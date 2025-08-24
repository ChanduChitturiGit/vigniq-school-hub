from django.urls import path
from .views import StudentView,AttendanceView

urlpatterns = [
    path('manage_student/<str:action>', StudentView.as_view(), name='student_action'),
    path('manage_attendance/<str:action>', AttendanceView.as_view(), name='attendance_action'),
]
