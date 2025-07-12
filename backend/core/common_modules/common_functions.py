"""Common functions for the backend."""

import logging

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