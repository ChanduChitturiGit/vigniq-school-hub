"""Classes Service Module"""

import logging

from django.http import JsonResponse
from django.db import IntegrityError,transaction

from classes.models import SchoolClass,ClassAssignment
from classes.serializers import ClassSerializer
from teacher.models import Teacher
from academics.models import AcademicYear

from core.common_modules.common_functions import CommonFunctions
from core.models import User

from student.models import StudentClassAssignment,Student
from student.services.student_service import StudentService

logger = logging.getLogger(__name__)

class ClassesService:
    """Service class for managing classes and sections."""

    @staticmethod
    def get_classes(request):
        """Retrieve all classes."""
        try:
            logger.info("Retrieving all classes.")

            school_id = request.GET.get('school_id', request.user.school_id)
            if not school_id:
                return JsonResponse({"error": "School ID is required."},
                                    status=400)
            school_db_name = CommonFunctions.get_school_db_name(school_id)
            classes = SchoolClass.objects.using(school_db_name).all()
            serializer = ClassSerializer(classes, many=True)

            logger.info(f"Retrieved {len(serializer.data)} classes.")
            return JsonResponse({'classes': serializer.data},status=200)
        except Exception as e:
            logger.error(f"Error retrieving classes: {e}")
            return JsonResponse({"error": "An error occurred while retrieving classes."},
                                status=500)
    @staticmethod
    def get_classes_by_school_id(request):
        try:
            logger.info("Retrieving active classes.")
            school_id = request.GET.get('school_id', request.user.school_id)
            academic_year_id = request.GET.get('academic_year_id',1)

            if not school_id:
                return JsonResponse({"error": "School ID is required."},
                                    status=400)
            if not academic_year_id:
                return JsonResponse({"error": "Academic Year ID is required."},
                                    status=400)
            
            school_db_name = CommonFunctions.get_school_db_name(school_id)

            class_assignment = ClassAssignment.objects.using(school_db_name).filter(
                academic_year_id=academic_year_id
            )

            data = []
            for class_instance in class_assignment:
                teacher = None
                teacher_name = None
                try:
                    class_teacher_id = class_instance.class_teacher_id
                    if class_teacher_id:
                        teacher = Teacher.objects.using(school_db_name).get(pk=class_teacher_id)
                        teacher_name = User.objects.get(
                            id=teacher.teacher_id,
                            is_active=True,
                        ).full_name()
                except Teacher.DoesNotExist:
                    logger.error(f"Teacher with ID {class_instance.class_teacher_id} does not exist.")
                    continue
                except User.DoesNotExist:
                    logger.error(f"Teacher with ID {class_instance.class_teacher.teacher_id} does not exist.")
                    continue
                class_obj = SchoolClass.objects.using(school_db_name).get(
                    pk=class_instance.class_instance_id)
                academic_year_obj = AcademicYear.objects.using(school_db_name).get(
                    pk=class_instance.academic_year_id)

                student_ids = StudentClassAssignment.objects.using(school_db_name).filter(
                    class_instance=class_instance.class_instance_id,
                    academic_year=academic_year_obj
                ).values_list('student_id', flat=True)

                student_count = Student.objects.using(school_db_name).filter(
                    id__in=student_ids,
                    is_active=True
                ).count()

                class_data = {
                    'class_assignment_id': class_instance.id,
                    'class_id': class_obj.id,
                    'class_name': class_obj.name,
                    'section': class_obj.section,
                    'teacher_id': teacher.teacher_id if teacher else None,
                    'teacher_name': teacher_name,
                    # 'academic_year_id': academic_year_obj.id,
                    # 'academic_year_start_date': str(academic_year_obj.start_date),
                    # 'academic_year_end_date': str(academic_year_obj.end_date),
                    'school_id': school_id,
                    'student_count': student_count
                }
                data.append(class_data)


            logger.info(f"Retrieved {len(data)} active classes.")
            return JsonResponse({'classes': data}, status=200)
        except Exception as e:
            logger.error(f"Error retrieving active classes: {e}")
            return JsonResponse({"error": "An error occurred while retrieving active classes."},
                                status=500)
    
    @staticmethod
    def get_class_by_id(request):
        """Retrieve a class by its ID."""
        try:
            logger.info("Retrieving class by ID.")
            school_id = request.GET.get('school_id', request.user.school_id)
            class_id = request.GET.get('class_id')
            academic_year_id = request.GET.get('academic_year_id',1)

            if not school_id:
                return JsonResponse({"error": "School ID is required."},
                                    status=400)
            if not class_id:
                return JsonResponse({"error": "Class  Id is required."},
                                    status=400)

            school_db_name = CommonFunctions.get_school_db_name(school_id)
            
            class_obj = SchoolClass.objects.using(school_db_name).get(
                    pk=class_id)

            class_instance = ClassAssignment.objects.using(school_db_name).get(
                class_instance=class_obj,
                academic_year_id=academic_year_id
            )
            teacher = None
            teacher_name = None
            if class_instance.class_teacher_id:
                teacher = Teacher.objects.using(school_db_name).get(pk=class_instance.class_teacher_id)
                teacher_name = User.objects.get(
                    id=teacher.teacher_id,
                    is_active=True,
                ).full_name()

            academic_year = AcademicYear.objects.using(school_db_name).get(
                id = academic_year_id
            )

            student_ids = StudentClassAssignment.objects.using(school_db_name).filter(
                class_instance = class_obj,
                academic_year = academic_year
            )

            students = Student.objects.using(school_db_name).filter(
                id__in=student_ids,
            )
            students_data = StudentService(school_db_name).get_students_data(
                students,
                academic_year_id
            )
            data = {
                'class_assignment_id': class_instance.id,
                'class_id': class_instance.class_instance_id,
                'class_name': class_obj.name,
                'section': class_obj.section,
                'teacher_id': teacher.teacher_id if teacher else None,
                'teacher_name': teacher_name,
                'studends_list': students_data
            }

            logger.info(f"Class with ID {class_id} retrieved successfully.")
            return JsonResponse({'class': data}, status=200)
        except ValueError as ve:
            logger.error("Value error: %s",ve)
            return JsonResponse({'error':ve}, status=404)
        except ClassAssignment.DoesNotExist:
            logger.error("Class assignment does not exist.")
            return JsonResponse({"error": "Class assignment not found."}, status=404)
        except Teacher.DoesNotExist:
            logger.error("Teacher does not exist.")
            return JsonResponse({"error": "Teacher not found."}, status=404)
        except User.DoesNotExist:
            logger.error("User does not exist.")
            return JsonResponse({"error": "User not found."}, status=404)
        except SchoolClass.DoesNotExist:
            logger.error("Class does not exist.")
            return JsonResponse({"error": "Class not found."}, status=404)
        except Exception as e:
            logger.error(f"Error retrieving class: {e}")
            return JsonResponse({"error": "An error occurred while retrieving the class."},
                                status=500)

    # @staticmethod
    # def create_class_and_section(request):
    #     """Create a new class."""
    #     try:
    #         logger.info("Creating a new class.")
    #         school_id = request.data.get('school_id', request.user.school_id)
    #         class_name = request.data.get('class_name')
    #         section_name = request.data.get('section_name')

    #         if not school_id:
    #             return JsonResponse({"error": "School ID is required."},
    #                                 status=400)
    #         if not class_name:
    #             return JsonResponse({"error": "Class name is required."},
    #                                 status=400)
    #         if not section_name:
    #             return JsonResponse({"error": "Section name is required."},
    #                                 status=400)

    #         school_db_name = CommonFunctions.get_school_db_name(school_id)

    #         if not school_db_name:
    #             return JsonResponse({"error": "School not found or inactive."},
    #                                 status=404)

    #         class_instance,is_created = SchoolClass.objects.using(school_db_name).get_or_create(
    #             name=class_name, section = section_name
    #         )

    #         if not is_created:
    #             return JsonResponse({
    #                 'error': 'A class with the same name and section already exists.'
    #             }, status=400)

    #         serializer = ClassSerializer(class_instance)

    #         logger.info(f"Class '{class_name}'- section - {section_name} created successfully.")
    #         return JsonResponse({'class': serializer.data}, status=201)
    #     except IntegrityError as e:
    #         logger.error(f"Integrity error while creating class: {e}")
    #         if 'unique_name_section' in str(e):
    #             return JsonResponse({
    #                 'error': 'A class with the same name and section already exists.'
    #             }, status=400)
    #         else:
    #             return JsonResponse({
    #                 'error': 'An unexpected error occurred while creating the class.'
    #             }, status=500)
    #     except Exception as e:
    #         logger.error(f"Error creating class: {e}")
    #         return JsonResponse({"error": "An error occurred while creating the class."},
    #                             status=500)
    
    # @staticmethod
    # def update_class_and_section(request):
    #     """Update an existing class."""
    #     try:
    #         logger.info("Updating a class...")
    #         school_id = request.data.get('school_id', request.user.school_id)
    #         class_id = request.data.get('class_id')
    #         class_name = request.data.get('class_name')
    #         section_name = request.data.get('section_name')

    #         if not school_id:
    #             return JsonResponse({"error": "School ID is required."},
    #                                 status=400)
    #         if not class_id:
    #             return JsonResponse({"error": "Class ID is required."},
    #                                 status=400)
    #         if not class_name:
    #             return JsonResponse({"error": "Class name is required."},
    #                                 status=400)
    #         if not section_name:
    #             return JsonResponse({"error": "Section is required."},
    #                                 status=400)

    #         school_db_name = CommonFunctions.get_school_db_name(school_id)

    #         if not school_db_name:
    #             return JsonResponse({"error": "School not found or inactive."},
    #                                 status=404)

    #         class_instance = SchoolClass.objects.using(school_db_name).get(id=class_id)
    #         class_instance.name = class_name
    #         class_instance.section = section_name
    #         class_instance.save(using=school_db_name)

    #         serializer = ClassSerializer(class_instance)

    #         logger.info(f"Class '{class_name}'- {section_name} updated successfully.")
    #         return JsonResponse({'class': serializer.data}, status=200)
    #     except SchoolClass.DoesNotExist:
    #         logger.error("Class does not exist.")
    #         return JsonResponse({"error": "Class not found."}, status=404)
    #     except IntegrityError as e:
    #         logger.error(f"Integrity error while updating class: {e}")
    #         if 'unique_name_section' in str(e):
    #             return JsonResponse({
    #                 'error': 'A class with the same name and section already exists.'
    #             }, status=400)
    #         else:
    #             return JsonResponse({
    #                 'error': 'An unexpected error occurred while updating the class.'
    #             }, status=500)
    #     except Exception as e:
    #         logger.error(f"Error updating class: {e}")
    #         return JsonResponse({"error": "An error occurred while updating the class."},
    #                             status=500)

    @staticmethod
    def create_class(request):
        """Create a new class."""
        try:
            school_id = request.data.get('school_id', request.user.school_id)
            class_name = request.data.get('class_name')
            section_name = request.data.get('section')
            teacher_id = request.data.get('teacher_id',None)
            academic_year_id = request.data.get('academic_year_id',1)

            if not school_id:
                return JsonResponse({"error": "School ID is required."},
                                    status=400)
            if not class_name:
                return JsonResponse({"error": "Class name is required."},
                                    status=400)
            if not section_name:
                return JsonResponse({"error": "Section name is required."},
                                    status=400)

            if not academic_year_id:
                return JsonResponse({"error": "Academic Year ID is required."},
                                    status=400)

            school_db_name = CommonFunctions.get_school_db_name(school_id)
            if not school_db_name:
                return JsonResponse({"error": "School not found or inactive."},
                                    status=404)

            class_teacher = None
            if teacher_id is not None:
                class_teacher = Teacher.objects.using(school_db_name).get(teacher_id=teacher_id)
                if not class_teacher:
                    return JsonResponse({"error": "Teacher not found."},
                                        status=404)
            academic_year = AcademicYear.objects.using(school_db_name).filter(
                                id=academic_year_id).first()
            if not academic_year:
                return JsonResponse({"error": "Academic Year not found."},
                                    status=404)
            with transaction.atomic(using=school_db_name):
                class_instance = SchoolClass.objects.using(school_db_name).create(
                    name=class_name,
                    section=section_name
                )

                class_assignment, created = ClassAssignment.objects.using(school_db_name).get_or_create(
                    class_instance=class_instance,
                    class_teacher=class_teacher,
                    academic_year=academic_year
                )

                if not created:
                    return JsonResponse({
                        'error': 'A class assignment with the same class, teacher, and academic year already exists.'
                    }, status=400)
                
                response_data = {
                    'id': class_assignment.id,
                    'class_id': class_instance.id,
                    'class_name': class_instance.name,
                    'section': class_instance.section,
                    'teacher_id': class_teacher.id if class_teacher else None,
                    'academic_year_id': academic_year.id
                }
                logger.info(f"Class assignment created successfully: {response_data}")
                return JsonResponse({'class': response_data}, status=201)
        except SchoolClass.DoesNotExist:
            logger.error("Class does not exist.")
            return JsonResponse({"error": "Class not found."}, status=404)
        except Teacher.DoesNotExist:
            logger.error("Teacher does not exist.")
            return JsonResponse({"error": "Teacher not found."}, status=404)
        except IntegrityError as e:
            logger.error(f"Integrity error while creating class: {e}")
            if 'unique_together' in str(e):
                return JsonResponse({
                    'error': 'A class assignment with the same class, teacher, and academic year already exists.'
                }, status=400)
            if 'unique_name_section' in str(e):
                return JsonResponse({
                    'error': 'A class with the same name and section already exists.'
                }, status=400)
            else:
                return JsonResponse({
                    'error': 'An unexpected error occurred while creating the class.'
                }, status=500)
        except Exception as e:
            logger.error(f"Error creating class: {e}")
            return JsonResponse({"error": "An error occurred while creating the class."},
                                status=500)
    
    @staticmethod
    def update_class(request):
        """Update an existing class."""
        try:
            school_id = request.data.get('school_id', request.user.school_id)
            id = request.data.get('id')
            teacher_id = request.data.get('teacher_id')

            if not school_id:
                return JsonResponse({"error": "School ID is required."},
                                    status=400)
            if not teacher_id:
                return JsonResponse({"error": "Teacher ID is required."},
                                    status=400)
            if not id:
                return JsonResponse({"error": "Instance ID is required."},
                                    status=400)

            school_db_name = CommonFunctions.get_school_db_name(school_id)
            if not school_db_name:
                return JsonResponse({"error": "School not found or inactive."},
                                    status=404)

            class_teacher = Teacher.objects.using(school_db_name).get(id=teacher_id)

            class_assignment = ClassAssignment.objects.using(school_db_name).get(
                id=id
            )
            if not class_assignment:
                return JsonResponse({"error": "Class assignment not found."},
                                    status=404)
            class_assignment.class_teacher = class_teacher
            class_assignment.save(using=school_db_name)
            
            response_data = {
                'id': class_assignment.id,
                'class_id': class_assignment.class_instance.id,
                'class_name': class_assignment.class_instance.name,
                'section': class_assignment.class_instance.section,
                'teacher_id': class_teacher.id,
                'academic_year_id': class_assignment.academic_year.id
            }
            
            logger.info(f"Class assignment updated successfully: {response_data}")
            return JsonResponse({'class': response_data}, status=200)
        except SchoolClass.DoesNotExist:
            logger.error("Class does not exist.")
            return JsonResponse({"error": "Class not found."}, status=404)
        except Teacher.DoesNotExist:
            logger.error("Teacher does not exist.")
            return JsonResponse({"error": "Teacher not found."}, status=404)
        except ClassAssignment.DoesNotExist:
            logger.error("Class assignment does not exist.")
            return JsonResponse({"error": "Class assignment not found."}, status=404)
        except IntegrityError as e:
            logger.error(f"Integrity error while updating class: {e}")
            if 'unique_together' in str(e):
                return JsonResponse({
                    'error': 'A class assignment with the same class, teacher, and academic year already exists.'
                }, status=400)
            else:
                return JsonResponse({
                    'error': 'An unexpected error occurred while updating the class.'
                }, status=500)
        except Exception as e:
            logger.error(f"Error updating class: {e}")
            return JsonResponse({"error": "An error occurred while updating the class."},
                                status=500)