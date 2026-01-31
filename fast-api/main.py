import os
import logging
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from huggingface_hub import InferenceClient
from dotenv import load_dotenv

from course_fetcher import CourseFetcher

# 1. Setup & Security
load_dotenv() # Load HF_TOKEN from .env file
HF_TOKEN = os.getenv("HF_TOKEN")

# Setup Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("ChatbotService")

if not HF_TOKEN:
    logger.error("HF_TOKEN is missing! Please check your .env file.")
    # We don't raise error instantly to allow app to start, but chat will fail.

import py_eureka_client.eureka_client as eureka_client
from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Register with Eureka
    eureka_server_url = os.getenv("EUREKA_SERVER_URL", "http://localhost:8761/eureka")
    await eureka_client.init_async(
        eureka_server=eureka_server_url,
        app_name="CHATBOT-SERVICE",
        instance_port=8000
    )
    yield
    # Shutdown handles deregistration automatically or we can be explicit if needed

app = FastAPI(title="DLMS AI Chatbot Service", lifespan=lifespan)

# 2. Dependencies
fetcher = CourseFetcher()
# We use Qwen 2.5 Coder, which is free and well-supported on HF Inference API
# It's excellent at following instructions and conversational tasks.
client = InferenceClient(token=HF_TOKEN)
MODEL_REPO = "Qwen/Qwen2.5-Coder-32B-Instruct"

# 3. Request Schema
class ChatRequest(BaseModel):
    message: str

# 4. The Persona (System Prompt)
# This is the "Brain" logic we discussed.
SYSTEM_TEMPLATE = """
You are a helpful and professional support assistant for the DLMS (Decentralized Learning Management System). 
Your goal is to assist students and instructors with platform-related inquiries using the provided Context.

RULES:
1. Use the provided Context to answer technical or course-related questions.
2. If the user asks a polite social question (e.g., "How are you?", "Hello"), reply politely and professionally, then briefly steer them back to the platform. 
   - Example: "I am functioning perfectly, thank you. How can I assist you with your courses today?"
3. If the user asks something completely irrelevant (e.g., "Tell me a joke", "What is the capital of Venezuela?"), politely decline.
   - Example: "I apologize, but I am designed to assist only with DLMS-related queries. Do you have a question about a course?"
4. Maintain a formal and courteous tone at all times. Do not use emojis or slang.
5. If the answer is not in the context, state that you do not have that information.

CONTEXT_DATA:
{context}

USER MESSAGE:
{user_message}
"""

@app.get("/health")
def health_check():
    return {"status": "active", "service": "DLMS Chatbot"}

@app.post("/api/chat")
async def chat_endpoint(request: ChatRequest):
    """
    Main Chat Interface.
    1. Fetches real-time context (Course Data).
    2. Injects it into the System Prompt.
    3. Calls Hugging Face Inference API.
    """
    if not HF_TOKEN:
        raise HTTPException(status_code=500, detail="Server Configuration Error: API Token Missing")

    try:
        # Step A: Get Dynamic Context (Lazy RAG)
        context_data = fetcher.get_course_context()
        
        # Step B: Construct the full prompt
        full_prompt = SYSTEM_TEMPLATE.format(
            context=context_data,
            user_message=request.message
        )

        # Step C: Call AI
        # Using chat_completion with the upgraded huggingface_hub library
        logger.info(f"Sending request to HF Model: {MODEL_REPO}")
        
        # Use chat-style messages for Mistral Instruct model
        messages = [
            {"role": "user", "content": full_prompt}
        ]
        
        response = client.chat_completion(
            model=MODEL_REPO,
            messages=messages,
            max_tokens=500,
            temperature=0.7
        )
        
        ai_reply = response.choices[0].message.content
        return {"response": ai_reply}

    except Exception as e:
        logger.error(f"Error during chat processing: {e}")
        raise HTTPException(status_code=500, detail="Internal AI Service Error")

if __name__ == "__main__":
    import uvicorn
    # Hot-reload enabled for development
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
