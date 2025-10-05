"""Syllabus progress report service"""

import logging
from django.http import JsonResponse
from django.db.models import Count, Q, F

from teacher.models import TeacherSubjectAssignment
from syllabus.models import SchoolLessonPlanDay, SchoolChapter
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