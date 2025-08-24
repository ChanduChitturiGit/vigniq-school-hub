"""Ai assistant service"""

import logging

from django.http import JsonResponse
from django.db.models import Prefetch,Count
from django.db import transaction
from core.common_modules.common_functions import CommonFunctions

from syllabus.models import ChatSession, ChatMessage, SchoolLessonPlanDay, Topic
from core.lang_chain.lang_chain import LangChainService
logger = logging.getLogger(__name__)


class AiAssistantService:
    """Ai Assistant Service"""

    def __init__(self, request):
        self.request = request
        self.school_id = request.data.get("school_id") or request.GET.get("school_id") or getattr(request.user, 'school_id', None)
        self.school_db_name = CommonFunctions.get_school_db_name(self.school_id)

    def get_chat_history(self, request):
        """Get chat history"""
        try:
            # Here you would typically retrieve the chat history from a database or cache
            # For demonstration purposes, we return an empty list
            logger.info("Chat history retrieved successfully")
            return JsonResponse({"status": "success", "data": []})
        except Exception as e:
            logger.error(f"Error retrieving chat history: {e}")
            return JsonResponse({"status": "error", "message": str(e)}, status=500)

    def get_chat_by_id(self, request):
        """Get chat by ID"""
        chat_id = request.GET.get("chat_id")
        if not chat_id:
            return JsonResponse({"status": "error", "message": "Chat ID is required"}, status=400)

        try:
            # Here you would typically retrieve the chat by ID from a database or cache
            # For demonstration purposes, we return a mock response
            logger.info(f"Chat with ID {chat_id} retrieved successfully")
            return JsonResponse({"status": "success", "data": {"id": chat_id, "messages": []}})
        except Exception as e:
            logger.error(f"Error retrieving chat with ID {chat_id}: {e}")
            return JsonResponse({"status": "error", "message": str(e)}, status=500)
    
    def chat_with_assistant(self):
        """Chat with the AI assistant"""
        try:
            user_message = self.request.data.get("message")
            chat_id = self.request.data.get("chat_id")
            lesson_plan_day_id = self.request.data.get("lesson_plan_day_id")
            user = self.request.user

            if not user_message or not lesson_plan_day_id or not user:
                return JsonResponse({"error": "Required fields are missing"}, status=400)

            try:
                lesson_plan_day = (
                    SchoolLessonPlanDay.objects.using(self.school_db_name)
                    .select_related(
                        "chapter__class_number",
                    )
                    .annotate(
                        total_days=Count("chapter__school_chapter_lesson_plan_days")
                    )
                    .get(id=lesson_plan_day_id)
                )
                topics = Topic.objects.using(self.school_db_name).filter(
                    lesson_plan_day=lesson_plan_day
                ).order_by("created_at")
                if not topics:
                    return JsonResponse({"error": "No topics found for this lesson plan day"}, status=404)
                
                topics_data = [
                    {
                        "title": topic.title,
                        "summary": topic.summary,
                        "time_minutes": topic.time_minutes,
                    }
                    for topic in topics
                ]

                lesson_plan = {
                    "class_number": lesson_plan_day.chapter.class_number.id if lesson_plan_day.chapter.class_number else None,
                    "chapter_number": lesson_plan_day.chapter.chapter_number,
                    "chapter_name": lesson_plan_day.chapter.chapter_name,
                    "total_days": lesson_plan_day.total_days,
                    "lession_plan": {"day": lesson_plan_day.day,"topics": topics_data},
                    "learning_outcomes": lesson_plan_day.learning_outcomes,
                    "real_world_applications": lesson_plan_day.real_world_applications,
                    "taxonomy_alignment": lesson_plan_day.taxonomy_alignment,
                }
                with transaction.atomic(using=self.school_db_name):
                    if not chat_id:
                        session = ChatSession.objects.using(self.school_db_name).create(
                            user_id=user.id, lesson_plan_day=lesson_plan_day
                        )
                    else:
                        session = ChatSession.objects.using(self.school_db_name).get(chat_id=chat_id)

                    response, summary = LangChainService(temperature=0.1).process_user_question(
                        session, self.school_db_name, lesson_plan, user_message)

                    ChatMessage.objects.using(self.school_db_name).create(session=session,
                                                            role="user", content=user_message)
                    ChatMessage.objects.using(self.school_db_name).create(session=session,
                                                        role="assistant", content=response)

                    session.summary = summary
                    session.save(using=self.school_db_name)

                    return JsonResponse({"data": response, "chat_id": session.chat_id}, status=200)
            except Exception as e:
                logger.error("Error processing user message: %s", e)
                return JsonResponse({"error": "Unable to process your request at the moment"}, status=500)
        except ChatSession.DoesNotExist:
            return JsonResponse({"status": "error", "message": "Chat session not found"},
                                status=404)
        except SchoolLessonPlanDay.DoesNotExist:
            return JsonResponse({"status": "error", "message": "Lesson plan day not found"},
                                status=404)
        except Exception as e:
            logger.error("Error in chat_with_assistant: %s", e)
            return JsonResponse({"status": "error", "message": str(e)}, status=500)