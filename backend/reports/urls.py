from django.urls import path
from .views import SyllabusProgressReportView

urlpatterns = [
    path('syllabus_reports/<str:action>', SyllabusProgressReportView.as_view(), name='school_action'),
]
