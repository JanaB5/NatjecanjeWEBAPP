import os
import json
from fastapi import FastAPI, Request, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from openai import OpenAI

# Load .env and setup OpenAI
load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# File paths
DATA_DIR = "data"
STUDENTS_FILE = os.path.join(DATA_DIR, "students.json")

os.makedirs(DATA_DIR, exist_ok=True)

# Helper: load & save
def load_students():
    if not os.path.exists(STUDENTS_FILE):
        with open(STUDENTS_FILE, "w", encoding="utf-8") as f:
            json.dump({}, f)
    with open(STUDENTS_FILE, "r", encoding="utf-8") as f:
        return json.load(f)

def save_students(data):
    with open(STUDENTS_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

@app.get("/")
def home():
    return {"message": "CareerApp backend running!"}

@app.get("/events")
def get_events():
    return [
        {
            "id": 1,
            "title": "Smotra Sveučilišta u Zagrebu 2025",
            "date": "2025-11-13",
            "location": "Zagrebački Velesajam",
            "description": "Središnji godišnji događaj gdje studenti i maturanti mogu upoznati fakultete, studije i karijerne mogućnosti."
        },
        {
            "id": 2,
            "title": "Radionica: Kako napisati životopis i motivacijsko pismo",
            "date": "2025-11-18",
            "location": "FER, Dvorana B4",
            "description": "Radionica za studente koji žele unaprijediti svoj CV i motivacijsko pismo uz praktične savjete stručnjaka iz ljudskih resursa."
        },
        {
            "id": 3,
            "title": "Career Fair 2025",
            "date": "2025-12-02",
            "location": "Ekonomski fakultet Zagreb",
            "description": "Sajam karijera gdje poslodavci poput Deloittea, Infobipa i Rimac Automobila predstavljaju prakse i otvorene pozicije studentima."
        },
        {
            "id": 4,
            "title": "AI u razvoju karijere: budućnost zapošljavanja",
            "date": "2025-12-10",
            "location": "PMF, dvorana 003",
            "description": "Predavanje o utjecaju umjetne inteligencije na karijerni razvoj i zapošljavanje."
        }
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
        return {"reply": response.choices[0].message.content.strip()}
    except Exception as e:
        return {"reply": f"Error: {e}"}


# ========== STUDENTS ==========

@app.post("/register")
def register(
    username: str = Form(...),
    name: str = Form(...),
    university: str = Form(...),
    about: str = Form(...),
):
    students = load_students()  # ✅ Load file each time

    if username in students:
        return {"success": False, "message": "Korisnik već postoji."}

    students[username] = {
        "name": name,
        "university": university,
        "about": about,
        "cv": None,
        "connections": [],
        "events": [],
    }

    save_students(students)  # ✅ Save back to file

    return {"success": True, "student": {**students[username], "username": username}}


@app.post("/login")
def login(username: str = Form(...)):
    students = load_students()  # ✅ Fix: was missing before
    if username in students:
        student_data = students[username]
        return {"success": True, "student": {**student_data, "username": username}}
    return {"success": False, "message": "Korisnik nije pronađen."}


@app.get("/student/{username}")
def get_student(username: str):
    students = load_students()
    if username in students:
        return students[username]
    return {"error": "Korisnik nije pronađen."}


@app.post("/register_event")
def register_event(username: str = Form(...), event_id: int = Form(...)):
    students = load_students()
    if username not in students:
        return {"success": False, "message": "Korisnik nije pronađen."}

    if event_id not in students[username]["events"]:
        students[username]["events"].append(event_id)
        save_students(students)

    return {"success": True, "events": students[username]["events"]}


@app.post("/unregister_event")
def unregister_event(username: str = Form(...), event_id: int = Form(...)):
    students = load_students()
    if username not in students:
        return {"success": False, "message": "Korisnik nije pronađen."}

    if event_id in students[username]["events"]:
        students[username]["events"].remove(event_id)
        save_students(students)

    return {"success": True, "events": students[username]["events"]}

# ========== CAREERS ==========
@app.get("/careers")
def get_careers():
    # Example data grouped by faculty
    return {
        "FER": [
            "Software Engineer",
            "Data Scientist",
            "AI Developer",
            "System Architect",
            "DevOps Engineer"
        ],
        "PMF": [
            "Matematičar",
            "Analitičar podataka",
            "Nastavnik matematike/fizike",
            "Istraživač",
            "Znanstveni suradnik"
        ],
        "EFZG": [
            "Financijski analitičar",
            "Marketing stručnjak",
            "Računovođa",
            "Bankarski savjetnik",
            "Konzultant za poslovni razvoj"
        ],
        "FFZG": [
            "Psiholog",
            "Sociolog",
            "Profesor jezika",
            "Prevoditelj",
            "Konzultant za ljudske resurse"
        ],
        "FAR": [
            "Farmaceut",
            "Klinički istraživač",
            "Regulatorni stručnjak",
            "Prodajni predstavnik za farmaciju",
            "Laboratorijski analitičar"
        ]
    }

# =========================
# SAVJETI (Advice forum)
# =========================

SAVJETI_FILE = os.path.join(DATA_DIR, "savjeti.json")

def load_savjeti():
    if not os.path.exists(SAVJETI_FILE):
        with open(SAVJETI_FILE, "w", encoding="utf-8") as f:
            json.dump([], f)
    with open(SAVJETI_FILE, "r", encoding="utf-8") as f:
        return json.load(f)

def save_savjeti(data):
    with open(SAVJETI_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


@app.get("/savjeti")
def get_savjeti():
    """Return all advice posts"""
    return load_savjeti()


@app.post("/savjeti")
def add_savjet(question: str = Form(...), tags: str = Form(...)):
    """Add a new advice post"""
    data = load_savjeti()
    new_post = {
        "id": len(data) + 1,
        "question": question,
        "tags": [t.strip() for t in tags.split(",") if t.strip()]
    }
    data.append(new_post)
    save_savjeti(data)
    return {"success": True, "savjet": new_post}

@app.post("/savjeti/reply")
def add_reply(post_id: int = Form(...), username: str = Form(...), reply: str = Form(...)):
    """Add a reply to a specific advice post"""
    data = load_savjeti()
    for post in data:
        if post["id"] == post_id:
            if "replies" not in post:
                post["replies"] = []
            post["replies"].append({
                "username": username,
                "reply": reply
            })
            save_savjeti(data)
            return {"success": True, "savjet": post}
    return {"success": False, "message": "Post not found."}
