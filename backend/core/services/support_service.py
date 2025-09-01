"""Support service for handling support tickets and responses."""

import logging
from io import BytesIO

from django.http import JsonResponse
from django.db import transaction
from django.utils import timezone
from django.db.models import Q

from core.models import SupportTicket, TicketResponse
from core import s3_client

logger = logging.getLogger(__name__)

class SupportService:
    """Service for managing support tickets."""

    def __init__(self, request):
        self.request = request
        self.user = request.user

    def create_ticket(self):
        """Create a support ticket."""
        try:
            logger.info("Creating support ticket for user %s", self.user)
            input_data = self.request.data
            school_id = input_data.get("school_id")
            title = input_data.get("title")
            issue_type_id = input_data.get("issue_type_id")
            related_section_id = input_data.get("related_section_id")
            issue_description = input_data.get("issue_description")
            expected_outcome = input_data.get("expected_outcome")
            files = input_data.get("files", [])

            if not all([school_id, title, issue_type_id, related_section_id,
                        issue_description, expected_outcome]):
                logger.warning("Missing required fields for creating support ticket")
                return JsonResponse({"error": "Missing required fields"}, status=400)
            with transaction.atomic():
                ticket = SupportTicket.objects.create(
                    user=self.user,
                    school_id=school_id,
                    title=title,
                    issue_type_id=issue_type_id,
                    related_section_id=related_section_id,
                )

                files_paths = self.save_files_in_s3(files, ticket)

                TicketResponse.objects.create(
                    ticket=ticket,
                    responder=self.user,
                    message=f"**Issue Description**:\n{issue_description}\n"
                            f"**Expected Outcome**:\n{expected_outcome}",
                    file_attachment=files_paths if files_paths else None
                )
            logger.info("Support ticket created successfully: %s", ticket)
            return JsonResponse({"message": "Support ticket created successfully"}, status=201)
        except Exception as e:
            logger.error("Error creating support ticket for user %s: %s", self.user, e)
            return JsonResponse({"error": "Unable to create support ticket"}, status=500)

    def respond_to_ticket(self):
        """Respond to a support ticket."""
        try:
            ticket_id = self.request.data.get("ticket_id")
            responder = self.user
            message = self.request.data.get("message")
            file_attachment = self.request.data.get("file_attachment")

            logger.info("Responding to ticket %s by %s", ticket_id, responder)
            ticket_obj = SupportTicket.objects.get(
                ~Q(status='closed'),
                id=ticket_id
            )
            file_paths = self.save_files_in_s3(file_attachment, ticket_obj)
            TicketResponse.objects.create(
                ticket=ticket_obj,
                responder=responder,
                message=message,
                file_attachment=file_paths if file_paths else None,
                is_responder_admin=responder.is_superuser
            )
            return JsonResponse({"message": "Response submitted successfully"}, status=201)
        except Exception as e:
            logger.error("Error responding to ticket by %s: %s", responder, e)
            return JsonResponse({"error": "Unable to submit response"}, status=500)

    def save_files_in_s3(self, files, ticket):
        """Save uploaded files to S3 and return their paths."""
        try:
            s3_paths = []
            for file in files:
                ext = file.name.split(".")[-1].lower()
                content_type = file.content_type
                s3_key = f"support_tickets/{ticket.id}/attachment_{timezone.now()}.{ext}"
                file_obj = BytesIO(file.read())
                s3_path = s3_client.upload_file(file_obj, s3_key, content_type)
                s3_paths.append(s3_path)
            return s3_paths
        except Exception as e:
            logger.error("Error saving files to S3: %s", e)
            return None