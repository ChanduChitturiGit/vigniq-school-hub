"""Whiteboard Service for managing whiteboard sessions."""

import logging
import uuid

from django.core.exceptions import ObjectDoesNotExist
from django.db.models import Prefetch
from rest_framework.response import Response
from rest_framework import status

from syllabus.models import WhiteboardSession,Topic, WhiteboardDataChunk
from core.common_modules.common_functions import CommonFunctions

logger = logging.getLogger(__name__)


class WhiteboardService:
    """Service class for handling whiteboard operations."""

    def create_whiteboard_session(self, request):
        """Create a new whiteboard session."""
        try:
            school_id = request.GET.get('school_id') or getattr(request.user, 'school_id', None)
            topic_id = request.GET.get('topic_id')

            if not school_id:
                return Response({"error": "Missing school_id"}, status=status.HTTP_400_BAD_REQUEST)
            if not topic_id:
                return Response({"error": "Missing topic_id"}, status=status.HTTP_400_BAD_REQUEST)
            
            school_db_name = CommonFunctions.get_school_db_name(school_id)

            try:
                topic = Topic.objects.using(school_db_name).get(id=topic_id)
            except ObjectDoesNotExist:
                return Response({"error": f"Topic with id {topic_id} not found"},
                                status=status.HTTP_404_NOT_FOUND)

            session_id = self.generate_unique_session_id(school_db_name)

            session = WhiteboardSession.objects.using(school_db_name).create(
                session_id=session_id,
                topic=topic
            )

            logger.info("Whiteboard session created with session_id: %s", session_id)
            return Response({"data": {"session_id":session.session_id}},
                            status=status.HTTP_201_CREATED)

        except Exception as e:
            logger.exception("Unexpected error creating whiteboard session")
            return Response({"error": "Failed to create whiteboard session"},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def generate_unique_session_id(self,school_db_name):
        while True:
            session_id = uuid.uuid4().hex
            if not WhiteboardSession.objects.using(school_db_name).filter(
                session_id=session_id).exists():
                return session_id
    

    def get_whiteboards_by_chapter(self, request):
        """Get all whiteboard sessions for a specific chapter."""
        try:
            school_id = request.GET.get('school_id') or getattr(request.user, 'school_id', None)
            chapter_id = request.GET.get('chapter_id')
            class_section_id = request.GET.get('class_section_id')
            acadamic_year_id = request.GET.get('academic_year_id',1)
            if not school_id:
                return Response({"error": "Missing school_id"}, status=status.HTTP_400_BAD_REQUEST)
            if not chapter_id:
                return Response({"error": "Missing chapter_id"}, status=status.HTTP_400_BAD_REQUEST)
            if not class_section_id:
                return Response({"error": "Missing class_section_id"},
                                status=status.HTTP_400_BAD_REQUEST)
            school_name = CommonFunctions.get_school_db_name(school_id)

            sessions = WhiteboardSession.objects.using(school_name).filter(
                topic__lesson_plan_day__chapter_id=chapter_id,
                is_active=True,
                topic__lesson_plan_day__class_section_id=class_section_id,
                topic__lesson_plan_day__chapter__academic_year_id=acadamic_year_id
            ).select_related('topic').order_by('-created_at')

            session_data = []
            for session in sessions:
                session_data.append({
                    "session_id": session.session_id,
                    "topic": session.topic.title,
                    "created_at": session.created_at.isoformat(),
                    "updated_at": session.updated_at.isoformat(),
                })
            

            return Response({"data":session_data}, status=status.HTTP_200_OK)

        except Exception as e:
            logger.exception("Unexpected error fetching whiteboard sessions")
            return Response({"error": "Failed to fetch whiteboard sessions"},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def get_whiteboard_by_session_id(self, request):
        """Get all data for a specific whiteboard session."""
        try:
            school_id = request.GET.get('school_id') or getattr(request.user, 'school_id', None)
            session_id = request.GET.get('session_id')
            if not session_id:
                return Response({"error": "Missing session_id"}, status=status.HTTP_400_BAD_REQUEST)
            if not school_id:
                return Response({"error": "Missing school_id"}, status=status.HTTP_400_BAD_REQUEST)

            school_db_name = CommonFunctions.get_school_db_name(school_id)

            session = WhiteboardSession.objects.using(school_db_name).filter(
                session_id=session_id,
                is_active=True
            ).prefetch_related(
                Prefetch(
                    'data_chunks',
                    queryset=WhiteboardDataChunk.objects.using(school_db_name).filter()
                )
            ).first()
            if not session:
                return Response({"error": f"Whiteboard session with id {session_id} not found"},
                                status=status.HTTP_404_NOT_FOUND)

            data_chunks = session.data_chunks.all().order_by('chunk_index')

            data = []
            for chunk in data_chunks:
                data.append({
                    "chunk_index": chunk.chunk_index,
                    "data": chunk.data
                })

            return Response({"data": data}, status=status.HTTP_200_OK)

        except Exception as e:
            logger.exception("Unexpected error fetching whiteboard data")
            return Response({"error": "Failed to fetch whiteboard data"},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def delete_whiteboard_session(self, request):
        """Delete a whiteboard session."""
        try:
            school_id = request.data.get('school_id') or getattr(request.user, 'school_id', None)
            session_id = request.data.get('session_id')
            if not session_id:
                return Response({"error": "Missing session_id"}, status=status.HTTP_400_BAD_REQUEST)
            if not school_id:
                return Response({"error": "Missing school_id"}, status=status.HTTP_400_BAD_REQUEST)

            school_name = CommonFunctions.get_school_db_name(school_id)

            session = WhiteboardSession.objects.using(school_name).filter(
                session_id=session_id,
                is_active=True
            ).first()
            if not session:
                return Response({"error": f"Whiteboard session with id {session_id} not found"},
                                status=status.HTTP_404_NOT_FOUND)

            session.is_active = False
            session.save(using=school_name)

            logger.info("Whiteboard session deleted with session_id: %s", session_id)
            return Response({"message": "Whiteboard session deleted successfully"},
                            status=status.HTTP_200_OK)

        except Exception as e:
            logger.exception("Unexpected error deleting whiteboard session")
            return Response({"error": "Failed to delete whiteboard session"},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)
