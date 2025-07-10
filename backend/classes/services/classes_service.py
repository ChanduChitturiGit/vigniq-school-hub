"""Classes Service Module"""

import logging

from django.http import JsonResponse
from django.db import IntegrityError

from classes.models import Class, Section
from classes.serializers import ClassSerializer

from core.common_modules.common_functions import CommonFunctions

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
            classes = Class.objects.using(school_db_name).all()
            serializer = ClassSerializer(classes, many=True)
            
            data = serializer.data

            for item in data:
                item['sections'] = list(Section.objects.using(school_db_name).filter(
                    school_class_id=item['id']).values('id', 'name'))

            logger.info(f"Retrieved {len(data)} classes.")
            return JsonResponse({'data': data},status=200)
        except Exception as e:
            logger.error(f"Error retrieving classes: {e}")
            return JsonResponse({"error": "An error occurred while retrieving classes."},
                                status=500)

    @staticmethod
    def create_class(request):
        """Create a new class."""
        try:
            logger.info("Creating a new class.")
            school_id = request.data.get('school_id', request.user.school_id)
            class_name = request.data.get('class_name')
            class_grade = request.data.get('class_grade')
            section_name = request.data.get('section_name')

            if not school_id:
                return JsonResponse({"error": "School ID is required."},
                                    status=400)
            if not class_name:
                return JsonResponse({"error": "Class name is required."},
                                    status=400)
            if not class_grade:
                return JsonResponse({"error": "Grade is required."},
                                    status=400)
            if not section_name:
                return JsonResponse({"error": "Section name is required."},
                                    status=400)

            school_db_name = CommonFunctions.get_school_db_name(school_id)

            if not school_db_name:
                return JsonResponse({"error": "School not found or inactive."},
                                    status=404)

            class_instance,is_created = Class.objects.using(school_db_name).get_or_create(
                name=class_name, grade=class_grade
                )
            
            section_instance = Section.objects.using(school_db_name).create(
                name=section_name, school_class=class_instance
            )

            serializer = ClassSerializer(class_instance)

            data = serializer.data
            data['sections'] = [
                {'id': section_instance.id, 'name': section_instance.name}
            ]

            logger.info(f"Class '{class_name}'- {class_grade} - section - {section_name} created successfully.")
            return JsonResponse({'data': data}, status=201)
        except IntegrityError as e:
            logger.error(f"Integrity error while creating class: {e}")
            if 'unique_name_grade' in str(e):
                return JsonResponse({
                    'error': 'A class with the same name and grade already exists.'
                }, status=400)
            elif 'unique_name_school_class' in str(e):
                return JsonResponse({
                    'error': 'A section with the same name already exists in this class.'
                }, status=400)
            else:
                return JsonResponse({
                    'error': 'An unexpected error occurred while creating the class.'
                }, status=500)
        except Exception as e:
            logger.error(f"Error creating class: {e}")
            return JsonResponse({"error": "An error occurred while creating the class."},
                                status=500)
    