"""Exam service"""

import logging

from django.db.models import Avg, Count, Case, When, Value, F, FloatField, Q
from django.http import JsonResponse
from django.db import transaction
from psycopg2 import IntegrityError

from student.models import StudentClassAssignment, StudentAttendanceData
from teacher.models import Exam, ExamCategory, ExamType,ExamResult
from core.common_modules.common_functions import CommonFunctions
from core.models import User, SessionTypes

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
    
    def get_exam_categories_for_chapterwise(self):
        """Get Exam Categories for chapterwise"""
        try:
            categories = ExamCategory.objects.using(self.school_db_name).filter(
                id__in=[1,15,17,18,19,20]
            ).order_by('name','id')
            return JsonResponse({"data": [{"id": cat.id, "name": cat.name} for cat in categories]})
        except Exception as e:
            logger.error("Error fetching chapterwise exam categories: %s", e)
            return JsonResponse({"error": "Unable to fetch chapterwise exam categories"}, status=500)

    def create_offline_exam(self):
        """Create Offline Exam"""
        try:
            logger.info("Creating offline exam")
            data = self.request.data
            exam_name = data.get("exam_name")
            exam_category_id = data.get("exam_category_id")
            exam_type = data.get("exam_type","offline")
            exam_date = data.get("exam_date")
            max_marks = data.get("total_marks")
            pass_marks = data.get("pass_marks")
            subject_id = data.get("subject_id")
            academic_year_id = data.get("academic_year_id", 1)
            class_section_id = data.get("class_section_id")
            exam_session = data.get("exam_session", SessionTypes.MORNING)
            chapter_id = data.get("chapter_id", None)

            exam = Exam.objects.using(self.school_db_name).create(
                name=exam_name,
                exam_category_id=exam_category_id,
                exam_type=exam_type,
                exam_date=exam_date,
                max_marks=max_marks,
                pass_marks=pass_marks,
                subject_id=subject_id,
                academic_year_id=academic_year_id,
                class_section_id=class_section_id,
                created_by_teacher_id=self.user.id,
                updated_by_teacher_id=self.user.id,
                session=exam_session,
                chapter_id=chapter_id
            )

            students_list = StudentClassAssignment.objects.using(self.school_db_name).filter(
                class_instance_id=class_section_id,
                academic_year_id=academic_year_id,
            ).values_list('student_id', flat=True)

            attendance = StudentAttendanceData.objects.using(self.school_db_name).filter(
                attendance__class_section_id=class_section_id,
                attendance__academic_year_id=academic_year_id,
                attendance__date=exam_date,
                attendance__is_holiday=False,
                attendance__session=exam_session
            )

            attendance_mapping = {att.student_id: att.is_present for att in attendance}

            exams_results_objs = [
                ExamResult(
                    exam=exam,
                    student_id=student,
                    marks_obtained=0,
                    is_absent=not attendance_mapping.get(student, True),
                    created_by_teacher_id=self.user.id,
                    updated_by_teacher_id=self.user.id
                )
                for student in students_list
            ]
            ExamResult.objects.using(self.school_db_name).bulk_create(exams_results_objs)

            logger.info("Offline exam created successfully with ID %s", exam.id)
            return JsonResponse({"message": "Offline exam created successfully"}, status=201)
        except IntegrityError as e:
            logger.error("Invalid foreign key while creating exam: %s", e)
            return JsonResponse({"error": "Invalid related ID provided"}, status=400)
        except Exception as e:
            logger.exception("Error creating offline exam: %s", e)
            return JsonResponse({"error": "Unable to create offline exam"},
                                status=500)
    
    def edit_offline_exam(self):
        """Edit Offline Exam"""
        try:
            data = self.request.data
            exam_id = data.get("exam_id")
            exam = Exam.objects.using(self.school_db_name).get(id=exam_id)

            exam.name = data.get("exam_name", exam.name)
            exam.exam_category_id = data.get("exam_category_id", exam.exam_category_id)
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
    
    def assign_marks_to_exam(self):
        """Assign marks to exam"""
        try:
            data = self.request.data
            exam_id = data.get("exam_id")
            student_marks = data.get("student_marks", [])

            exam = Exam.objects.using(self.school_db_name).get(id=exam_id)

            with transaction.atomic(using=self.school_db_name):
                student_ids = [item["student_id"] for item in student_marks if item.get("student_id")]

                existing_results = ExamResult.objects.using(self.school_db_name).filter(
                    exam=exam,
                    student_id__in=student_ids
                )

                existing = {res.student_id: res for res in existing_results}

                to_create = []
                to_update = []

                for item in student_marks:
                    student_id = item.get("student_id")
                    marks = item.get("marks", 0)

                    if student_id in existing:
                        obj = existing[student_id]
                        obj.marks_obtained = marks
                        obj.updated_by_teacher_id = self.user.id
                        to_update.append(obj)
                    else:
                        to_create.append(
                            ExamResult(
                                exam=exam,
                                student_id=student_id,
                                marks_obtained=marks,
                                updated_by_teacher_id=self.user.id,
                                created_by_teacher_id=self.user.id,
                            )
                        )

                if to_create:
                    ExamResult.objects.using(self.school_db_name).bulk_create(to_create)

                if to_update:
                    ExamResult.objects.using(self.school_db_name).bulk_update(
                        to_update, ["marks_obtained", "updated_by_teacher"]
                    )
                exam.is_submitted = True
                exam.save(using=self.school_db_name)

            logger.info("Marks assigned successfully for exam ID %s", exam.id)
            return JsonResponse({"message": "Marks assigned successfully"}, status=200)
        except Exam.DoesNotExist:
            logger.error("Exam not found while assigning marks: %s", exam_id)
            return JsonResponse({"error": "Exam not found"}, status=404)
        except Exception as e:
            logger.error("Error assigning marks to exam: %s", e)
            return JsonResponse({"error": "Unable to assign marks to exam"}, status=500)

    def get_exam_details_by_id(self):
        """Get Exam Details"""
        try:
            data = self.request.GET
            exam_id = data.get("exam_id")
            exam = Exam.objects.using(self.school_db_name).select_related(
                'subject', 'created_by_teacher', 'updated_by_teacher',"exam_category"
            ).get(id=exam_id)

            marks = ExamResult.objects.using(self.school_db_name).filter(
                exam=exam
            ).values("student_id", "student__roll_number", "marks_obtained","is_absent")

            marks_data = []

            student_ids = [m["student_id"] for m in marks]

            students = (
                User.objects.using("default")
                .filter(id__in=student_ids)
                .values("id", "first_name", "last_name")
            )

            students_map = {
                s["id"]: f"{s['first_name'] or ''} {s['last_name'] or ''}".strip()
                for s in students
            }

            marks_data = [
                {
                    "student_id": mark["student_id"],
                    "roll_number": mark["student__roll_number"],
                    "marks_obtained": round(mark["marks_obtained"], 2),
                    "student_name": students_map.get(mark["student_id"], ""),
                    "is_absent": mark.get("is_absent", False),
                }
                for mark in marks
            ]

            exam_data = {
                "exam_id": exam.id,
                "name": exam.name,
                "exam_type": exam.exam_type,
                "exam_category": exam.exam_category.name,
                "max_marks": round(exam.max_marks, 2),
                "pass_marks": round(exam.pass_marks, 2),
                "exam_date": exam.exam_date,
                "subject_name": exam.subject.name,
                "created_by": exam.created_by_teacher.full_name,
                "updated_by": exam.updated_by_teacher.full_name if exam.updated_by_teacher else None,
                "marks": marks_data,
                "exam_session": exam.session,
                "chapter_id": exam.chapter_id,

            }
            logger.info("Fetched exam details successfully for exam ID %s", exam_id)
            return JsonResponse({"data": exam_data}, status=200)
        except Exam.DoesNotExist:
            logger.error("Exam not found while fetching details: %s", exam_id)
            return JsonResponse({"error": "Exam not found"}, status=404)
        except Exception as e:
            logger.error("Error fetching exam details: %s", e)
            return JsonResponse({"error": "Unable to fetch exam details"}, status=500)
    
    def get_exams_list(self):
        """Get Exams List"""
        try:
            data = self.request.GET
            class_section_id = data.get("class_section_id")
            subject_id = data.get("subject_id")
            academic_year_id = data.get("academic_year_id", 1)
            chapter_id = data.get("chapter_id", None)

            if not any([class_section_id, subject_id, academic_year_id]):
                return JsonResponse({"error": "Mandatory fields are required"}, status=400)

            filters = dict(
                class_section_id=class_section_id,
                subject_id=subject_id,
                academic_year_id=academic_year_id,
                is_active=True,
            )
            if chapter_id:
                filters["chapter_id"] = chapter_id
            exams = Exam.objects.using(self.school_db_name).filter(
                **filters
            ).select_related('exam_category').order_by('-created_at')

            if not exams.exists():
                return JsonResponse({"data": []}, status=200)

            exam_results = (
                ExamResult.objects.using(self.school_db_name)
                .filter(exam_id__in=exams.values_list("id", flat=True))
                .values("exam_id")
                .annotate(
                    average_marks=Avg("marks_obtained"),
                    student_count=Count("student_id"),
                    passed_students=Count(
                        "student_id",
                        filter=Q(marks_obtained__gte=F("exam__pass_marks"))
                    ),
                )
                .annotate(
                    pass_percentage=Case(
                        When(student_count=0, then=Value(0)),
                        default=F("passed_students") * 100.0 / F("student_count"),
                        output_field=FloatField(),
                    )
                )
            )

            exam_results_map = {res["exam_id"]: res for res in exam_results}

            output = []
            for exam in exams:
                res = exam_results_map.get(exam.id, {})
                output.append({
                    "exam_id": exam.id,
                    "exam_name": exam.name,
                    "exam_type": exam.exam_type,
                    "exam_date": exam.exam_date,
                    "exam_category": exam.exam_category.name,
                    "exam_session": exam.session if exam.session else None,
                    "chapter_id": exam.chapter_id,
                    "total_marks": round(exam.max_marks, 2),
                    "pass_marks": round(exam.pass_marks, 2),
                    "average_marks": round(res.get("average_marks", 0), 2),
                    "student_count": res.get("student_count", 0),
                    "passed_students": res.get("passed_students", 0),
                    "pass_percentage": round(res.get("pass_percentage", 0), 2),
                    "is_submitted": exam.is_submitted
                })

            return JsonResponse({"data": output}, status=200)

        except Exception as e:
            logger.error("Error fetching exams list: %s", e)
            return JsonResponse({"error": "Unable to fetch exams list"}, status=500)
