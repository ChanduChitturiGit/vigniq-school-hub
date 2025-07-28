"""
Service class to handle all academic-related operations.
"""

import logging
from django.db import transaction
from academics.models import SchoolAcademicYear

from school.models import SchoolDbMetadata
from rest_framework.response import Response
from rest_framework import status

logger = logging.getLogger(__name__)

class AcademicsService:

    def get_academic_years(self, request):
        """
        Fetch all academic years.
        """
        try:
            school_id = request.GET.get("school_id") or getattr(request.user, 'school_id', None)
            if not school_id:
                logger.error("School ID is required for fetching academic years.")
                return Response({"error": "School ID is required."},
                                status=status.HTTP_400_BAD_REQUEST)
            school_db_name = SchoolDbMetadata.objects.filter(school_id=school_id).first().db_name
            if not school_db_name:
                logger.error(f"School with ID {school_id} does not exist.")
                return Response({"error": "School not found."}, status=status.HTTP_404_NOT_FOUND)

            academic_years = SchoolAcademicYear.objects.using(school_db_name).all()
            data = [{"id": year.id,
                     "start_year": year.start_year,
                     "end_year": year.end_year,
                     "is_active": year.is_active} for year in academic_years
            ]

            return Response(data, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Error fetching academic years: {e}")
            return Response({"error": "Failed to fetch academic years"},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def create_academic_year(self, request):
        """
        Create a new academic year.
        """
        try:
            school_id = request.data.get("school_id") or getattr(request.user, 'school_id', None)
            start_year = request.data.get("start_year")
            end_year = request.data.get("end_year")

            if not school_id or not start_year or not end_year:
                logger.error(
                    "School ID, start year, and end year are required to create an academic year.")
                return Response({"error": "School ID, start year, and end year are required."},
                                status=status.HTTP_400_BAD_REQUEST)

            school_db_name = SchoolDbMetadata.objects.filter(school_id=school_id).first().db_name

            if not school_db_name:
                logger.error("School with ID %s does not exist.", school_id)
                return Response({"error": "School not found."}, status=status.HTTP_404_NOT_FOUND)

            with transaction.atomic(using=school_db_name):
                academic_year = SchoolAcademicYear.objects.using(school_db_name).create(
                    start_year=start_year,
                    end_year=end_year
                )
                return Response({"id": academic_year.id,
                                 "start_year": academic_year.start_year,
                                 "end_year": academic_year.end_year,
                                 "is_active": academic_year.is_active},
                                status=status.HTTP_201_CREATED)
        except Exception as e:
            logger.error(f"Error creating academic year: {e}")
            return Response({"error": "Failed to create academic year"},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def edit_academic_year(self, request):
        """
        Update an existing academic year.
        """
        try:
            school_id = request.data.get("school_id") or getattr(request.user, 'school_id', None)
            academic_year_id = request.data.get("academic_year_id")
            start_year = request.data.get("start_year")
            end_year = request.data.get("end_year")

            if not school_id or not academic_year_id or not start_year or not end_year:
                logger.error(
                    "School ID, academic year ID, start year, and end year are required to update an academic year.")
                return Response(
                    {"error":"School ID, academic year ID, start year, and end year are required."},
                                status=status.HTTP_400_BAD_REQUEST)

            school_db_name = SchoolDbMetadata.objects.filter(school_id=school_id).first().db_name

            if not school_db_name:
                logger.error("School with ID %s does not exist.", school_id)
                return Response({"error": "School not found."}, status=status.HTTP_404_NOT_FOUND)

            with transaction.atomic(using=school_db_name):
                academic_year = SchoolAcademicYear.objects.using(school_db_name).filter(
                    id=academic_year_id).first()
                if not academic_year:
                    logger.error("Academic Year with ID %s does not exist.",academic_year_id)
                    return Response({"error": "Academic Year not found."},
                                    status=status.HTTP_404_NOT_FOUND)

                academic_year.start_year = start_year
                academic_year.end_year = end_year
                academic_year.save()

                return Response({"id": academic_year.id,
                                 "start_year": academic_year.start_year,
                                 "end_year": academic_year.end_year,
                                 "is_active": academic_year.is_active},
                                status=status.HTTP_200_OK)
        except Exception as e:
            logger.error("Error updating academic year: %s", e)
            return Response({"error": "Failed to update academic year"},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)