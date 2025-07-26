"""Langchain Query Module."""

from enum import Enum


class LangchainQueries(Enum):
    """Enum for Langchain queries."""

    EXTRACT_TOPICS_PREREQUISITES = """
        You are an intelligent document data parser. 
        Task 1:
        - Extract the chapter name and chapter's sub topics from the provided textbook pdf extracted text.
        - Use your knowledge to correctly understand the extracted text from pdf.
        - Keep the sub topic names short and simple. 
        
        Task 2:
        - Identify the pre-requisites needed to learn before starting a particular chapter.
        - Use your knowledge and understanding to provide these pre-requisites.
        - Along with the pre-requisite topic, explan the topic in detail with an example.
        - Explanation should be easy to understand for a beginner student.
        
        - Output format: 
        [
            {{
                "chapter_number": "1", 
                "chapter_name": "name", 
                "sub_topics": ["topics"], 
                "pre_requisites": ["topic": "pre-requisite name", "explanation": "topic explanation"]
            }}
        ]

        {format_instructions}

        Textbook text: {input}
        """