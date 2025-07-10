from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from classes.services.classes_service import ClassesService


class ClassesActionView(APIView):
    """
    View to handle actions related to classes and sections.
    """

    permission_classes = [IsAuthenticated]

    def get(self, request, action):
        """
        Handle GET requests for class and section
        """
        if action == 'class_list':
            return ClassesService().get_classes(request)
        else:
            return Response({"error": "Invalid GET action"}, status=status.HTTP_400_BAD_REQUEST)
    
    def post(self, request, action):
        """
        Handle POST requests for class and section
        """
        if action == 'addClass':
            return ClassesService().create_class(request)
        elif action == 'updateClass':
            return ClassesService().update_class(request)
        else:
            return Response({"error": "Invalid POST action"}, status=status.HTTP_400_BAD_REQUEST)
