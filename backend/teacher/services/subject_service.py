"""Subjects Service Module
This module provides services related to subjects, including creating, updating,
and listing subjects."""

import logging

from django.db import transaction
from django.http import JsonResponse
from rest_framework import status

from teacher.models import Subject

from core.common_modules.common_functions import CommonFunctions

logger = logging.getLogger(__name__)

class SubjectService:
    """Service class for handling subject-related operations."""
    def __init__(self):
        pass

    def create_subject(self, request):
        """Create a new subject."""
        try:
            school_id = request.data.get('school_id',request.user.school_id)
            name = request.data.get('name')
            if not school_id:
                return JsonResponse({"error": "School ID is required."},
                                    status=status.HTTP_400_BAD_REQUEST)

            if not name:
                return JsonResponse({"error": "Subject name is required."},
                                    status=status.HTTP_400_BAD_REQUEST)

            school_db_name = CommonFunctions.get_school_db_name(school_id)
            if not school_db_name:
                return JsonResponse({"error": "School not found or school is inactive."},
                                    status=status.HTTP_404_NOT_FOUND)

            with transaction.atomic():
                # Check if the subject already exists
                if Subject.objects.using(school_db_name).filter(name=name).exists():
                    return JsonResponse({"error": "Subject with this name already exists."},
                                        status=status.HTTP_400_BAD_REQUEST)
                
                # Create the subject
                subject = Subject.objects.using(school_db_name).create(name=name)
            return JsonResponse({"message": "Subject created successfully.",
                                 "subject_id": subject.id}, status=status.HTTP_201_CREATED)
        except Exception as e:
            logger.error(f"Error creating subject: {e}")
            return JsonResponse({"error": "Failed to create subject."},
                                status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def get_subjects_by_school_id(self,request):
        """List all subjects."""
        try:
            school_id = request.GET.get('school_id', request.user.school_id)
            if not school_id:
                return JsonResponse({"error": "School ID is required."},
                                    status=status.HTTP_400_BAD_REQUEST)
            school_db_name = CommonFunctions.get_school_db_name(school_id)
            if not school_db_name:
                return JsonResponse({"error": "School not found or school is inactive."},
                                    status=status.HTTP_404_NOT_FOUND)

            subjects = Subject.objects.using(school_db_name).all().values('id', 'name')
            return JsonResponse(list(subjects), safe=False, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Error fetching subjects: {e}")
            return JsonResponse({"error": "Failed to fetch subjects."},
                                status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def update_subject_by_id(self, request):
        """Update an existing subject."""
        try:
            school_id = request.data.get('school_id', request.user.school_id)
            subject_id = request.data.get('subject_id')
            name = request.data.get('name')
            if not school_id:
                return JsonResponse({"error": "School ID is required."},
                                    status=status.HTTP_400_BAD_REQUEST)
            if not subject_id or not name:
                return JsonResponse({"error": "Subject ID and name are required."},
                                    status=status.HTTP_400_BAD_REQUEST)
            
            school_db_name = CommonFunctions.get_school_db_name(school_id)
            if not school_db_name:
                return JsonResponse({"error": "School not found or school is inactive."},
                                    status=status.HTTP_404_NOT_FOUND)

            with transaction.atomic():
                # Check if the subject exists
                try:
                    if Subject.objects.using(school_db_name).filter(name=name,
                                                ).exclude(pk=subject_id).exists():
                        return JsonResponse({"error": "Subject with this name already exists."},
                                        status=status.HTTP_400_BAD_REQUEST)
                    subject = Subject.objects.using(school_db_name).get(id=subject_id)
                except Subject.DoesNotExist:
                    return JsonResponse({"error": "Subject not found."},
                                        status=status.HTTP_404_NOT_FOUND)
                
                # Update the subject
                subject.name = name
                subject.save(using=school_db_name)
            return JsonResponse({"message": "Subject updated successfully."}, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Error updating subject: {e}")
            return JsonResponse({"error": "Failed to update subject."},
                                status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    