# core/middleware.py
import threading
import logging

from django.conf import settings
from django.http import JsonResponse

from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, AuthenticationFailed

from school.models import School
from school.models import SchoolDbMetadata

from core.common_modules.db_loader import DbLoader

# Flag to ensure dynamic DBs are loaded once
_db_initialized = threading.Event()

# Thread-local storage for request-scoped DB name
_db_context = threading.local()

def set_current_db(db_name):
    _db_context.db = db_name

def get_current_db():
    return getattr(_db_context, 'db', None)

class LoadDynamicDatabasesMiddleware:
    """
    Middleware to load all dynamic databases once at server startup.
    Should be placed high in the middleware order.
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if not _db_initialized.is_set():
            try:
                self.load_databases()
                _db_initialized.set()
            except Exception as e:
                logging.error(f"[DB INIT ERROR] Failed to load dynamic DBs: {e}")
                return JsonResponse({"error": "Internal server error during DB setup."}, status=500)

        return self.get_response(request)

    def load_databases(self):
        db_loader = DbLoader()
        for school_db in SchoolDbMetadata.objects.all():
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
                

class DatabaseMiddleware:
    """
    Middleware to set current DB context based on authenticated user's school.
    Should be placed after authentication middleware.
    """
    def __init__(self, get_response):
        self.get_response = get_response

        self.exempt_paths = [
            "/auth/login/",
            "/auth/token/refresh/",
            "/core/password_manager/reset_password",
            "/core/password_manager/verify_otp"
        ]

    def __call__(self, request):
        path = request.path

        if path in self.exempt_paths:
            return self.get_response(request)

        # Attempt to authenticate using JWT manually
        jwt_auth = JWTAuthentication()
        try:
            user_auth_tuple = jwt_auth.authenticate(request)
            if user_auth_tuple is None:
                return JsonResponse({"error": "Authentication required."}, status=401)

            user, _ = user_auth_tuple
            request.user = user

            if user.is_superuser:
                set_current_db('default')
            else:
                if not hasattr(user, 'school_id') or user.school_id is None:
                    return JsonResponse({"error": "School not associated with user."}, status=400)
                
                school_id = user.school_id
                school = School.objects.filter(id=school_id).first()

                if not school:
                    return JsonResponse({"error": "School not found."}, status=400)

                db_name = f"{school.name.lower().replace(' ', '_')}_{school.id}_db"
                set_current_db(db_name)

        except (InvalidToken, AuthenticationFailed) as e:
            return JsonResponse({"error": str(e)}, status=401)

        response = self.get_response(request)
        set_current_db(None)
        return response
