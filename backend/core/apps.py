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
                    loader.load_dynamic_databases(db_key,
                                                  engine=settings.DB_CONFIG['ENGINE'],
                                                  name=db_key,
                                                  user=settings.DB_CONFIG['USER'],
                                                  password=settings.DB_CONFIG['PASSWORD'],
                                                  host=settings.DB_CONFIG['HOST'],
                                                  port=settings.DB_CONFIG['PORT'])
                    print(f"[REDIS] Databases reloaded successfully.")
                except Exception as e:
                    print(f"[REDIS ERROR] Could not reload databases: {e}")