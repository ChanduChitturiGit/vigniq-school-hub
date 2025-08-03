"""This file contains the Pydantic models used for handling chapter topics and prerequisites in the syllabus."""
from pydantic import BaseModel, Field
from typing import List

class PreRequisites(BaseModel):
    topic: str
    explanation: str
    
class ChapterTopics(BaseModel):
    chapter_number: str
    chapter_name: str
    sub_topics: List[str]
    pre_requisites: List[PreRequisites]
    
class ChapterInfo(BaseModel):
    result: List[ChapterTopics]



class Topic(BaseModel):
    title: str = Field(..., description="Title of the topic")
    summary: str = Field(..., description="Brief explanation of the topic")
    time_minutes: int = Field(..., description="Time allocated to the topic in minutes")

class LessonDay(BaseModel):
    day: int = Field(..., description="Day number")
    topics: List[Topic] = Field(..., description="List of topics for the day")
    learning_outcomes: str = Field(..., description="Learning outcomes from the day topics")
    real_world_applications: str = Field(..., description="Real world applications of the learned topics in that day")
    taxonomy_alignment: str = Field(..., description="Taxonomy alignment of the day topics")

class LessonPlan(BaseModel):
    chapter_number: str
    chapter_title: str
    total_days: int
    lesson_plan: List[LessonDay]