"""Exam service"""

import logging

from django.http import JsonResponse
from psycopg2 import IntegrityError

from teacher.models import Exam, ExamCategory, ExamType
from core.common_modules.common_functions import CommonFunctions

logger = logging.getLogger(__name__)


class OfflineExamsService:
    """Offline Exams"""

    def __init__(self, request):
        self.request = request
        self.user = request.user
        self.school_id = (
            request.GET.get("school_id") or 
            request.data.get("school_id") or 
            getattr(request.user, 'school_id', None)
        )
        self.school_db_name = CommonFunctions.get_school_db_name(self.school_id)

    def get_exam_categories(self):
        """Get Exam Categories"""
        try:
            categories = ExamCategory.objects.using(self.school_db_name).all()
            return JsonResponse({"data": [{"id": cat.id, "name": cat.name} for cat in categories]})
        except Exception as e:
            logger.error("Error fetching exam categories: %s", e)
            return JsonResponse({"error": "Unable to fetch exam categories"}, status=500)

    def create_offline_exam(self):
        """Create Offline Exam"""
        try:
            logger.info("Creating offline exam")
            data = self.request.data
            exam_name = data.get("exam_name")
            exam_category_id = data.get("exam_category_id")
            exam_type = data.get("exam_type","offline"),
            exam_date = data.get("exam_date")
            max_marks = data.get("total_marks")
            pass_marks = data.get("pass_marks")
            subject_id = data.get("subject_id")
            academic_year_id = data.get("academic_year_id", 1)
            class_section_id = data.get("class_section_id")

            exam = Exam.objects.using(self.school_db_name).create(
                name=exam_name,
                category_id=exam_category_id,
                exam_type=exam_type,
                exam_date=exam_date,
                max_marks=max_marks,
                pass_marks=pass_marks,
                subject_id=subject_id,
                academic_year_id=academic_year_id,
                class_section_id=class_section_id,
                created_by_teacher_id=self.user.id,
                updated_by_teacher_id=self.user.id
            )

            logger.info("Offline exam created successfully with ID %s", exam.id)
            return JsonResponse({"data": {"exam_id": exam.id}})
        except IntegrityError as e:
            logger.error("Invalid foreign key while creating exam: %s", e)
            return JsonResponse({"error": "Invalid related ID provided"}, status=400)
        except Exception as e:
            logger.error("Error creating offline exam: %s", e)
            return JsonResponse({"error": "Unable to create offline exam"},
                                status=500)
    
    def edit_offline_exam(self):
        """Edit Offline Exam"""
        try:
            data = self.request.data
            exam_id = data.get("exam_id")
            exam = Exam.objects.using(self.school_db_name).get(id=exam_id)

            exam.name = data.get("exam_name", exam.name)
            exam.category_id = data.get("exam_category_id", exam.category_id)
            exam.exam_date = data.get("exam_date", exam.exam_date)
            exam.max_marks = data.get("total_marks", exam.max_marks)
            exam.pass_marks = data.get("pass_marks", exam.pass_marks)
            exam.class_section_id = data.get("class_section_id", exam.class_section_id)

            exam.updated_by_teacher_id = self.user.id

            exam.save(using=self.school_db_name)
            logger.info("Offline exam edited successfully with ID %s", exam.id)
            return JsonResponse({"message": "Offline exam edited successfully"}, status=200)
        except Exam.DoesNotExist:
            logger.error("Exam not found while editing: %s", exam_id)
            return JsonResponse({"error": "Exam not found"}, status=404)
        except IntegrityError as e:
            logger.error("Invalid foreign key while editing exam: %s", e)
            return JsonResponse({"error": "Invalid related ID provided"}, status=400)
        except Exception as e:
            logger.error("Error editing offline exam: %s", e)
            return JsonResponse({"error": "Unable to edit offline exam"}, status=500)
    
    def delete_offline_exam(self):
        """Delete Offline Exam"""
        try:
            data = self.request.data
            exam_id = data.get("exam_id")
            exam = Exam.objects.using(self.school_db_name).get(id=exam_id)
            exam.is_active = False
            exam.save(using=self.school_db_name)
            logger.info("Offline exam deleted successfully with ID %s", exam_id)
            return JsonResponse({"message": "Offline exam deleted successfully"}, status=200)
        except Exam.DoesNotExist:
            logger.error("Exam not found while deleting: %s", exam_id)
            return JsonResponse({"error": "Exam not found"}, status=404)
        except Exception as e:
            logger.error("Error deleting offline exam: %s", e)
            return JsonResponse({"error": "Unable to delete offline exam"}, status=500)
    
    # def assign_marks_to_exam(self):
    #     """"""
