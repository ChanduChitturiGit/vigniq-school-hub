from django.urls import path
from classes.views import ClassesActionView

urlpatterns = [
    path('<str:action>', ClassesActionView.as_view(), name='manage_teacher'),
]
