"""Syllabus app views."""
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from core.permissions import IsSuperAdmin
from syllabus.services.ebook_service import EbookService

class EbookView(APIView):
    """View for managing eBooks."""

    def get_permissions(self):
        if self.kwargs.get('action') in ['uploadEbook', 'deleteEbookById']:
            return [IsSuperAdmin()]
        return [IsAuthenticated(),]

    def get(self, request, action=None):
        """Handle GET requests for eBook actions."""
        if action == 'getEbooks':
            return EbookService().get_ebook(request)
        return Response({"message": f"GET request for action: {action}"})

    def post(self, request, action=None):
        """Handle POST requests for eBook actions."""
        
        if action == 'uploadEbook':
            return EbookService().upload_ebook(request)
        return Response({"message": f"POST request for action: {action}"})
    
    def delete(self, request, action=None):
        """Handle DELETE requests for eBook actions."""
        if action == 'deleteEbookById':
            return EbookService().delete_ebook_by_id(request)
        return Response({"message": f"DELETE request for action: {action}"})