# Local Testing Guide

## 🧪 How to Test Your Application Locally

This guide will help you verify that your application works correctly before deploying to AWS.

---

## ⚠️ Prerequisites

### **Backend Requirements**
- Python 3.12 installed
- PostgreSQL database running locally
- Virtual environment set up

### **Frontend Requirements**
- Node.js 18+ installed
- npm installed

---

## 🚀 Step 1: Start the Backend (API)

### **Option A: Using Virtual Environment (Recommended)**

```powershell
# Navigate to backend directory
cd backend

# Activate virtual environment
.\venv\Scripts\Activate.ps1

# Start the server
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

### **Option B: Direct Python**

```powershell
# Navigate to backend directory
cd backend

# Start with venv python directly
.\venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

### **Expected Output:**
```
INFO:     Will watch for changes in these directories: ['...\backend']
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Started reloader process [xxxxx] using WatchFiles
INFO:     Started server process [xxxxx]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

---

## 🧪 Step 2: Test Backend Endpoints

### **Test 1: Root Endpoint**
```powershell
Invoke-WebRequest -Uri "http://127.0.0.1:8000/" -Method GET
```

**Expected Response:**
```json
{
  "message": "Welcome to TeamLease EdTech Referral Portal",
  "version": "1.0.0",
  "docs": "/docs",
  "health": "/health"
}
```

### **Test 2: Health Check (Liveness)**
```powershell
Invoke-WebRequest -Uri "http://127.0.0.1:8000/health/live" -Method GET
```

**Expected Response:**
```json
{
  "status": "alive"
}
```

### **Test 3: Health Check (Readiness)**
```powershell
Invoke-WebRequest -Uri "http://127.0.0.1:8000/health/ready" -Method GET
```

**Expected Response:**
```json
{
  "status": "ready",
  "database": "connected"
}
```

### **Test 4: Full Health Check**
```powershell
Invoke-WebRequest -Uri "http://127.0.0.1:8000/health" -Method GET
```

**Expected Response:**
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "environment": "production",
  "checks": {
    "api": "ok",
    "database": "ok"
  }
}
```

### **Test 5: API Documentation**
Open in browser:
- Swagger UI: http://127.0.0.1:8000/docs
- ReDoc: http://127.0.0.1:8000/redoc

---

## 🎨 Step 3: Start the Frontend (UI)

### **In a NEW terminal:**

```powershell
# Navigate to frontend directory
cd frontend

# Install dependencies (if not already done)
npm install

# Start development server
npm run dev
```

### **Expected Output:**
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

---

## 🧪 Step 4: Test Frontend

### **Test 1: Open in Browser**
Navigate to: http://localhost:5173/

### **Test 2: Check Pages**
- ✅ Login page loads
- ✅ Dashboard loads (after login)
- ✅ Referrals page loads
- ✅ Universities page loads
- ✅ Leaderboard page loads
- ✅ Rewards page loads
- ✅ Analytics page loads

### **Test 3: Check API Connectivity**
Open browser console (F12) and check for:
- ✅ No CORS errors
- ✅ API calls to http://localhost:8000/api/v1/*
- ✅ Successful responses (200 OK)

---

## 🐛 Common Issues & Solutions

### **Issue 1: Backend Won't Start - ModuleNotFoundError**

**Problem:**
```
ModuleNotFoundError: No module named 'app'
```

**Solution:**
Make sure you're in the `backend` directory when starting the server:
```powershell
cd backend
python -m uvicorn app.main:app --reload
```

---

### **Issue 2: Backend Won't Start - ImportError pydantic**

**Problem:**
```
ImportError: cannot import name 'AliasGenerator' from 'pydantic'
```

**Solution:**
Your system Python has an old pydantic version. Use the virtual environment:
```powershell
cd backend
.\venv\Scripts\Activate.ps1
python -m uvicorn app.main:app --reload
```

---

### **Issue 3: Database Connection Failed**

**Problem:**
```
{
  "status": "unhealthy",
  "checks": {
    "database": "failed"
  }
}
```

**Solution:**
1. Make sure PostgreSQL is running
2. Check database credentials in `.env` file:
   ```
   DATABASE_HOST=localhost
   DATABASE_PORT=5432
   DATABASE_NAME=referral
   DATABASE_USER=postgres
   DATABASE_PASSWORD=your_password
   ```
3. Create database if it doesn't exist:
   ```sql
   CREATE DATABASE referral;
   ```

