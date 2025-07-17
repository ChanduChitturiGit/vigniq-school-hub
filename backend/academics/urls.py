"""urls.py"""

from django.urls import path
from academics.views import AcademicYearActionView

urlpatterns = [
    path('academic_years/<str:action>', AcademicYearActionView.as_view(), name='academic_years'),
]
