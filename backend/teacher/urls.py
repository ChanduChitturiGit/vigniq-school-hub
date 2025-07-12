from django.urls import path
from .views import TeacherActionView, SubjectActionView

urlpatterns = [
    path('manage_teacher/<str:action>', TeacherActionView.as_view(), name='manage_teacher'),
    path('manage_subject/<str:action>', SubjectActionView.as_view(), name='manage_subject'),
]
