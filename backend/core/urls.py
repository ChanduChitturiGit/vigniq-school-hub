"""urls.py"""

from django.urls import path
from core.views import PasswordManagerView

urlpatterns = [
    path('password_manager/<str:action>', PasswordManagerView.as_view(), name='passsword_manager'),
]
