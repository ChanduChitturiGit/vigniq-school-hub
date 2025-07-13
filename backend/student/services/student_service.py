"""Student Service Module
This module provides services related to student operations, including creating,
updating, and retrieving student data."""

import logging

from django.db import transaction
from django.http import JsonResponse

from rest_framework import status

from student.models import Student

from core.common_modules.common_functions import CommonFunctions
from core.models import User,Role


logger = logging.getLogger(__name__)

class StudentService:
    """Service class for handling student-related operations."""
    
    def __init__(self):
        pass

    def create_student(self, request):
        """Create a new student."""
        try:
            school_id = request.data.get('school_id', request.user.school_id)
            first_name = request.data.get('first_name')
            last_name = request.data.get('last_name')
            username = request.data.get('username')
            email = request.data.get('email')
            password = request.data.get('password')
            phone = request.data.get('phone')
            class_id = request.data.get('class_id')
            roll_number = request.data.get('roll_number')
            date_of_birth = request.data.get('date_of_birth')
            gender = request.data.get('gender')
            address = request.data.get('address')
            addmission_date = request.data.get('admission_date')
            parent_name = request.data.get('parent_name')
            parent_phone = request.data.get('parent_phone')
            parent_email = request.data.get('parent_email')


            if not school_id:
                return JsonResponse({"error": "School ID is required."},
                                    status=status.HTTP_400_BAD_REQUEST)

            if not first_name or not last_name:
                return JsonResponse({"error": "First name and last name are required."},
                                    status=status.HTTP_400_BAD_REQUEST)
            if (not username or not class_id or not password or not roll_number or not date_of_birth
                or not gender or not address or not addmission_date or not parent_name or not 
                parent_phone):
                return JsonResponse({"error": "All manditory fields are required."},
                                    status=status.HTTP_400_BAD_REQUEST)

            school_db_name = CommonFunctions.get_school_db_name(school_id)

            if not school_db_name:
                return JsonResponse({"error": "School not found or school is inactive."},
                                    status=status.HTTP_404_NOT_FOUND)

            with transaction.atomic():
                role = Role.objects.get(name='student')
                user = User.objects.createuser(
                    username=username,
                    first_name=first_name,
                    last_name=last_name,
                    email=email,
                    password=password,
                    phone_number=phone,
                    school_id=school_id,
                    gender=gender,
                    address=address,
                    role_id=3,
                )
            return JsonResponse({"message": "Student created successfully.",
                                 "student_id": student.id}, status=status.HTTP_201_CREATED)
        except Exception as e:
            logger.error(f"Error creating student: {e}")
            return JsonResponse({"error": "Failed to create student."},
                                status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def get_students_by_school_id(self, request):
        """Retrieve students by school ID."""
        # Implementation for retrieving students by school ID
        pass

    def get_student_by_id(self, request):
        """Retrieve a student by their ID."""
        # Implementation for retrieving a student by ID
        pass

    def update_student_by_id(self, request):
        """Update an existing student's details."""
        # Implementation for updating a student's details
        pass

    def delete_student_by_id(self, request):
        """Delete a student by their ID."""
        # Implementation for deleting a student by ID
        pass