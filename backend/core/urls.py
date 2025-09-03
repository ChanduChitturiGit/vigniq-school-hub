"""urls.py"""

from django.urls import path
from core.views import PasswordManagerView,UserProfileView,DashboardView,SupportView

urlpatterns = [
    path('password_manager/<str:action>', PasswordManagerView.as_view(), name='passsword_manager'),
    path('user_profile/<str:action>', UserProfileView.as_view(), name='user_profile'),
    path('dashboard/<str:action>', DashboardView.as_view(), name='dashboard'),
    path('support/<str:action>', SupportView.as_view(), name='support'),
]
