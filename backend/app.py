import os
import json
from datetime import datetime, timedelta
from typing import Optional

from fastapi import FastAPI, Request, UploadFile, Form, Depends, HTTPException, status, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import jwt, JWTError
from passlib.context import CryptContext
from dotenv import load_dotenv
from openai import OpenAI
from fastapi.responses import FileResponse

# === Load environment variables ===
load_dotenv()
OPENAI_KEY = os.getenv("OPENAI_API_KEY")
SECRET_KEY = os.getenv("SECRET_KEY")

# === Initialize app ===
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# === Directories ===
DATA_DIR = "data"
os.makedirs(DATA_DIR, exist_ok=True)
APPLICATIONS_FILE = os.path.join(DATA_DIR, "applications.json")
NOTIFICATIONS_FILE = os.path.join(DATA_DIR, "notifications.json")

# === Helper functions ===
def load_applications():
    if not os.path.exists(APPLICATIONS_FILE):
        with open(APPLICATIONS_FILE, "w", encoding="utf-8") as f:
            json.dump([], f)
    with open(APPLICATIONS_FILE, "r", encoding="utf-8") as f:
        return json.load(f)

def save_applications(data):
    with open(APPLICATIONS_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

def load_notifications():
    if not os.path.exists(NOTIFICATIONS_FILE):
        with open(NOTIFICATIONS_FILE, "w", encoding="utf-8") as f:
            json.dump([], f)
    with open(NOTIFICATIONS_FILE, "r", encoding="utf-8") as f:
        return json.load(f)

def save_notifications(data):
    with open(NOTIFICATIONS_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

# === MOCK AUTH FUNCTION ===
# (kasnije se zamjenjuje pravom get_current_user funkcijom iz tvoje auth sekcije)
def get_current_user():
    return {"username": "testuser"}

# === ROUTES ===
@app.post("/update_application_status")
def update_application_status(
    username: str = Form(...),
    job_id: int = Form(...),
    new_status: str = Form(...),
):
    """Ažurira status prijave (firma/mentor koristi ovaj endpoint)"""
    applications = load_applications()
    found = None

    for app_data in applications:
        if app_data["username"] == username and app_data["job_id"] == job_id:
            app_data["status"] = new_status
            app_data["updated_at"] = datetime.utcnow().isoformat()
            found = app_data
            break

    if not found:
        raise HTTPException(status_code=404, detail="Prijava nije pronađena")

    save_applications(applications)

    # Dodaj obavijest studentu
    notifications = load_notifications()
    notifications.append({
        "username": username,
        "message": f"Status tvoje prijave za {found['job_name']} je promijenjen u '{new_status}'.",
        "created_at": datetime.utcnow().isoformat(),
        "read": False
    })
    save_notifications(notifications)

    return {"success": True, "updated": found}

@app.post("/apply")
async def apply_for_job(
    username: str = Form(...),
    job_name: str = Form(...),
    use_saved_cv: bool = Form(False),
    cover_letter: UploadFile = File(...),
    cv_file: Optional[UploadFile] = File(None),
):
    """
    Kreira novu prijavu za posao:
    - Ako je use_saved_cv True → koristi spremljeni CV korisnika.
    - Inače koristi novi CV (cv_file).
    - Motivacijsko pismo (cover_letter) je uvijek obavezno.
    """
    students = load_students()
    if username not in students:
        raise HTTPException(status_code=404, detail="Korisnik nije pronađen")

    user = students[username]

    # === Odredi koji CV se koristi ===
    if use_saved_cv:
        if not user.get("cv"):
            raise HTTPException(status_code=400, detail="Nema spremljenog CV-a.")
        cv_filename = user["cv"]
    else:
        if not cv_file:
            raise HTTPException(status_code=400, detail="CV je obavezan.")
        ext = cv_file.filename.split(".")[-1].lower()
        if ext not in ["pdf", "doc", "docx"]:
            raise HTTPException(status_code=400, detail="CV mora biti PDF/DOC/DOCX.")
        cv_filename = f"{username}_{datetime.utcnow().timestamp()}_cv.{ext}"
        with open(os.path.join("data", "profiles", cv_filename), "wb") as f:
            f.write(await cv_file.read())

    # === Motivacijsko pismo (obavezno) ===
    cl_ext = cover_letter.filename.split(".")[-1].lower()
    if cl_ext not in ["pdf", "doc", "docx"]:
        raise HTTPException(status_code=400, detail="Motivacijsko pismo mora biti PDF/DOC/DOCX.")
    cl_filename = f"{username}_{datetime.utcnow().timestamp()}_cover.{cl_ext}"
    with open(os.path.join("data", "profiles", cl_filename), "wb") as f:
        f.write(await cover_letter.read())

    # === Spremi prijavu u applications.json ===
    applications = load_applications()
    app_id = (applications[-1]["id"] + 1) if applications else 1
    new_app = {
        "id": app_id,
        "username": username,
        "job_name": job_name,
        "cv": cv_filename,
        "cover_letter": cl_filename,
        "status": "Poslano",
        "created_at": datetime.utcnow().isoformat(),
        "updated_at": datetime.utcnow().isoformat(),
    }
    applications.append(new_app)
    save_applications(applications)

    return {"success": True, "application": new_app}

@app.get("/applications/{username}")
def get_applications(username: str):
    applications = load_applications()
    return {"applications": [a for a in applications if a["username"] == username]}

@app.get("/get_notifications")
def get_notifications(current=Depends(get_current_user)):
    """Dohvati sve obavijesti korisnika"""
    notifications = load_notifications()
    user_notifications = [n for n in notifications if n["username"] == current["username"]]
    return {"notifications": sorted(user_notifications, key=lambda x: x["created_at"], reverse=True)}


@app.post("/mark_notifications_read")
def mark_notifications_read(current=Depends(get_current_user)):
    """Označi obavijesti kao pročitane"""
    notifications = load_notifications()
    for n in notifications:
        if n["username"] == current["username"]:
            n["read"] = True
    save_notifications(notifications)
    return {"success": True}



if not OPENAI_KEY or not SECRET_KEY:
    raise RuntimeError("❌ Environment variables OPENAI_API_KEY and SECRET_KEY must be set in .env!")

# === Initialize OpenAI client ===
client = OpenAI(api_key=OPENAI_KEY)

# === JWT & Auth configuration ===
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
bearer_scheme = HTTPBearer(auto_error=False)

def hash_password(pw: str) -> str:
    return pwd_context.hash(pw)

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

# === Data setup ===
DATA_DIR = "data"
STUDENTS_FILE = os.path.join(DATA_DIR, "students.json")
SAVJETI_FILE = os.path.join(DATA_DIR, "savjeti.json")
os.makedirs(DATA_DIR, exist_ok=True)

# === Helper functions ===
def load_students():
    if not os.path.exists(STUDENTS_FILE):
        with open(STUDENTS_FILE, "w", encoding="utf-8") as f:
            json.dump({}, f)
    with open(STUDENTS_FILE, "r", encoding="utf-8") as f:
        return json.load(f)

def save_students(data):
    with open(STUDENTS_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

def load_savjeti():
    if not os.path.exists(SAVJETI_FILE):
        with open(SAVJETI_FILE, "w", encoding="utf-8") as f:
            json.dump([], f)
    with open(SAVJETI_FILE, "r", encoding="utf-8") as f:
        return json.load(f)

def save_savjeti(data):
    with open(SAVJETI_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

def get_current_user(credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme)):
    if credentials is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Nedostaje token")
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if not username:
            raise HTTPException(status_code=401, detail="Neispravan token")
    except JWTError:
        raise HTTPException(status_code=401, detail="Neispravan ili istekao token")

    students = load_students()
    user = students.get(username)
    if not user:
        raise HTTPException(status_code=401, detail="Korisnik ne postoji")
    return {"username": username, **{k: v for k, v in user.items() if k != "hashed_password"}}

# === Routes ===

@app.get("/")
def home():
    return {"message": "CareerApp backend running!"}

# === OpenAI chat route ===
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

# === EVENTS ===
@app.get("/events")
def get_events():
    events_path = os.path.join(DATA_DIR, "events.json")
    if not os.path.exists(events_path):
        raise HTTPException(status_code=404, detail="events.json not found")

    with open(events_path, encoding="utf-8") as f:
        events = json.load(f)
    return {"events": events}


# === REGISTER & LOGIN (secure) ===
@app.post("/register")
def register(
    username: str = Form(...),
    password: str = Form(...),
    name: str = Form(...),
    university: str = Form(...),
    about: str = Form("")
):
    students = load_students()

    if username in students:
        return {"success": False, "message": "Korisničko ime je zauzeto."}

    students[username] = {
        "name": name,
        "university": university,
        "about": about,
        "connections": [],
        "events": [],
        "hashed_password": hash_password(password[:72]),

    }
    save_students(students)

    token = create_access_token({"sub": username})
    student_public = {k: v for k, v in students[username].items() if k != "hashed_password"}
    return {"success": True, "access_token": token, "token_type": "bearer", "student": {"username": username, **student_public}}

@app.post("/login")
def login(username: str = Form(...), password: str = Form(...)):
    students = load_students()
    user = students.get(username)
    if not user or not verify_password(password, user.get("hashed_password", "")):
        return {"success": False, "message": "Pogrešno korisničko ime ili lozinka."}

    token = create_access_token({"sub": username})
    student_public = {k: v for k, v in user.items() if k != "hashed_password"}
    return {"success": True, "access_token": token, "token_type": "bearer", "student": {"username": username, **student_public}}

@app.get("/student/{username}")
def get_student(username: str, current=Depends(get_current_user)):
    if current["username"] != username:
        raise HTTPException(status_code=403, detail="Zabranjen pristup")
    students = load_students()
    user = students.get(username)
    if not user:
        raise HTTPException(status_code=404, detail="Korisnik nije pronađen")
    return {"username": username, **{k: v for k, v in user.items() if k != "hashed_password"}}

# === EVENT REGISTRATION ===
@app.post("/register_event")
def register_event(username: str = Form(...), event_id: int = Form(...), current=Depends(get_current_user)):
    if current["username"] != username:
        raise HTTPException(status_code=403, detail="Zabranjen pristup")

    students = load_students()
    if username not in students:
        raise HTTPException(status_code=404, detail="Korisnik nije pronađen")

    if event_id not in students[username].get("events", []):
        students[username]["events"].append(event_id)
        save_students(students)
    return {"success": True, "events": students[username]["events"]}


PROFILE_DIR = os.path.join(DATA_DIR, "profiles")
os.makedirs(PROFILE_DIR, exist_ok=True)


@app.post("/upload_profile")
async def upload_profile(
    username: str = Form(...),
    file: UploadFile = Form(...),
    current=Depends(get_current_user)
):
    """Upload profile image or CV (PDF)"""
    if current["username"] != username:
        raise HTTPException(status_code=403, detail="Zabranjen pristup")

    students = load_students()
    if username not in students:
        raise HTTPException(status_code=404, detail="Korisnik nije pronađen")

    # provjeri tip datoteke
    ext = file.filename.split(".")[-1].lower()
    if ext not in ["jpg", "jpeg", "png", "pdf"]:
        raise HTTPException(status_code=400, detail="Samo slike (jpg/png) ili PDF dozvoljeni.")

    # spremi datoteku
    filename = f"{username}_{datetime.utcnow().timestamp()}.{ext}"
    path = os.path.join(PROFILE_DIR, filename)
    with open(path, "wb") as f:
        f.write(await file.read())

    # spremi putanju u students.json
    if ext == "pdf":
        students[username]["cv"] = filename
    else:
        students[username]["profile_image"] = filename

    save_students(students)

    return {"success": True, "filename": filename}


@app.get("/profile_file/{filename}")
def get_profile_file(filename: str):
    """Serve uploaded images and CVs"""
    path = os.path.join(PROFILE_DIR, filename)
    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail="Datoteka nije pronađena.")
    return FileResponse(path)

@app.post("/upload_profile")
async def upload_profile(
    username: str = Form(...),
    file: UploadFile = File(...),
    current=Depends(get_current_user)
):
    """Upload profile image or CV (PDF)"""
    if current["username"] != username:
        raise HTTPException(status_code=403, detail="Zabranjen pristup")

    students = load_students()
    if username not in students:
        raise HTTPException(status_code=404, detail="Korisnik nije pronađen")

    # provjeri tip datoteke
    ext = file.filename.split(".")[-1].lower()
    if ext not in ["jpg", "jpeg", "png", "pdf"]:
        raise HTTPException(status_code=400, detail="Samo slike (jpg/png) ili PDF dozvoljeni.")

    # briši staru datoteku ako postoji
    if ext == "pdf":
        old_file = students[username].get("cv")
    else:
        old_file = students[username].get("profile_image")

    if old_file:
        old_path = os.path.join(PROFILE_DIR, old_file)
        if os.path.exists(old_path):
            os.remove(old_path)

    # spremi novu datoteku
    filename = f"{username}_{datetime.utcnow().timestamp()}.{ext}"
    path = os.path.join(PROFILE_DIR, filename)
    with open(path, "wb") as f:
        f.write(await file.read())

    # ažuriraj json zapis
    if ext == "pdf":
        students[username]["cv"] = filename
    else:
        students[username]["profile_image"] = filename

    save_students(students)

    return {"success": True, "filename": filename}

@app.post("/delete_profile_image")
def delete_profile_image(username: str = Form(...), current=Depends(get_current_user)):
    """Briše korisnikovu profilnu sliku"""
    if current["username"] != username:
        raise HTTPException(status_code=403, detail="Zabranjen pristup")

    students = load_students()
    if username not in students:
        raise HTTPException(status_code=404, detail="Korisnik nije pronađen")

    old_file = students[username].get("profile_image")
    if old_file:
        path = os.path.join(PROFILE_DIR, old_file)
        if os.path.exists(path):
            os.remove(path)
        students[username]["profile_image"] = None
        save_students(students)

    return {"success": True}

@app.post("/delete_cv")
def delete_cv(username: str = Form(...), current=Depends(get_current_user)):
    """Briše korisnikov CV (PDF)"""
    if current["username"] != username:
        raise HTTPException(status_code=403, detail="Zabranjen pristup")

    students = load_students()
    if username not in students:
        raise HTTPException(status_code=404, detail="Korisnik nije pronađen")

    old_file = students[username].get("cv")
    if old_file:
        path = os.path.join(PROFILE_DIR, old_file)
        if os.path.exists(path):
            os.remove(path)
        students[username]["cv"] = None
        save_students(students)

    return {"success": True}

@app.post("/update_profile")
def update_profile(
    username: str = Form(...),
    about: str = Form(""),
    university: str = Form(""),
    current=Depends(get_current_user)
):
    """Ažurira polja 'about' i 'university' u students.json"""
    if current["username"] != username:
        raise HTTPException(status_code=403, detail="Zabranjen pristup")

    students = load_students()
    if username not in students:
        raise HTTPException(status_code=404, detail="Korisnik nije pronađen")

    students[username]["about"] = about
    students[username]["university"] = university
    save_students(students)

    return {"success": True, "student": students[username]}

# === CONNECT DATA (Jobs, Mentors, Advice) ===

CONNECT_FILE = os.path.join(DATA_DIR, "connect.json")



def load_connect_data():
    if not os.path.exists(CONNECT_FILE):
        return []
    with open(CONNECT_FILE, "r", encoding="utf-8") as f:
        return json.load(f)



@app.get("/connect_data")
def get_connect_data(faculty: str = "", type: str = "", category: str = ""):
    """Vraća sve poslove/mentore/savjete filtrirane po fakultetu, tipu i kategoriji"""
    data = load_connect_data()
    results = [
        d for d in data
        if (not faculty or d["faculty"].lower() == faculty.lower())
        and (not type or d["type"].lower() == type.lower())
        and (not category or d["category"].lower() == category.lower())
    ]
    return {"results": results}



# === AI KARijERNI ASISTENT ===
@app.post("/career_suggestion")
async def career_suggestion(request: Request):
    data = await request.json()
    faculty = data.get("faculty", "")
    interests = data.get("interests", "")

    prompt = f"""
    Na temelju fakulteta ({faculty}) i interesa ({interests}),
    predloži tri potencijalne karijere i kratko objasni zašto bi mogle biti zanimljive studentu.
    Odgovori na hrvatskom jeziku, u formatu:
    1. [Naziv karijere] — [kratki opis]
    """

    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "Ti si karijerni savjetnik Sveučilišta u Zagrebu."},
                {"role": "user", "content": prompt},
            ],
        )
        reply = response.choices[0].message.content.strip()
        return {"suggestions": reply}
    except Exception as e:
        return {"error": str(e)}


