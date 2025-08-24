from django.urls import path
from .views import EbookView,SyllabusView,WhiteboardView,AIChatView

urlpatterns = [
    path('manage_ebook/<str:action>', EbookView.as_view(), name='ebook_action'),
    path('manage_syllabus/<str:action>', SyllabusView.as_view(), name='syllabus_action'),
    path('manage_whiteboard/<str:action>', WhiteboardView.as_view(), name='whiteboard_action'),
    path('manage_ai_chat/<str:action>', AIChatView.as_view(), name='ai_chat_action'),
]
