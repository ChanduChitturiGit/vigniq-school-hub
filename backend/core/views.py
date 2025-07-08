"""core views.py"""
import logging


from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated,AllowAny
from rest_framework.exceptions import AuthenticationFailed
from rest_framework_simplejwt.views import TokenObtainPairView


from .serializers import CustomTokenObtainPairSerializer
from core.services.password_manager_service import PasswordManagerService

logger = logging.getLogger(__name__)


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
        if self.kwargs.get('action') in ['reset_password', 'verify_and_set_password']:
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
        elif action == 'verify_and_set_password':
            user_name = request.data.get('user_name')
            otp = request.data.get('otp')
            password = request.data.get('password')

            if not user_name or not otp or not password:
                return Response({"error": "Username, OTP and Password are required."},
                                status=status.HTTP_400_BAD_REQUEST
                    )

            return PasswordManagerService().reset_password_verify_otp_and_setpassword(
                    user_name, otp, password
                )
        elif action == 'change_password':
            return PasswordManagerService().change_password(request)
        else:
            return Response({"error": "Invalid action."}, status=status.HTTP_400_BAD_REQUEST)
