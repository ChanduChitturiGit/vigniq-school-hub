"""Support service for handling support tickets and responses."""

import logging
from io import BytesIO

from django.http import JsonResponse
from django.db import transaction
from django.utils import timezone
from django.db.models import Q, Prefetch, OuterRef, Subquery
from django.core.paginator import Paginator, EmptyPage

from core.models import SupportTicket, TicketResponse, IssueTypes, AvailableModules
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
            files = self.request.FILES.getlist("file_attachment[]", [])

            if not all([school_id, title, issue_type_id, related_section_id,
                        issue_description, expected_outcome]):
                logger.error("Missing required fields for creating support ticket")
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
            logger.info("Support ticket created successfully")
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
            file_attachment = self.request.FILES.getlist("file_attachment[]", [])

            logger.info("Responding to ticket %s by %s", ticket_id, responder)
            ticket_obj = SupportTicket.objects.get(
                id=ticket_id
            )
            file_paths = self.save_files_in_s3(file_attachment, ticket_obj)
            TicketResponse.objects.create(
                ticket=ticket_obj,
                responder=responder,
                message=message,
                file_attachment=file_paths if file_paths else None,
            )
            return JsonResponse({"message": "Response submitted successfully"}, status=201)
        except SupportTicket.DoesNotExist:
            logger.error("Support ticket not found: %s", ticket_id)
            return JsonResponse({"error": "Support ticket not found"}, status=404)
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
                status = s3_client.upload_file(file_obj, s3_key, content_type)
                if status:
                    s3_paths.append(s3_key)
            return s3_paths
        except Exception as e:
            logger.error("Error saving files to S3: %s", e)
            return None

    def update_ticket_status(self):
        """Update the status of a support ticket."""
        try:
            ticket_id = self.request.data.get("ticket_id")
            new_status = self.request.data.get("status")
            if not all([ticket_id, new_status]):
                logger.warning("Missing ticket_id or status for updating ticket")
                return JsonResponse({"error": "Missing ticket_id or status"}, status=400)
            
            if new_status not in dict(SupportTicket.STATUS_CHOICES):
                logger.warning("Invalid status value: %s", new_status)
                return JsonResponse({"error": "Invalid status value"}, status=400)
            
            ticket_obj = SupportTicket.objects.get(id=ticket_id)
            ticket_obj.status = new_status
            ticket_obj.save()
            return JsonResponse({"message": "Support ticket status updated successfully"}, status=200)
        except SupportTicket.DoesNotExist:
            logger.error("Support ticket not found: %s", ticket_id)
            return JsonResponse({"error": "Support ticket not found"}, status=404)
        except Exception as e:
            logger.error("Error updating ticket %s: %s", ticket_id, e)
            return JsonResponse({"error": "Unable to update support ticket"}, status=500)
    
    def get_tickets(self):
        """Retrieve all support tickets for the user."""
        try:
            logger.info("Retrieving support tickets")
            from_date = self.request.GET.get("from_date")
            to_date = self.request.GET.get("to_date")
            status = self.request.GET.get("status")
            school_id = self.request.GET.get("school_id")
            page = self.request.GET.get("page", 1)
            page_size = self.request.GET.get("page_size", 10)
            filters = {}
            
            if from_date and to_date:
                filters["created_at__range"] = [from_date, to_date]
            if status:
                filters["status"] = status
            if school_id:
                filters["school_id"] = school_id
            if not self.user.is_superuser:
                filters["user"] = self.user
            tickets = (
                SupportTicket.objects
                .filter(**filters)
                .order_by("-created_at")
                .prefetch_related(
                    Prefetch("responses", queryset=TicketResponse.objects.only("file_attachment"))
                )
            )
            paginator = Paginator(tickets, page_size)

            try:
                paginated_tickets = paginator.page(page)
            except EmptyPage:
                paginated_tickets = []

            ticket_data = []
            for ticket in paginated_tickets:
                attachments_count = sum(
                    len(resp.file_attachment or []) for resp in ticket.responses.all()
                )
                if self.user.is_superuser:
                    new_messages_count = sum(
                        1 for resp in ticket.responses.all()
                        if resp.responder and not resp.responder.is_superuser and not resp.is_read
                    )
                else:
                    new_messages_count = sum(
                        1 for resp in ticket.responses.all()
                        if resp.responder and resp.responder.is_superuser and not resp.is_read
                    )
                ticket_data.append({
                    "ticket_id": ticket.id,
                    "title": ticket.title,
                    "status": ticket.status,
                    "created_at": ticket.created_at,
                    "updated_at": ticket.updated_at,
                    "attachments_count": attachments_count,
                    "total_responses": ticket.responses.count(),
                    "new_messages_count": new_messages_count,
                })
            return JsonResponse({"data": ticket_data}, status=200)
        except Exception as e:
            logger.error("Error retrieving tickets for user %s: %s", self.user, e)
            return JsonResponse({"error": "Unable to retrieve support tickets"}, status=500)

    def get_ticket_by_id(self):
        """Get a support ticket by its ID."""
        try:
            ticket_id = self.request.GET.get("ticket_id")

            if not ticket_id:
                logger.warning("Missing ticket_id for retrieving ticket")
                return JsonResponse({"error": "Missing ticket_id"}, status=400)
            filters={}
            if not self.user.is_superuser:
                filters["user"] = self.user
            ticket = SupportTicket.objects.select_related(
                "user", "school", "issue_type", "related_section"
            ).prefetch_related(
                Prefetch("responses", queryset=TicketResponse.objects.select_related("responder").order_by("created_at"))
            ).get(id=ticket_id, **filters)
            responses = ticket.responses.all()

            formated_responses = []
            for response in responses:
                formated_responses.append({
                    "response_id": response.id,
                    "message": response.message,
                    "created_at": response.created_at,
                    "responder_first_name": response.responder.first_name if response.responder else None,
                    "responder_last_name": response.responder.last_name if response.responder else None,
                    "is_responder_superuser": response.responder.is_superuser if response.responder else None,
                    "file_attachment": [s3_client.generate_temp_link(file_path) for file_path in (response.file_attachment or [])]
                })
            ticket_data = {
                "ticket_id": ticket.id,
                "title": ticket.title,
                "status": ticket.status,
                "created_at": ticket.created_at,
                "updated_at": ticket.updated_at,
                "school_id": ticket.school_id,
                "school_name": ticket.school.name if ticket.school else None,
                "issue_type_id": ticket.issue_type_id if ticket.issue_type else None,
                "issue_type_name": ticket.issue_type.name if ticket.issue_type else None,
                "related_section_id": ticket.related_section_id if ticket.related_section else None,
                "related_section_name": ticket.related_section.name if ticket.related_section else None,
                "user_id": ticket.user_id if ticket.user else None,
                "user_name": ticket.user.full_name() if ticket.user else None,
                "responses": formated_responses
            }
            return JsonResponse({"data": ticket_data}, status=200)
        except SupportTicket.DoesNotExist:
            logger.warning("Ticket not found: %s", ticket_id)
            return JsonResponse({"error": "Ticket not found"}, status=404)
        except Exception as e:
            logger.error("Error retrieving ticket %s: %s", ticket_id, e)
            return JsonResponse({"error": "Unable to retrieve support ticket"}, status=500)

    def get_issue_types(self):
        """Get a list of issue types."""
        try:
            issue_types = IssueTypes.objects.all()
            issue_type_data = [
                {
                    "issue_type_id": issue_type.id,
                    "issue_type_name": issue_type.name
                } for issue_type in issue_types
            ]
            return JsonResponse({"data": issue_type_data}, status=200)
        except Exception as e:
            logger.error("Error retrieving issue types: %s", e)
            return JsonResponse({"error": "Unable to retrieve issue types"}, status=500)
    
    def get_available_modules(self):
        """Get Available modules"""
        try:
            modules = AvailableModules.objects.all()
            module_data = [
                {
                    "related_section_id": module.id,
                    "related_section_name": module.name
                } for module in modules
            ]
            return JsonResponse({"data": module_data}, status=200)
        except Exception as e:
            logger.error("Error retrieving available modules: %s", e)
            return JsonResponse({"error": "Unable to retrieve available modules"}, status=500)
    
    def get_ticket_attachments(self):
        """Get attachments for a specific ticket."""
        try:
            ticket_id = self.request.GET.get("ticket_id")
            if not ticket_id:
                logger.error("Missing ticket_id for retrieving attachments")
                return JsonResponse({"error": "Missing ticket_id"}, status=400)

            ticket = SupportTicket.objects.prefetch_related(
                Prefetch(
                    "responses",
                    queryset=TicketResponse.objects.order_by(
                        "created_at"
                    ).select_related("responder")
                )
            ).get(id=ticket_id)

            attachments = []
            initial_submission = True
            for response in ticket.responses.all():
                if response.file_attachment:
                    attachments.append({
                        "file_attachment": [
                            s3_client.generate_temp_link(file_path) for file_path in response.file_attachment
                        ],
                        "response_id": response.id,
                        "created_at": response.created_at,
                        "is_responder_superuser": response.responder.is_superuser if response.responder else None,
                        "is_initial_submission": initial_submission,
                        "responder_first_name": response.responder.first_name if response.responder else None,
                        "responder_last_name": response.responder.last_name if response.responder else None,
                    })
                initial_submission = False
            return JsonResponse({"data": attachments}, status=200)
        except SupportTicket.DoesNotExist:
            logger.warning("Ticket not found: %s", ticket_id)
            return JsonResponse({"error": "Ticket not found"}, status=404)
        except Exception as e:
            logger.error("Error retrieving attachments for ticket %s: %s", ticket_id, e)
            return JsonResponse({"error": "Unable to retrieve attachments"}, status=500)
    
    def mark_message_as_read(self):
        """Mark messages as read in a ticket."""
        try:
            ticket_id = self.request.data.get("ticket_id")
            if not ticket_id:
                logger.error("Missing ticket_id for marking messages as read")
                return JsonResponse({"error": "Missing ticket_id"}, status=400)
            ticket_response = TicketResponse.objects.filter(ticket_id=ticket_id,is_read=False)
            ticket_response.update(is_read=True)
            logger.info("Marked response %d as read", ticket_id)
            return JsonResponse({"message": "Marked response as read"}, status=200)
        except Exception as e:
            logger.error("Error marking messages as read for response %s: %s", ticket_id, e)
            return JsonResponse({"error": "Unable to mark messages as read"}, status=500)

    
    def get_support_notifications(self):
        """Get tickets with latest unread messages for the current user."""
        try:
            logger.info("Retrieving support notifications for user %s", self.user)

            if self.user.is_superuser:
                unread_responses = TicketResponse.objects.filter(
                    responder__isnull=False,
                    responder__is_superuser=False,
                    is_read=False,
                )
            else:
                unread_responses = TicketResponse.objects.filter(
                    ticket__user=self.user,
                    responder__isnull=False,
                    responder__is_superuser=True,
                    is_read=False,
                )

            # Only keep latest unread per ticket
            tickets_with_unread = {}
            for resp in unread_responses.order_by("ticket_id", "-created_at"):
                if resp.ticket_id not in tickets_with_unread:
                    tickets_with_unread[resp.ticket_id] = resp

            data = []
            for ticket_id, resp in tickets_with_unread.items():
                data.append({
                    "ticket_id": ticket_id,
                    "latest_message": resp.message or ("File Attachment" if resp.file_attachment else ""),
                    "latest_message_time": resp.created_at,
                })

            return JsonResponse({"data": data}, status=200)

        except Exception as e:
            logger.error("Error retrieving support notifications for user %s: %s", self.user, e)
            return JsonResponse({"error": "Unable to retrieve support notifications"}, status=500)