@app.post("/add_meeting")
def add_meeting(
    username: str = Form(...),
    title: str = Form(...),
    description: str = Form(""),
    date: str = Form(...),
    current=Depends(get_current_user)
):
    if current["username"] != username:
        raise HTTPException(status_code=403, detail="Zabranjen pristup")

    students = load_students()
    if username not in students:
        raise HTTPException(status_code=404, detail="Korisnik nije pronađen")

    if "meetings" not in students[username]:
        students[username]["meetings"] = []

    students[username]["meetings"].append({
        "title": title,
        "description": description,
        "date": date
    })

    save_students(students)
    return {"success": True, "meetings": students[username]["meetings"]}


@app.post("/delete_meeting")
def delete_meeting(
    username: str = Form(...),
    title: str = Form(...),
    current=Depends(get_current_user)
):
    """Brisanje sastanka po naslovu"""
    if current["username"] != username:
        raise HTTPException(status_code=403, detail="Zabranjen pristup")

    students = load_students()
    if username not in students or "meetings" not in students[username]:
        raise HTTPException(status_code=404, detail="Sastanci nisu pronađeni")

    students[username]["meetings"] = [
        m for m in students[username]["meetings"] if m["title"] != title
    ]

    save_students(students)
    return {"success": True, "meetings": students[username]["meetings"]}

