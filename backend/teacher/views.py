
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from teacher.services.teacher_service import TeacherService
from teacher.services.subject_service import SubjectService

from core.permissions import IsSuperAdminOrAdmin


class TeacherActionView(APIView):
    """
    View to handle teacher-related actions like create, update, and list teachers.
    Only accessible by users with the admin role (role.id == 1).

    Paths Available:
    - GET /teacher/manage_teacher/teacher_list/ - List all teachers (admin only)
    - POST /teacher/manage_teacher/create/ - Create a new teacher (admin only)
    - PUT /teacher/manage_teacher/edit/ - Update an existing teacher (admin only)
    """

    def get_permissions(self):
        if self.kwargs.get('action') in ['getTeacherById']:
            return [IsAuthenticated()]
        return [IsAuthenticated(), IsSuperAdminOrAdmin()]

    def get(self, request, action=None):

        if action == "getTeachersBySchoolId":
            return TeacherService().get_teacher_list_by_school_id(request)
        elif action == "getTeacherById":
            return TeacherService().get_teacher_by_id(request)
        return Response({"error": "Invalid GET action"}, status=status.HTTP_400_BAD_REQUEST)
    
    def post(self, request, action=None):

        if action == "addTeacher":
            return TeacherService().create_teacher(request)
        return Response({"error": "Invalid POST action"}, status=status.HTTP_400_BAD_REQUEST)
    
    def put(self, request, action=None):

        if action == "updateTeacherById":
            return TeacherService().edit_teacher(request)
        return Response({"error": "Invalid PUT action"}, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, action=None):

        if action == "deleteTeacherById":
            return TeacherService().delete_teacher(request)
        return Response({"error": "Invalid DELETE action"}, status=status.HTTP_400_BAD_REQUEST)

class SubjectActionView(APIView):
    """
    View to handle subject-related actions like create, update, and list subjects.
    Only accessible by users with the admin role (role.id == 1).

    Paths Available:
    
    """
    def get_permissions(self):
        if self.kwargs.get('action') in ['getSubjects']:
            return [IsAuthenticated()]
        return [IsAuthenticated(), IsSuperAdminOrAdmin()]

    def get(self, request, action=None):

        if action == "getSubjects":
            return SubjectService().get_subjects_by_school_id(request)
        return Response({"error": "Invalid GET action"}, status=status.HTTP_400_BAD_REQUEST)

    def post(self, request, action=None):

        if action == "addSubject":
            return SubjectService().create_subject(request)
        return Response({"error": "Invalid POST action"}, status=status.HTTP_400_BAD_REQUEST)
    
    def put(self, request, action=None):

        if action == "updateSubjectById":
            return SubjectService().update_subject_by_id(request)
        return Response({"error": "Invalid PUT action"}, status=status.HTTP_400_BAD_REQUEST)