# Complete Guide: How to Run Your Backend

Based on your project structure, here's the complete step-by-step guide:

## 📋 Prerequisites Check

✅ **Python Version**: Python 3.12.5 (detected)
✅ **Virtual Environment**: Already exists in `backend/venv/`
✅ **Dependencies**: Listed in `requirements.txt`
✅ **Environment File**: `.env` file exists

## 🚀 Quick Start (3 Steps)

### Step 1: Navigate to Backend Directory
```powershell
cd backend
```

### Step 2: Activate Virtual Environment

**Windows PowerShell:**
```powershell
.\venv\Scripts\Activate.ps1
```

**Windows Command Prompt:**
```cmd
venv\Scripts\activate.bat
```

**Linux/Mac:**
```bash
source venv/bin/activate
```

### Step 3: Run the Server

**Option A: Using uvicorn directly (Recommended)**
```powershell
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Option B: Using Python module**
```powershell
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Option C: Run directly from main.py**
```powershell
python app/main.py
```

## 📍 Server URLs

Once running, your backend will be available at:

- **API Base URL**: `http://localhost:8000`
- **API Documentation (Swagger)**: `http://localhost:8000/docs`
- **ReDoc Documentation**: `http://localhost:8000/redoc`
- **Health Check**: `http://localhost:8000/health`
- **Root Endpoint**: `http://localhost:8000/`

## 🔧 Complete Setup (If Starting Fresh)

### 1. Verify Python Installation
```powershell
python --version
# Should show: Python 3.12.5 or similar
```

### 2. Navigate to Backend
```powershell
cd backend
```

### 3. Activate Virtual Environment
```powershell
.\venv\Scripts\Activate.ps1
```

### 4. Install/Update Dependencies (if needed)
```powershell
pip install -r requirements.txt
```

### 5. Verify Environment File
```powershell
# Check if .env exists
Test-Path .env

# If it doesn't exist, create it from template
Copy-Item env.example .env

# Then edit .env with your database credentials and settings
```

### 6. Run the Server
```powershell
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## 📝 Command Breakdown

- `uvicorn` - ASGI server for FastAPI
- `app.main:app` - Path to FastAPI app instance (app/main.py → app variable)
- `--reload` - Auto-reload on code changes (development mode)
- `--host 0.0.0.0` - Listen on all network interfaces
- `--port 8000` - Port number (default: 8000)

## 🎯 One-Line Command (From Project Root)

If you're in the project root directory:

```powershell
cd backend; .\venv\Scripts\Activate.ps1; uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## 🔍 Verify It's Working

After starting the server, you should see output like:

```
INFO:     Started server process [12345]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
```

Then visit `http://localhost:8000/docs` to see the API documentation.

## ⚙️ Environment Configuration

Your `.env` file should contain:

```env
# Database Configuration
DATABASE_HOST=10.0.3.146
DATABASE_PORT=5432
DATABASE_NAME=referral
DATABASE_USER=referral
DATABASE_PASSWORD=R@f@iia1@2026

# JWT Configuration
JWT_SECRET_KEY=your-super-secret-jwt-key-change-in-production-2024
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
REFRESH_TOKEN_EXPIRE_DAYS=7

# Application Configuration
APP_NAME=TeamLease EdTech Referral Portal
APP_VERSION=1.0.0
DEBUG=False
ENVIRONMENT=production

# CORS Origins
CORS_ORIGINS=http://localhost:3000,http://localhost:5173,http://localhost:8080

# Logging
LOG_LEVEL=INFO
```

## 🐛 Troubleshooting

### Port Already in Use
If port 8000 is busy, use a different port:
```powershell
uvicorn app.main:app --reload --host 0.0.0.0 --port 8001
```

### Module Not Found Errors
```powershell
# Make sure venv is activated, then:
pip install -r requirements.txt
```

### Database Connection Issues
- Verify PostgreSQL is running
- Check `.env` file has correct database credentials
- Ensure database server at `10.0.3.146` is accessible

### Permission Errors (PowerShell)
If you get execution policy errors:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Virtual Environment Not Activating
```powershell
# Try this instead:
& .\venv\Scripts\Activate.ps1
```

## 🚀 Production Deployment

For production, remove `--reload` and use multiple workers:

```powershell
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

Or use gunicorn:
```powershell
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

## 📚 Project Structure

```
backend/
├── app/
│   ├── main.py              ← Entry point (FastAPI app)
│   ├── config.py            ← Configuration
│   ├── database.py          ← Database connection
│   ├── api/routes/          ← API endpoints
│   ├── controllers/         ← Request handlers
│   ├── services/            ← Business logic
│   ├── models/              ← Database models
│   └── schemas/             ← Validation schemas
├── venv/                    ← Virtual environment
├── requirements.txt         ← Dependencies
├── .env                     ← Environment variables (create from env.example)
└── README.md               ← Documentation
```

## ✅ Success Checklist

- [ ] Navigated to `backend` directory
- [ ] Activated virtual environment (`venv`)
- [ ] Verified `.env` file exists with correct settings
- [ ] Installed dependencies (`pip install -r requirements.txt`)
- [ ] Started server (`uvicorn app.main:app --reload`)
- [ ] Server running on `http://localhost:8000`
- [ ] Can access `/docs` endpoint
- [ ] Database connection working

## 🎉 You're All Set!

Your backend should now be running. The API will be available at `http://localhost:8000` and you can view interactive documentation at `http://localhost:8000/docs`.






