import os 
from dotenv import load_dotenv

load_dotenv(dotenv_path='../.env',override=True)

APP_CONFIG = {
    'ENVIRONMENT': os.getenv('ENVIRONMENT', 'dev'),
    'ALLOWED_HOSTS': os.getenv('ALLOWED_HOSTS', 'localhost,127.0.0.1').split(','),
}

AWS_CONFIG = {
    'S3_BUCKET_NAME': os.getenv('AWS_S3_BUCKET_NAME'),
    'REGION_NAME': os.getenv('AWS_REGION_NAME', 'us-east-1'),
    'AWS_ACCESS_KEY_ID': os.getenv('AWS_ACCESS_KEY_ID', ''),
    'AWS_SECRET_ACCESS_KEY': os.getenv('AWS_SECRET_ACCESS_KEY', ''),
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


API_KEYS = {
    'GEMINI_API_KEY': os.getenv('GEMINI_API_KEY')
}

AI_MODELS = {
    'GEMINI_MODEL': os.getenv('GEMINI_MODEL', 'gemini-2.5-flash')
}