from django.urls import path
from classes.views import ClassesActionView

urlpatterns = [
    path('class_manager/<str:action>', ClassesActionView.as_view(), name='manage_class'),
]
