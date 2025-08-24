"""Langchain module."""

import logging

from django.conf import settings

from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.chains import LLMChain
from langchain.prompts import PromptTemplate
from langchain.output_parsers import PydanticOutputParser
from langchain.memory import ConversationSummaryBufferMemory

from core.common_modules.common_functions import CommonFunctions
from syllabus.models import ChatSession, ChatMessage

from .states import ChapterInfo,LessonPlan
from .queries import LangchainQueries

logger = logging.getLogger(__name__)

class LangChainService:
    """Service for Langchain operations."""
    def __init__(self,temperature=0):
        self.llm = ChatGoogleGenerativeAI(
            model=settings.AI_MODELS.get('GEMINI_MODEL', 'gemini-2.5-flash'),
            temperature=temperature,
            api_key=settings.API_KEYS.get('GEMINI_API_KEY')
        )

    def invoke_llm(self, pdf_text,prompt):

        chain = LLMChain(llm=self.llm, prompt=prompt)
        response = chain.run(input=pdf_text)

        return response

    def get_topics_and_prerequisites(self,pdf_file):
        chapter_parser = PydanticOutputParser(pydantic_object=ChapterInfo)
        prompt = PromptTemplate(
            template=LangchainQueries.EXTRACT_TOPICS_PREREQUISITES.value,
            input_variables=["input"],
            partial_variables={"format_instructions": chapter_parser.get_format_instructions()}
        )

        pdf_text = CommonFunctions.extract_text_from_pdf(pdf_file=pdf_file)
        response = self.invoke_llm(pdf_text=pdf_text, prompt=prompt)
        parsed = chapter_parser.parse(response)
        
        return parsed.model_dump()['result']

    def generate_lesson_plan(self, chapter_number, chapter_title, num_days, time_period, pdf_file):
        lesson_plan_parser = PydanticOutputParser(pydantic_object=LessonPlan)
        prompt = PromptTemplate(
            template=LangchainQueries.GENERATE_LESSON_PLAN.value,
            input_variables=["chapter_number", "chapter_title", "num_days", "text", "time_period"],
            partial_variables={"format_instructions": lesson_plan_parser.get_format_instructions()}
        )

        pdf_text = CommonFunctions.extract_text_from_pdf(pdf_file=pdf_file)

        chain = LLMChain(llm=self.llm, prompt=prompt)

        response = chain.run({
        "chapter_number": chapter_number,
        "chapter_title": chapter_title,
        "num_days": num_days,
        "time_period": time_period,
        "text": pdf_text
        })
        parsed = lesson_plan_parser.parse(response)

        return parsed.model_dump()

    def get_chain_with_memory(self, school_db_name, session: ChatSession):
        """Load memory from DB messages + summary, return LLMChain + memory."""

        prompt = PromptTemplate(
            template=LangchainQueries.ASSISTANT_CHAT.value,
            input_variables=["lesson_plan", "question", "chat_history"],
        )
        memory = ConversationSummaryBufferMemory(
            llm=self.llm,
            max_token_limit=1000,
            memory_key="chat_history",
            input_key="question",
            return_messages=True
        )

        if session.summary:
            memory.moving_summary_buffer = session.summary

        chat_messages = ChatMessage.objects.using(school_db_name).filter(
            session=session
        ).order_by("created_at")

        for msg in chat_messages:
            if msg.role == "user":
                memory.chat_memory.add_user_message(msg.content)
            else:
                memory.chat_memory.add_ai_message(msg.content)

        chain = LLMChain(
            llm=self.llm,
            prompt=prompt,
            memory=memory
        )

        return chain, memory


    def process_user_question(self, session,
                              school_db_name, lesson_plan: str, user_question: str):
        """Handle user input, run LLM, store messages + updated summary."""

        chain, memory = self.get_chain_with_memory(school_db_name, session)

        response = chain.run({
            "lesson_plan": lesson_plan,
            "question": user_question
        })

        return response, memory.moving_summary_buffer