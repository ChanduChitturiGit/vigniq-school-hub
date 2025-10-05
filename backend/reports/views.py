"""Report views"""

from rest_framework.views import APIView
from django.http import JsonResponse
from reports.services.syllabus_progress_report import SyllabusProgressReportService




class SyllabusProgressReportView(APIView):
    """View for handling syllabus progress reports"""

    def get(self, request, action=None):
        """Handle GET requests"""

        if action == 'syllabusProgressByClass':
            service = SyllabusProgressReportService(request)
            return service.get_report_by_class()
        else:
            return JsonResponse({"error": "Invalid action"}, status=400)