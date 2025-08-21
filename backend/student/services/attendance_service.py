"""Attendance Service Module."""

import logging
from datetime import datetime

from rest_framework.response import Response
from rest_framework import status

from django.utils import timezone
from core.common_modules.common_functions import CommonFunctions
from student.models import StudentAttendance

logger = logging.getLogger(__name__)


class AttendanceService:
    """Service for handling attendance-related operations."""

    def __init__(self):
        pass

    def mark_attendance(self, request):
        """Mark attendance for a students."""
        try:
            school_id = request.data.get('school_id') or getattr(request.user, 'school_id', None)
            class_section_id = request.data.get('class_section_id')
            attendance_data = request.data.get('attendance', [])
            date = request.data.get('date')
            session = request.data.get('session', 'M')
            academic_year_id = request.data.get('academic_year_id', 1)
            school_db_name = CommonFunctions.get_school_db_name(school_id)

            if not all([class_section_id, date, session, attendance_data]):
                logger.error("Missing required fields in attendance data.")
                return None
            
            attendance_date = datetime.strptime(date, "%Y-%m-%d").date()
            if attendance_date != timezone.localdate():
                logger.error("Attendance date must be today's date.")
                return None
            if session not in ['M', 'A']:
                logger.error("Invalid session provided. Must be 'Morning(M)' or 'Afternoon(A)'.")
                return None

            for data in attendance_data:
                student_id = data.get('student_id')
                present = data.get('present', True)

                if not student_id or date is None:
                    logger.error("Missing student_id or date in attendance data.")
                    continue

                StudentAttendance.objects.using(school_db_name).update_or_create(
                    student_id=student_id,
                    date=date,
                    session=session,
                    defaults={
                        'present': present,
                        'academic_year_id': academic_year_id
                    }
                )

            return Response({"message": "Attendance marked successfully."},
                            status=status.HTTP_200_OK)
        except Exception as e:
            logger.error("Error marking attendance: %s",e)
            return Response({"error": "Failed to mark attendance"},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def get_attendance(self, request):
        """Retrieve attendance records for a student."""
        try:
            date
            if date:
                return self.student_attendance_model.objects.filter(
                    student_id=student_id, date=date
                )
            return self.student_attendance_model.objects.filter(student_id=student_id)
        except Exception as e:
            logger.error(f"Error retrieving attendance: {e}")
            raise