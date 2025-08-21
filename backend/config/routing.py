from django.urls import re_path
from .consumers.whiteboard_consumer import WhiteboardConsumer

websocket_urlpatterns = [
    re_path(r"^ws/whiteboard/(?P<session_id>\w+)/$", WhiteboardConsumer.as_asgi()),
]
