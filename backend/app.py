import os
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from openai import OpenAI

# Load .env file
load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {"message": "CareerApp backend running!"}

@app.get("/events")
def get_events():
    return [
        {"id": 1, "title": "Career Workshop: CV & Motivation Letter", "date": "2025-11-10"},
        {"id": 2, "title": "AI in Career Development", "date": "2025-11-12"},
        {"id": 3, "title": "Alumni Mentorship Networking Night", "date": "2025-11-18"},
    ]

@app.get("/mentorships")
def mentorships():
    return [
        {"id": 1, "mentor": "Dr. Ana Horvat", "field": "Psychology", "availability": "Open"},
        {"id": 2, "mentor": "Ivan Kovač", "field": "Computer Science", "availability": "Full"},
    ]

@app.post("/chat")
async def chat(request: Request):
    data = await request.json()
    message = data.get("message", "")

    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are an assistant from the University of Zagreb Career Development Office. "
                        "You ONLY answer questions related to: career guidance, events, mentorships, "
                        "student organizations, and professional development at the University of Zagreb. "
                        "If a user asks something outside that scope, politely redirect them to "
                        "the university website unizg.hr or to career@unizg.hr."
                    ),
                },
                {"role": "user", "content": message},
            ],
        )
        ai_reply = response.choices[0].message.content.strip()
        return {"reply": ai_reply}
    except Exception as e:
        return {"reply": f"Error: {e}"}