@app.get("/meetings/{username}")
def get_meetings(username: str, current=Depends(get_current_user)):
    if current["username"] != username:
        raise HTTPException(status_code=403, detail="Zabranjen pristup")
    students = load_students()
    if username not in students:
        raise HTTPException(status_code=404, detail="Korisnik nije pronađen")
    return {"meetings": students[username].get("meetings", [])}


@app.post("/unregister_event")
def unregister_event(username: str = Form(...), event_id: int = Form(...), current=Depends(get_current_user)):
    if current["username"] != username:
        raise HTTPException(status_code=403, detail="Zabranjen pristup")

    students = load_students()
    if event_id in students[username]["events"]:
        students[username]["events"].remove(event_id)
        save_students(students)
    return {"success": True, "events": students[username]["events"]}

# === CAREERS ===
@app.get("/careers")
def get_careers():
    return {
        "FER": {
            "about": "Fakultet elektrotehnike i računarstva (FER) vodeća je institucija u području tehnologije, informatike i računarstva u Hrvatskoj. Studenti stječu znanja iz umjetne inteligencije, strojnog učenja, automatike i razvoja softvera.",
            "careers": [
                "Software Engineer",
                "Data Scientist",
                "AI Developer",
                "System Architect",
                "DevOps Engineer"
            ],
            "mentor_quote": "“FER studenti su među najtraženijima na tržištu — njihova kombinacija tehničkog znanja i inovativnog razmišljanja čini ih izvrsnim kandidatima.” — dr. Marko Novak, Mentor"
        },
        "PMF": {
            "about": "Prirodoslovno-matematički fakultet (PMF) poznat je po vrhunskim programima iz matematike, fizike, biologije i kemije. Nudi čvrste temelje za karijeru u znanstvenom i obrazovnom sektoru.",
            "careers": [
                "Matematičar",
                "Analitičar podataka",
                "Nastavnik matematike/fizike",
                "Istraživač",
                "Znanstveni suradnik"
            ],
            "mentor_quote": "“PMF potiče analitičko razmišljanje i znanstvenu znatiželju — kvalitete koje poslodavci izuzetno cijene.” — prof. Ana Marić"
        },
        "EFZG": {
            "about": "Ekonomski fakultet Sveučilišta u Zagrebu (EFZG) obrazuje buduće stručnjake iz ekonomije, marketinga, financija i poduzetništva. EFZG diplomanti često preuzimaju vodeće uloge u tvrtkama i institucijama.",
            "careers": [
                "Financijski analitičar",
                "Marketing stručnjak",
                "Računovođa",
                "Bankarski savjetnik",
                "Konzultant za poslovni razvoj"
            ],
            "mentor_quote": "“EFZG studenti donose svježe ideje i razumijevanje tržišta — ključne vještine u modernom poslovanju.” — dr. Petra Vuković"
        },
        "FFZG": {
            "about": "Filozofski fakultet Sveučilišta u Zagrebu (FFZG) pruža obrazovanje u humanističkim i društvenim znanostima, potičući kritičko mišljenje i komunikacijske vještine.",
            "careers": [
                "Psiholog",
                "Sociolog",
                "Profesor jezika",
                "Prevoditelj",
                "Konzultant za ljudske resurse"
            ],
            "mentor_quote": "“Studenti FFZG-a su empatični, kreativni i izvrsni komunikatori — kvalitete koje svaka organizacija treba.” — dr. Iva Horvat"
        },
        "FAR": {
            "about": "Farmaceutsko-biokemijski fakultet (FAR) usmjeren je na znanstveno-istraživački i klinički rad u farmaciji, medicini i biokemiji. Nudi modernu opremu i praktičnu nastavu.",
            "careers": [
                "Farmaceut",
                "Klinički istraživač",
                "Regulatorni stručnjak",
                "Prodajni predstavnik za farmaciju",
                "Laboratorijski analitičar"
            ],
            "mentor_quote": "“Na FAR-u učimo kako teoriju pretvoriti u praksu koja spašava živote.” — prof. Luka Barišić"
        }
    }

# === SAVJETI (advice forum) ===
@app.get("/savjeti")
def get_savjeti():
    return load_savjeti()

@app.post("/savjeti")
def add_savjet(question: str = Form(...), tags: str = Form(...)):
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
    data = load_savjeti()
    for post in data:
        if post["id"] == post_id:
            post.setdefault("replies", []).append({"username": username, "reply": reply})
            save_savjeti(data)
            return {"success": True, "savjet": post}
    return {"success": False, "message": "Post not found."}
