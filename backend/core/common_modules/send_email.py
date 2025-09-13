"""Email Service Module"""

import logging

from django.core.mail import EmailMultiAlternatives
from django.conf import settings
from django.template.loader import render_to_string
from django.utils.timezone import now
from email.utils import formataddr

logger = logging.getLogger(__name__)

class EmailService:
    """Service to send emails"""

    def __init__(self):
        pass

    def send_email(self, to_email, email_type, name=None, user_name=None, password=None,otp=None,
                   login_url=None):
        """
        Send an email with both plain text and HTML content.
        
        Args:
            subject (str): Subject of the email.
            from_email (str): Sender's email address.
            to (list): List of recipient email addresses.
            text_content (str): Plain text content of the email.
            html_content (str): HTML content of the email.
        """
        try:
            logger.info(f"Sending {email_type} email to {to_email}")
            from_email = settings.EMAIL_CONFIG['EMAIL_HOST_USER']
            subject,html_path = self.get_subject_and_html_content(email_type)

            context = {
                'user_name':user_name,
                'year': now().year
            }

            if email_type == 'welcome':
                context['name'] = name
                context['password'] = password
            elif email_type == 'password_reset':
                context['otp']= otp

            if login_url:
                context['login_url'] = login_url

            html_content = render_to_string(html_path, context)

            if isinstance(to_email, str):
                to_email = [to_email]

            msg = EmailMultiAlternatives(
                subject=subject, 
                body='',
                from_email=formataddr((settings.EMAIL_CONFIG['EMAIL_HEADER'], from_email)),
                to=to_email
            )
            msg.attach_alternative(html_content, "text/html")
            msg.send()
            logger.info(f"Email sent successfully to {to_email} for {email_type} type.")
            return True
        except Exception as e:
            logger.error(f"Error sending email: {e}")
            raise e

    def get_subject_and_html_content(self, email_type):
        """
        Get the subject and HTML content based on the email type.
        
        Args:
            email_type (str): Type of the email.
        
        Returns:
            tuple: Subject and HTML content for the email.
        """
        if email_type == 'welcome':
            subject = "Welcome to VIGYS AI"
            html_path = "email/welcome_email.html"
        elif email_type == 'password_reset':
            subject = "Password Reset Request"
            html_path = "email/password_reset_email.html"
        else:
            subject = "Notification"
            html_path = "<h1>Notification</h1><p>This is a notification email.</p>"
        
        return subject, html_path


