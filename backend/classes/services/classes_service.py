"""Classes Service Module"""

import logging

from django.http import JsonResponse
from django.db import IntegrityError

from classes.models import Class
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

            logger.info(f"Retrieved {len(serializer.data)} classes.")
            return JsonResponse({'data': serializer.data},status=200)
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
            section_name = request.data.get('section_name')

            if not school_id:
                return JsonResponse({"error": "School ID is required."},
                                    status=400)
            if not class_name:
                return JsonResponse({"error": "Class name is required."},
                                    status=400)
            if not section_name:
                return JsonResponse({"error": "Section name is required."},
                                    status=400)

            school_db_name = CommonFunctions.get_school_db_name(school_id)

            if not school_db_name:
                return JsonResponse({"error": "School not found or inactive."},
                                    status=404)

            class_instance,is_created = Class.objects.using(school_db_name).get_or_create(
                name=class_name, section = section_name
            )

            if not is_created:
                return JsonResponse({
                    'error': 'A class with the same name and section already exists.'
                }, status=400)

            serializer = ClassSerializer(class_instance)

            logger.info(f"Class '{class_name}'- section - {section_name} created successfully.")
            return JsonResponse({'data': serializer.data}, status=201)
        except IntegrityError as e:
            logger.error(f"Integrity error while creating class: {e}")
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
            logger.info("Updating a class...")
            school_id = request.data.get('school_id', request.user.school_id)
            class_id = request.data.get('class_id')
            class_name = request.data.get('class_name')
            section_name = request.data.get('section_name')

            if not school_id:
                return JsonResponse({"error": "School ID is required."},
                                    status=400)
            if not class_id:
                return JsonResponse({"error": "Class ID is required."},
                                    status=400)
            if not class_name:
                return JsonResponse({"error": "Class name is required."},
                                    status=400)
            if not section_name:
                return JsonResponse({"error": "Section is required."},
                                    status=400)

            school_db_name = CommonFunctions.get_school_db_name(school_id)

            if not school_db_name:
                return JsonResponse({"error": "School not found or inactive."},
                                    status=404)

            class_instance = Class.objects.using(school_db_name).get(id=class_id)
            class_instance.name = class_name
            class_instance.section = section_name
            class_instance.save(using=school_db_name)

            serializer = ClassSerializer(class_instance)

            logger.info(f"Class '{class_name}'- {section_name} updated successfully.")
            return JsonResponse({'data': serializer.data}, status=200)
        except Class.DoesNotExist:
            logger.error("Class does not exist.")
            return JsonResponse({"error": "Class not found."}, status=404)
        except IntegrityError as e:
            logger.error(f"Integrity error while updating class: {e}")
            if 'unique_name_section' in str(e):
                return JsonResponse({
                    'error': 'A class with the same name and section already exists.'
                }, status=400)
            else:
                return JsonResponse({
                    'error': 'An unexpected error occurred while updating the class.'
                }, status=500)
        except Exception as e:
            logger.error(f"Error updating class: {e}")
            return JsonResponse({"error": "An error occurred while updating the class."},
                                status=500)