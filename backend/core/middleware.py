# core/middleware.py
import threading
import logging

from django.urls import resolve, Resolver404
from django.shortcuts import redirect
from django.conf import settings
from django.http import JsonResponse
from django.db import connections
from django.utils.deprecation import MiddlewareMixin

from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, AuthenticationFailed

from school.models import School

from core.common_modules.db_loader import DbLoader

# Flag to ensure dynamic DBs are loaded once
_db_initialized = threading.Event()

# Thread-local storage for request-scoped DB name
_db_context = threading.local()

logger = logging.getLogger(__name__)

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
                DbLoader().load_databases()
                _db_initialized.set()
            except Exception as e:
                logger.error(f"[DB INIT ERROR] Failed to load dynamic DBs: {e}")
                return JsonResponse({"error": "Internal server error during DB setup."}, status=500)

        return self.get_response(request)

class CloseDBConnectionMiddleware(MiddlewareMixin):
    def process_response(self, request, response):
        # Loop through all configured DBs
        for conn in connections.all():
            conn.close_if_unusable_or_obsolete()
        return response


class AuthenticationMiddleware:
    """
    Middleware to set current DB context based on authenticated user's school.
    Should be placed after authentication middleware.
    """
    def __init__(self, get_response):
        self.get_response = get_response

        self.exempt_paths = [
            "/",
            "/assets/",
            "/static/",
            "/favicon.ico",
            "/auth/login/",
            "/auth/token/refresh/",
            "/core/password_manager/reset_password",
            "/core/password_manager/verify_otp"
        ]

    def is_exempt(self, path):
        return (
            path in self.exempt_paths
            or path.startswith("/assets/")
            or path.startswith("/static/")
            or path == "/favicon.ico"
        )

    def __call__(self, request):
        path = request.path

        if self.is_exempt(path):
            return self.get_response(request)
        
        try:
            if path == "/login":
                return redirect(request.build_absolute_uri('/'))
            resolve(path)
        except Resolver404:
            logger.error(f"Path not found: {path}")
            return redirect(f"{request.build_absolute_uri('/')}#/unauthorized")

        jwt_auth = JWTAuthentication()
        try:
            user_auth_tuple = jwt_auth.authenticate(request)
            if user_auth_tuple is None:
                logger.error("Authentication credentials were not provided or are invalid.")
                return JsonResponse({"error": "Authentication credentials were not provided or are invalid."}, status=401)

            user, _ = user_auth_tuple
            request.user = user

            if not user.is_superuser:
                if not hasattr(user, 'school_id') or user.school_id is None:
                    logger.error(f"User {user.id} is not associated with any school.")
                    return JsonResponse({"error": "User is not associated with any school. Please contact support."}, status=400)
                
                # school_id = user.school_id
                # school = School.objects.filter(id=school_id).first()

                # if not school:
                #     return JsonResponse({"error": "School not found."}, status=400)

                # db_name = f"{school.name.lower().replace(' ', '_')}_{school.id}_db"
                # set_current_db(db_name)

        except InvalidToken as e:
            logger.error(f"Invalid token: {str(e)}")
            return JsonResponse({"error":"Invalid or expired token. Please log in again."}, status=401)
        except AuthenticationFailed as e:
            logger.error(f"Authentication failed: {str(e)}")
            return JsonResponse({"error": f"Authentication failed"}, status=401)

        response = self.get_response(request)
        # set_current_db(None)
        return response
