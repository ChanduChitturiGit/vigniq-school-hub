"""Syllabus app views."""
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from core.permissions import IsSuperAdmin,IsSuperAdminOrAdminOrTeacher
from syllabus.services.ebook_service import EbookService
from syllabus.services.syllabus_service import SyllabusService

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

class SyllabusView(APIView):
    """View for managing syllabus."""

    permission_classes = [IsAuthenticated, IsSuperAdminOrAdminOrTeacher]

    def get(self, request, action=None):
        """Handle GET requests for syllabus actions."""
        if action == 'getChaptersProgress':
            return SyllabusService().get_chapters_progress(request)
        return Response({"message": f"GET request for action: {action}"})

    def post(self, request, action=None):
        """Handle POST requests for syllabus actions."""
        
        return Response({"message": f"POST request for action: {action}"})
    
    def put(self, request, action=None):
        """Handle PUT requests for syllabus actions."""
        
        return Response({"message": f"PUT request for action: {action}"})
    
    def delete(self, request, action=None):
        """Handle DELETE requests for syllabus actions."""
        if action == 'deleteSyllabusById':
            return EbookService().delete_syllabus_by_id(request)
        return Response({"message": f"DELETE request for action: {action}"})