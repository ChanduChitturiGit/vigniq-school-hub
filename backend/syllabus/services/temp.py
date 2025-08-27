from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain
from langchain_google_genai import ChatGoogleGenerativeAI

# 1. Initialize LLM
llm = ChatGoogleGenerativeAI(
    model="gemini-2.0-flash",
    temperature=0,
    api_key='AIzaSyDn7yDyYGXsiHDGtkzJ3EPsw0lTepYpjkg',
)

# 2. Create Prompt
prompt = PromptTemplate(
    input_variables=["topic"],
    template="Explain {topic} in simple terms in 500 words."
)

# 3. Create LLMChain
chain = LLMChain(llm=llm, prompt=prompt)

# 4. Stream with `astream`
async def run_stream():
    async for chunk in chain.astream({"topic": "photosynthesis"}):
        # Each chunk is a partial response
        print(chunk, end="", flush=True)

# If you’re not inside an async function, run it like:
import asyncio
asyncio.run(run_stream())
