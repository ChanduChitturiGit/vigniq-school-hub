import logging

from django.core.management.base import BaseCommand
from django.core.management import call_command
from django.conf import settings
from django.test.utils import override_settings

from school.models import SchoolDbMetadata
from core.common_modules.db_loader import DbLoader

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = 'Apply migrations to all dynamically registered school databases'

    def handle(self, *args, **kwargs):
        logger.info("Starting migration for all school databases...")

        try:
            all_metadata = SchoolDbMetadata.objects.all()
            db_loader = DbLoader()
            for school_db in all_metadata:
                db_key = school_db.db_name

                if db_key not in settings.DATABASES:
                    db_loader.load_dynamic_databases(
                        db_key = db_key,
                        engine = settings.DB_CONFIG['ENGINE'],
                        name = school_db.db_name,
                        user = settings.DB_CONFIG['USER'],
                        password = settings.DB_CONFIG['PASSWORD'],
                        host = settings.DB_CONFIG['HOST'],
                        port = settings.DB_CONFIG['PORT']
                    )

                logger.info(f"Applying migrations for {db_key}...")
                try:
                    apps = ['academics','classes','teacher','student','syllabus']
                    with override_settings(CURRENT_MIGRATION_DB=db_key):
                        for app in apps:
                            call_command("migrate",app, database=db_key,verbosity=1)
                            logger.info(f"Migration successful for {db_key}")
                except Exception as migrate_error:
                    logger.exception(f"Migration failed for {db_key}: {migrate_error}")

        except Exception as e:
            logger.exception(f"Error while loading school databases: {e}")
