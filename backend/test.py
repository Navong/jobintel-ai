import os
from fastapi import FastAPI
from fastapi.responses import StreamingResponse
from langchain_groq import ChatGroq
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

if "GROQ_API_KEY" not in os.environ:
    raise ValueError("GROQ_API_KEY is not set. Please add it to your .env file.")

llm = ChatGroq(
    model="llama-3.1-8b-instant",
    temperature=0.0,
    max_retries=2,
)

app = FastAPI()

@app.get("/stream")
async def stream_response(query: str):
    messages = [("system", "You are a helpful assistant that can write human-like blog posts."), ("human", query)]
    
    async def event_generator():
        for chunk in llm.stream(messages):
            yield chunk.text()
    
    return StreamingResponse(event_generator(), media_type="text/plain")
