"""Syllabus Service Module"""

import logging
from rest_framework.response import Response
from rest_framework import status

from syllabus.models import SchoolChapter, SchoolPrerequisite, SchoolSubTopic
from core.common_modules.common_functions import CommonFunctions
from teacher.models import TeacherSubjectAssignment
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
                          'school_class__section', 'subject_id','subject__name')
            
            data = []
            for assignment in teacher_assignment_obj:
                data.append({
                    "class_id": assignment["school_class_id"],
                    "class_number": assignment["school_class__class_instance_id"],
                    "section": assignment["school_class__section"],
                    "subject_id": assignment["subject_id"],
                    "subject_name": assignment["subject__name"]
                })
            return Response({"data": data}, status=status.HTTP_200_OK)

        except Exception as e:
            logger.error(f"Error fetching grade by teacher ID: {e}")
            return Response({"error": "Failed to fetch grade."},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)