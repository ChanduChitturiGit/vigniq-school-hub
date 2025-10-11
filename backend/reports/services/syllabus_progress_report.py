"""Syllabus progress report service"""

import logging
from collections import defaultdict
from django.http import JsonResponse
from django.db.models import Count, Q, F, Max, Prefetch

from core.models import User
from teacher.models import TeacherSubjectAssignment
from syllabus.models import SchoolLessonPlanDay, SchoolChapter, SchoolSection, Topic
from core.common_modules.common_functions import CommonFunctions

logger = logging.getLogger(__name__)

class SyllabusProgressReportService:
    """Service for generating syllabus progress reports"""

    def __init__(self, request):
        """Initialize with request"""
        self.request = request

    
    def get_report_by_class(self):
        """Generate syllabus progress report by class (uses class_section_id correctly)"""
        try:
            school_id = self.request.GET.get('school_id')
            school_db_name = CommonFunctions.get_school_db_name(school_id)
            if not school_db_name:
                return JsonResponse({"error": "Invalid school ID"}, status=400)

            latest_academic_year = CommonFunctions().get_latest_academic_year(school_db_name)
            boards_dict = CommonFunctions().get_boards_dict()

            # 1) classes that have at least one subject (school_class_id is SchoolSection.id)
            classes_with_subjects = list(
                TeacherSubjectAssignment.objects.using(school_db_name)
                .filter(academic_year=latest_academic_year)
                .values(
                    'school_class_id',                                  # SchoolSection.id (class_section_id)
                    'school_class__class_instance__id',                 # SchoolClass.id (class_instance_id)
                    'school_class__class_instance__class_number',       # class number (display)
                    'school_class__section',
                    'school_class__board_id',
                )
                .annotate(number_of_subjects=Count('subject', distinct=True))
                .order_by('school_class__class_instance__class_number', 'school_class__section')
            )

            if not classes_with_subjects:
                return JsonResponse({"data": []}, status=200)

            # build helper maps and lists
            class_section_ids = [c['school_class_id'] for c in classes_with_subjects]
            class_instance_ids = list({c['school_class__class_instance__id'] for c in classes_with_subjects})

            # map: class_section_id -> (class_instance_id, board_id)
            class_section_info = {
                c['school_class_id']: {
                    'class_instance_id': c['school_class__class_instance__id'],
                    'board_id': c['school_class__board_id']
                }
                for c in classes_with_subjects
            }

            # 2) Aggregate lesson plans per chapter + class_section to determine chapter completion per section
            chapter_completion_qs = (
                SchoolLessonPlanDay.objects.using(school_db_name)
                .filter(
                    class_section_id__in=class_section_ids,
                    chapter__academic_year=latest_academic_year
                )
                .values('chapter_id', 'chapter__subject_id', 'class_section_id')
                .annotate(
                    total_lessons=Count('id'),
                    completed_lessons=Count('id', filter=Q(status='completed'))
                )
            )

            # completed_chapters_map: (class_section_id, subject_id) -> number_of_completed_chapters
            completed_chapters_map = {}
            for r in chapter_completion_qs:
                total = r['total_lessons']
                comp = r['completed_lessons']
                if total > 0 and total == comp:
                    key = (r['class_section_id'], r['chapter__subject_id'])
                    completed_chapters_map[key] = completed_chapters_map.get(key, 0) + 1

            # 3) Get total chapters per (class_number_id, school_board_id, subject_id)
            total_chapters_qs = (
                SchoolChapter.objects.using(school_db_name)
                .filter(academic_year=latest_academic_year, class_number_id__in=class_instance_ids)
                .values('class_number_id', 'school_board_id', 'subject_id')
                .annotate(total_chapters=Count('id'))
            )

            # map: (class_instance_id, board_id, subject_id) -> total_chapters
            total_chapters_map = {
                (t['class_number_id'], t['school_board_id'], t['subject_id']): t['total_chapters']
                for t in total_chapters_qs
            }

            # 4) Compare completed chapters per section to total chapters to determine completed subjects per section
            completed_subjects_per_section = {}
            for (class_section_id, subject_id), completed_ch_count in completed_chapters_map.items():
                info = class_section_info.get(class_section_id)
                if not info:
                    continue
                class_instance_id = info['class_instance_id']
                board_id = info['board_id']
                total_ch_count = total_chapters_map.get((class_instance_id, board_id, subject_id), 0)

                # subject is complete for that section if all chapters for that subject are completed
                if total_ch_count > 0 and completed_ch_count == total_ch_count:
                    completed_subjects_per_section[class_section_id] = (
                        completed_subjects_per_section.get(class_section_id, 0) + 1
                    )

            # 5) Build final report using class_section_id as the identifier
            report_data = []
            for c in classes_with_subjects:
                cs_id = c['school_class_id']
                report_data.append({
                    "class_number": c['school_class__class_instance__class_number'],
                    "class_section": c['school_class__section'],
                    "board_id": c['school_class__board_id'],
                    "board_name": boards_dict.get(c['school_class__board_id'], 'Unknown Board'),
                    "total_subjects": c['number_of_subjects'],
                    "class_section_id": cs_id,
                    "completed_subjects": completed_subjects_per_section.get(cs_id, 0),
                })

            return JsonResponse({"data": report_data}, status=200)

        except Exception as e:
            logger.error("Error generating report by class: %s", e)
            return JsonResponse({"error": "Failed to generate report"}, status=500)
    

    def get_subject_progress_by_class_section(self):
        """Get subject-wise progress for a given class_section_id"""
        try:
            school_id = self.request.GET.get('school_id')
            class_section_id = self.request.GET.get('class_section_id')

            if not (school_id and class_section_id):
                return JsonResponse({"error": "Missing school_id or class_section_id"}, status=400)

            school_db_name = CommonFunctions.get_school_db_name(school_id)
            if not school_db_name:
                return JsonResponse({"error": "Invalid school ID"}, status=400)

            latest_academic_year = CommonFunctions().get_latest_academic_year(school_db_name)

            # 1) Get all subjects assigned to this class_section
            subjects_qs = (
                TeacherSubjectAssignment.objects.using(school_db_name)
                .filter(
                    academic_year=latest_academic_year,
                    school_class_id=class_section_id
                )
                .values('subject__id', 'subject__name','teacher_id')
                .distinct()
            )

            if not subjects_qs:
                return JsonResponse({"data": []}, status=200)

            subject_ids = [s['subject__id'] for s in subjects_qs]

            teacher_ids = [s['teacher_id'] for s in subjects_qs]

            teacher_names_map = {}
            teachers = User.objects.filter(id__in=teacher_ids).values('id', 'first_name', 'last_name')
            for t in teachers:
                teacher_names_map[t['id']] = f"{t['first_name']} {t['last_name']}"

            # 2) Get class_instance_id and board_id for the class_section
            section_info = (
                SchoolSection.objects.using(school_db_name)
                .filter(id=class_section_id)
                .values('class_instance_id', 'board_id')
                .first()
            )

            if not section_info:
                return JsonResponse({"error": "Invalid class_section_id"}, status=400)

            class_instance_id = section_info['class_instance_id']
            board_id = section_info['board_id']

            # 3) Get total chapters per subject for that class and board
            total_chapters_qs = (
                SchoolChapter.objects.using(school_db_name)
                .filter(
                    academic_year=latest_academic_year,
                    class_number_id=class_instance_id,
                    school_board_id=board_id,
                    subject_id__in=subject_ids
                )
                .values('subject_id')
                .annotate(total_chapters=Count('id'))
            )

            total_chapters_map = {t['subject_id']: t['total_chapters'] for t in total_chapters_qs}

            # 4) Get completed chapters (where all lesson plan days for that chapter are completed)
            chapter_completion_qs = (
                SchoolLessonPlanDay.objects.using(school_db_name)
                .filter(
                    class_section_id=class_section_id,
                    chapter__academic_year=latest_academic_year,
                    chapter__subject_id__in=subject_ids
                )
                .values('chapter_id', 'chapter__subject_id')
                .annotate(
                    total_lessons=Count('id'),
                    completed_lessons=Count('id', filter=Q(status='completed'))
                )
            )

            # determine which chapters are fully completed
            completed_chapters_map = {}
            for r in chapter_completion_qs:
                total = r['total_lessons']
                comp = r['completed_lessons']
                if total > 0 and total == comp:
                    subj_id = r['chapter__subject_id']
                    completed_chapters_map[subj_id] = completed_chapters_map.get(subj_id, 0) + 1

            # 5) Build final response
            subject_progress_data = []
            for s in subjects_qs:
                subj_id = s['subject__id']
                subj_name = s['subject__name']
                total_ch = total_chapters_map.get(subj_id, 0)
                completed_ch = completed_chapters_map.get(subj_id, 0)
                completion_pct = round((completed_ch / total_ch) * 100, 2) if total_ch > 0 else 0.0

                subject_progress_data.append({
                    "subject_id": subj_id,
                    "subject_name": subj_name,
                    "total_chapters": total_ch,
                    "completed_chapters": completed_ch,
                    "completion_percentage": completion_pct,
                    "teacher_name": teacher_names_map.get(s['teacher_id'], 'Unknown Teacher')
                })

            return JsonResponse({"data": subject_progress_data}, status=200)

        except Exception as e:
            logger.error("Error generating subject progress for class_section %s: %s", class_section_id, e)
            return JsonResponse({"error": "Failed to generate subject progress"}, status=500)

    def get_chapter_progress_by_subject(self):
        """Get chapter-wise progress for a given class_section_id and subject_id"""
        try:
            school_id = self.request.GET.get('school_id')
            class_section_id = self.request.GET.get('class_section_id')
            subject_id = self.request.GET.get('subject_id')

            if not (school_id and class_section_id and subject_id):
                return JsonResponse({"error": "Missing school_id, class_section_id, or subject_id"}, status=400)

            school_db_name = CommonFunctions.get_school_db_name(school_id)
            if not school_db_name:
                return JsonResponse({"error": "Invalid school ID"}, status=400)

            latest_academic_year = CommonFunctions().get_latest_academic_year(school_db_name)

            # 1) Get class_instance_id and board_id for the class_section
            section_info = (
                SchoolSection.objects.using(school_db_name)
                .filter(id=class_section_id)
                .values('class_instance_id', 'board_id')
                .first()
            )
            if not section_info:
                return JsonResponse({"error": "Invalid class_section_id"}, status=400)

            class_instance_id = section_info['class_instance_id']
            board_id = section_info['board_id']

            # 2) Get all chapters for this subject in this class and board
            chapters_qs = (
                SchoolChapter.objects.using(school_db_name)
                .filter(
                    academic_year=latest_academic_year,
                    class_number_id=class_instance_id,
                    school_board_id=board_id,
                    subject_id=subject_id
                )
                .values('id', 'chapter_name','chapter_number')
                .order_by('chapter_number')
            )

            if not chapters_qs:
                return JsonResponse({"data": []}, status=200)

            chapter_ids = [c['id'] for c in chapters_qs]

            # 3) Get lesson plan days per chapter for this class_section
            lessonplans_qs = (
                SchoolLessonPlanDay.objects.using(school_db_name)
                .filter(
                    class_section_id=class_section_id,
                    chapter_id__in=chapter_ids
                )
                .values('chapter_id')
                .annotate(
                    total_lessons=Count('id'),
                    completed_lessons=Count('id', filter=Q(status='completed')),
                    last_completed_date=Max('updated_at', filter=Q(status='completed'))
                )
            )

            # Map: chapter_id -> info
            lessonplans_map = {l['chapter_id']: l for l in lessonplans_qs}

            # 4) Build response
            chapter_progress_data = []
            completed_chapters_count = 0
            for c in chapters_qs:
                chap_id = c['id']
                chap_name = c['chapter_name']
                info = lessonplans_map.get(chap_id, {})
                total = info.get('total_lessons', 0)
                completed = info.get('completed_lessons', 0)
                last_completed_date = info.get('last_completed_date')

                if total > 0 and total == completed:
                    status = 'completed'
                    completed_chapters_count += 1
                else:
                    status = 'not completed'
                    last_completed_date = None

                chapter_progress_data.append({
                    "chapter_id": chap_id,
                    "chapter_name": chap_name,
                    "status": status,
                    "completed_date": last_completed_date,
                    'chaper_number': c['chapter_number'],
                    "offline_exams_conducted": 0
                })

            total_chapters = len(chapters_qs)
            overall_progress = round((completed_chapters_count / total_chapters) * 100, 2) if total_chapters > 0 else 0.0

            return JsonResponse({
                "data": {
                    "subject_id": subject_id,
                    "total_chapters": total_chapters,
                    "completed_chapters": completed_chapters_count,
                    "overall_progress_percentage": overall_progress,
                    "chapters": chapter_progress_data
                }
            }, status=200)

        except Exception as e:
            logger.error(
                "Error generating chapter progress for class_section %s and subject %s: %s",
                class_section_id, subject_id, e
            )
            return JsonResponse({"error": "Failed to generate chapter progress"}, status=500)

    def get_lesson_plan_details(self,):
        """Get detailed lesson plan days for a given class_section and chapter"""
        try:
            school_id = self.request.GET.get('school_id')
            class_section_id = self.request.GET.get('class_section_id')
            chapter_id = self.request.GET.get('chapter_id')
            if not class_section_id or not chapter_id:
                return JsonResponse({"error": "Missing required parameters"}, status=400)
            if not school_id:
                return JsonResponse({"error": "Missing school_id"}, status=400)

            school_db_name = CommonFunctions.get_school_db_name(school_id)
            if not school_db_name:
                return JsonResponse({"error": "Invalid school ID"}, status=400)

            lesson_plans = (
                SchoolLessonPlanDay.objects.using(school_db_name)
                .filter(class_section_id=class_section_id, chapter_id=chapter_id)
                .prefetch_related(
                    Prefetch(
                        'school_lesson_topics',
                        queryset=Topic.objects.using(school_db_name).all()
                    )
                )
                .order_by('day')
            )

            output = []
            for lp in lesson_plans:
                output.append({
                    "day": lp.day,
                    "learning_outcomes": lp.learning_outcomes,
                    "real_world_applications": lp.real_world_applications,
                    "taxonomy_alignment": lp.taxonomy_alignment,
                    "status": lp.status,
                    "completed_date": lp.updated_at if lp.status == 'completed' else None,
                    "topics": [
                        {
                            "title": t.title,
                            "summary": t.summary,
                            "time_minutes": t.time_minutes
                        }
                        for t in lp.school_lesson_topics.all()
                    ]
                })
            return JsonResponse({"data": output}, status=200)

        except Exception as e:
            logger.error(
                "Error fetching lesson plan details for class_section %s and chapter %s: %s",
                class_section_id, chapter_id, e
            )
            return JsonResponse({"error": "Failed to fetch lesson plan details"}, status=500)
    
    def get_teacher_subject_progress(self):
        """
        Returns teacher-wise subject progress grouped by subject and board,
        listing all classes assigned with accurate weighted averages based on chapters.
        """
        try:
            school_id = self.request.GET.get('school_id')
            if not school_id:
                return JsonResponse({"error": "Missing school_id"}, status=400)

            school_db_name = CommonFunctions.get_school_db_name(school_id)
            if not school_db_name:
                return JsonResponse({"error": "Invalid school ID"}, status=400)

            latest_academic_year = CommonFunctions().get_latest_academic_year(school_db_name)
            boards_dict = CommonFunctions().get_boards_dict()

            # 1️⃣ Get all teacher–subject–class assignments (with board info)
            assignments = (
                TeacherSubjectAssignment.objects.using(school_db_name)
                .filter(academic_year=latest_academic_year)
                .values(
                    'teacher_id',
                    'subject__id',
                    'subject__name',
                    'school_class_id',
                    'school_class__board_id',
                )
            )

            if not assignments:
                return JsonResponse({"data": []}, status=200)

            # Map teacher IDs to names
            teacher_ids = list({a['teacher_id'] for a in assignments})
            teacher_map = {
                t['id']: f"{t['first_name']} {t['last_name']}".strip()
                for t in User.objects.filter(id__in=teacher_ids).values('id', 'first_name', 'last_name')
            }

            # Map class_section IDs to names
            section_ids = list({a['school_class_id'] for a in assignments})
            section_map = {
                s['id']: f"{s['class_instance__class_number']}-{s['section']}"
                for s in SchoolSection.objects.using(school_db_name)
                .filter(id__in=section_ids)
                .values('id', 'section', 'class_instance__class_number')
            }

            # 2️⃣ Get total chapters per class-section + subject
            chapters_qs = (
                SchoolChapter.objects.using(school_db_name)
                .filter(
                    academic_year=latest_academic_year,
                    class_number_id__in=[SchoolSection.objects.using(school_db_name).get(id=sec_id).class_instance_id for sec_id in section_ids],
                    subject_id__in=[a['subject__id'] for a in assignments]
                )
                .values('subject_id', 'class_number_id','school_board_id')
                .annotate(total_chapters=Count('id'))
            )

            # Map: (subject_id, class_number_id) -> total_chapters
            total_chapters_map = {}
            for ch in chapters_qs:
                total_chapters_map[(ch['subject_id'], ch['class_number_id'], ch['school_board_id'])] = ch['total_chapters']

            # 3️⃣ Get completed chapters per class-section + subject
            chapter_progress_qs = (
                SchoolLessonPlanDay.objects.using(school_db_name)
                .filter(
                    chapter__academic_year=latest_academic_year,
                    class_section_id__in=section_ids,
                    chapter__subject_id__in=[a['subject__id'] for a in assignments],
                )
                .values('chapter_id', 'chapter__subject_id', 'class_section_id')
                .annotate(
                    total_lessons=Count('id'),
                    completed_lessons=Count('id', filter=Q(status='completed'))
                )
            )


            # Map class_section_id -> class_number_id
            class_number_map = {
                s['id']: s['class_instance_id'] for s in SchoolSection.objects.using(school_db_name)
                .filter(id__in=section_ids)
                .values('id', 'class_instance_id')
            }

            # Map: (subject_id, class_section_id) -> completed chapters count
            completed_map = {}
            for cp in chapter_progress_qs:
                section_id = cp['class_section_id']
                subject_id = cp['chapter__subject_id']
                total = cp['total_lessons']
                completed = cp['completed_lessons']

                # Chapter is considered completed if all its lessons are completed
                chapter_completed = 1 if total > 0 and completed == total else 0

                if (subject_id, section_id) in completed_map:
                    completed_map[(subject_id, section_id)] += chapter_completed
                else:
                    completed_map[(subject_id, section_id)] = chapter_completed

            # 4️⃣ Aggregate per teacher + subject + board
            data_map = {}
            for a in assignments:
                t_id = a['teacher_id']
                s_id = a['subject__id']
                subj_name = a['subject__name']
                section_id = a['school_class_id']
                board_id = a['school_class__board_id']
                class_number_id = class_number_map.get(section_id)

                key = (t_id, s_id, board_id)
                if key not in data_map:
                    data_map[key] = {
                        "teacher_id": t_id,
                        "teacher_name": teacher_map.get(t_id, "Unknown"),
                        "subject_id": s_id,
                        "subject_name": subj_name,
                        "board_id": board_id,
                        "board_name": boards_dict.get(board_id, "Unknown Board"),
                        "classes_assigned": [],
                        "total_chapters": 0,
                        "completed_chapters": 0
                    }

                # Add class name
                class_name = section_map.get(section_id, "Unknown")
                if class_name not in data_map[key]["classes_assigned"]:
                    data_map[key]["classes_assigned"].append(class_name)

                # Add chapter counts
                total_chapters = total_chapters_map.get((s_id, class_number_id, board_id), 0)
                completed_chapters = completed_map.get((s_id, section_id), 0)
                data_map[key]["total_chapters"] += total_chapters
                data_map[key]["completed_chapters"] += completed_chapters

            # 5️⃣ Finalize response
            result = []
            for val in data_map.values():
                total_ch = val["total_chapters"]
                completed_ch = val["completed_chapters"]
                completion_percentage = round((completed_ch / total_ch) * 100, 2) if total_ch > 0 else 0.0
                result.append({
                    "teacher_id": val["teacher_id"],
                    "teacher_name": val["teacher_name"],
                    "subject_id": val["subject_id"],
                    "subject_name": val["subject_name"],
                    "board_id": val["board_id"],
                    "board_name": val["board_name"],
                    "completion_percentage": completion_percentage,
                    "classes_assigned": val["classes_assigned"]
                })

            return JsonResponse({"data": result}, status=200)

        except Exception as e:
            logger.error("Error generating teacher subject progress: %s", e, exc_info=True)
            return JsonResponse({"error": "Failed to generate teacher subject progress"}, status=500)





