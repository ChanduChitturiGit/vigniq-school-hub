"""Password Manager Service"""

import logging
import random

from django.core.cache import cache
from django.http import JsonResponse

from core.models import User
from core.common_modules.send_email import EmailService
from core.common_modules.password_validator import is_valid_password

logger = logging.getLogger(__name__)

class PasswordManagerService:
    """
    Service to manage password reset functionality.
    """
    def __init__(self):
        pass
    
    def reset_password_send_otp(self,user_name):
        """
        Reset the password for the given user name.
        This is a placeholder implementation.
        """
        try:
            if not user_name:
                logger.error("Username is required for password reset.")
                return JsonResponse({"error": "Username is required."}, status=400)

            logger.info(f"Password reset requested for user: {user_name}")

            user = User.objects.filter(user_name=user_name).first()

            if not user:
                logger.error(f"User with username {user_name} does not exist.")
                return JsonResponse({"error": "User does not exist."}, status=404)

            otp = str(random.randint(100000, 999999))
            cache.set(f"otp_{user.user_name}", otp, timeout=320)

            email_service = EmailService()
            email_status = email_service.send_email(
                to_email=user.email,
                email_type='password_reset',
                user_name=user.user_name,
                otp=otp
            )

            if not email_status:
                logger.error(f"Failed to send email for user: {user_name}")
                return JsonResponse({"error": "Failed to send password reset email."}, status=500)

            logger.info(f"Email sent with otp for user: {user_name}")
            
            return JsonResponse({"message": "Password reset otp has been sent to your email."}, status=200)
        except Exception as e:
            logger.error("Error in reset_password_send_otp: %s", e)
            return JsonResponse({"error": "An error occured while sending the password reset link."},status=500)
    
    def reset_password_verify_otp_and_setpassword(self, user_name, otp,password):
        """
        Verify the OTP for password reset.
        """
        try:
            if not user_name or not otp:
                logger.error("Username and OTP are required for verification.")
                return JsonResponse({"error": "Username and OTP are required."}, status=400)
            
            if not is_valid_password(password):
                logger.error("Invalid password format.")
                return JsonResponse({"error": "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character."}, status=400)

            cached_otp = cache.get(f"otp_{user_name}")

            if not cached_otp:
                logger.error(f"OTP for user {user_name} has expired or does not exist.")
                return JsonResponse({"error": "OTP has expired or invalid."}, status=400)

            if cached_otp != otp:
                logger.error("Invalid OTP provided.")
                return JsonResponse({"error": "Invalid OTP."}, status=400)

            logger.info(f"OTP verified successfully for user: {user_name}")

            user = User.objects.filter(user_name=user_name).first()
            if not user:
                logger.error(f"User with username {user_name} does not exist.")
                return JsonResponse({"error": "User does not exist."}, status=404)
            user.set_password(password)
            user.save()
            cache.delete(f"otp_{user_name}")

            logger.info(f"Password updated successfully for user: {user_name}")

            return JsonResponse({"message": "Password changed successfully."}, status=200)
        except Exception as e:
            logger.error("Error in reset_password_verify_otp: %s", e)
            return JsonResponse({"error": "An error occurred while verifying the OTP."}, status=500)
    
    def change_password(self,request):
        """
        Change the password for the authenticated user.
        Expects 'old_password' and 'new_password' in the request data.
        """
        try:
            user = request.user
            if not user.is_authenticated:
                return JsonResponse({"error": "Authentication required."}, status=401)

            old_password = request.data.get('old_password')
            new_password = request.data.get('new_password')

            if not old_password or not new_password:
                return JsonResponse({"error": "Old and new passwords are required."}, status=400)
            
            if not is_valid_password(new_password):
                logger.error("Invalid password format.")
                return JsonResponse({"error": "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character."}, status=400)

            if not user.check_password(old_password):
                return JsonResponse({"error": "Old password is incorrect."}, status=400)

            user.set_password(new_password)
            user.save()

            return JsonResponse({"message": "Password changed successfully."}, status=200)
        except Exception as e:
            logger.error("Error in change_password: %s", e)
            return JsonResponse({"error": "An error occurred while changing the password."}, status=500)
    
