import os 
from dotenv import load_dotenv

load_dotenv(dotenv_path='../.env',override=True)

APP_CONFIG = {
    'ENVIRONMENT': os.getenv('ENVIRONMENT', 'dev'),
}

DB_CONFIG = {
    'ENGINE': os.getenv('DB_ENGINE', 'django.db.backends.sqlite3'),
    'NAME': os.getenv('DB_NAME', 'db.sqlite3'),
    'USER': os.getenv('DB_USER', ''),
    'PASSWORD': os.getenv('DB_PASSWORD', ''),
    'HOST': os.getenv('DB_HOST', ''),
    'PORT': os.getenv('DB_PORT', ''),
}

APP_SECRET = {
    'SECRET_KEY': os.getenv('SECRET_KEY', 'django-insecure-&9chc#qf(k@=zb54)hiy!jvaf^264=85bai=!th#(6x@t78rpj'),
}

EMAIL_CONFIG = {
    'EMAIL_HOST_USER': os.getenv('EMAIL_HOST_USER', ''),
    'EMAIL_HOST_PASSWORD': os.getenv('EMAIL_HOST_PASSWORD', '')
}