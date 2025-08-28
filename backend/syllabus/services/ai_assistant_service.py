"""Ai assistant service"""

import logging
import json
from asgiref.sync import sync_to_async

from django.http import JsonResponse, StreamingHttpResponse
from django.db.models import Count
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


    def get_chat(self):
        """Get Chat"""
        lesson_plan_day_id = self.request.GET.get("lesson_plan_day_id")
        user = self.request.user
        if not lesson_plan_day_id:
            return JsonResponse({"error": "Lesson Plan Day ID is required"}, status=400)
        
        if not user:
            return JsonResponse({"error": "User is not authenticated"}, status=401)

        try:
            session = ChatSession.objects.using(self.school_db_name).filter(
                            user_id=user.id, lesson_plan_day_id=lesson_plan_day_id
                        )
            
            if session.exists():
                session = session.first()
            else:
                session = None
            print(session)
            chat_history = ChatMessage.objects.using(self.school_db_name).filter(
                session_id=session
            ).order_by("created_at").values('role','content','created_at')

            logger.info(f"Chat with Lesson Plan Day ID %s for user %s retrieved successfully",
                        lesson_plan_day_id, user.id)
            output = {
                'chat_id':session.chat_id,
                'chat_history': list(chat_history)
            }
            return JsonResponse({"data": output})
        except Exception as e:
            logger.error("Error retrieving chat with Lesson Plan Day ID %s: %s",
                         lesson_plan_day_id, e)
            return JsonResponse({"error": "Unable to retrieve chat"}, status=500)

    def chat_with_assistant(self):
        """Chat with the AI assistant"""
        try:
            user_message = self.request.data.get("message")
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
                    session, created = ChatSession.objects.using(self.school_db_name).get_or_create(
                                user_id=user.id, lesson_plan_day=lesson_plan_day
                            )
                    
                    response = ""
                    async def streaming_chat():
                            nonlocal response
                            streaming_response = LangChainService(temperature=0.1).process_user_question(
                                    session, self.school_db_name, lesson_plan, user_message)
                            async for event in streaming_response:
                                if event["type"] == "token":
                                    response += event["data"]
                                    yield json.dumps({"data": event["data"], "status": "streaming"}) + "\n"

                            await self.save_chat_messages(session, user_message, response)

                            yield json.dumps({"status": "success"}) + "\n"

                return StreamingHttpResponse(streaming_chat(), content_type='text/event-stream')
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

    @sync_to_async
    def save_chat_messages(self, session, user_message, ai_response):
        """Save chat response"""
        ChatMessage.objects.using(self.school_db_name).create(session=session,
                                                                role="user", content=user_message)
        ChatMessage.objects.using(self.school_db_name).create(session=session,
                                                                role="assistant", content=ai_response)

        session.save(using=self.school_db_name)
