"""Langchain Query Module."""

from enum import Enum


class LangchainQueries(Enum):
    """Enum for Langchain queries."""

    #Ebooks prompts
    EXTRACT_TOPICS_PREREQUISITES = """
        You are an intelligent document data parser. 
        Task 1:
        - Extract the correct chapter name and chapter's sub topics from the provided textbook pdf extracted text.
        - Use your knowledge to correctly understand the extracted text from pdf.
        - Keep the sub topic names short and simple.
        - Keep the chapter names and topic names in Title Case.
        - The output topics should be in the same order as in the textbook
        - Ensure that each sub-topic under a chapter is unique.
        - If the same sub-topic appears multiple times in the text, include it only once in the output (keep the first occurrence in order).
        - Do not merge or alter sub-topics, only remove duplicates.
        
        Task 2:
        - Identify the pre-requisites needed to learn before starting a particular chapter.
        - Use your knowledge and understanding to provide these pre-requisites.
        - Along with the pre-requisite topic, explan the topic in detail with an example.
        - Explanation should be easy to understand for a beginner student.
        - Explanation should be point wise in markdown format.
        - Pre-requisite must be related to chapter, do not give any unnecessary topics in pre-requisites.
        
        - {additional_instructions}
        
        ## Rules:
        - If there are multiple pats in a chapter (like 1A, 1B etc.,) consider them into single chapter(1).
        - For mathematical expressions:
            - Do NOT use LaTeX.
            - Do NOT use $ symbols.
            - Always use proper mathematical symbols instead of words:
                • Multiplication → ×
                • Division → ÷
                • Powers → superscripts (2², 3³, etc.)
                • Square root → √ (e.g., √16 = 4)
                • Fractions → write as a/b (e.g., ½ instead of 0.5 when clearer)
        
        - Output format: 
        [
            {{
                "chapter_number": "1" (must be a number in string format), 
                "chapter_name": "Name", 
                "sub_topics": ["Topics"], 
                "pre_requisites": [{{"topic": "pre-requisite name", "explanation": "topic explanation"}}]
            }}
        ]

        {format_instructions}

        Textbook text: {input}
        """
    
    CHAPTER_WISE_PROMPT = """
    The given pdf text corresponds to a single chapter ({chapter_num}) of subject {subject} for class {class_num}.
    Understand the text carefully and:
    - Extract the correct chapter name and its sub-topics.
    - Identify and explain the prerequisites for this chapter.
    """

    SINGLE_WISE_PROMPT = """
    The given pdf text corresponds to the entire textbook of subject {subject} for class {class_num}.
    Understand the complete text carefully and:
    - Extract the correct chapter numbers, names, and their sub-topics.
    - Identify and explain the prerequisites for each chapter.
    - Chapter number should not be repeated.
    - Select only main chapters mentioned in the textbook, ignore any additional context like appendix, index, preface etc.
    """

    #Lesson Plan Prompts
    GENERATE_LESSON_PLAN = """
        You are a curriculum designer. Based on the input chapter text, break it down into a detailed lesson plan.

        ### Input
        Subject: {subject}
        Chapter Number: {chapter_number}
        Chapter Title: {chapter_title}
        Total Number of Days: {num_days}
        Time for each day in minutes: {time_period}
        Additional instructions from teacher: {teacher_instructions}

        ### Instructions
        - Create a structured lesson plan that spans the specified number of days. The plan must be divided **by day**.
        {subject_instructions}
        - Add the following per day:
            - **Learning Outcomes**: A concise bullet-style summary of what students should understand or be able to do by the end of the day, output in markdown format.
            - **Real-World Applications**: Examples or explanations of how the day's topics relate to real-world scenarios or practical use cases, output in markdown format.
            - **Taxonomy Alignment**: Align the topics and outcomes with Bloom's Taxonomy or another recognized educational taxonomy (e.g., "Applying", "Analyzing", "Creating"), output in markdown format.
            
        - The passed chapter text is extracted from a pdf, use your knowledge to understand the text.

        Syllabus Text:
        {text}
        
        Your output **must** be a valid JSON structure conforming to this schema:
        {format_instructions}
        """
    
    OTHER_SUBJECT = """
    - Include topics depending on the length and complexity of the topics.
    - For each topic:
        - Provide a title
        - Allocate time in minutes
        - Write a short explanation of the topic in 2 sentences. Do not mention any previous class details in explantion, use your own knowledge to explain the topic. Don't guide the teacher in topic explanation.
    """
        
    ENGLISH_SUBJECT = """
    - For English, divide the given days into two parts:
    - First half days should be allocated for teaching the chapter.
    - Second half days should be allocated for Grammer topics mentioned at the end of the chapter.
    - For each topic:
        - Provide a title
        - Allocate time in minutes
        - Write a short explanation of the topic in 2 sentences. Do not mention any previous class details in explantion, use your own knowledge to explain the topic. Don't guide the teacher in topic explanation.
    """

    MATHEMATICS_SUBJECT = """
    - For Mathematics, include the topics for a day based on the complexity of the topics and concepts.
    - For each day, include a mix of theory and problems.
    - For each topic:
        - Provide a title
        - Allocate time in minutes
        - Write a short explanation of the topic in 2 sentences. Do not mention any previous class details in explantion, use your own knowledge to explain the topic. Don't guide the teacher in topic explanation.
    - For each topic, include at least one example problem.
    - Ensure mathematical expressions are clear and correctly formatted.
    - For mathematical expressions:
        - Do NOT use LaTeX.
        - Do NOT use $ symbols.
        - Always use proper mathematical symbols instead of words:
            • Multiplication → ×  
            • Division → ÷  
            • Powers → superscripts (2², 3³, etc.)  
            • Square root → √ (e.g., √16 = 4)  
            • Fractions → write as a/b (e.g., ½ instead of 0.5 when clearer) 
    """

    SCIENCE_SUBJECT = """
    - For Science, include the topics for a day based on the complexity of the topics.
    - In day wise plan, include problems wherever present in the chapter.
    - If problems are present at the end of the chapter, allocate a day at the end of the plan for problems explanation.
    - For each topic:
        - Provide a title
        - Allocate time in minutes
        - Write a short explanation of the topic in 2 sentences. Do not mention any previous class details in explantion, use your own knowledge to explain the topic. Don't guide the teacher in topic explanation.
    """

    PHYSICAL_SCIENCE_SUBJECT = """
    - For Physical Science, include the topics for a day based on the complexity of the topics and concepts.
    - For each day, include a mix of theory and problems, if the problems are present in the chapter.
    - If the problems are present at the end of the chapter, allocate a day at the end of the plan for problems explanation.
    - For each topic:
        - Provide a title
        - Allocate time in minutes
        - Write a short explanation of the topic in 2 sentences. Do not mention any previous class details in explantion, use your own knowledge to explain the topic. Don't guide the teacher in topic explanation.
    """
    PHYSICS_SUBJECT = """
    - For Physical Science, include the topics for a day based on the complexity of the topics and concepts.
    - For each day, include a mix of theory and problems, if the problems are present in the chapter.
    - If the problems are present at the end of the chapter, allocate a day at the end of the plan for problems explanation.
    - For each topic:
        - Provide a title
        - Allocate time in minutes
        - Write a short explanation of the topic in 2 sentences. Do not mention any previous class details in explantion, use your own knowledge to explain the topic. Don't guide the teacher in topic explanation.
    """

    CHEMISTRY_SUBJECT = """
    - For Chemistry, include the topics for a day based on the complexity of the topics and concepts.
    - For each day, include a mix of theory and problems, if the problems are present in the chapter.
    - If the problems are present at the end of the chapter, allocate a day at the end of the plan for problems explanation.
    - For each topic:
        - Provide a title
        - Allocate time in minutes
        - Write a short explanation of the topic in 2 sentences. Do not mention any previous class details in explantion, use your own knowledge to explain the topic. Don't guide the teacher in topic explanation.
    """

    BIOLOGY_SUBJECT = """
    - For Biology, include the topics for a day based on the complexity of the topics.
    - Include Practical topics as theory explanations wherever necessary.
    - For each topic:
        - Provide a title
        - Allocate time in minutes
        - Write a short explanation of the topic in 2 sentences. Do not mention any previous class details in explantion, use your own knowledge to explain the topic. Don't guide the teacher in topic explanation.
    """


    #Chat Prompts  
    ASSISTANT_CHAT = """
        You are a friendly and knowledgeable lesson assistant for teachers and students.
        You are given a lesson plan for a specific day in a chapter.

        ## Your strict instructions:
        1. Only answer the user's question directly. Do NOT include unrelated details or extra commentary.
        2. Keep the response concise, clear, and easy to understand.
        3. Always use a proper example to illustrate the concept, if applicable.
        4. Always use a real world scenario to explain the concept or question, if applicable.
        5. Always connect the explanation or example directly to the user's question and the current lesson plan.
        6. Use step-by-step reasoning only if needed for problem-solving.
        7. For mathematical expressions:
           - Do NOT use LaTeX.
           - Do NOT use $ symbols.
           - Always use proper mathematical symbols instead of words:
             • Multiplication → ×  
             • Division → ÷  
             • Powers → superscripts (2², 3³, etc.)  
             • Square root → √ (e.g., √16 = 4)  
             • Fractions → write as a/b (e.g., ½ instead of 0.5 when clearer) 
        8. If the question is outside today's scope, politely redirect them by saying which day or topic it will be covered in.
        9. Format the final answer in **Markdown** for clarity.
        Example of tone: Friendly, encouraging, and curious - like a good teacher who makes the subject interesting and simple.

        ## Lesson plan for today:
        {lesson_plan}

        ## Final Answer (concise, directly related, in Markdown):
        """