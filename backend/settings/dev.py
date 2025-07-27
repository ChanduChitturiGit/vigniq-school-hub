"""dev settings"""
from .base import *

SECRET_KEY = APP_SECRET['SECRET_KEY']

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.filebased.FileBasedCache',
        'LOCATION': os.path.join(BASE_DIR, 'django_cache'),
    }
}