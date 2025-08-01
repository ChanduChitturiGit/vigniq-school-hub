"""
URL configuration for config project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
# from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from core.views import CustomTokenObtainPairView, FrontendAppView
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    # path('admin/', admin.site.urls),
    path('', FrontendAppView.as_view(), name='frontend'),
    path('core/', include('core.urls')),
    path('school/', include('school.urls')),
    path('teacher/', include('teacher.urls')),
    path('classes/', include('classes.urls')),
    path('student/', include('student.urls')),
    path('academics/', include('academics.urls')),
    path('syllabus/', include('syllabus.urls')),
    path('auth/login/', CustomTokenObtainPairView.as_view(), name='login'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
] + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
