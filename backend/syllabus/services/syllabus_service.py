"""Syllabus Service Module"""

import logging

from django.db.models import Prefetch

from rest_framework.response import Response
from rest_framework import status

from syllabus.models import SchoolChapter, SchoolClassPrerequisite, SchoolClassSubTopic
from core.common_modules.common_functions import CommonFunctions
from teacher.models import TeacherSubjectAssignment
from classes.models import SchoolSection
logger = logging.getLogger(__name__)

class SyllabusService:
    """Service class for handling syllabus-related operations."""
    
    def get_chapters_progress(self, request):
        """Fetch chapters by subject ID."""
        try:
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
            )
            chapters_list = []

            if chapters.exists():
                for chapter in chapters:
                    chapters_list.append({
                        "chapter_id": chapter.id,
                        "chapter_name": chapter.chapter_name,
                        "chapter_number": chapter.chapter_number,
                    })

            return Response({"data": chapters_list},
                            status=status.HTTP_200_OK)
        
        except Exception as e:
            logger.error(f"Error fetching chapters: {e}")
            return Response({"error": "Failed to fetch chapters."},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def get_grade_by_teacher_id(self, request):
        """Fetch grade by teacher ID."""
        try:
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
                data.append({
                    "class_id": assignment["school_class_id"],
                    "class_number": assignment["school_class__class_instance_id"],
                    "section": assignment["school_class__section"],
                    "subject_id": assignment["subject_id"],
                    "subject_name": assignment["subject__name"],
                    "board_id": assignment["school_class__board_id"]
                })
            return Response({"data": data}, status=status.HTTP_200_OK)

        except Exception as e:
            logger.error(f"Error fetching grade by teacher ID: {e}")
            return Response({"error": "Failed to fetch grade."},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def get_syllabus_by_subject(self, request):
        """Fetch syllabus by subject."""
        try:
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
                    )
                )
            )

            data = []
            for chapter in chapters:
                sub_topics = chapter.class_sub_topics.all()
                prerequisites = chapter.class_prerequisites.all()
                
                renamed_sub_topics = [
                    {'sub_topic_id': item['id'], 'sub_topic': item['name']}
                    for item in sub_topics.values('id', 'name')
                ]
                renamed_prerequisites = [
                    {'prerequisite_id': item['id'], 'topic': item['topic'], 'explanation': item['explanation']}
                    for item in prerequisites.values('id', 'topic', 'explanation')
                ]
                data.append({
                    "chapter_id": chapter.id,
                    "chapter_name": chapter.chapter_name,
                    "chapter_number": chapter.chapter_number,
                    "sub_topics": renamed_sub_topics,
                    "prerequisites": renamed_prerequisites,
                })

            return Response({"data": data}, status=status.HTTP_200_OK)
        except Exception as e:
            logger.exception(f"Error fetching syllabus by class: {e}")
            return Response({"error": "Failed to fetch syllabus."},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def create_sub_topic(self, request):
        """Add a topic to a chapter."""
        try:
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
            return Response({"message": "Sub-topic added successfully."},
                            status=status.HTTP_201_CREATED)
        except Exception as e:
            logger.error("Error in add_sub_topic_to_chapter: %s", e)
            return Response({"error": "Something went wrong while adding sub-topic."},
                            status=status.HTTP_400_BAD_REQUEST)
    
    def edit_sub_topic_by_id(self, request):
        """Edit a sub-topic."""
        try:
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
            return Response({"message": "Sub-topic updated successfully."},
                            status=status.HTTP_200_OK)

        except Exception as e:
            logger.error("Error in edit_sub_topic: %s", e)
            return Response({"error": "Something went wrong while editing sub-topic."},
                            status=status.HTTP_400_BAD_REQUEST)
    
    def delete_sub_topic_by_id(self, request):
        """Delete a sub-topic."""
        try:
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
            return Response({"message": "Sub-topic deleted successfully."},
                            status=status.HTTP_200_OK)
        except Exception as e:
            logger.error("Error in delete_sub_topic: %s", e)
            return Response({"error": "Something went wrong while deleting sub-topic."},
                            status=status.HTTP_400_BAD_REQUEST)
    
    def create_prerequisite(self, request):
        """Create a prerequisite for a chapter."""
        try:
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
            return Response({"message": "Prerequisite created successfully."},
                            status=status.HTTP_201_CREATED)
        except Exception as e:
            logger.error("Error in create_prerequisite: %s", e)
            return Response({"error": "Something went wrong while creating prerequisite."},
                            status=status.HTTP_400_BAD_REQUEST)
    
    def edit_prerequisite_by_id(self, request):
        """Edit a prerequisite for a chapter."""
        try:
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
            return Response({"message": "Prerequisite updated successfully."},
                            status=status.HTTP_200_OK)
        except Exception as e:
            logger.error("Error in edit_prerequisite: %s", e)
            return Response({"error": "Something went wrong while editing prerequisite."},
                            status=status.HTTP_400_BAD_REQUEST)
    
    def delete_prerequisite_by_id(self, request):
        """Delete a prerequisite for a chapter."""
        try:
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
            return Response({"message": "Prerequisite deleted successfully."},
                            status=status.HTTP_200_OK)
        except Exception as e:
            logger.error("Error in delete_prerequisite: %s", e)
            return Response({"error": "Something went wrong while deleting prerequisite."},
                            status=status.HTTP_400_BAD_REQUEST)
    
    # def generate_lesson_plan(self, request):
    #     """Generate a lesson plan based on chapter details."""
    #     try:
    #         school_id = request.data.get("school_id") or getattr(request.user, 'school_id', None)
    #         chapter_id = request.data.get("chapter_id")
    #         num_days = request.data.get("num_days")
    #         time_period = request.data.get("time_period")