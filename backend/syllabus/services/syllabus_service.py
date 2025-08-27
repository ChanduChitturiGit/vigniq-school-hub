"""Syllabus Service Module"""

import logging
from io import BytesIO

from django.db.models import Prefetch, Q, Count

from rest_framework.response import Response
from rest_framework import status

from syllabus.models import (
    SchoolChapter,
    SchoolClassPrerequisite,
    SchoolClassSubTopic,
    SchoolLessonPlanDay,
    Topic
)

from core.common_modules.common_functions import CommonFunctions
from core import s3_client
from core.lang_chain.lang_chain import LangChainService

from teacher.models import TeacherSubjectAssignment

from classes.models import SchoolSection

from school.models import SchoolSyllabusEbooks

logger = logging.getLogger(__name__)

class SyllabusService:
    """Service class for handling syllabus-related operations."""

    def get_chapters_by_subject(self, request):
        """Fetch chapters by subject ID."""
        try:
            logger.info("Fetching chapters by subject...")
            school_id = request.GET.get("school_id") or getattr(request.user, 'school_id', None)
            school_board_id = request.GET.get("school_board_id")
            academic_year_id = request.GET.get("academic_year_id", 1)
            class_number_id = request.GET.get("class_number_id")
            subject_id = request.GET.get('subject_id')

            if not all([school_id, school_board_id, academic_year_id, class_number_id, subject_id]):
                logger.error("Missing required parameters for fetching chapters.")
                return Response({"error": "Missing required parameters."},
                                status=status.HTTP_400_BAD_REQUEST)
            school_db_name = CommonFunctions.get_school_db_name(school_id)

            chapters = SchoolChapter.objects.using(school_db_name).filter(
                subject_id=subject_id,
                school_board_id=school_board_id,
                academic_year_id=academic_year_id,
                class_number_id=class_number_id
            ).order_by('chapter_number')
            chapters_list = []

            if chapters.exists():
                for chapter in chapters:
                    chapters_list.append({
                        "chapter_id": chapter.id,
                        "chapter_name": chapter.chapter_name,
                        "chapter_number": chapter.chapter_number,
                        "progress": self.get_chapter_progress(school_db_name, chapter.id),
                    })
            logger.info("Chapters fetched successfully.")
            return Response({"data": chapters_list},
                            status=status.HTTP_200_OK)

        except Exception as e:
            logger.error(f"Error fetching chapters: {e}")
            return Response({"error": "Failed to fetch chapters."},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def get_chapter_progress(self, school_db_name, chapter_id):

        total_days = SchoolLessonPlanDay.objects.using(school_db_name).filter(
            chapter_id=chapter_id
        ).count()

        if total_days == 0:
            return 0

        completed_days = SchoolLessonPlanDay.objects.using(school_db_name).filter(
            chapter_id=chapter_id,
            status='completed'
        ).count()

        progress = (completed_days / total_days) * 100
        return round(progress, 2)

    def get_grade_by_teacher_id(self, request):
        """Fetch grade by teacher ID."""
        try:
            logger.info("Fetching grade by teacher ID...")
            school_id = request.GET.get("school_id") or getattr(request.user, 'school_id', None)
            teacher_id = request.GET.get("teacher_id")
            academic_year = request.GET.get("academic_year", 1)
            if not teacher_id or not school_id:
                logger.error("Missing required parameters.")
                return Response({"error": "Missing required parameters."},
                                status=status.HTTP_400_BAD_REQUEST)

            school_db_name = CommonFunctions.get_school_db_name(school_id)
            teacher_assignment_obj = TeacherSubjectAssignment.objects.using(school_db_name).filter(
                teacher__teacher_id=teacher_id,
                academic_year=academic_year
            ).values('school_class_id', 'school_class__class_instance_id',
                          'school_class__section', 'subject_id','subject__name',
                          'school_class__board_id')

            data = []
            for assignment in teacher_assignment_obj:
                progress = self.get_subject_progress(
                    school_db_name,
                    assignment["school_class_id"],
                    assignment["school_class__class_instance_id"],
                    assignment["subject_id"]
                )
                data.append({
                    "class_id": assignment["school_class_id"],
                    "class_number": assignment["school_class__class_instance_id"],
                    "section": assignment["school_class__section"],
                    "subject_id": assignment["subject_id"],
                    "subject_name": assignment["subject__name"],
                    "board_id": assignment["school_class__board_id"],
                    "progress": round(progress, 2),
                })
            logger.info("Grade by teacher ID fetched successfully.")
            return Response({"data": data}, status=status.HTTP_200_OK)

        except Exception as e:
            logger.error(f"Error fetching grade by teacher ID: {e}")
            return Response({"error": "Failed to fetch grade."},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def get_subject_progress(self,school_db_name, section_id, class_id, subject_id):
        chapters = SchoolChapter.objects.using(school_db_name).filter(
            class_number_id=class_id,
            subject_id=subject_id
        )

        total_chapters = chapters.count()
        if total_chapters == 0:
            return 0

        chapter_weight = 100 / total_chapters
        total_progress = 0

        for chapter in chapters:
            total_days = SchoolLessonPlanDay.objects.using(school_db_name).filter(
                chapter_id=chapter.id,
                class_section_id=section_id
            ).count()

            if total_days == 0:
                continue

            completed_days = SchoolLessonPlanDay.objects.using(school_db_name).filter(
                chapter_id=chapter.id,
                class_section_id=section_id,
                status='completed'
            ).count()

            chapter_progress = (completed_days / total_days) * chapter_weight
            total_progress += chapter_progress

        return round(total_progress, 2)

    def get_syllabus_subject(self, request):
        """Fetch syllabus by subject."""
        try:
            logger.info("Fetching syllabus by subject...")
            school_id = request.GET.get("school_id") or getattr(request.user, 'school_id', None)
            class_id = request.GET.get("class_id")
            subject_id = request.GET.get("subject_id")
            academic_year_id = request.GET.get("academic_year_id", 1)
            if not all([school_id, class_id, subject_id]):
                logger.error("Missing required parameters for fetching syllabus.")
                return Response({"error": "Missing required parameters."},
                                status=status.HTTP_400_BAD_REQUEST)

            school_db_name = CommonFunctions.get_school_db_name(school_id)

            if not school_db_name:
                logger.error("Invalid school database name.")
                return Response({"error": "Invalid school database."},
                                status=status.HTTP_400_BAD_REQUEST)

            school_class = SchoolSection.objects.using(school_db_name).filter(
                id=class_id
            ).select_related(
                'class_instance'
            ).first()

            chapters = (
                SchoolChapter.objects.using(school_db_name)
                .filter(
                    subject_id=subject_id,
                    academic_year_id=academic_year_id,
                    school_board_id=school_class.board_id,
                    class_number_id=school_class.class_instance.class_number
                )
                .prefetch_related(
                    Prefetch(
                        'class_sub_topics',
                        queryset=SchoolClassSubTopic.objects.using(school_db_name).filter(
                            class_section=school_class
                        )
                    ),
                    Prefetch(
                        'class_prerequisites',
                        queryset=SchoolClassPrerequisite.objects.using(school_db_name).filter(
                            class_section=school_class
                        )
                    ),
                    Prefetch(
                        'school_chapter_lesson_plan_days',
                        queryset=SchoolLessonPlanDay.objects.using(school_db_name).filter(
                            class_section=school_class
                        ).order_by('day')
                    )
                ).order_by('chapter_number')
            )

            data = []
            for chapter in chapters:
                sub_topics = chapter.class_sub_topics.all()
                prerequisites = chapter.class_prerequisites.all()
                lesson_plan_days = chapter.school_chapter_lesson_plan_days.all()

                
                renamed_sub_topics = [
                    {'sub_topic_id': item['id'], 'sub_topic': item['name']}
                    for item in sub_topics.values('id', 'name')
                ]
                renamed_prerequisites = [
                    {'prerequisite_id': item['id'], 'topic': item['topic'], 'explanation': item['explanation']}
                    for item in prerequisites.values('id', 'topic', 'explanation')
                ]
                lesson_plan_days_data = [
                    {
                        "lesson_plan_day_id": day.id,
                        "day": day.day,
                        "status": day.status,
                    }
                    for day in lesson_plan_days
                ]
                
                total_days = lesson_plan_days.count()
                completed_days = lesson_plan_days.filter(status='completed').count()
                progress = (completed_days / total_days) * 100 if total_days > 0 else 0

                data.append({
                    "chapter_id": chapter.id,
                    "chapter_name": chapter.chapter_name,
                    "chapter_number": chapter.chapter_number,
                    "sub_topics": renamed_sub_topics,
                    "prerequisites": renamed_prerequisites,
                    "lesson_plan_days": lesson_plan_days_data,
                    "progress": round(progress, 2),
                })
            logger.info("Syllabus by subject fetched successfully.")
            return Response({"data": data}, status=status.HTTP_200_OK)
        except Exception as e:
            logger.exception(f"Error fetching syllabus by class: {e}")
            return Response({"error": "Failed to fetch syllabus."},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def get_prerequisites(self, request):
        """Fetch lesson plan and prerequisites for a chapter."""
        try:
            logger.info("Fetching lesson plan and prerequisites...")
            school_id = request.GET.get("school_id") or getattr(request.user, 'school_id', None)
            chapter_id = request.GET.get("chapter_id")
            class_section_id = request.GET.get("class_section_id")

            if not all([school_id, chapter_id, class_section_id]):
                logger.error("Missing required parameters for fetching lesson plan.")
                return Response({"error": "Missing required parameters."},
                                status=status.HTTP_400_BAD_REQUEST)

            school_db_name = CommonFunctions.get_school_db_name(school_id)


            prerequisites = SchoolClassPrerequisite.objects.using(school_db_name).filter(
                chapter_id=chapter_id,
                class_section_id=class_section_id
            )

            prerequisites_data = [
                {
                    "prerequisite_id": prerequisite.id,
                    "topic": prerequisite.topic,
                    "explanation": prerequisite.explanation
                }
                for prerequisite in prerequisites
            ]
            logger.info("Lesson plan and prerequisites fetched successfully.")
            return Response({"data":prerequisites_data}, status=status.HTTP_200_OK)

        except Exception as e:
            logger.error(f"Error fetching lesson plan and prerequisites: {e}")
            return Response({"error": "Failed to fetch lesson plan and prerequisites."},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def get_lesson_plan_by_chapter_id(self, request):
        """Fetch lesson plan by chapter ID."""
        try:
            logger.info("Fetching lesson plan by chapter ID...")
            school_id = request.GET.get("school_id") or getattr(request.user, 'school_id', None)
            chapter_id = request.GET.get("chapter_id")
            class_section_id = request.GET.get("class_section_id")

            if not all([school_id, chapter_id, class_section_id]):
                logger.error("Missing required parameters for fetching lesson plan.")
                return Response({"error": "Missing required parameters."},
                                status=status.HTTP_400_BAD_REQUEST)

            school_db_name = CommonFunctions.get_school_db_name(school_id)

            lesson_plan_days = SchoolLessonPlanDay.objects.using(school_db_name).filter(
                chapter_id=chapter_id,
                class_section_id=class_section_id
            )

            data = []
            for day in lesson_plan_days:
                data.append({
                    "lesson_plan_day_id": day.id,
                    "day": day.day,
                    "status": day.status,
                })
            logger.info("Lesson plan by chapter ID fetched successfully.")
            return Response({"data": data}, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Error fetching lesson plan by chapter ID: {e}")
            return Response({"error": "Failed to fetch lesson plan."},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
    def get_lesson_plan_day_by_id(self, request):
        """Fetch lesson plan day by ID."""
        try:
            logger.info("Fetching lesson plan day by ID...")
            school_id = request.GET.get("school_id") or getattr(request.user, 'school_id', None)
            lesson_plan_day_id = request.GET.get("lesson_plan_day_id")

            if not all([school_id, lesson_plan_day_id]):
                logger.error("Missing required parameters for fetching lesson plan day.")
                return Response({"error": "Missing required parameters."},
                                status=status.HTTP_400_BAD_REQUEST)

            school_db_name = CommonFunctions.get_school_db_name(school_id)

            lesson_plan_day = SchoolLessonPlanDay.objects.using(school_db_name).filter(
                id=lesson_plan_day_id
            ).prefetch_related(
                Prefetch(
                    'school_lesson_topics',
                    queryset=Topic.objects.using(school_db_name)
                )
            ).first()

            if not lesson_plan_day:
                logger.error("Lesson plan day not found.")
                return Response({"error": "Lesson plan day not found."},
                                status=status.HTTP_404_NOT_FOUND)

            topics = lesson_plan_day.school_lesson_topics.all()

            data = {
                "lesson_plan_day_id": lesson_plan_day.id,
                "day": lesson_plan_day.day,
                "learning_outcomes": lesson_plan_day.learning_outcomes,
                "real_world_applications": lesson_plan_day.real_world_applications,
                "taxonomy_alignment": lesson_plan_day.taxonomy_alignment,
                "status": lesson_plan_day.status,
                "topics": [
                    {
                        "topic_id": topic.id,
                        "title": topic.title,
                        "summary": topic.summary,
                        "time_minutes": topic.time_minutes
                    } for topic in topics
                ]
            }
            logger.info("Lesson plan day by ID fetched successfully.")
            return Response({"data": data}, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Error fetching lesson plan day by ID: {e}")
            return Response({"error": "Failed to fetch lesson plan day."},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def edit_lesson_plan_day_by_id(self,request):
        """Edit lesson plan day by ID."""
        try:
            logger.info("Editing lesson plan day by ID...")
            school_id = request.data.get("school_id") or getattr(request.user, 'school_id', None)
            lesson_plan_day_id = request.data.get("lesson_plan_day_id")

            if not all([school_id, lesson_plan_day_id]):
                logger.error("Missing required parameters for editing lesson plan day.")
                return Response({"error": "Missing required parameters."},
                                status=status.HTTP_400_BAD_REQUEST)

            school_db_name = CommonFunctions.get_school_db_name(school_id)

            lesson_plan_day = SchoolLessonPlanDay.objects.using(school_db_name).filter(
                id=lesson_plan_day_id
            ).first()

            if not lesson_plan_day:
                logger.error("Lesson plan day not found.")
                return Response({"error": "Lesson plan day not found."},
                                status=status.HTTP_404_NOT_FOUND)

            data = request.data

            for field in ['learning_outcomes', 'real_world_applications',
                          'taxonomy_alignment']:
                if field in data:
                    setattr(lesson_plan_day, field, data[field])
            lesson_plan_day.save(using=school_db_name)

            if 'topics' in data:
                topics_data = data['topics']

                for topic_data in topics_data:
                    topic_id = topic_data.get('topic_id')
                    if not topic_id:
                        continue

                    topic = Topic.objects.using(school_db_name).filter(id=topic_id).first()
                    if not topic:
                        continue

                    for t_field in ['title', 'summary', 'time_minutes']:
                        if t_field in topic_data:
                            setattr(topic, t_field, topic_data[t_field])
                    topic.save(using=school_db_name)

            logger.info("Lesson plan day updated successfully.")

            return Response({"message": "Lesson plan day updated successfully"},
                            status=status.HTTP_200_OK)

        except Exception as e:
            logger.error("Error editing lesson plan day by ID: %s", e)
            return Response({"error": "Failed to edit lesson plan day."},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)


    def create_sub_topic(self, request):
        """Add a topic to a chapter."""
        try:
            logger.info("Adding sub-topic to chapter...")
            school_id = request.data.get("school_id") or getattr(request.user, 'school_id', None)
            chapter_id = request.data.get("chapter_id")
            sub_topic = request.data.get("sub_topic")
            class_section_id = request.data.get("class_section_id")

            if not all([school_id, chapter_id, sub_topic, class_section_id]):
                logger.error("Missing required parameters for adding sub-topic.")
                return Response({"error": "Missing required parameters."},
                                status=status.HTTP_400_BAD_REQUEST)

            school_db_name = CommonFunctions.get_school_db_name(school_id)

            SchoolClassSubTopic.objects.using(school_db_name).create(
                chapter_id=chapter_id,
                name=sub_topic,
                class_section_id=class_section_id
            )
            logger.info("Sub-topic added successfully.")
            return Response({"message": "Sub-topic added successfully."},
                            status=status.HTTP_201_CREATED)
        except Exception as e:
            logger.error("Error in add_sub_topic_to_chapter: %s", e)
            return Response({"error": "Something went wrong while adding sub-topic."},
                            status=status.HTTP_400_BAD_REQUEST)
    
    def edit_sub_topic_by_id(self, request):
        """Edit a sub-topic."""
        try:
            logger.info("Editing sub-topic by ID...")
            school_id = request.data.get("school_id") or getattr(request.user, 'school_id', None)
            sub_topic_id = request.data.get("sub_topic_id")
            new_sub_topic_name = request.data.get("sub_topic")

            if not all([school_id, sub_topic_id, new_sub_topic_name]):
                logger.error("Missing required parameters for editing sub-topic.")
                return Response({"error": "Missing required parameters."},
                                status=status.HTTP_400_BAD_REQUEST)

            school_db_name = CommonFunctions.get_school_db_name(school_id)

            sub_topic = SchoolClassSubTopic.objects.using(school_db_name).filter(
                id=sub_topic_id
            ).first()

            if not sub_topic:
                logger.error("Sub-topic not found.")
                return Response({"error": "Sub-topic not found."},
                                status=status.HTTP_404_NOT_FOUND)

            sub_topic.name = new_sub_topic_name
            sub_topic.save(using=school_db_name)
            logger.info("Sub-topic updated successfully.")
            return Response({"message": "Sub-topic updated successfully."},
                            status=status.HTTP_200_OK)

        except Exception as e:
            logger.error("Error in edit_sub_topic: %s", e)
            return Response({"error": "Something went wrong while editing sub-topic."},
                            status=status.HTTP_400_BAD_REQUEST)
    
    def delete_sub_topic_by_id(self, request):
        """Delete a sub-topic."""
        try:
            logger.info("Deleting sub-topic by ID...")
            school_id = request.data.get("school_id") or getattr(request.user, 'school_id', None)
            sub_topic_id = request.data.get("sub_topic_id")

            if not all([school_id, sub_topic_id]):
                logger.error("Missing required parameters for deleting sub-topic.")
                return Response({"error": "Missing required parameters."},
                                status=status.HTTP_400_BAD_REQUEST)

            school_db_name = CommonFunctions.get_school_db_name(school_id)

            sub_topic = SchoolClassSubTopic.objects.using(school_db_name).filter(
                id=sub_topic_id
            ).first()

            if not sub_topic:
                logger.error("Sub-topic not found.")
                return Response({"error": "Sub-topic not found."},
                                status=status.HTTP_404_NOT_FOUND)

            sub_topic.delete(using=school_db_name)
            logger.info("Sub-topic deleted successfully.")
            return Response({"message": "Sub-topic deleted successfully."},
                            status=status.HTTP_200_OK)
        except Exception as e:
            logger.error("Error in delete_sub_topic: %s", e)
            return Response({"error": "Something went wrong while deleting sub-topic."},
                            status=status.HTTP_400_BAD_REQUEST)
    
    def create_prerequisite(self, request):
        """Create a prerequisite for a chapter."""
        try:
            logger.info("Creating prerequisite for chapter...")
            school_id = request.data.get("school_id") or getattr(request.user, 'school_id', None)
            chapter_id = request.data.get("chapter_id")
            topic = request.data.get("topic")
            explanation = request.data.get("explanation")
            class_section_id = request.data.get("class_section_id")

            if not all([school_id, chapter_id, topic, class_section_id, explanation]):
                logger.error("Missing required parameters for creating prerequisite.")
                return Response({"error": "Missing required parameters."},
                                status=status.HTTP_400_BAD_REQUEST)
            
            school_db_name = CommonFunctions.get_school_db_name(school_id)
            
            SchoolClassPrerequisite.objects.using(school_db_name).create(
                chapter_id=chapter_id,
                topic=topic,
                explanation=explanation,
                class_section_id=class_section_id
            )
            logger.info("Prerequisite created successfully.")
            return Response({"message": "Prerequisite created successfully."},
                            status=status.HTTP_201_CREATED)
        except Exception as e:
            logger.error("Error in create_prerequisite: %s", e)
            return Response({"error": "Something went wrong while creating prerequisite."},
                            status=status.HTTP_400_BAD_REQUEST)
    
    def edit_prerequisite_by_id(self, request):
        """Edit a prerequisite for a chapter."""
        try:
            logger.info("Editing prerequisite by ID...")
            school_id = request.data.get("school_id") or getattr(request.user, 'school_id', None)
            prerequisite_id = request.data.get("prerequisite_id")
            topic = request.data.get("topic")
            explanation = request.data.get("explanation")

            if not all([school_id, prerequisite_id, topic, explanation]):
                logger.error("Missing required parameters for editing prerequisite.")
                return Response({"error": "Missing required parameters."},
                                status=status.HTTP_400_BAD_REQUEST)

            school_db_name = CommonFunctions.get_school_db_name(school_id)

            prerequisite = SchoolClassPrerequisite.objects.using(school_db_name).filter(
                id=prerequisite_id
            ).first()

            if not prerequisite:
                logger.error("Prerequisite not found.")
                return Response({"error": "Prerequisite not found."},
                                status=status.HTTP_404_NOT_FOUND)

            prerequisite.topic = topic
            prerequisite.explanation = explanation
            prerequisite.save(using=school_db_name)
            logger.info("Prerequisite updated successfully.")
            return Response({"message": "Prerequisite updated successfully."},
                            status=status.HTTP_200_OK)
        except Exception as e:
            logger.error("Error in edit_prerequisite: %s", e)
            return Response({"error": "Something went wrong while editing prerequisite."},
                            status=status.HTTP_400_BAD_REQUEST)
    
    def delete_prerequisite_by_id(self, request):
        """Delete a prerequisite for a chapter."""
        try:
            logger.info("Deleting prerequisite by ID...")
            school_id = request.data.get("school_id") or getattr(request.user, 'school_id', None)
            prerequisite_id = request.data.get("prerequisite_id")

            if not all([school_id, prerequisite_id]):
                logger.error("Missing required parameters for deleting prerequisite.")
                return Response({"error": "Missing required parameters."},
                                status=status.HTTP_400_BAD_REQUEST)

            school_db_name = CommonFunctions.get_school_db_name(school_id)

            prerequisite = SchoolClassPrerequisite.objects.using(school_db_name).filter(
                id=prerequisite_id
            ).first()

            if not prerequisite:
                logger.error("Prerequisite not found.")
                return Response({"error": "Prerequisite not found."},
                                status=status.HTTP_404_NOT_FOUND)

            prerequisite.delete(using=school_db_name)
            logger.info("Prerequisite deleted successfully.")
            return Response({"message": "Prerequisite deleted successfully."},
                            status=status.HTTP_200_OK)
        except Exception as e:
            logger.error("Error in delete_prerequisite: %s", e)
            return Response({"error": "Something went wrong while deleting prerequisite."},
                            status=status.HTTP_400_BAD_REQUEST)
    
    def generate_lesson_plan(self, request):
        """Generate a lesson plan based on chapter details."""
        try:
            logger.info("Generating lesson plan...")
            school_id = request.data.get("school_id") or getattr(request.user, 'school_id', None)
            chapter_id = request.data.get("chapter_id")
            num_days = request.data.get("num_days")
            time_period = request.data.get("time_period")

            if not all([school_id, chapter_id, num_days, time_period]):
                logger.error("Missing required parameters for generating lesson plan.")
                return Response({"error": "Missing required parameters."},
                                status=status.HTTP_400_BAD_REQUEST)

            school_db_name = CommonFunctions.get_school_db_name(school_id)

            chapter = SchoolChapter.objects.using(school_db_name).filter(
                id=chapter_id
            ).first()
            
            if not chapter:
                logger.error("Chapter not found.")
                return Response({"error": "Chapter not found."},
                                status=status.HTTP_404_NOT_FOUND)
            
            ebook_instance = SchoolSyllabusEbooks.objects.filter(
                id=chapter.ebook_id
            ).first()

            if not ebook_instance:
                logger.error("Ebook not found for the chapter.")
                return Response({"error": "Ebook not found for the chapter."},
                                status=status.HTTP_404_NOT_FOUND)
            pdf_bytes_io = BytesIO()
            s3_status = s3_client.download_file(ebook_instance.file_path, pdf_bytes_io)
            if not s3_status:
                logger.error("Failed to download ebook from S3.")
                return Response({"error": "Failed to download ebook."},
                                status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            lang_chain_service = LangChainService()
            lesson_plan = lang_chain_service.generate_lesson_plan(
                chapter_number=chapter.chapter_number,
                chapter_title=chapter.chapter_name,
                num_days=num_days,
                time_period=time_period,
                pdf_file=pdf_bytes_io
            )

            normalized = CommonFunctions.normalize_keys(lesson_plan)
            logger.info("Lesson plan generated successfully.")
            return Response({"data": normalized},
                            status=status.HTTP_200_OK)
        except Exception as e:
            logger.error("Error in generate_lesson_plan: %s", e)
            return Response({"error": "Something went wrong while generating lesson plan. Please try again."},
                            status=status.HTTP_400_BAD_REQUEST)
    
    def save_lesson_plan(self, request):
        """Save the generated lesson plan."""
        try:
            logger.info("Saving lesson plan...")
            school_id = request.data.get("school_id") or getattr(request.user, 'school_id', None)
            chapter_id = request.data.get("chapter_id")
            class_section_id = request.data.get("class_section_id")
            lesson_plan_data = request.data.get("lesson_plan_data")

            if not all([school_id, chapter_id, class_section_id, lesson_plan_data]):
                logger.error("Missing required parameters for saving lesson plan.")
                return Response({"error": "Missing required parameters."},
                                status=status.HTTP_400_BAD_REQUEST)

            school_db_name = CommonFunctions.get_school_db_name(school_id)

            chapter = SchoolChapter.objects.using(school_db_name).filter(
                id=chapter_id
            ).first()

            if not chapter:
                logger.error("Chapter not found.")
                return Response({"error": "Chapter not found."},
                                status=status.HTTP_404_NOT_FOUND)

            class_section = SchoolSection.objects.using(school_db_name).filter(
                id=class_section_id
            ).first()

            if not class_section:
                logger.error("Class section not found.")
                return Response({"error": "Class section not found."},
                                status=status.HTTP_404_NOT_FOUND)
            
            school_lesson_plan_day = SchoolLessonPlanDay.objects.using(school_db_name).filter(
                chapter=chapter,
                class_section=class_section
            ).first()
            if school_lesson_plan_day:
                school_lesson_plan_day.delete(using=school_db_name)

            for day in lesson_plan_data['lesson_plan']:
                lesson_plan_day = SchoolLessonPlanDay.objects.using(school_db_name).create(
                    chapter=chapter,
                    class_section=class_section,
                    day=day.get('day'),
                    learning_outcomes=day.get("learning_outcomes"),
                    real_world_applications=day.get("real_world_applications"),
                    taxonomy_alignment=day.get("taxonomy_alignment")
                )
                topics = day.get("topics", [])
                for topic in topics:
                    topic_instance = Topic.objects.using(school_db_name).create(
                        lesson_plan_day=lesson_plan_day,
                        title=topic.get("title"),
                        summary=topic.get("summary"),
                        time_minutes=topic.get("time_minutes")
                    )
            logger.info("Lesson plan saved successfully.")
            return Response({"message": "Lesson plan saved successfully."},
                            status=status.HTTP_201_CREATED)
        except Exception as e:
            logger.exception("Error in save_lesson_plan: %s", e)
            return Response({"error": "Something went wrong while saving lesson plan."},
                            status=status.HTTP_400_BAD_REQUEST)
