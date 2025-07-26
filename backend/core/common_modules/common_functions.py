"""Common functions for the backend."""

import logging

import PyPDF2

from school.models import SchoolDbMetadata

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