## KariLink — Career Platform for Students of the University of Zagreb

KariLink is a full-stack web application that helps **students, alumni, and companies** connect through **career advice, mentorship, and job opportunities.**  
It’s built with **React (frontend)** and **FastAPI (backend)**.

---

### Features

✅ Student and company authentication  
✅ Career advice & mentorship Q&A (Savjeti)  
✅ Events by faculties (Događaji)  
✅ Career explorer (Karijere)  
✅ Smart matching portal (Poveži se / Connect)  
✅ Company search for students  
✅ Dashboard for both roles (student & company)  

---

### Tech Stack

| Part | Technology |
|------|-------------|
| Frontend | React + Vite + TailwindCSS + Framer Motion |
| Backend | FastAPI (Python) |
| Database | SQLite (default) or PostgreSQL |
| Communication | Axios (REST API) |
| Icons/UI | Lucide React, shadcn/ui |

---

### Installation & Setup

#### 1. Clone the repository

```bash
git clone https://github.com/JanaB5/NatjecanjeWEBAPP.git
cd NatjecanjeWEBAPP
```

#### 2.  Backend setup (FastAPI)

```bash
cd backend
pip install -r requirements.txt
```

If you don’t have a `requirements.txt`, use:

```bash
pip install fastapi uvicorn sqlalchemy pydantic python-multipart
```

Then run the backend:

```bash
uvicorn main:app --reload
```

The backend will run by default at `http://127.0.0.1:8000`

---

#### 3. Frontend setup (React)

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`

---

### Folder Structure

```
NatjecanjeWEBAPP/
│
├── backend/
│   ├── main.py           # FastAPI entry point
│   ├── models.py         # Database models
│   ├── routes/           # All API routes
│   ├── static/           # Uploaded files (profile pics, CVs)
│   └── database.db       # SQLite DB (if local)
│
├── frontend/
│   ├── src/
│   │   ├── pages/        # React pages (Home, About, Dashboard, etc.)
│   │   ├── components/   # Reusable UI components
│   │   └── services/     # Axios API logic
│   ├── public/
│   └── package.json
│
└── README.md
```

---

### Environment Variables

In the backend, create a `.env` file (optional):

```
DATABASE_URL=sqlite:///./database.db
CORS_ORIGINS=http://localhost:5173
```

---

### Testing the app

1. Start **FastAPI** backend: `uvicorn main:app --reload`  
2. Start **React** frontend: `npm run dev`  
3. Open [http://localhost:5173](http://localhost:5173) in your browser 🎉

---

### Authors

- **Jana Bulum** — Frontend Developer  
- **Marko Ropar** — Backend Developer  

---

2025 KariLink Team
