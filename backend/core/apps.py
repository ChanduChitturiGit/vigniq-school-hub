import threading
import redis
from django.conf import settings
from django.apps import AppConfig



class CoreConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'core'

    def ready(self):
        threading.Thread(target=self.listen_for_db_creation, daemon=True).start()

    def listen_for_db_creation(self):
        from core.common_modules.db_loader import DbLoader
        from school.models import SchoolDbMetadata
        r = redis.Redis(host='localhost', port=6379, db=0)
        pubsub = r.pubsub()
        pubsub.subscribe('new_db_created')

        for message in pubsub.listen():
            if message['type'] == 'message':
                db_key = message['data'].decode('utf-8')
                print(f"[REDIS] New DB creation detected: {db_key}")
                try:
                    loader = DbLoader()
                    school_db_metadata = SchoolDbMetadata.objects.get(db_name=db_key)
                    loader.load_dynamic_databases(school_db_metadata.db_name,
                                                  engine=settings.DB_CONFIG['ENGINE'],
                                                  name=school_db_metadata.db_name,
                                                  user=school_db_metadata.db_user,
                                                  password=school_db_metadata.db_password,
                                                  host=school_db_metadata.db_host,
                                                  port=school_db_metadata.db_port)
                    print(f"[REDIS] Databases reloaded successfully.")
                except Exception as e:
                    print(f"[REDIS ERROR] Could not reload databases: {e}")