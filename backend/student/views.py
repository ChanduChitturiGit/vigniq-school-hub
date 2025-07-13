from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response

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
            pass
        elif action == "getStudentById":
            pass
        elif action == "getStudentsByClassId":
            pass
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
            pass
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
            pass
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
            pass
        return Response({"error": "Invalid POST action"}, status=status.HTTP_400_BAD_REQUEST)