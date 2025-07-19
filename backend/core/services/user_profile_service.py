"""User Profile Service for managing user profiles in the application."""
import logging

from rest_framework.response import Response
from rest_framework import status
from django.db import transaction

from core.models import User
from teacher.models import Teacher
from academics.models import AcademicYear
from student.models import Student,StudentClassAssignment
from classes.models import SchoolClass

from core.common_modules.common_functions import CommonFunctions

logger = logging.getLogger(__name__)

class UserProfileService:
    """User Profile Service to handle user profile operations."""

    def get_user_by_username(self, request):
        try:
            user_name = request.GET.get('user_name', request.user.user_name)
            user = User.objects.get(user_name=user_name)
            school_id = user.school_id

            if not user.is_active:
                logger.error("User with ID %s is inactive.", user.user_name)
                return Response(
                    {"error": "User is inactive. Please contact school teacher or principal."},
                    status=status.HTTP_403_FORBIDDEN
                )

            if not user:
                logger.error("User with ID %s does not exist.", user.user_name)
                return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)
            output = {
                "id": user.id,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "email": user.email,
                "phone_number": user.phone_number,
                "user_name": user.user_name,
                "gender": user.gender,
                "address": user.address,
                "date_of_birth": user.date_of_birth,
            }
            if school_id:
                school_db_name = CommonFunctions.get_school_db_name(school_id)
                if school_db_name is None:
                    logger.error("School with ID %s does not exist.", user.school_id)
                    return Response({"error": "School not found."},
                                    status=status.HTTP_404_NOT_FOUND)
                if user.role.id == 3:
                    teacher = Teacher.objects.using(school_db_name).filter(
                        teacher_id=user.id).first()
                    if not teacher:
                        logger.error("Teacher with ID %s does not exist.", user.id)
                        return Response({"error": "Teacher not found."},
                                        status=status.HTTP_404_NOT_FOUND)
                    output.update({
                        "joining_date": teacher.joining_date,
                        "qualification": teacher.qualification,
                        "experience": teacher.experience,
                        "emergency_contact": teacher.emergency_contact,
                    })
                elif user.role.id == 4:
                    acadamic_year_id = request.GET.get("academic_year_id")
                    if not acadamic_year_id:
                        logger.error("Academic year ID is required for student profile.")
                        return Response({"error": "Academic year ID is required."},
                                        status=status.HTTP_400_BAD_REQUEST)

                    academic_year = AcademicYear.objects.using(school_db_name).filter(
                        id=acadamic_year_id, is_active=True).first()

                    if not academic_year:
                        logger.error("Academic year with ID %s does not exist.", acadamic_year_id)
                        return Response({"error": "Academic year not found."},
                                        status=status.HTTP_404_NOT_FOUND)

                    student_class_assignment = StudentClassAssignment.objects.using(
                        school_db_name
                    ).filter(
                        student_id=user.id, academic_year_id=acadamic_year_id
                    ).first()

                    class_obj = None
                    if student_class_assignment:
                        class_obj = SchoolClass.objects.using(school_db_name).filter(
                            id=student_class_assignment.class_instance_id
                        ).first()

                    student = Student.objects.using(school_db_name).filter(
                        student_id=user.id).first()

                    if not student:
                        logger.error("Student with ID %s does not exist.", user.id)
                        return Response({"error": "Student not found."},
                                        status=status.HTTP_404_NOT_FOUND)

                    output.update({
                        "admission_date": student.admission_date,
                        "parent_name": student.parent_name,
                        "parent_phone": student.parent_phone,
                        "parent_email": student.parent_email,
                        "class_id": class_obj.id if class_obj else None,
                        "class_name": class_obj.name if class_obj else None,
                        "section": class_obj.section if class_obj else None,
                        "roll_number": student.roll_number,
                    })
            return Response({"user": output}, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)