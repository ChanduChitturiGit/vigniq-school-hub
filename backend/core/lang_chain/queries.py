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
    GENERATE_LESSON_PLAN = """
            You are a curriculum designer. Based on the input chapter text, break it down into a detailed lesson plan.

            ### Input
            Chapter Number: {chapter_number}
            Chapter Title: {chapter_title}
            Total Number of Days: {num_days}
            Time for each day in minutes: {time_period}
            Chapter Text:
            {text}

            ### Instructions
            Create a structured lesson plan that spans the specified number of days. The plan must be divided **by day**, and for each day:
            - Include 3 to 4 topics
                - For each topic:
                    - Provide a title
                    - Allocate time in minutes
                    - Write a short summary of the topic
            - Add the following per day:
                - **Learning Outcomes**: A concise bullet-style summary of what students should understand or be able to do by the end of the day.
                - **Real-World Applications**: Examples or explanations of how the day's topics relate to real-world scenarios or practical use cases.
                - **Taxonomy Alignment**: Align the topics and outcomes with Bloom's Taxonomy or another recognized educational taxonomy (e.g., "Applying", "Analyzing", "Creating").
                
            - The passed chapter text is a extracted from a pdf, use your knowledge to understand the text.

            Your output **must** be a valid JSON structure conforming to this schema:
            {format_instructions}
            """