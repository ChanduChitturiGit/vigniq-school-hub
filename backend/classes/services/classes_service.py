"""Classes Service Module"""

import logging

from django.http import JsonResponse
from django.core.serializers import serialize

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

    # @staticmethod
    # def get_sections():
    #     """Retrieve all sections."""
    #     try:
    #         sections = Section.objects.all()
    #         serializer = SectionSerializer(sections, many=True)

    #         logger.info(f"Retrieved {len(serializer.data)} sections.")
    #         return JsonResponse({'data': serializer.data}, status=200)
    #     except Exception as e:
    #         logger.error(f"Error retrieving sections: {e}")
    #         return JsonResponse({"error": "An error occurred while retrieving sections."}, status=500)