"""dev settings"""
from .base import *

SECRET_KEY = APP_SECRET['SECRET_KEY']

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = ['localhost', '127.0.0.1']