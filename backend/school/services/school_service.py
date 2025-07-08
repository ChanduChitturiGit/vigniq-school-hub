"""create school service"""
import logging
import psycopg2

from django.db import transaction
from django.conf import settings
from django.test.utils import override_settings
from django.apps import apps
from django.core.management import call_command

from rest_framework.response import Response
from rest_framework import status

from core.models import User,Role
from core.common_modules.db_loader import DbLoader
from core.common_modules.send_email import EmailService
from core.common_modules.password_validator import is_valid_password

from teacher.models import Teacher

from school.models import School, SchoolDbMetadata, SchoolBoard, SchoolBoardMapping


logger = logging.getLogger(__name__)

class SchoolService:
    """Service to create a school"""

    def __init__(self):
        pass

    def create_school(self, request):
        """
        Create a school with the provided data.
        Args:
            request: The HTTP request containing school data.
        Returns:
            Response: A response indicating success or failure.
        """
        try:
            with transaction.atomic():
                data = request.data

                admin_role = Role.objects.get(name='admin')

                if not is_valid_password(data.get('password')):
                    logger.error("Invalid password format.")
                    return Response({"error": "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character."}, status=400)

                
                admin_user = User.objects.create_user(
                    email = data.get('admin_email'),
                    user_name = data.get('admin_username'),
                    password = data.get('password'),
                    phone_number = data.get('contact_number'),
                    role = admin_role,
                )

                school = School.objects.create(
                    name = data.get('school_name'),
                    address = data.get('address'),
                    contact_number = data.get('contact_number'),
                    school_admin = admin_user,
                    email = data.get('school_email', None),
                )

                board_ids = data.get('boards', [])
                boards = SchoolBoard.objects.filter(id__in=board_ids)

                for board in boards:
                    SchoolBoardMapping.objects.get_or_create(school=school, board=board)

                admin_user.school_id = school.pk
                admin_user.save()

                school_db_metadata = SchoolDbMetadata.objects.create(
                    school = school,
                    db_name = f'{school.name.lower().replace(" ", "_")}_{school.pk}_db',
                    db_user = settings.DB_CONFIG['USER'],
                    db_password = settings.DB_CONFIG['PASSWORD'],
                    db_host = settings.DB_CONFIG['HOST'],
                    db_port = settings.DB_CONFIG['PORT']
                )

                success = self.create_school_database(school_db_metadata)

                if not success:
                    logger.error("Database creation failed. Rolling back transaction.")
                    raise Exception("Failed to create database for school.")
                
                email_service = EmailService()
                email_service.send_email(
                    to_email=admin_user.email,
                    email_type='welcome',
                    name = school.name,
                    user_name=admin_user.user_name,
                    password=data.get('password'),
                )

                return Response({"message": "School created successfully."}, status=status.HTTP_201_CREATED)

        except Role.DoesNotExist:
            logger.error("Role 'admin' does not exist.")
            return Response({"error": "Admin role is not configured in the system."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        except Exception as e:
            logger.error("Error while creating school.")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def edit_school(self, request):
        """
        Edit an existing school.
        Args:
            request: The HTTP request containing updated school data.
            school_id: The ID of the school to edit.
        Returns:
            Response: A response indicating success or failure.
        """
        try:
            with transaction.atomic():
                data = request.data
                school_id = data.get('school_id')
                school = School.objects.get(pk=school_id)

                school.name = data.get('school_name', school.name)
                school.address = data.get('school_address', school.address)
                school.contact_number = data.get('school_contact_number', school.contact_number)
                school.email = data.get('school_email', school.email)
                school.save()

                # Update boards if provided
                board_ids = data.get('boards')
                if board_ids is not None:
                    boards = SchoolBoard.objects.filter(id__in=board_ids)
                    # Remove old mappings
                    SchoolBoardMapping.objects.filter(school=school).exclude(board__in=boards).delete()
                    # Add new mappings
                    for board in boards:
                        SchoolBoardMapping.objects.get_or_create(school=school, board=board)

                return Response({"message": "School updated successfully."}, status=status.HTTP_200_OK)
        except School.DoesNotExist:
            logger.error(f"School with id {school_id} does not exist.")
            return Response({"error": "School not found."}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.error("Error while editing school.")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def get_schools(self, request):
        """
        Get all available schools.
        Args:
            request: The HTTP request.
        Returns:
            Response: A response with the list of schools.
        """
        try:
            schools = School.objects.all()
            schools_data = []
            for school in schools:
                school_db_metadata = SchoolDbMetadata.objects.filter(school=school).first()
                if school_db_metadata:
                    school_db_name = school_db_metadata.db_name
                else:
                    school_db_name = None
                
                teacher_count = Teacher.objects.using(school_db_name).filter(is_active=True).count()

                schools_data.append({
                    "school_id": school.id,
                    "school_name": school.name,
                    "school_address": school.address,
                    "school_contact_number": school.contact_number,
                    "school_email": school.email if school.school_admin else None,
                    "teacher_count": teacher_count,
                })
            return Response({"schools": schools_data}, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error("Error while fetching schools.")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def get_school(self,request):
        """
        Get details of a specific school.
        Args:
            request: The HTTP request containing the school ID.
        Returns:
            Response: A response with the school details.
        """
        try:
            school_id = request.query_params.get('school_id')
            if not school_id:
                return Response({"error": "School id is required."}, status=status.HTTP_400_BAD_REQUEST)

            school = School.objects.get(pk=school_id)
            school_db_metadata = SchoolDbMetadata.objects.filter(school=school).first()
            if school_db_metadata:
                school_db_name = school_db_metadata.db_name
            else:
                school_db_name = None
            

            school_data = {
                "school_id": school.id,
                "school_name": school.name,
                "school_address": school.address,
                "school_contact_number": school.contact_number,
                "school_email": school.email if school.school_admin else None,
                "school_admin_username" : school.school_admin.user_name if school.school_admin else None,
                "school_admin_email": school.school_admin.email if school.school_admin else None,
                "school_admin_full_name" : f"{school.school_admin.first_name} {school.school_admin.last_name}" if school.school_admin else None,
                "school_admin_phone_number": school.school_admin.phone_number if school.school_admin else None,
            }
            return Response({"school": school_data}, status=status.HTTP_200_OK)
        except School.DoesNotExist:
            logger.error(f"School with id {school_id} does not exist.")
            return Response({"error": "School not found."}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.error("Error while fetching school details.")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def get_boards(self, request):
        """
        Get all available school boards.
        Args:
            request: The HTTP request.
        Returns:
            Response: A response with the list of school boards.
        """
        try:
            boards = SchoolBoard.objects.all()
            boards_data = [{"id": board.id, "name": board.board_name} for board in boards]
            return Response({"boards": boards_data}, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error("Error while fetching school boards.")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    
    def create_school_database(self, school_db_metadata):
        """
        Create a database for the school.
        Args:
            school: The School object for which the database is to be created.
        Returns:
            bool: True if the database was created successfully, False otherwise.
        """
        try:
            logger.info(f"Creating database for school: {school_db_metadata.db_name}")

            conn = psycopg2.connect(
                dbname=settings.DB_CONFIG['NAME'],
                user=settings.DB_CONFIG['USER'],
                password=settings.DB_CONFIG['PASSWORD'],
                host=settings.DB_CONFIG['HOST'],
                port=settings.DB_CONFIG['PORT']
            )
            conn.autocommit = True
            cursor = conn.cursor()

            cursor.execute(f'CREATE DATABASE "{school_db_metadata.db_name}"')

            cursor.close()
            conn.close()

            db_loader = DbLoader()
            db_loader.load_dynamic_databases(
                db_key = school_db_metadata.db_name,
                engine = settings.DB_CONFIG['ENGINE'],
                name = school_db_metadata.db_name,
                user = settings.DB_CONFIG['USER'],
                password = settings.DB_CONFIG['PASSWORD'],
                host = settings.DB_CONFIG['HOST'],
                port = settings.DB_CONFIG['PORT']
            )
            self.apply_db_migrations(school_db_metadata.db_name)
            logger.info(f"Database {school_db_metadata.db_name} created successfully.")
            return True
        except Exception as e:
            logger.error(f"Failed to create database for school {school_db_metadata.db_name}: {str(e)}")
            return False
    
    def apply_db_migrations(self,db_name,
                            exclude_apps=('core', 'auth',
                'admin', 'contenttypes', 'sessions','school')
    ):
        """
        Apply migrations to the specified database, excluding certain apps.
        Args:
            db_name (str): The name of the database to apply migrations to.
            exclude_apps (tuple): A tuple of app labels to exclude from migrations.
        """
        # Get all app labels except excluded ones
        app_labels = [app.label for app in apps.get_app_configs() if app.label not in exclude_apps]

        for app_label in app_labels:
            try:
                with override_settings(CURRENT_MIGRATION_DB=db_name):
                    call_command('migrate', database=db_name, app_label=app_label, interactive=False)
                    logger.info(f"Migrated {app_label} on {db_name}")
            except Exception as e:
                logger.error(f"Migration failed for {app_label} on {db_name}: {e}")