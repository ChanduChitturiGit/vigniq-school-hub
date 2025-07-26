"""Db loader module for managing school databases."""

import logging

from django.conf import settings

from school.models import SchoolDbMetadata

logger = logging.getLogger(__name__)

class DbLoader:
    """Class to handle loading and managing school databases."""

    def __init__(self):
        pass

    def load_dynamic_databases(self,db_key,engine,name,user,password,host,port):
        """Load all dynamic databases from the SchoolDbMetadata model."""
        try:
            if db_key not in settings.DATABASES:
                settings.DATABASES[db_key] = {
                    'ENGINE': engine,
                    'NAME': name,
                    'USER': user,
                    'PASSWORD': password,
                    'HOST': host,
                    'PORT': port,
                    'ATOMIC_REQUESTS': False,
                    'OPTIONS': {},
                    'CONN_MAX_AGE': 300,
                    'TIME_ZONE': settings.TIME_ZONE,
                    'CONN_HEALTH_CHECKS': True,
                    'AUTOCOMMIT': True,
                }
            else:
                logger.info(f"Database {db_key} already exists in settings.DATABASES")
        except Exception as e:
            logger.error(f"Error loading database {db_key}: {e}")
            raise e
    
    def load_databases(self):
        for school_db in SchoolDbMetadata.objects.all():
            db_key = school_db.db_name
            if db_key not in settings.DATABASES:
                self.load_dynamic_databases(
                    db_key = db_key,
                    engine = settings.DB_CONFIG['ENGINE'],
                    name = school_db.db_name,
                    user = settings.DB_CONFIG['USER'],
                    password = settings.DB_CONFIG['PASSWORD'],
                    host = settings.DB_CONFIG['HOST'],
                    port = settings.DB_CONFIG['PORT']
                )