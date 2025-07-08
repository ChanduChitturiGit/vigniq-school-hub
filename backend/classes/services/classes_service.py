"""Classes Service Module"""

import logging

from django.http import JsonResponse
from django.core.serializers import serialize

from classes.models import Class, Section
from classes.serializers import ClassSerializer,SectionSerializer

logger = logging.getLogger(__name__)

class ClassesService:
    """Service class for managing classes and sections."""

    @staticmethod
    def get_classes():
        """Retrieve all classes."""
        try:
            classes = Class.objects.all()
            serializer = ClassSerializer(classes, many=True)

            logger.info(f"Retrieved {len(serializer.data)} classes.")
            return JsonResponse({'data': serializer.data},status=200)
        except Exception as e:
            logger.error(f"Error retrieving classes: {e}")
            return JsonResponse({"error": "An error occurred while retrieving classes."}, status=500)

    @staticmethod
    def get_sections():
        """Retrieve all sections."""
        try:
            sections = Section.objects.all()
            serializer = SectionSerializer(sections, many=True)

            logger.info(f"Retrieved {len(serializer.data)} sections.")
            return JsonResponse({'data': serializer.data}, status=200)
        except Exception as e:
            logger.error(f"Error retrieving sections: {e}")
            return JsonResponse({"error": "An error occurred while retrieving sections."}, status=500)