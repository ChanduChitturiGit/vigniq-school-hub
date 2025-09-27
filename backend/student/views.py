from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response

from student.services.student_service import StudentService
from student.services.attendance_service import AttendanceService
from core.permissions import IsSuperAdminOrAdminOrTeacher

class StudentView(APIView):
    """
    View to handle student-related operations.
    """

    def get_permissions(self):
        if self.kwargs.get('action') in ['getStudentById']:
            return [IsAuthenticated()]
        return [IsAuthenticated(), IsSuperAdminOrAdminOrTeacher()]


    def get(self, request,action=None):
        """
        Handle GET requests to retrieve student data.
        """

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

        if action == "createStudent":
            return StudentService().create_student(request)
        return Response({"error": "Invalid POST action"}, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, action=None):
        """
        Handle PUT requests to update an existing student.
        """

        if action == "updateStudentById":
            return StudentService().update_student_by_id(request)
        return Response({"error": "Invalid PUT action"}, status=status.HTTP_400_BAD_REQUEST)
    
    def patch(self, request, action=None):

        if action == "reactivateStudentById":
            return StudentService().reactivate_student(request)
        return Response({"error": "Invalid PATCH action"}, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, action=None):
        """
        Handle DELETE requests to remove a student.
        """

        if action == "deleteStudentById":
            return StudentService().delete_student_by_id(request)
        return Response({"error": "Invalid Delete action"}, status=status.HTTP_400_BAD_REQUEST)

class AttendanceView(APIView):
    """
    View to handle attendance-related operations.
    """
    permission_classes = [IsAuthenticated, IsSuperAdminOrAdminOrTeacher]

    def get(self, request, action=None):
        """
        Handle GET requests to retrieve attendance data.
        """

        # if action == "getAttendanceByStudent":
        #     return AttendanceService().get_attendance(request)
        if action == "getAttendanceByClassSection":
            return AttendanceService().get_attendance_by_class_section(request)
        elif action == "getPastAttendance":
            return AttendanceService().get_past_attendance(request)
        return Response({"error": "Invalid GET action"}, status=status.HTTP_400_BAD_REQUEST)

    def post(self, request, action=None):
        """
        Handle POST requests to mark or update attendance.
        """

        if action == "markAttendance":
            return AttendanceService().mark_attendance(request)
        elif action == "markHoliday":
            return AttendanceService().mark_holiday(request)
        elif action == "unmarkHoliday":
            return AttendanceService().unmark_holiday(request)
        return Response({"error": "Invalid POST action"}, status=status.HTTP_400_BAD_REQUEST)