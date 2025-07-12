"""prod settings"""
from .base import *

SECRET_KEY = APP_SECRET['SECRET_KEY']

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = False

ALLOWED_HOSTS = []