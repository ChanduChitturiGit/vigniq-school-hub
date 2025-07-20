"""Student Service Module
This module provides services related to student operations, including creating,
updating, and retrieving student data."""

import logging

from django.db import transaction,IntegrityError
from django.http import JsonResponse

from rest_framework import status

from student.models import Student,StudentClassAssignment

from classes.models import SchoolClass
from academics.models import AcademicYear

from core.common_modules.common_functions import CommonFunctions
from core.models import User,Role


logger = logging.getLogger(__name__)

class StudentService:
    """Service class for handling student-related operations."""
    
    def __init__(self,school_db_name = None):
        self.school_db_name = school_db_name

    def create_student(self, request):
        """Create a new student."""
        try:
            school_id = request.data.get('school_id', request.user.school_id)
            first_name = request.data.get('first_name')
            last_name = request.data.get('last_name')
            username = request.data.get('user_name')
            email = request.data.get('email')
            password = request.data.get('password')
            phone = request.data.get('phone_number')
            class_id = request.data.get('class_id')
            roll_number = request.data.get('roll_number')
            date_of_birth = request.data.get('date_of_birth')
            gender = request.data.get('gender')
            address = request.data.get('address')
            addmission_date = request.data.get('admission_date')
            parent_name = request.data.get('parent_name')
            parent_phone = request.data.get('parent_phone')
            parent_email = request.data.get('parent_email')
            acadamic_year_id = request.data.get('academic_year_id',1)


            if not school_id:
                return JsonResponse({"error": "School ID is required."},
                                    status=status.HTTP_400_BAD_REQUEST)

            if not first_name or not last_name:
                return JsonResponse({"error": "First name and last name are required."},
                                    status=status.HTTP_400_BAD_REQUEST)
            if (not username or not class_id or not password or not roll_number or not date_of_birth
                or not gender or not address or not addmission_date or not parent_name or not 
                parent_phone or not acadamic_year_id):
                return JsonResponse({"error": "All manditory fields are required."},
                                    status=status.HTTP_400_BAD_REQUEST)

            school_db_name = CommonFunctions.get_school_db_name(school_id)

            if not school_db_name:
                return JsonResponse({"error": "School not found or school is inactive."},
                                    status=status.HTTP_404_NOT_FOUND)

            with transaction.atomic():
                role = Role.objects.get(name='student')
                user = User.objects.create_user(
                    user_name=username,
                    first_name=first_name,
                    last_name=last_name,
                    email=email,
                    password=password,
                    phone_number=phone,
                    school_id=school_id,
                    gender=gender,
                    address=address,
                    role = role,
                    date_of_birth=date_of_birth,
                )
                class_instance = SchoolClass.objects.using(school_db_name).get(id=class_id)
                if not class_instance:
                    return JsonResponse({"error": "Class not found."},
                                        status=status.HTTP_404_NOT_FOUND)
                
                student = Student.objects.using(school_db_name).create(
                    student_id=user.id,
                    roll_number=roll_number,
                    admission_date=addmission_date,
                    parent_name=parent_name,
                    parent_phone=parent_phone,
                    parent_email=parent_email
                )

                acadamic_year = AcademicYear.objects.using(school_db_name).get(id=acadamic_year_id)

                student_class_assignment = StudentClassAssignment.objects.using(
                    school_db_name
                ).create(
                    student = student,
                    class_instance = class_instance,
                    academic_year = acadamic_year
                )

            return JsonResponse({"message": "Student created successfully.",
                                 "student_id": student.student_id}, status=status.HTTP_201_CREATED)
        except Role.DoesNotExist:
            return JsonResponse({"error": "Role student not found."},
                                status=status.HTTP_404_NOT_FOUND)
        except SchoolClass.DoesNotExist:
            return JsonResponse({"error": "Class not found."},
                                status=status.HTTP_404_NOT_FOUND)
        except AcademicYear.DoesNotExist:
            return JsonResponse({"error": "Academic year not found."},
                                status=status.HTTP_404_NOT_FOUND)
        except User.DoesNotExist:
            return JsonResponse({"error": "User creation failed."},
                                status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except IntegrityError as e:
            logger.error(f"Integrity error: {e}")
            if 'unique_student_id_roll_number' in str(e):
                return JsonResponse({"error": "Student with this ID and roll number already exists."},
                                    status=status.HTTP_400_BAD_REQUEST)
            elif 'unique_student_academic_year' in str(e):
                return JsonResponse({"error": "This student is already assigned to the class for this academic year."},
                                    status=status.HTTP_400_BAD_REQUEST)
            elif 'unique_academic_year_dates' in str(e):
                return JsonResponse({"error": "Academic year with these dates already exists."},
                                    status=status.HTTP_400_BAD_REQUEST)
            elif 'unique constraint' in str(e).lower():
                return JsonResponse({'error':"Username already exists."}, status=400)
            
        except Exception as e:
            logger.error(f"Error creating student: {e}")
            return JsonResponse({"error": "Failed to create student."},
                                status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def update_student_by_id(self, request):
        """Update an existing student's details."""
        try:
            school_id = request.data.get('school_id', request.user.school_id)
            student_id = request.data.get('student_id')
            first_name = request.data.get('first_name')
            last_name = request.data.get('last_name')
            email = request.data.get('email')
            phone = request.data.get('phone_number')
            class_assignment_id = request.data.get('class_assignment_id')
            class_id = request.data.get('class_id')
            roll_number = request.data.get('roll_number')
            date_of_birth = request.data.get('date_of_birth')
            gender = request.data.get('gender')
            address = request.data.get('address')
            addmission_date = request.data.get('admission_date')
            parent_name = request.data.get('parent_name')
            parent_phone = request.data.get('parent_phone')
            parent_email = request.data.get('parent_email')
            acadamic_year_id = request.data.get('academic_year_id',1)

            if not school_id:
                return JsonResponse({"error": "School ID is required."},
                                    status=status.HTTP_400_BAD_REQUEST)
            if not student_id:
                return JsonResponse({"error": "Student ID is required."},
                                    status=status.HTTP_400_BAD_REQUEST)
            
            user = User.objects.get(
                id=student_id)

            if first_name:
                user.first_name = first_name
            if last_name:
                user.last_name = last_name
            if email:
                user.email = email
            if phone:
                user.phone_number = phone
            if gender:
                user.gender = gender
            if address:
                user.address = address
            if date_of_birth:
                user.date_of_birth = date_of_birth

            school_db_name = CommonFunctions.get_school_db_name(school_id)

            student = Student.objects.using(school_db_name).get(
                student_id=student_id
            )
            if not student:
                return JsonResponse({"error": "Student not found."},
                                    status=status.HTTP_404_NOT_FOUND)
            if roll_number:
                student.roll_number = roll_number
            if addmission_date:
                student.admission_date = addmission_date
            if parent_name:
                student.parent_name = parent_name
            if parent_phone:
                student.parent_phone = parent_phone
            if parent_email:
                student.parent_email = parent_email

            with transaction.atomic():
                with transaction.atomic(using=school_db_name):
                    user.save()
                    student.save(using=school_db_name)
                    if class_assignment_id and class_id and acadamic_year_id:
                        class_assignment_instance = StudentClassAssignment.objects.using(
                            school_db_name
                        ).get(
                            id=class_assignment_id
                        )
                        if not class_assignment_instance:
                            raise ValueError("Class Assignment not found for the student.")
                        class_assignment_instance.delete()

                        class_instance = SchoolClass.objects.using(school_db_name).get(id=class_id)
                        
                        acadamic_year = AcademicYear.objects.using(school_db_name).get(id=acadamic_year_id)
                        if not acadamic_year:
                            raise ValueError("Academic year not found.")
                        student_class_assignment = StudentClassAssignment.objects.using(
                            school_db_name
                        ).create(
                            student=student,
                            class_instance=class_instance,
                            academic_year=acadamic_year
                        )
                    return JsonResponse(
                        {"message": "Student updated successfully.",
                            "student_id": student.student_id}, status=status.HTTP_200_OK)
        except ValueError as ve:
            logger.error(f"Value error: {ve}")
            return JsonResponse({"error": ve},
                                            status=status.HTTP_404_NOT_FOUND)
        except User.DoesNotExist:
            return JsonResponse({"error": "User not found."},
                                status=status.HTTP_404_NOT_FOUND)
        except Student.DoesNotExist:
            return JsonResponse({"error": "Student not found."},
                                status=status.HTTP_404_NOT_FOUND)
        except SchoolClass.DoesNotExist:
            return JsonResponse({"error": "Class not found."},
                                status=status.HTTP_404_NOT_FOUND)
        except AcademicYear.DoesNotExist:
            return JsonResponse({"error": "Academic year not found."},
                                status=status.HTTP_404_NOT_FOUND)
        except IntegrityError as e:
            logger.error(f"Integrity error: {e}")
            if 'unique_student_id_roll_number' in str(e):
                return JsonResponse({"error": "Student with this ID and roll number already exists."},
                                    status=status.HTTP_400_BAD_REQUEST)
            elif 'unique_student_academic_year' in str(e):
                return JsonResponse({"error": "This student is already assigned to the class for this academic year."},
                                    status=status.HTTP_400_BAD_REQUEST)
            elif 'unique constraint' in str(e).lower():
                return JsonResponse({'error':"Username already exists."}, status=400)
            return JsonResponse({"error": "Failed to update student."},
                                status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except Exception as e:
            logger.error(f"Error updating student: {e}")
            return JsonResponse({"error": "Failed to update student."},
                                status=status.HTTP_500_INTERNAL_SERVER_ERROR)


    def get_students_by_school_id(self, request):
        """Retrieve students by school ID."""
        try:
            school_id = request.data.get('school_id', request.user.school_id)
            academic_year_id = request.data.get('academic_year_id', 1)
            if not academic_year_id:
                return JsonResponse({"error": "Academic year ID is required."},
                                    status=status.HTTP_400_BAD_REQUEST)
            if not school_id:
                return JsonResponse({"error": "School ID is required."},
                                    status=status.HTTP_400_BAD_REQUEST)

            self.school_db_name = CommonFunctions.get_school_db_name(school_id)
            if not self.school_db_name:
                return JsonResponse({"error": "School not found or school is inactive."},
                                    status=status.HTTP_404_NOT_FOUND)

            students = Student.objects.using(self.school_db_name).all()

            students_data = self.get_students_data(students,academic_year_id)

            return JsonResponse({"students": students_data}, status=status.HTTP_200_OK)
        except ValueError as ve:
            logger.error(f"Value error: {ve}")
            return JsonResponse({"error": str(ve)},
                                status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.error(f"Error retrieving students: {e}")
            return JsonResponse({"error": "Failed to retrieve students."},
                                status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def get_student_by_id(self, request):
        """Retrieve a student by their ID."""
        try:
            school_id = request.data.get('school_id', request.user.school_id)
            student_id = request.data.get('student_id')
            academic_year_id = request.data.get('academic_year_id', 1)

            if not academic_year_id:
                return JsonResponse({"error": "Academic year ID is required."},
                                    status=status.HTTP_400_BAD_REQUEST)
            if not school_id:
                return JsonResponse({"error": "School ID is required."},
                                    status=status.HTTP_400_BAD_REQUEST)
            if not student_id:
                return JsonResponse({"error": "Student ID is required."},
                                    status=status.HTTP_400_BAD_REQUEST)

            self.school_db_name = CommonFunctions.get_school_db_name(school_id)
            if not self.school_db_name:
                return JsonResponse({"error": "School not found or school is inactive."},
                                    status=status.HTTP_404_NOT_FOUND)

            student = Student.objects.using(self.school_db_name).get(student_id=student_id)
            if not student:
                return JsonResponse({"error": "Student not found."},
                                    status=status.HTTP_404_NOT_FOUND)

            user = User.objects.get(id=student.student_id)

            academic_year = AcademicYear.objects.using(self.school_db_name).get(id=academic_year_id)
            class_assignment = StudentClassAssignment.objects.using(self.school_db_name).get(
                student = student,
                academic_year = academic_year
            )
            class_instance = SchoolClass.objects.using(self.school_db_name).get(
                id=class_assignment.class_instance_id
            )

            student_data = {
                "student_id": student.student_id,
                "student_first_name": user.first_name,
                "student_last_name": user.last_name,
                "roll_number": student.roll_number,
                "parent_name": student.parent_name,
                "parent_phone": student.parent_phone,
                "is_active": student.is_active,
                "class_name": class_instance.name,
                "class_id": class_instance.id,
                "section": class_instance.section,
                "email": user.email,
                "address": user.address,
                "date_of_birth": user.date_of_birth,
                "gender": user.gender,
                "admission_date": student.admission_date
            }

            return JsonResponse({"student": student_data}, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Error retrieving student by ID: {e}")
            return JsonResponse({"error": "Failed to retrieve student."},
                                status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def get_students_by_class_id(self, request):
        """Retrieve students by class ID."""
        try:
            school_id = request.data.get('school_id', request.user.school_id)
            class_id = request.data.get('class_id')
            academic_year_id = request.data.get('academic_year_id', 1)

            if not school_id:
                return JsonResponse({"error": "School ID is required."},
                                    status=status.HTTP_400_BAD_REQUEST)
            if not class_id:
                return JsonResponse({"error": "Class ID is required."},
                                    status=status.HTTP_400_BAD_REQUEST)
            if not academic_year_id:
                return JsonResponse({"error": "Academic year ID is required."},
                                    status=status.HTTP_400_BAD_REQUEST)

            self.school_db_name = CommonFunctions.get_school_db_name(school_id)
            if not self.school_db_name:
                return JsonResponse({"error": "School not found or school is inactive."},
                                    status=status.HTTP_404_NOT_FOUND)

            class_instance = SchoolClass.objects.using(self.school_db_name).get(id=class_id)

            students_instants_ids = StudentClassAssignment.objects.using(self.school_db_name).filter(
                class_instance=class_instance,
                academic_year_id=academic_year_id
            ).values_list('student_id', flat=True)

            students = Student.objects.using(self.school_db_name).filter(
                id__in=students_instants_ids,
            )

            formated_students_data = self.get_students_data(students,academic_year_id)

            return JsonResponse({"students": formated_students_data}, status=status.HTTP_200_OK)
        except ValueError as ve:
            logger.error(f"Value error: {ve}")
            return JsonResponse({"error": str(ve)},
                                status=status.HTTP_404_NOT_FOUND)
        except StudentClassAssignment.DoesNotExist:
            return JsonResponse({"error": "No students found for this class."},
                                status=status.HTTP_404_NOT_FOUND)
        except SchoolClass.DoesNotExist:
            return JsonResponse({"error": "Class not found."},
                                status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.error(f"Error retrieving students by class ID: {e}")
            return JsonResponse({"error": "Failed to retrieve students."},
                                status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def delete_student_by_id(self, request):
        """Delete a student by their ID."""
        try:
            school_id = request.data.get('school_id', request.user.school_id)
            student_id = request.data.get('student_id')

            if not school_id:
                return JsonResponse({"error": "School ID is required."},
                                    status=status.HTTP_400_BAD_REQUEST)
            if not student_id:
                return JsonResponse({"error": "Student ID is required."},
                                    status=status.HTTP_400_BAD_REQUEST)

            self.school_db_name = CommonFunctions.get_school_db_name(school_id)
            if not self.school_db_name:
                return JsonResponse({"error": "School not found or school is inactive."},
                                    status=status.HTTP_404_NOT_FOUND)

            student = Student.objects.using(self.school_db_name).get(
                student_id=student_id,
                is_active=True
            )

            student.is_active = False

            user = User.objects.get(id=student.student_id,is_active=True)
            user.is_active = False

            with transaction.atomic():
                with transaction.atomic(using=self.school_db_name):
                    user.save()
                    student.save(using=self.school_db_name)

            return JsonResponse({"message": "Student deleted successfully."}, status=status.HTTP_200_OK)
        except Student.DoesNotExist:
            return JsonResponse({"error": "Student not found."},
                                status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.error(f"Error deleting student: {e}")
            return JsonResponse({"error": "Failed to delete student."},
                                status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def get_students_data(self,students,academic_year_id):
        """Helper method to format student data."""
        try:
            students_data = []
            
            academic_year = AcademicYear.objects.using(self.school_db_name).get(id=academic_year_id)
            for student in students:
                try:
                    user = User.objects.get(id=student.student_id)
                    class_assignment = StudentClassAssignment.objects.using(
                        self.school_db_name
                    ).get(
                        student=student,
                        academic_year = academic_year
                    )
                    class_instance = SchoolClass.objects.using(self.school_db_name).get(
                        id=class_assignment.class_instance_id)
                except User.DoesNotExist:
                    logger.warning(f"User with ID {student.student_id} not found.")
                    continue
                except StudentClassAssignment.DoesNotExist:
                    logger.warning(f"Class assignment for student ID {student.student_id} not found.")
                    continue
                except SchoolClass.DoesNotExist:
                    logger.warning(f"Class with ID {class_assignment.class_instance.id} not found.")
                    continue
                students_data.append({
                    "student_id": student.student_id,
                    "student_name": user.full_name(),
                    "roll_number": student.roll_number,
                    "parent_name": student.parent_name,
                    "parent_phone": student.parent_phone,
                    "is_active": student.is_active,
                    "class_name": class_instance.name,
                    "class_id": class_instance.id,
                    "section": class_instance.section,
                    "email": user.email,
                })
            return students_data
        except AcademicYear.DoesNotExist:
            raise ValueError("Academic year not found.")
        except Exception as e:
            logger.error(f"Error formatting students data: {e}")
            return []