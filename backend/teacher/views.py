
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from teacher.services.teacher_service import TeacherService


class TeacherActionView(APIView):
    """
    View to handle teacher-related actions like create, update, and list teachers.
    Only accessible by users with the admin role (role.id == 1).

    Paths Available:
    - GET /teacher/manage_teacher/teacher_list/ - List all teachers (admin only)
    - POST /teacher/manage_teacher/create/ - Create a new teacher (admin only)
    - PUT /teacher/manage_teacher/edit/ - Update an existing teacher (admin only)
    """

    permission_classes = [IsAuthenticated]

    def get(self, request, action=None):
        user = request.user
        if user.role.id not in (1,2):
            return Response({"error": "You do not have permission to view teachers."},
                            status=status.HTTP_403_FORBIDDEN)

        if action == "teacher_list":
            return TeacherService().get_teacher_list(request)
        return Response({"error": "Invalid GET action"}, status=status.HTTP_400_BAD_REQUEST)
    
    def post(self, request, action=None):
        user = request.user
        if user.role.id not in (1,2):
            return Response({"error": "You do not have permission to create a teacher."},
                            status=status.HTTP_403_FORBIDDEN)

        if action == "create":
            return TeacherService().create_teacher(request)
        elif action == 'edit':
            return  TeacherService().edit_teacher(request)
        return Response({"error": "Invalid POST action"}, status=status.HTTP_400_BAD_REQUEST)