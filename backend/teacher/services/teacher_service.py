"""Teacher service module"""

import logging

from rest_framework.exceptions import NotFound

from django.http import JsonResponse
from django.db import transaction,IntegrityError
from django.core.exceptions import ObjectDoesNotExist

from teacher.models import Teacher, TeacherSubjectAssignment, Subject

from classes.models import Class, Section

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
            teacher_name = request.data.get('teacher_name')
            user_name = request.data.get('user_name')
            password = request.data.get('password')
            email = request.data.get('email')
            phone_number = request.data.get('phone_number')
            school_id = request.user.school_id
            gender = request.data.get('gender')
            address = request.data.get('address')
            assignments = request.data.get('subject_assignments', [])

            role = Role.objects.filter(name='teacher').first()

            if not role:
                logger.error("Role 'teacher' does not exist.")
                return JsonResponse({"error": "Role 'teacher' does not exist."}, status = 500)

            if not teacher_name or not user_name or not password or not email or not gender:
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
                        full_name=teacher_name,
                        address=address,
                    )

                    teacher = Teacher.objects.using(school_db_name).create(
                        teacher_id = user.id,
                    )

                    for item in assignments:
                            try:
                                subject = Subject.objects.using(school_db_name).get(id=item["subject_id"])
                                school_class = Class.objects.using(school_db_name).get(id=item["class_id"])
                                section = Section.objects.using(school_db_name).get(id=item["section_id"])
                            except Subject.DoesNotExist:
                                logger.error(f"Subject ID {item['subject_id']} not found.")
                                raise NotFound(f"Subject ID {item['subject_id']} not found.")
                            except Class.DoesNotExist:
                                logger.error(f"Class ID {item['class_id']} not found.")
                                raise NotFound(f"Class ID {item['class_id']} not found.")
                            except Section.DoesNotExist:
                                logger.error(f"Section ID {item['section_id']} not found.")
                                raise NotFound(f"Section ID {item['section_id']} not found.")
                            except ObjectDoesNotExist as e:
                                raise ValueError(f"Invalid ID in assignment: {e}")

                            TeacherSubjectAssignment.objects.using(school_db_name).get_or_create(
                                teacher=teacher,
                                subject=subject,
                                school_class=school_class,
                                section=section
                            )

                    
                
                    send_email = EmailService()
                    send_email.send_email(
                        to_email=email,
                        email_type='welcome',
                        user_name=user_name,
                        name=teacher_name,
                        password=password
                    )
                    logger.info(f"Teacher {teacher_name} created successfully with ID {teacher.teacher_id}.")
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
            teacher_name = request.data.get('teacher_name')
            email = request.data.get('email')
            phone_number = request.data.get('phone_number')
            gender = request.data.get('gender')
            address = request.data.get('address')
            assignments = request.data.get('subject_assignments', [])

            school_id = request.user.school_id
            school_db_name = SchoolDbMetadata.objects.filter(school_id=school_id).first().db_name

            with transaction.atomic(using='default'):
                with transaction.atomic(using=school_db_name):
                    # Update User
                    try:
                        user = User.objects.get(id=teacher_id, school_id=school_id)
                    except User.DoesNotExist:
                        logger.error(f"User with id {teacher_id} does not exist.")
                        return JsonResponse({"error": "Teacher not found."}, status=404)

                    if teacher_name:
                        user.full_name = teacher_name
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

                    # Update assignments
                    if assignments is not None:
                        # Remove old assignments
                        TeacherSubjectAssignment.objects.using(school_db_name).filter(teacher=teacher).delete()
                        # Add new assignments
                        for item in assignments:
                            try:
                                subject = Subject.objects.using(school_db_name).get(id=item["subject_id"])
                                school_class = Class.objects.using(school_db_name).get(id=item["class_id"])
                                section = Section.objects.using(school_db_name).get(id=item["section_id"])
                            except Subject.DoesNotExist:
                                logger.error(f"Subject ID {item['subject_id']} not found.")
                                raise NotFound(f"Subject ID {item['subject_id']} not found.")
                            except Class.DoesNotExist:
                                logger.error(f"Class ID {item['class_id']} not found.")
                                raise NotFound(f"Class ID {item['class_id']} not found.")
                            except Section.DoesNotExist:
                                logger.error(f"Section ID {item['section_id']} not found.")
                                raise NotFound(f"Section ID {item['section_id']} not found.")
                            except ObjectDoesNotExist as e:
                                raise ValueError(f"Invalid ID in assignment: {e}")

                            TeacherSubjectAssignment.objects.using(school_db_name).get_or_create(
                                teacher=teacher,
                                subject=subject,
                                school_class=school_class,
                                section=section
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
            return JsonResponse({"error": "An error occurred while editing the teacher."}, status=500)
    

    def get_teacher_list(self, request):
        """
        Get a list of all teachers for the current school, including their assignments.
        """
        try:
            school_id = request.GET.get('school_id', None)

            if not school_id:
                school_id = request.user.school_id

            school_db_name = SchoolDbMetadata.objects.filter(school_id=school_id).first().db_name

            teachers = Teacher.objects.using(school_db_name).all()
            teacher_list = []

            for teacher in teachers:
                try:
                    user = User.objects.get(id=teacher.teacher_id, school_id=school_id)
                except User.DoesNotExist:
                    continue

                assignments = TeacherSubjectAssignment.objects.using(school_db_name).filter(teacher=teacher)
                assignment_list = []
                for assign in assignments:
                    assignment_list.append({
                        "subject_id": assign.subject.id,
                        "subject_name": assign.subject.name,
                        "class_id": assign.school_class.id,
                        "class_name": assign.school_class.name,
                        "section_id": assign.section.id,
                        "section_name": assign.section.name,
                    })

                teacher_list.append({
                    "teacher_id": teacher.teacher_id,
                    "teacher_name": user.full_name,
                    "user_name": user.user_name,
                    "email": user.email,
                    "phone_number": user.phone_number,
                    "gender": user.gender,
                    "address": user.address,
                    "assignments": assignment_list
                })

            return JsonResponse({"teachers": teacher_list}, status=200)
        except Exception as e:
            logger.error("Error fetching teacher list: %s", e)
            return JsonResponse({"error": "An error occurred while fetching the teacher list."},status = 500)