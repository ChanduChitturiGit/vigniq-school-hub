"""Routers for handling database routing in Django."""

from core.middleware import get_current_db

class DatabaseRouter:
    """ A router to control all database operations on models for different databases.
    """

    apps_using_default_db = ('core', 'auth', 'contenttypes', 'admin', 'sessions','school','subscriptions')
    def db_for_read(self, model, **hints):
        from core.middleware import get_current_db
        db = get_current_db()
        if model._meta.app_label in self.apps_using_default_db:
            return 'default'
        return db or 'default'

    def db_for_write(self, model, **hints):
        from core.middleware import get_current_db
        db = get_current_db()
        if model._meta.app_label in self.apps_using_default_db:
            return 'default'
        return db or 'default'

    def allow_relation(self, obj1, obj2, **hints):
        db_obj1 = get_current_db()
        db_obj2 = get_current_db()
        return db_obj1 == db_obj2

    def allow_migrate(self, db, app_label, model_name=None, **hints):
        # Only allow `core` app on default DB
        if app_label in self.apps_using_default_db:
            return db == 'default'
        
        # All other apps should be allowed only on school DBs (i.e., not 'default')
        return db != 'default'
