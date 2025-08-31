from django.urls import path
from .views import TeacherActionView, SubjectActionView, OfflineExamActionView

urlpatterns = [
    path('manage_teacher/<str:action>', TeacherActionView.as_view(), name='manage_teacher'),
    path('manage_subject/<str:action>', SubjectActionView.as_view(), name='manage_subject'),
    path('manage_offline_exam/<str:action>', OfflineExamActionView.as_view(), name='manage_offline_exam'),
]
