from django.urls import path
from .views import StudentView

urlpatterns = [
    path('manage_student/<str:action>', StudentView.as_view(), name='student_action'),
]
