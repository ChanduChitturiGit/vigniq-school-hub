"""prod settings"""
from .base import *

SECRET_KEY = APP_SECRET['SECRET_KEY']

DEBUG = False


CACHES = {
        'default': {
            'BACKEND': 'django.core.cache.backends.redis.RedisCache',
            'LOCATION': 'redis://127.0.0.1:6379/1',
        }
    }