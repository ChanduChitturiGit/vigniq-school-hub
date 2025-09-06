"""Syllabus app views."""
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from core.permissions import IsSuperAdmin,IsSuperAdminOrAdminOrTeacher
from syllabus.services.ebook_service import EbookService
from syllabus.services.syllabus_service import SyllabusService
from syllabus.services.whiteboard_service import WhiteboardService
from syllabus.services.ai_assistant_service import AiAssistantService

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

    def get_permissions(self):
        if self.kwargs.get('action') in ['getChaptersTopicsBySubject', 'getChaptersProgressBySubject']:
            return [IsAuthenticated()]
        return [IsAuthenticated(), IsSuperAdminOrAdminOrTeacher()]

    def get(self, request, action=None):
        """Handle GET requests for syllabus actions."""
        if action == 'getChaptersProgressBySubject':
            return SyllabusService().get_chapters_by_subject(request)
        elif action == 'getSyllabusBySubject':
            return SyllabusService().get_syllabus_subject(request)
        elif action == 'getGradeByTeacherId':
            return SyllabusService().get_grade_by_teacher_id(request)
        elif action == 'getChapterDetailsById':
            return SyllabusService().get_chapter_details_by_id(request)
        elif action == 'getLessionPlan':
            return SyllabusService().get_lesson_plan_by_chapter_id(request)
        elif action == "getLessonDayPlan":
            return SyllabusService().get_lesson_plan_day_by_id(request)
        return Response({"error": f"GET request not found for action: {action}"}, status=400)

    def post(self, request, action=None):
        """Handle POST requests for syllabus actions."""
        if action == 'addSubTopic':
            return SyllabusService().create_sub_topic(request)
        elif action == 'addPrerequisite':
            return SyllabusService().create_prerequisite(request)
        elif action == 'generateLessonPlan':
            return SyllabusService().generate_lesson_plan(request)
        elif action == "saveLessonPlan":
            return SyllabusService().save_lesson_plan(request)
        return Response({"error": f"POST request not found for action: {action}"}, status=400)
    
    def put(self, request, action=None):
        """Handle PUT requests for syllabus actions."""
        if action == 'editSubTopicById':
            return SyllabusService().edit_sub_topic_by_id(request)
        elif action == 'editPrerequisiteById':
            return SyllabusService().edit_prerequisite_by_id(request)
        elif action == 'editLessonPlanByDayId':
            return SyllabusService().edit_lesson_plan_day_by_id(request)
        return Response({"error": f"PUT request not found for action: {action}"},status=400)
    
    def delete(self, request, action=None):
        """Handle DELETE requests for syllabus actions."""
        if action == 'deleteSubTopicById':
            return SyllabusService().delete_sub_topic_by_id(request)
        elif action == 'deletePrerequisiteById':
            return SyllabusService().delete_prerequisite_by_id(request)
        return Response({"error": f"DELETE request not found for action: {action}"}, status=400)

class AIChatView(APIView):
    """View for AI chat assistant."""

    def get_permissions(self):
        return [IsAuthenticated()]

    def get(self, request, action=None):
        """Handle GET requests for AI chat actions."""
        if action == 'getAssistantChat':
            return AiAssistantService(request).get_chat()
        return Response({"error": f"GET request not found for action: {action}"}, status=400)

    def post(self, request, action=None):
        """Handle POST requests for AI chat actions."""
        if action == 'chatWithAssistant':
            return AiAssistantService(request).chat_with_assistant()
        return Response({"error": f"POST request not found for action: {action}"}, status=400)

class WhiteboardView(APIView):
    """View for managing whiteboard sessions."""

    def get_permissions(self):
        if self.kwargs.get('action') in ['getWhiteboardsByChapter']:
            return [IsAuthenticated()]
        return [IsAuthenticated(), IsSuperAdminOrAdminOrTeacher()]

    def get(self, request, action=None):
        """Handle GET requests for whiteboard actions."""
        if action == 'getWhiteboardsByChapter':
            return WhiteboardService().get_whiteboards_by_chapter(request)
        elif action == 'getWhiteboardData':
            return WhiteboardService().get_whiteboard_by_session_id(request)
        return Response({"error": f"GET request not found for action: {action}"}, status=400)

    def post(self, request, action=None):
        """Handle POST requests for whiteboard actions."""
        if action == 'createWhiteboardSession':
            return WhiteboardService().create_whiteboard_session(request)
        return Response({"error": f"POST request not found for action: {action}"}, status=400)

    def delete(self, request, action=None):
        """Handle DELETE requests for whiteboard actions."""
        if action == 'deleteWhiteboardSession':
            return WhiteboardService().delete_whiteboard_session(request)
        return Response({"error": f"DELETE request not found for action: {action}"}, status=400)