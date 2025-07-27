from django.urls import path
from .views import EbookView,SyllabusView

urlpatterns = [
    path('manage_ebook/<str:action>', EbookView.as_view(), name='ebook_action'),
    path('manage_syllabus/<str:action>', SyllabusView.as_view(), name='syllabus_action'),
]
