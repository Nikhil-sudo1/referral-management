# How to Run the Backend Server

## Quick Start

### 1. Navigate to Backend Directory
```bash
cd backend
```

### 2. Activate Virtual Environment

**Windows (PowerShell):**
```powershell
.\venv\Scripts\Activate.ps1
```

**Windows (Command Prompt):**
```cmd
venv\Scripts\activate.bat
```

**Linux/Mac:**
```bash
source venv/bin/activate
```

### 3. Set Up Environment Variables

Make sure you have a `.env` file in the `backend` directory. If not, copy from `env.example`:

**Windows (PowerShell):**
```powershell
Copy-Item env.example .env
```

**Windows (Command Prompt):**
```cmd
copy env.example .env
```

**Linux/Mac:**
```bash
cp env.example .env
```

Then edit `.env` with your configuration (database credentials, SMTP settings, etc.)

### 4. Install Dependencies (if not already installed)

```bash
pip install -r requirements.txt
```

### 5. Run the Server

**Option 1: Using uvicorn directly (Recommended)**
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Option 2: Using Python module**
```bash
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Option 3: Run directly from main.py**
```bash
python app/main.py
```

## Server URLs

Once running, the server will be available at:
- **API Base URL**: `http://localhost:8000`
- **API Documentation (Swagger)**: `http://localhost:8000/docs`
- **ReDoc Documentation**: `http://localhost:8000/redoc`
- **Health Check**: `http://localhost:8000/health`

## Command Breakdown

- `uvicorn` - ASGI server for FastAPI
- `app.main:app` - Path to FastAPI app instance
- `--reload` - Auto-reload on code changes (development only)
- `--host 0.0.0.0` - Listen on all network interfaces
- `--port 8000` - Port number (default: 8000)

## Troubleshooting

### Port Already in Use
If port 8000 is already in use, change the port:
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8001
```

### Database Connection Issues
- Ensure PostgreSQL is running
- Check `.env` file has correct database credentials
- Verify database exists and is accessible

### Module Not Found Errors
- Make sure virtual environment is activated
- Run `pip install -r requirements.txt` again

### Permission Errors (Windows)
If you get execution policy errors in PowerShell:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

## Production Deployment

For production, remove `--reload` flag and use a production ASGI server:

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

Or use gunicorn with uvicorn workers:
```bash
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

