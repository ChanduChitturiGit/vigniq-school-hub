"""Classes Service Module"""

import logging

from django.http import JsonResponse
from django.db import IntegrityError,transaction

from classes.models import SchoolClass,ClassAssignment,SchoolSection

from teacher.models import Teacher, TeacherSubjectAssignment
from academics.models import SchoolAcademicYear

from core.common_modules.common_functions import CommonFunctions
from core.models import User

from school.models import SchoolDefaultClasses,SchoolBoard

from student.models import StudentClassAssignment,Student
from student.services.student_service import StudentService

from syllabus.models import (
    SchoolChapter,
    SchoolPrerequisite,
    SchoolSubTopic,
    SchoolClassSubTopic,
    SchoolClassPrerequisite
)

logger = logging.getLogger(__name__)

class ClassesService:
    """Service class for managing classes and sections."""


    def get_classes(self,request):
        """Retrieve all classes."""
        try:
            logger.info("Retrieving all classes.")
            classes = SchoolDefaultClasses.objects.all()
            class_data = []
            for class_obj in classes:
                class_data.append({
                    'id': class_obj.id,
                    'class_number': class_obj.class_number,
                })
            logger.info(f"Retrieved {len(class_data)} classes.")
            return JsonResponse({'data': class_data},status=200)
        except Exception as e:
            logger.error(f"Error retrieving classes: {e}")
            return JsonResponse({"error": "An error occurred while retrieving classes."},
                                status=500)

    def get_classes_by_school_id(self, request):
        try:
            logger.info("Retrieving active classes.")
            school_id = request.GET.get("school_id") or getattr(request.user, 'school_id', None)
            academic_year_id = request.GET.get('academic_year_id',1)

            if not school_id:
                return JsonResponse({"error": "School ID is required."},
                                    status=400)
            if not academic_year_id:
                return JsonResponse({"error": "Academic Year ID is required."},
                                    status=400)
            
            school_db_name = CommonFunctions.get_school_db_name(school_id)

            classes_qs = SchoolSection.objects.using(school_db_name).all()

            teacher_obj = Teacher.objects.using(school_db_name).filter(
                teacher_id=request.user.id
            ).first()

            if teacher_obj:
                # get classes where teacher is class teacher
                class_teacher_class_ids = ClassAssignment.objects.using(school_db_name).filter(
                    class_teacher=teacher_obj,
                    academic_year_id=academic_year_id
                ).values_list('class_instance_id', flat=True)

                # get classes where teacher teaches a subject
                subject_teacher_class_ids = TeacherSubjectAssignment.objects.using(school_db_name).filter(
                    teacher=teacher_obj,
                    academic_year_id=academic_year_id
                ).values_list('school_class_id', flat=True)

                allowed_class_ids = set(class_teacher_class_ids) | set(subject_teacher_class_ids)

                classes_qs = classes_qs.filter(id__in=allowed_class_ids)

            data = []
            for class_obj in classes_qs:
                school_board = SchoolBoard.objects.get(
                    id=class_obj.board_id
                )
                class_instance = ClassAssignment.objects.using(school_db_name).filter(
                    class_instance=class_obj,
                    academic_year_id=academic_year_id
                ).first()
                teacher = None
                teacher_name = None
                student_count = 0
                if class_instance:
                    try:
                        class_teacher_id = class_instance.class_teacher_id
                        if class_teacher_id:
                            teacher = Teacher.objects.using(school_db_name).get(teacher_id=class_teacher_id)
                            teacher_name = User.objects.get(
                                id=teacher.teacher_id,
                                is_active=True,
                            ).full_name()
                    except Teacher.DoesNotExist:
                        logger.error(f"Teacher with ID {class_instance.class_teacher_id} does not exist.")
                    except User.DoesNotExist:
                        logger.error(f"Teacher with ID {teacher.teacher_id} does not exist.")

                    academic_year_obj = SchoolAcademicYear.objects.using(school_db_name).get(
                        pk=class_instance.academic_year_id)

                    student_ids = StudentClassAssignment.objects.using(school_db_name).filter(
                        class_instance=class_instance.class_instance_id,
                        academic_year=academic_year_obj
                    ).values_list('student_id', flat=True)

                    student_count = Student.objects.using(school_db_name).filter(
                        student_id__in=student_ids,
                        is_active=True
                    ).count()

                    class_data = {
                        'class_assignment_id': class_instance.id if class_instance else None,
                        'class_id': class_obj.id,
                        'class_number': class_obj.class_instance_id,
                        'section': class_obj.section,
                        'teacher_id': teacher.teacher_id if teacher else None,
                        'teacher_name': teacher_name,
                        # 'academic_year_id': academic_year_obj.id,
                        # 'academic_year_start_date': str(academic_year_obj.start_date),
                        # 'academic_year_end_date': str(academic_year_obj.end_date),
                        'school_id': school_id,
                        'student_count': student_count,
                        'school_board_id': school_board.id,
                        'school_board_name': school_board.board_name,
                    }
                    data.append(class_data)


            logger.info(f"Retrieved {len(data)} active classes.")
            return JsonResponse({'classes': data}, status=200)
        except Exception as e:
            logger.error(f"Error retrieving active classes: {e}")
            return JsonResponse({"error": "An error occurred while retrieving active classes."},
                                status=500)


    def get_class_by_id(self, request):
        """Retrieve a class by its ID."""
        try:
            logger.info("Retrieving class by ID.")
            school_id = request.GET.get("school_id") or getattr(request.user, 'school_id', None)
            class_id = request.GET.get('class_id')
            academic_year_id = request.GET.get('academic_year_id',1)

            if not school_id:
                return JsonResponse({"error": "School ID is required."},
                                    status=400)
            if not class_id:
                return JsonResponse({"error": "Class  Id is required."},
                                    status=400)

            school_db_name = CommonFunctions.get_school_db_name(school_id)
            
            class_obj = SchoolSection.objects.using(school_db_name).get(
                    pk=class_id)
            school_board = SchoolBoard.objects.get(
                id=class_obj.board_id
            )
            class_instance = ClassAssignment.objects.using(school_db_name).filter(
                class_instance=class_obj,
                academic_year_id=academic_year_id
            ).first()
            teacher = None
            teacher_name = None
            print(class_instance.class_teacher_id)
            if class_instance and class_instance.class_teacher_id:
                teacher = Teacher.objects.using(school_db_name).get(
                    teacher_id=class_instance.class_teacher_id
                )
                teacher_name = User.objects.get(
                    id=teacher.teacher_id,
                    is_active=True,
                ).full_name()

            academic_year = SchoolAcademicYear.objects.using(school_db_name).get(
                id = academic_year_id
            )

            student_ids = StudentClassAssignment.objects.using(school_db_name).filter(
                class_instance = class_obj,
                academic_year = academic_year
            ).values_list('student_id', flat=True)

            students = Student.objects.using(school_db_name).filter(
                student_id__in=student_ids,
                is_active=True
            )
            students_data = StudentService(school_db_name).get_students_data(
                students,
                academic_year_id
            )
            data = {
                'class_assignment_id': class_instance.id if class_instance else None,
                'class_id': class_id,
                'class_number': class_obj.class_instance_id,
                'section': class_obj.section,
                'teacher_id': teacher.teacher_id if teacher else None,
                'teacher_name': teacher_name,
                'studends_list': students_data,
                'school_board_id' : school_board.id,
                'school_board_name' : school_board.board_name,
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
        except SchoolSection.DoesNotExist:
            logger.error("Class and Section does not exist.")
            return JsonResponse({"error": "Class and Section not found."}, status=404)
        except Exception as e:
            logger.error(f"Error retrieving class: {e}")
            return JsonResponse({"error": "An error occurred while retrieving the class."},
                                status=500)

    def get_classes_without_class_teacher(self, request):
        """Get classes without class teacher"""
        try:
            logger.info("Retrieving classes without class teacher.")
            school_id = request.GET.get("school_id") or getattr(request.user, 'school_id', None)
            academic_year_id = request.GET.get('academic_year_id',1)

            if not school_id:
                return JsonResponse({"error": "School ID is required."},
                                    status=400)
            if not academic_year_id:
                return JsonResponse({"error": "Academic Year ID is required."},
                                    status=400)

            school_db_name = CommonFunctions.get_school_db_name(school_id)

            classes = SchoolSection.objects.using(school_db_name).all()

            data = []
            for class_obj in classes:
                class_instance = ClassAssignment.objects.using(school_db_name).filter(
                    class_instance=class_obj,
                    academic_year_id=academic_year_id
                ).first()
                if not class_instance or not class_instance.class_teacher_id:
                    data.append({
                        'class_section_id': class_obj.id,
                        'class_number': class_obj.class_instance_id,
                        'section': class_obj.section,
                        'board_id': class_obj.board_id,
                    })
            return JsonResponse({"classes": data}, status=200)
        except Exception as e:
            logger.error("Unable to get classes without class teacher: %s", e)
            return JsonResponse(
                {"error": "An error occurred while retrieving classes without class teacher."},
                status=500
            )

    def create_class(self, request):
        """Create a new class."""
        try:
            school_id = request.data.get("school_id") or getattr(request.user, 'school_id', None)
            class_number = request.data.get('class_number')
            section_name = request.data.get('section')
            teacher_id = request.data.get('teacher_id',None)
            board_id = request.data.get('board_id', 1)
            academic_year_id = request.data.get('academic_year_id',1)

            if not school_id or not class_number or not section_name or not board_id or not academic_year_id:
                return JsonResponse({"error": "Required fields are missing."},
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
            academic_year = SchoolAcademicYear.objects.using(school_db_name).filter(
                                id=academic_year_id).first()
            if not academic_year:
                return JsonResponse({"error": "Academic Year not found."},
                                    status=404)
            with transaction.atomic(using=school_db_name):
                class_obj = SchoolClass.objects.using(school_db_name).get(
                    class_number=class_number,
                )
                class_instance = SchoolSection.objects.using(school_db_name).create(
                    class_instance=class_obj,
                    section=section_name,
                    board_id=board_id
                )

                class_assignment, created = ClassAssignment.objects.using(school_db_name).get_or_create(
                    class_instance=class_instance,
                    class_teacher=class_teacher,
                    academic_year=academic_year
                )

                chapters = SchoolChapter.objects.using(school_db_name).filter(
                    class_number=class_obj,
                    academic_year=academic_year,
                    school_board_id=board_id,
                )
                if chapters.exists():
                    for chapter in chapters:
                        subtopics = SchoolSubTopic.objects.using(school_db_name).filter(chapter=chapter)
                        class_subtopic_objs = [
                            SchoolClassSubTopic(
                                chapter=chapter,
                                name=subtopic.name,
                                class_section=class_instance
                            )
                            for subtopic in subtopics
                        ]
                        if class_subtopic_objs:
                            SchoolClassSubTopic.objects.using(school_db_name).bulk_create(
                                class_subtopic_objs
                            )

                        prerequisites = SchoolPrerequisite.objects.using(school_db_name).filter(
                            chapter=chapter
                        )
                        class_prerequisite_objs = [
                            SchoolClassPrerequisite(
                                chapter=chapter,
                                class_section=class_instance,
                                topic=prerequisite.topic,
                                explanation=prerequisite.explanation
                            )
                            for prerequisite in prerequisites
                        ]
                        if class_prerequisite_objs:
                            SchoolClassPrerequisite.objects.using(school_db_name).bulk_create(
                                class_prerequisite_objs
                            )
                if not created:
                    return JsonResponse({
                        'error': 'A class assignment with the same class, teacher, and academic year already exists.'
                    }, status=400)
                

                
                response_data = {
                    'id': class_assignment.id,
                    'class_id': class_instance.id,
                    'class_number': class_obj.class_number,
                    'section': class_instance.section,
                    'teacher_id': class_teacher.teacher_id if class_teacher else None,
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
            elif 'unique_class_instance_section' in str(e):
                return JsonResponse({
                    'error': 'A class with the same class number and section already exists.'
                }, status=400)
            else:
                return JsonResponse({
                    'error': 'An unexpected error occurred while creating the class.'
                }, status=500)
        except Exception as e:
            logger.error(f"Error creating class: {e}")
            return JsonResponse({"error": "An error occurred while creating the class."},
                                status=500)


    def update_class(self, request):
        """Update an existing class."""
        try:
            school_id = request.data.get("school_id") or getattr(request.user, 'school_id', None)
            id = request.data.get('class_id')
            teacher_id = request.data.get('teacher_id')
            academic_year_id = request.data.get('academic_year_id',1)

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

            class_teacher = Teacher.objects.using(school_db_name).get(teacher_id=teacher_id)

            class_section_instance = SchoolSection.objects.using(school_db_name).get(
                id=id
            )

            class_assignment = ClassAssignment.objects.using(school_db_name).get(
                class_instance = class_section_instance,
                academic_year_id = academic_year_id
            )

            ClassAssignment.objects.using(school_db_name).filter(
                class_teacher=class_teacher,
                academic_year_id=academic_year_id
            ).update(class_teacher=None)

            if not class_assignment:
                return JsonResponse({"error": "Class assignment not found."},
                                    status=404)
            class_assignment.class_teacher = class_teacher
            class_assignment.save(using=school_db_name)

            
            logger.info(f"Class assignment updated successfully")
            return JsonResponse({'message': "Class assignment updated successfully."}, status=200)
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