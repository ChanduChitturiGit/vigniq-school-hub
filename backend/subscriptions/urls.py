"""subscriptions urls"""

from django.urls import path
from subscriptions.views import PackagesView

urlpatterns = [
    path('manage_packages/<str:action>', PackagesView.as_view(), name='packages'),
]