from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from classes.services.classes_service import ClassesService


class ClassesManagingView(APIView):
    """
    View to handle actions related to classes and sections.
    """

    permission_classes = [IsAuthenticated]

    def get(self, request, action):
        """
        Handle GET requests for class and section
        """
        user = request.user
        if user.role.id not in (1,2,3):
            return Response({"error": "You do not have permission view classes"},
                            status=status.HTTP_403_FORBIDDEN)
        if action == 'getAvailableClassList':
            return ClassesService().get_classes(request)
        elif action == 'getClassesByAcademicYear':
            return ClassesService().get_classes_by_academic_year(request)
        elif action == 'getClassById':
            return ClassesService().get_class_by_id(request)
        else:
            return Response({"error": "Invalid GET action"}, status=status.HTTP_400_BAD_REQUEST)
    
    def post(self, request, action):
        """
        Handle POST requests for class and section
        """
        user = request.user
        if user.role.id not in (1,2,3):
            return Response({"error": "You do not have permission to add classes"},
                            status=status.HTTP_403_FORBIDDEN)
        if action == 'addClassAndSection':
            return ClassesService().create_class_and_section(request)
        elif action == 'CreateClass':
            return ClassesService().create_class(request)
        else:
            return Response({"error": "Invalid POST action"}, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, action):
        """
        Handle PUT requests for class and section
        """
        user = request.user
        if user.role.id not in (1,2,3):
            return Response({"error": "You do not have permission to update classes"},
                            status=status.HTTP_403_FORBIDDEN)
        if action == 'updateClassAndSection':
            return ClassesService().update_class_and_section(request)
        elif action == 'updateClassById':
            return ClassesService().update_class(request)
        else:
            return Response({"error": "Invalid PUT action"}, status=status.HTTP_400_BAD_REQUEST)
        

