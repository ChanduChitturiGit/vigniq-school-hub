"""core views.py"""
import logging
import os

from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated,AllowAny
from rest_framework.exceptions import AuthenticationFailed
from rest_framework_simplejwt.views import TokenObtainPairView

from django.views.generic import View
from django.http import HttpResponse
from django.conf import settings

from .serializers import CustomTokenObtainPairSerializer
from core.services.password_manager_service import PasswordManagerService
from core.services.user_profile_service import UserProfileService

logger = logging.getLogger(__name__)

class FrontendAppView(View):
    def get(self, request):
        index_path = os.path.join(settings.PROJECT_ROOT, 'dist', 'index.html')
        try:
            with open(index_path, 'r') as f:
                return HttpResponse(f.read())
        except FileNotFoundError:
            return HttpResponse("index.html not found. Run your frontend build.", status=501)

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

    def post(self, request, *args, **kwargs):
        try:
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            return Response(serializer.validated_data, status=status.HTTP_200_OK)
        except AuthenticationFailed as e:
            return Response({"error": str(e)}, status=status.HTTP_401_UNAUTHORIZED)


class PasswordManagerView(APIView):
    
    def get_permissions(self):
        if self.kwargs.get('action') in ['reset_password', 'verify_otp']:
            return [AllowAny()]
        return [IsAuthenticated()]

    def post(self, request, action=None):
        """
        Handle password reset requests.
        Expects 'username' in the request data.
        """
        if action == 'reset_password':
            user_name = request.data.get('user_name')
            if not user_name:
                return Response({"error": "Username is required."},
                                status=status.HTTP_400_BAD_REQUEST
                    )

            return PasswordManagerService().reset_password_send_otp(user_name)
        elif action == 'verify_otp':
            user_name = request.data.get('user_name')
            otp = request.data.get('otp')

            if not user_name or not otp:
                return Response({"error": "Username, OTP and Password are required."},
                                status=status.HTTP_400_BAD_REQUEST
                    )

            return PasswordManagerService().validate_otp(
                    user_name, otp
                )
        elif action == 'change_or_set_password':
            return PasswordManagerService().change_password(request)
        else:
            return Response({"error": "Invalid action."}, status=status.HTTP_400_BAD_REQUEST)

class UserProfileView(APIView):
    """
    View to handle user profile actions.
    """

    permission_classes = [IsAuthenticated]

    def get(self, request, action=None):
        """
        Get the authenticated user's profile information.
        """
        if action == 'getUserByUserName':
            return UserProfileService().get_user_by_username(request)
        return Response({"error": "Invalid GET action"}, status=status.HTTP_400_BAD_REQUEST)
    
    def put(self, request, action=None):
        """
        Update the authenticated user's profile information.
        """
        if action == 'editUserByUserName':
            return UserProfileService().edit_user_by_username(request)
        return Response({"error": "Invalid PUT action"}, status=status.HTTP_400_BAD_REQUEST)
