"""Academic Year views"""

import logging
from rest_framework.views import APIView

from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from academics.services.academics_service import AcademicsService

logger = logging.getLogger(__name__)

class AcademicYearActionView(APIView):
    """View to handle academic year-related actions like create, update, and list academic years."""
    
    permission_classes = [IsAuthenticated]

    def get(self, request, action=None):
        user = request.user
        if user.role.id not in (1, 2):
            return Response({"error": "You do not have permission to view academic years."},
                            status=status.HTTP_403_FORBIDDEN)

        if action == "getAcademicYears":
            return AcademicsService().get_academic_years(request)
        return Response({"error": "Invalid GET action"}, status=status.HTTP_400_BAD_REQUEST)

    def post(self, request, action=None):
        user = request.user
        if user.role.id not in (1, 2):
            return Response({"error": "You do not have permission to create an academic year."},
                            status=status.HTTP_403_FORBIDDEN)

        if action == "addAcademicYear":
            return AcademicsService().create_academic_year(request)
        return Response({"error": "Invalid POST action"}, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, action=None):
        user = request.user
        if user.role.id not in (1, 2):
            return Response({"error": "You do not have permission to update an academic year."},
                            status=status.HTTP_403_FORBIDDEN)

        if action == "updateAcademicYear":
            return AcademicsService().edit_academic_year(request)
        return Response({"error": "Invalid PUT action"}, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, action=None):
        user = request.user
        if user.role.id not in (1, 2):
            return Response({"error": "You do not have permission to delete an academic year."},
                            status=status.HTTP_403_FORBIDDEN)

        if action == "deleteAcademicYear":
            return AcademicsService().delete_academic_year(request)
        return Response({"error": "Invalid DELETE action"}, status=status.HTTP_400_BAD_REQUEST)