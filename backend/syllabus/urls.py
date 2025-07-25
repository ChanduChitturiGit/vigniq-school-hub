from django.urls import path
from .views import EbookView

urlpatterns = [
    path('manage_ebook/<str:action>', EbookView.as_view(), name='ebook_action'),
]
