"""Common functions for the backend."""

import logging

import PyPDF2

from school.models import SchoolDbMetadata, SchoolBoard
from academics.models import SchoolAcademicYear

logger = logging.getLogger(__name__)

class CommonFunctions:

    @staticmethod
    def get_school_db_name(school_id):
        """Retrieve the database name for a given school ID."""
        try:
            school_metadata = SchoolDbMetadata.objects.get(school_id=school_id,is_active=True)
            return school_metadata.db_name
        except SchoolDbMetadata.DoesNotExist:
            logger.error(f"School metadata not found for school ID: {school_id}")
            return None
        except Exception as e:
            logger.error(f"Error retrieving school database name: {e}")
            return None
    
    @staticmethod
    def extract_text_from_pdf(pdf_file):
        pdf_file.seek(0)
        pdf_text = ""
        pdf_reader = PyPDF2.PdfReader(pdf_file)
        num_pages = len(pdf_reader.pages)

        for page_num in range(num_pages):
            page = pdf_reader.pages[page_num]
            page_text = page.extract_text()
            pdf_text += (page_text or "") + "\n\n"
        return pdf_text
    
    @staticmethod
    def normalize_keys(obj):
        if isinstance(obj, dict):
            return {k.lower(): CommonFunctions.normalize_keys(v) for k, v in obj.items()}
        elif isinstance(obj, list):
            return [CommonFunctions.normalize_keys(item) for item in obj]
        else:
            return obj

    def get_login_uri(self, request):
        """Get the login URI for the application."""
        uri = request.build_absolute_uri('/#/login')
        logger.info(f"Login URI: {uri}")
        return uri

    def get_absolute_uri(self, request):
        """Get the absolute URI for a given path."""
        uri = request.build_absolute_uri('/')
        logger.info(f"Absolute URI: {uri}")
        return uri
    
    def get_boards_dict(self):
        boards= dict(SchoolBoard.objects.all().values_list("id", "board_name"))
        return boards
    
    def get_latest_academic_year(self, school_db_name):
        """Get the latest academic year for a given school ID."""
        try:
            if not school_db_name:
                return None
            latest_academic_year = SchoolAcademicYear.objects.using(school_db_name).all().order_by('-id').first()
            return latest_academic_year
        except Exception as e:
            logger.error(f"Error retrieving latest academic year: {e}")
            return None