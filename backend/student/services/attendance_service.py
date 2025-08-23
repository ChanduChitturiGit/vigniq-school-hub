"""Attendance Service Module."""

import logging
from datetime import datetime

from rest_framework.response import Response
from rest_framework import status

from django.utils import timezone
from core.common_modules.common_functions import CommonFunctions
from core.models import User
from student.models import StudentAttendance,StudentClassAssignment

logger = logging.getLogger(__name__)


class AttendanceService:
    """Service for handling attendance-related operations."""

    def __init__(self):
        pass

    def mark_attendance(self, request):
        """Mark or update attendance for students (only for today's date)."""
        try:
            school_id = request.data.get('school_id') or getattr(request.user, 'school_id', None)
            class_section_id = request.data.get('class_section_id')
            attendance_data = request.data.get('attendance_data', [])
            date_str = request.data.get('date')
            session = request.data.get('session', 'M')
            academic_year_id = request.data.get('academic_year_id', 1)
            user_id = getattr(request.user, 'id', None)
            school_db_name = CommonFunctions.get_school_db_name(school_id)

            if not all([class_section_id, date_str, session, attendance_data]):
                logger.error("Missing required fields in attendance data.")
                return Response({"error": "Missing required fields."},
                                status=status.HTTP_400_BAD_REQUEST)

            attendance_date = datetime.strptime(date_str, "%Y-%m-%d").date()
            if attendance_date != timezone.localdate():
                logger.error("Attendance date must be today's date.")
                return Response({"error": "Attendance can only be marked for today's date."},
                                status=status.HTTP_400_BAD_REQUEST)

            if session not in ['M', 'A']:
                logger.error("Invalid session provided.")
                return Response({"error": "Invalid session. Must be 'M' or 'A'."},
                                status=status.HTTP_400_BAD_REQUEST)

            for data in attendance_data:
                student_id = data.get('student_id')
                is_present = data.get('is_present')

                if not student_id:
                    logger.error("Missing student_id in attendance data.")
                    continue

                obj, created = StudentAttendance.objects.using(school_db_name).update_or_create(
                    student_id=student_id,
                    date=attendance_date,
                    session=session,
                    academic_year_id=academic_year_id,
                    defaults={
                        "is_present": is_present,
                    }
                )

                if created:
                    obj.taken_by_user_id = user_id
                obj.updated_by_user_id = user_id
                obj.save(using=school_db_name)

            return Response({"message": "Attendance marked/updated successfully."},
                            status=status.HTTP_200_OK)

        except Exception as e:
            logger.error("Error marking attendance: %s", e,)
            return Response({"error": "Failed to mark attendance"},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def get_attendance_by_class_section(self, request):
        """Retrieve attendance records for a class section."""
        try:
            date = request.GET.get('date')
            class_section_id = request.GET.get('class_section_id')
            academic_year_id = request.GET.get('academic_year_id', 1)
            session = request.GET.get('session', 'M')
            school_id = request.GET.get('school_id') or getattr(request.user, 'school_id', None)

            if not all([date, class_section_id, academic_year_id, school_id]):
                logger.error("Missing required parameters.")
                return Response({"error": "Missing required parameters."},
                                status=status.HTTP_400_BAD_REQUEST)
            school_db_name = CommonFunctions.get_school_db_name(school_id)

            students_list = StudentClassAssignment.objects.using(school_db_name).filter(
                class_instance_id=class_section_id,
                academic_year_id=academic_year_id
            )

            attendance_records = StudentAttendance.objects.using(school_db_name).filter(
                student_id__in=students_list.values_list('student_id', flat=True),
                academic_year_id=academic_year_id,
                date=date,
                session=session
            )

            attendance_taken = attendance_records.exists()

            student_ids = list(students_list.values_list("student_id", flat=True))

            users = User.objects.filter(id__in=student_ids).values("id", "first_name", "last_name")
            user_map = {u["id"]: f'{u["first_name"]} {u["last_name"]}' for u in users}

            attendance_list = []

            if not attendance_taken:
                for student_id in student_ids:
                    attendance_list.append({
                        "student_id": student_id,
                        "student_name": user_map.get(student_id, "Unknown"),
                    })
            else:
                records_map = {r.student_id: r for r in attendance_records}
                for student_id in student_ids:
                    record = records_map.get(student_id)
                    attendance_list.append({
                        "student_id": student_id,
                        "student_name": user_map.get(student_id, "Unknown"),
                        "is_present": record.is_present if record else None,
                    })

            output = {
                "attendance_taken": attendance_taken,
                "attendance_data": attendance_list
            }
            return Response({"data": output},
                            status=status.HTTP_200_OK)

        except Exception as e:
            logger.error("Error retrieving attendance: %s", e)
            return Response({"error": "Failed to retrieve attendance"},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)