---

### **Issue 4: CORS Errors in Frontend**

**Problem:**
```
Access to fetch at 'http://127.0.0.1:8000/api/v1/...' from origin 'http://localhost:5173' has been blocked by CORS policy
```

**Solution:**
Update `backend/app/config.py`:
```python
CORS_ORIGINS: str = "http://localhost:3000,http://localhost:5173,http://localhost:8080"
```

---

### **Issue 5: Frontend Can't Connect to Backend**

**Problem:**
Frontend shows "Network Error" or "Failed to fetch"

**Solution:**
1. Check backend is running on port 8000
2. Update `frontend/src/lib/api/client.ts`:
   ```typescript
   const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
   ```
3. Or set environment variable:
   ```powershell
   $env:VITE_API_BASE_URL="http://127.0.0.1:8000"
   npm run dev
   ```

---

## ✅ Complete Test Checklist

### **Backend Tests**
- [ ] Backend starts without errors
- [ ] Root endpoint (/) returns welcome message
- [ ] Health check (/health/live) returns alive
- [ ] Health check (/health/ready) returns ready
- [ ] Full health check (/health) shows database connected
- [ ] API docs (/docs) loads successfully
- [ ] Login endpoint works
- [ ] Protected endpoints require authentication

### **Frontend Tests**
- [ ] Frontend starts without errors
- [ ] Login page loads
- [ ] Can login with valid credentials
- [ ] Dashboard displays data
- [ ] Can create new referral
- [ ] Can view universities
- [ ] Leaderboard shows rankings
- [ ] Rewards page displays rewards
- [ ] Analytics charts render
- [ ] No console errors
- [ ] No CORS errors

### **Integration Tests**
- [ ] Frontend successfully calls backend APIs
- [ ] Authentication flow works end-to-end
- [ ] Data displays correctly on all pages
- [ ] Forms submit successfully
- [ ] Error messages display appropriately

---

## 📊 Performance Testing

### **Backend Performance**
```powershell
# Test API response time
Measure-Command { Invoke-WebRequest -Uri "http://127.0.0.1:8000/api/v1/analytics/dashboard" -Method GET }
```

**Expected:** < 500ms

### **Frontend Performance**
- Page load time: < 3 seconds
- Time to interactive: < 5 seconds
- No memory leaks (check in browser DevTools)

---

## 🐳 Docker Testing (Optional)

### **Test Frontend Docker Build**
```powershell
cd frontend
docker build --build-arg VITE_API_URL=http://localhost:8000 -t test-ui:latest -f Dockerfile .
docker run -p 3001:3001 test-ui:latest
```

Access at: http://localhost:3001

### **Test Backend Docker Build**
```powershell
cd backend
docker build -t test-api:latest -f Dockerfile .
docker run -p 80:80 -e DATABASE_HOST=host.docker.internal test-api:latest
```

Access at: http://localhost:80

---

## 📝 Test Results Template

```
=== LOCAL TESTING REPORT ===

Date: _______________
Tester: _______________

BACKEND:
[ ] Started successfully
[ ] All health checks pass
[ ] API docs accessible
[ ] Database connected
[ ] Authentication works

FRONTEND:
[ ] Started successfully
[ ] All pages load
[ ] API connectivity works
[ ] No console errors
[ ] UI renders correctly

INTEGRATION:
[ ] Login flow works
[ ] Data displays correctly
[ ] Forms submit successfully
[ ] Error handling works

PERFORMANCE:
API Response Time: _____ ms
Page Load Time: _____ seconds

ISSUES FOUND:
1. _____________________
2. _____________________

OVERALL STATUS: [ ] PASS  [ ] FAIL
```

---

## 🚀 Ready for Deployment?

If all tests pass:
- ✅ Backend runs without errors
- ✅ Frontend runs without errors
- ✅ All health checks pass
- ✅ API connectivity works
- ✅ No CORS issues
- ✅ Database connection works
- ✅ Authentication flow works

**You're ready to deploy to AWS!** 🎉

Follow the `DEPLOYMENT_CHECKLIST.md` for AWS deployment steps.

---

## 📞 Need Help?

If you encounter issues:
1. Check the error messages in terminal
2. Review the logs in `backend/logs/` (if configured)
3. Check browser console for frontend errors
4. Verify database is running and accessible
5. Ensure all environment variables are set correctly

---

**Good luck with testing!** 🧪

