"""Report views"""

from rest_framework.views import APIView
from django.http import JsonResponse
from reports.services.syllabus_progress_report import SyllabusProgressReportService




class SyllabusProgressReportView(APIView):
    """View for handling syllabus progress reports"""

    def get(self, request, action=None):
        """Handle GET requests"""

        if action == 'getSyllabusProgressByClass':
            service = SyllabusProgressReportService(request)
            return service.get_report_by_class()
        elif action == 'getSyllabusProgressByClassSection':
            service = SyllabusProgressReportService(request)
            return service.get_subject_progress_by_class_section()
        elif action == 'getSyllabusProgressBySubject':
            service = SyllabusProgressReportService(request)
            return service.get_chapter_progress_by_subject()
        elif action == 'getLessonPlanByChapter':
            service = SyllabusProgressReportService(request)
            return service.get_lesson_plan_details()
        else:
            return JsonResponse({"error": "Invalid action"}, status=400)