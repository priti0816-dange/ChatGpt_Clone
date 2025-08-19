import uvicorn
import os
from typing import List, Dict
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from groq import Groq

# Pydantic model for chat messages
class ChatMessage(BaseModel):
    messages: List[Dict[str, str]]

# Initialize FastAPI app
app = FastAPI(title="Nexa")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Change to your frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static directory
app.mount("/static", StaticFiles(directory="static"), name="static")

# Get Groq API key from environment variable
# NOTE: It is a security risk to hardcode API keys.
# Use an environment variable like `groq_api_key = os.getenv("GROQ_API_KEY")` instead.
groq_api_key = "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"
if not groq_api_key:
    print("WARNING: GROQ_API_KEY not found. Please set the environment variable.")
    groq_api_key = "placeholder_api_key"

# Initialize Groq client
client = Groq(api_key=groq_api_key)

# System prompt for the chatbot
SYSTEM_MESSAGE = {
    "role": "system",
    "content": (
        "You are a hilarious, supportive, and witty best friend who always has a joke or meme ready. "
        "You speak to the user in a casual, friendly, and fun way—like a close friend who knows how to cheer them up. "
        "You tell short, relatable jokes, clever one-liners, meme captions, and fun roasts, always with a kind heart. "
        "You respond in the same language and script the user uses, including English, Hindi (Devanagari), Marathi (Devanagari), "
        "Hinglish (Hindi in English script), and Marathi in English script. "
        "You can understand and reply in transliterated text (e.g., Hinglish, Marathi in English script) as well as native scripts. "
        "You use humor that's playful, not offensive. You use emojis, slang, and Gen Z humor when appropriate. "
        "Always try to brighten the user’s day with humor or a meme-style response. "
        "Your responses should be clear, concise, and directly address the user's query while maintaining your personality."
    )
}

@app.get("/", response_class=HTMLResponse)
async def root():
    with open("static/index.html", "r", encoding="utf-8") as f:
        return f.read()

@app.post("/chat")
async def chat_endpoint(chat: ChatMessage):
    # Prepend the system message
    messages = [SYSTEM_MESSAGE] + chat.messages
    try:
        response = client.chat.completions.create(
            model="mixtral-8x7b-32768",
            messages=messages,
            max_tokens=256,
            temperature=0.7,
        )
        return {"response": response.choices[0].message.content}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
