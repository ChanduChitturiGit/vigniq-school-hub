"""Dashboard Service Module"""

import logging

from rest_framework.response import Response

from school.models import School
from core.models import User

from classes.models import SchoolSection
from student.models import StudentClassAssignment
from teacher.models import Teacher

from core.common_modules.common_functions import CommonFunctions

logger = logging.getLogger(__name__)


class DashboardService:
    """
    Service class for handling dashboard-related operations.
    """

    def __init__(self):
        pass

    def get_dashboard_data(self, request):
        """
        Fetches dashboard data for the given user.
        This method should be implemented to return relevant data.
        """

        logger.info("Fetching dashboard data for user: %s",request.user)

        if request.user.role_id == 1:
            total_schools = School.objects.filter(is_active=True).count()
            total_active_users = User.objects.filter(is_active=True).count()
            return Response({
                "data":{
                    "total_schools": total_schools,
                    "total_active_users": total_active_users
                }
            }, status=200)
        elif request.user.role_id == 2:
            academic_year_id = request.data.get('academic_year_id',1)
            school_db_name = CommonFunctions.get_school_db_name(request.user.school_id)
            school = School.objects.filter(school_admin=request.user).first()
            if not school:
                return Response({"error": "No school found for this user."}, status=404)
            total_classes = SchoolSection.objects.using(school_db_name).count()
            total_students = StudentClassAssignment.objects.using(school_db_name).filter(
                academic_year_id=academic_year_id,
                student__is_active=True
            ).count()

            total_teachers = Teacher.objects.using(school_db_name).filter(
                is_active=True
            ).count()

            return Response({
                "data":{
                    "total_classes": total_classes,
                    "total_students": total_students,
                    "total_teachers": total_teachers
                }
            }, status=200)

        return Response({"message": "Dashboard data not implemented yet."})