from django.urls import path
from classes.views import ClassesManagingView

urlpatterns = [
    path('class_manager/<str:action>', ClassesManagingView.as_view(), name='manage_class'),
]
