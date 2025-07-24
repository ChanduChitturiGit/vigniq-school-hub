"""Teacher service module"""

import logging

from rest_framework.exceptions import NotFound

from django.http import JsonResponse
from django.db import transaction,IntegrityError
from django.core.exceptions import ObjectDoesNotExist

from teacher.models import Teacher, TeacherSubjectAssignment, Subject
from academics.models import SchoolAcademicYear

from classes.models import SchoolClass

from core.models import Role, User
from core.common_modules.password_validator import is_valid_password
from core.common_modules.send_email import EmailService

from school.models import SchoolDbMetadata

logger = logging.getLogger(__name__)

class TeacherService:
    """
    Service to manage teacher-related operations.
    """

    def __init__(self):
        pass

    def create_teacher(self, request):
        """
        Create a new teacher and assign subjects, classes, and sections.
        This method expects the request data to contain:
        """
        try:
            first_name = request.data.get('first_name')
            last_name = request.data.get('last_name')
            user_name = request.data.get('user_name')
            password = request.data.get('password')
            email = request.data.get('email')
            phone_number = request.data.get('phone_number')
            school_id = request.data.get('school_id', request.user.school_id)
            gender = request.data.get('gender',None)
            address = request.data.get('address')
            subject_assignments = request.data.get('subject_assignments', [])
            qualification = request.data.get('qualification', None)
            experience = request.data.get('experience', None)
            joining_date = request.data.get('joining_date', None)
            emergency_contact = request.data.get('emergency_contact', None)
            academic_year_id = request.data.get('academic_year_id', 1)

            if not school_id:
                logger.error("School ID is required for teacher creation.")
                return JsonResponse({"error": "School ID is required."}, status=400)
            role = Role.objects.filter(name='teacher').first()

            if not role:
                logger.error("Role 'teacher' does not exist.")
                return JsonResponse({"error": "Role 'teacher' does not exist."}, status = 500)

            if (not first_name or not last_name or not user_name or not password 
                or not email or not gender or not phone_number or not qualification
                or not joining_date):
                logger.error("Missing required fields for teacher creation.")
                return JsonResponse({"error": "Missing required fields."}, status=400)
            
            if not is_valid_password(password):
                logger.error("Invalid password format.")
                return JsonResponse({"error": "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character."}, status=400)
            
            school_db_name = SchoolDbMetadata.objects.filter(school_id=school_id).first().db_name


            with transaction.atomic(using='default'):
                with transaction.atomic(using=school_db_name):
                    user = User.objects.create_user(
                        user_name=user_name,
                        password=password,
                        email=email,
                        role=role,
                        school_id=school_id,
                        phone_number=phone_number,
                        first_name=first_name,
                        last_name=last_name,
                        address=address,
                        gender=gender
                    )

                    teacher = Teacher.objects.using(school_db_name).create(
                        teacher_id = user.id,
                        qualification=qualification,
                        experience=experience,
                        joining_date=joining_date,
                        emergency_contact=emergency_contact,
                    )

                    if subject_assignments:
                        academic_year = SchoolAcademicYear.objects.using(school_db_name
                                ).filter(id=academic_year_id).first()
                        if not academic_year:
                            logger.error(
                                "Academic Year with ID %s does not exist.",academic_year_id)
                            raise NotFound("Academic Year not found.")
                        for item in subject_assignments:
                            try:
                                subject = Subject.objects.using(school_db_name).get(
                                    id=item["subject_id"]
                                )
                                school_class = SchoolClass.objects.using(school_db_name).get(
                                    id=item["class_id"]
                                )
                            except Subject.DoesNotExist:
                                logger.error(f"Subject ID {item['subject_id']} not found.")
                                raise NotFound(f"Subject ID {item['subject_id']} not found.")
                            except SchoolClass.DoesNotExist:
                                logger.error(f"Class ID {item['class_id']} not found.")
                                raise NotFound(f"Class ID {item['class_id']} not found.")
                            except ObjectDoesNotExist as e:
                                raise ValueError(f"Invalid ID in assignment: {e}")

                            TeacherSubjectAssignment.objects.using(school_db_name).get_or_create(
                                teacher = teacher,
                                subject = subject,
                                school_class = school_class,
                                academic_year = academic_year
                            )

                    send_email = EmailService()
                    send_email.send_email(
                        to_email=email,
                        email_type='welcome',
                        user_name=user_name,
                        name=f"{first_name} {last_name}",
                        password=password
                    )
                    logger.info(f"Teacher {first_name} {last_name} created successfully with ID {teacher.teacher_id}.")
                    return JsonResponse({"message": "Teacher created successfully."}, status=201)

        except NotFound as e:
            logger.error("NotFound error encountered: %s", e)
            return JsonResponse({"error": str(e)}, status=400)
        except IntegrityError as e:
            if 'unique constraint' in str(e).lower():
                return JsonResponse({'error':"Username already exists."}, status=400)
            logger.error("Integrity error encountered while assigning subject.")
            return JsonResponse({"error": e}, status=400)
        except Exception as e:
            logger.error("Error assigning teacher: %s",e)
            return JsonResponse({"error": "An error occurred while assigning the teacher."},status=500)
    
    def edit_teacher(self, request):
        """
        Edit an existing teacher's details and assignments.
        """
        try:
            teacher_id = request.data.get('teacher_id')
            first_name = request.data.get('first_name')
            last_name = request.data.get('last_name')
            email = request.data.get('email')
            phone_number = request.data.get('phone_number')
            gender = request.data.get('gender')
            address = request.data.get('address')
            subject_assignments = request.data.get('subject_assignments', [])
            qualification = request.data.get('qualification', None)
            experience = request.data.get('experience', None)
            joining_date = request.data.get('joining_date', None)
            emergency_contact = request.data.get('emergency_contact', None)
            academic_year_id = request.data.get('academic_year_id', 1)

            school_id = request.data.get("school_id",request.user.school_id)
            school_db_name = SchoolDbMetadata.objects.filter(school_id=school_id).first().db_name

            if not teacher_id:
                logger.error("Teacher ID is required for editing.")
                return JsonResponse({"error": "Teacher ID is required."}, status=400)
            
            if not academic_year_id:
                logger.error("Academic Year ID is required for editing.")
                return JsonResponse({"error": "Academic Year ID is required."}, status=400)

            acadamic_year = SchoolAcademicYear.objects.using(school_db_name
                                ).filter(id=academic_year_id).first()
            if not acadamic_year:
                logger.error(f"Academic Year with ID {academic_year_id} does not exist.")
                return JsonResponse({"error": "Academic Year not found."}, status=404)
            with transaction.atomic(using='default'):
                with transaction.atomic(using=school_db_name):
                    # Update User
                    try:
                        user = User.objects.get(id=teacher_id, school_id=school_id)
                    except User.DoesNotExist:
                        logger.error(f"User with id {teacher_id} does not exist.")
                        return JsonResponse({"error": "Teacher not found."}, status=404)

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
                    user.save()

                    # Update Teacher (if any additional fields)
                    try:
                        teacher = Teacher.objects.using(school_db_name).get(teacher_id=teacher_id)
                    except Teacher.DoesNotExist:
                        logger.error(f"Teacher with id {teacher_id} does not exist in school DB.")
                        return JsonResponse({"error": "Teacher not found in school DB."}, status=404)

                    if qualification is not None:
                        teacher.qualification = qualification
                    if experience is not None:
                        teacher.experience = experience
                    if joining_date is not None:
                        teacher.joining_date = joining_date
                    if emergency_contact is not None:
                        teacher.emergency_contact = emergency_contact
                    teacher.save()

                    # Update assignments
                    if subject_assignments is not None:
                        # Remove old assignments
                        TeacherSubjectAssignment.objects.using(school_db_name).filter(
                            teacher = teacher,
                            academic_year = acadamic_year).delete()
                        # Add new assignments
                        for item in subject_assignments:
                            try:
                                subject = Subject.objects.using(school_db_name).get(
                                    id=item["subject_id"]
                                )
                                school_class = SchoolClass.objects.using(school_db_name).get(
                                    id=item["class_id"]
                                )
                            except Subject.DoesNotExist:
                                logger.error(f"Subject ID {item['subject_id']} not found.")
                                raise NotFound(f"Subject ID {item['subject_id']} not found.")
                            except SchoolClass.DoesNotExist:
                                logger.error(f"Class ID {item['class_id']} not found.")
                                raise NotFound(f"Class ID {item['class_id']} not found.")
                            except ObjectDoesNotExist as e:
                                raise ValueError(f"Invalid ID in assignment: {e}")

                            TeacherSubjectAssignment.objects.using(school_db_name).get_or_create(
                                teacher = teacher,
                                subject = subject,
                                school_class = school_class,
                                academic_year = acadamic_year
                            )

                    logger.info(f"Teacher {teacher_id} updated successfully.")
                    return JsonResponse({"message": "Teacher updated successfully."}, status=200)

        except NotFound as e:
            logger.error("NotFound error encountered: %s", e)
            return JsonResponse({"error": str(e)}, status=400)
        except IntegrityError as e:
            if 'unique constraint' in str(e).lower():
                return JsonResponse({'error':"Username or email already exists."}, status=400)
            logger.error("Integrity error encountered while editing teacher.")
            return JsonResponse({"error": str(e)}, status=400)
        except Exception as e:
            logger.error("Error editing teacher: %s", e)
            return JsonResponse({"error": "An error occurred while editing the teacher."},
                                status=500)
    
    def get_teacher_by_id(self,request):
        """Get a teacher's details by their ID."""
        try:
            teacher_id = request.GET.get('teacher_id', None)
            school_id = request.GET.get('school_id', request.user.school_id)
            academic_year_id = request.GET.get('academic_year_id', 1)

            if not teacher_id:
                logger.error("Teacher ID is required to fetch teacher details.")
                return JsonResponse({"error": "Teacher ID is required."}, status=400)
            if not school_id:
                logger.error("School ID is required to fetch teacher details.")
                return JsonResponse({"error": "School ID is required."}, status=400)
            if not academic_year_id:
                logger.error("Academic Year ID is required for editing.")
                return JsonResponse({"error": "Academic Year ID is required."}, status=400)

            school_db_name = SchoolDbMetadata.objects.filter(school_id=school_id).first().db_name

            try:
                teacher = Teacher.objects.using(school_db_name).get(teacher_id=teacher_id)
            except Teacher.DoesNotExist:
                logger.error(f"Teacher with ID {teacher_id} does not exist.")
                return JsonResponse({"error": "Teacher not found."}, status=404)

            user = User.objects.get(id=teacher.teacher_id, school_id=school_id)

            acadamic_year = SchoolAcademicYear.objects.using(school_db_name
                                ).filter(id=academic_year_id).first()
            if not acadamic_year:
                logger.error(f"Academic Year with ID {academic_year_id} does not exist.")
                return JsonResponse({"error": "Academic Year not found."}, status=404)
            
            subject_assignments = TeacherSubjectAssignment.objects.using(school_db_name).filter(
                teacher = teacher,
                academic_year = acadamic_year
            ).values(
                'subject__id', 'subject__name', 'school_class__id', 'school_class__class_number',
                'school_class__section'
            ).distinct()

            renamed_assignments = [
                {
                    'subject': {'id': item['subject__id'], 'name': item['subject__name']},
                    'class': {'id': item['school_class__id'],
                              'class_number': item['school_class__class_number'],
                              'section_name': item['school_class__section']
                    },
                }
                for item in subject_assignments
            ]

            teacher_details = {
                "teacher_id": teacher.teacher_id,
                "teacher_first_name": user.first_name,
                "teacher_last_name": user.last_name,
                "email": user.email,
                "phone_number": user.phone_number,
                "address": user.address,
                "gender": user.gender,
                "qualification": teacher.qualification,
                "experience": teacher.experience,
                "joining_date": teacher.joining_date,
                "emergency_contact": teacher.emergency_contact,
                "subject_assignments": renamed_assignments
            }
            return JsonResponse({"data": teacher_details}, status=200)
        except User.DoesNotExist:
            logger.error(f"User with ID {teacher_id} does not exist.")
            return JsonResponse({"error": "User not found."}, status=404)
        except Exception as e:
            logger.error("Error fetching teacher details: %s", e)
            return JsonResponse({"error": "An error occurred while fetching the teacher details."},
                                status=500)


    def get_teacher_list_by_school_id(self, request):
        """
        Get a list of all teachers for the current school, including their assignments.
        This method expects the request to contain a 'school_id' parameter.
        """
        try:
            school_id = request.GET.get('school_id', request.user.school_id)
            # academic_year_id = request.GET.get('academic_year_id', None)

            if not school_id:
                logger.error("School ID is required to fetch teacher list.")
                return JsonResponse({"error": "School ID is required."}, status=400)
            
            # if not academic_year_id:
            #     logger.error("Academic Year ID is required for fetching teacher list.")
            #     return JsonResponse({"error": "Academic Year ID is required."}, status=400)
            

            school_db_name = SchoolDbMetadata.objects.filter(school_id=school_id).first().db_name

            # acadamic_year = AcademicYear.objects.using(school_db_name
            #                     ).filter(id=academic_year_id).first()
            # if not acadamic_year:
            #     logger.error(f"Academic Year with ID {academic_year_id} does not exist.")
            #     return JsonResponse({"error": "Academic Year not found."}, status=404)

            teachers = Teacher.objects.using(school_db_name).all()
            teacher_list = []

            for teacher in teachers:
                try:
                    user = User.objects.get(id=teacher.teacher_id, school_id=school_id)
                except User.DoesNotExist:
                    continue

                # subject_assignments = TeacherSubjectAssignment.objects.using(school_db_name).filter(
                #     teacher = teacher,
                #     academic_year = acadamic_year
                # ).values(
                #     'subject__id', 'subject__name', 'school_class__id', 'school_class__name',
                #     'school_class__section'
                # ).distinct()

                # renamed_assignments = [
                #     {
                #         'subject': {'id': item['subject__id'], 'name': item['subject__name']},
                #         'class': {'id': item['school_class__id'],
                #                 'class_name': item['school_class__name'],
                #                 'section_name': item['school_class__section']
                #         },
                #     }
                #     for item in subject_assignments
                # ]

                teacher_list.append({
                    "teacher_id": teacher.teacher_id,
                    "teacher_first_name": user.first_name,
                    "teacher_last_name": user.last_name,
                    "email": user.email,
                    # "subject_assignments": renamed_assignments
                    "qualification": teacher.qualification,
                    'phone_number': user.phone_number,
                })

            return JsonResponse({"teachers": teacher_list}, status=200)
        except Exception as e:
            logger.error("Error fetching teacher list: %s", e)
            return JsonResponse({"error": "An error occurred while fetching the teacher list."},
                                status = 500)
    
    def delete_teacher(self,request):
        """
        Delete a teacher by their ID.
        This method expects the request to contain a 'teacher_id' parameter.
        """
        try:
            teacher_id = request.data.get('teacher_id', None)
            school_id = request.data.get('school_id',request.user.school_id)

            if not teacher_id:
                logger.error("Teacher ID is required to delete a teacher.")
                return JsonResponse({"error": "Teacher ID is required."}, status=400)
            
            if not school_id:
                logger.error("School ID is required to delete a teacher.")
                return JsonResponse({"error": "School ID is required."}, status=400)

            school_db_name = SchoolDbMetadata.objects.filter(school_id=school_id).first().db_name

            with transaction.atomic(using='default'):
                with transaction.atomic(using=school_db_name):
                    try:
                        teacher = Teacher.objects.using(school_db_name).get(
                            teacher_id=teacher_id,
                            is_active=True
                        )
                    except Teacher.DoesNotExist:
                        logger.error(f"Teacher with ID {teacher_id} does not exist.")
                        return JsonResponse({"error": "Teacher not found."}, status=404)
                    
                    user = User.objects.filter(id=teacher_id, school_id=school_id)
                    if not user.exists():
                        logger.error(f"User with ID {teacher_id} does not exist.")
                        return JsonResponse({"error": "User not found."}, status=404)

                    # deactivate the teacher record
                    teacher.is_active = False
                    teacher.save(using=school_db_name)
                    
                    user = user.first()
                    user.is_active = False
                    user.save()

                    logger.info(f"Teacher with ID {teacher_id} deleted successfully.")
                    return JsonResponse({"message": "Teacher deleted successfully."}, status=200)

        except Exception as e:
            logger.error("Error deleting teacher: %s", e)
            return JsonResponse({"error": "An error occurred while deleting the teacher."},
                                status=500)