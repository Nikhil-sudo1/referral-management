# 🚀 Referral Portal - Startup Guide

## Quick Start (Both Services)

### Option 1: Using PowerShell Scripts

**Start Backend:**
```powershell
cd backend
.\venv\Scripts\Activate.ps1
uvicorn app.main:app --reload --port 8000
```

**Start Frontend (Open a NEW terminal):**
```powershell
cd frontend
npm run dev
```

---

## Detailed Instructions

### 1️⃣ Start Backend (FastAPI)

```powershell
# Step 1: Navigate to backend folder
cd "C:\Users\tledt\OneDrive\Documents\refreel management\referral-management\backend"

# Step 2: Activate virtual environment
.\venv\Scripts\Activate.ps1

# Step 3: Start the server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Backend URLs:**
| URL | Description |
|-----|-------------|
| http://localhost:8000 | API Root |
| http://localhost:8000/docs | Swagger API Documentation |
| http://localhost:8000/redoc | ReDoc API Documentation |
| http://localhost:8000/health | Health Check |

---

### 2️⃣ Start Frontend (React + Vite)

Open a **NEW terminal window** and run:

```powershell
# Step 1: Navigate to frontend folder
cd "C:\Users\tledt\OneDrive\Documents\refreel management\referral-management\frontend"

# Step 2: Start development server
npm run dev
```

**Frontend URL:**
- http://localhost:8080 (or http://localhost:5173)

---

## 🛑 How to Stop Services

Press `Ctrl + C` in each terminal window to stop the respective service.

---

## 📋 One-Line Commands

**Backend (one line):**
```powershell
cd "C:\Users\tledt\OneDrive\Documents\refreel management\referral-management\backend"; .\venv\Scripts\Activate.ps1; uvicorn app.main:app --reload --port 8000
```

**Frontend (one line):**
```powershell
cd "C:\Users\tledt\OneDrive\Documents\refreel management\referral-management\frontend"; npm run dev
```

---

## ⚠️ Prerequisites

### Backend Requirements:
- Python 3.10+ installed
- Virtual environment created (`python -m venv venv`)
- Dependencies installed (`pip install -r requirements.txt`)
- `.env` file configured with database credentials

### Frontend Requirements:
- Node.js 18+ installed
- Dependencies installed (`npm install`)

---

## 🔧 First Time Setup

### Backend Setup (one time):
```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
copy env.example .env
# Edit .env with your database credentials
```

### Frontend Setup (one time):
```powershell
cd frontend
npm install
```

---

## 📁 Project Structure

```
referral-management/
├── backend/          # FastAPI Python Backend
│   ├── app/
│   ├── venv/
│   ├── .env
│   └── requirements.txt
│
├── frontend/         # React TypeScript Frontend
│   ├── src/
│   ├── public/
│   └── package.json
│
└── START_GUIDE.md    # This file
```

---

## 🌐 Access Points

| Service | URL | Port |
|---------|-----|------|
| Frontend App | http://localhost:8080 | 8080 |
| Backend API | http://localhost:8000 | 8000 |
| API Docs | http://localhost:8000/docs | 8000 |

---

## 💡 Tips

1. Always start the **Backend first**, then the Frontend
2. Keep both terminal windows open while developing
3. Both servers support **hot reload** - changes apply automatically
4. Check http://localhost:8000/health to verify backend is running

