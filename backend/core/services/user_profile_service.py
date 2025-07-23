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
        """Retrieve user profile by username."""
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
                        "class_number": class_obj.class_number if class_obj else None,
                        "section": class_obj.section if class_obj else None,
                        "roll_number": student.roll_number,
                    })
            return Response({"user": output}, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.error("Error retrieving user profile: %s", str(e))
            return Response({"error": "An error occurred while retrieving the profile."},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    

    def edit_user_by_username(self, request):
        """Update the authenticated user's profile information."""
        try:
            user_name = request.data.get('user_name')
            first_name = request.data.get('first_name')
            last_name = request.data.get('last_name')
            email = request.data.get('email')
            phone_number = request.data.get('phone_number')
            gender = request.data.get('gender')
            address = request.data.get('address')
            date_of_birth = request.data.get('date_of_birth')
            school_id = request.user.school_id

            if not user_name:
                return Response({"error": "Username is required."},
                                status=status.HTTP_400_BAD_REQUEST)

            user = User.objects.get(user_name=user_name)

            if not user.is_active:
                logger.error("User with ID %s is inactive.", user.user_name)
                return Response(
                    {"error": "User is inactive. Please contact school teacher or principal."},
                    status=status.HTTP_403_FORBIDDEN
                )

            if first_name:
                user.first_name = first_name
            if last_name:
                user.last_name = last_name
            if email:
                user.email = email
            if phone_number:
                user.phone_number = phone_number
            if gender:
                user.gender = gender
            if address:
                user.address = address
            if date_of_birth:
                user.date_of_birth = date_of_birth

            school_db_name = None
            if school_id:
                school_db_name = CommonFunctions.get_school_db_name(school_id)
            with transaction.atomic():
                with transaction.atomic(using=school_db_name):
                    if school_id:
                        if school_db_name is None:
                            logger.error("School with ID %s does not exist.", school_id)
                            return Response({"error": "School not found."},
                                            status=status.HTTP_404_NOT_FOUND)
                        if user.role.id == 3:
                            emergency_contact = request.data.get('emergency_contact')
                            teacher = Teacher.objects.using(school_db_name).filter(
                                teacher_id=user.id).first()
                            if emergency_contact and teacher:
                                teacher.emergency_contact = emergency_contact
                            teacher.save(using=school_db_name)
                        elif user.role.id == 4:
                            parent_name = request.data.get('parent_name')
                            parent_phone = request.data.get('parent_phone')
                            parent_email = request.data.get('parent_email')
                            student = Student.objects.using(school_db_name).filter(
                                student_id=user.id).first()
                            if student:
                                if parent_name:
                                    student.parent_name = parent_name
                                if parent_phone:
                                    student.parent_phone = parent_phone
                                if parent_email:
                                    student.parent_email = parent_email
                                student.save(using=school_db_name)
                    user.save()

            return Response(
                {"message": "User profile updated successfully."},
                status=status.HTTP_200_OK
            )
        except User.DoesNotExist:
            return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.error("Error updating user profile: %s", str(e))
            return Response({"error": "An error occurred while updating the profile."},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)
