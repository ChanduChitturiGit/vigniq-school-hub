from django.urls import path
from .views import TeacherActionView

urlpatterns = [
    path('manage_teacher/<str:action>', TeacherActionView.as_view(), name='manage_teacher'),
]
