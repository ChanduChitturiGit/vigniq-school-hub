"""This file contains the Pydantic models used for handling chapter topics and prerequisites in the syllabus."""
from pydantic import BaseModel
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