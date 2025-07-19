from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response

from student.services.student_service import StudentService
class StudentView(APIView):
    """
    View to handle student-related operations.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request,action=None):
        """
        Handle GET requests to retrieve student data.
        """
        user = request.user
        if user.role.id not in (1,2,3):
            return Response({"error": "You do not have permission to get students data."},
                            status=status.HTTP_403_FORBIDDEN)
        if action == "getStudentsBySchoolId":
            return StudentService().get_students_by_school_id(request)
        elif action == "getStudentById":
            return StudentService().get_student_by_id(request)
        elif action == "getStudentsByClassId":
            return StudentService().get_students_by_class_id(request)
        return Response({"error": "Invalid GET action"}, status=status.HTTP_400_BAD_REQUEST)

    def post(self, request, action=None):
        """
        Handle POST requests to create a new student.
        """
        user = request.user
        if user.role.id not in (1,2,3):
            return Response({"error": "You do not have permission to add students data."},
                            status=status.HTTP_403_FORBIDDEN)
        if action == "createStudent":
            return StudentService().create_student(request)
        return Response({"error": "Invalid POST action"}, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, action=None):
        """
        Handle PUT requests to update an existing student.
        """
        user = request.user
        if user.role.id not in (1,2,3):
            return Response({"error": "You do not have permission to update students data."},
                            status=status.HTTP_403_FORBIDDEN)
        if action == "updateStudentById":
            return StudentService().update_student_by_id(request)
        return Response({"error": "Invalid PUT action"}, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, action=None):
        """
        Handle DELETE requests to remove a student.
        """
        user = request.user
        if user.role.id not in (1,2,3):
            return Response({"error": "You do not have permission to delete students data."},
                            status=status.HTTP_403_FORBIDDEN)
        if action == "deleteStudentById":
            return StudentService().delete_student_by_id(request)
        return Response({"error": "Invalid Delete action"}, status=status.HTTP_400_BAD_REQUEST)