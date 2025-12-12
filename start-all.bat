@echo off
echo ========================================
echo   Referral Portal - Starting Services
echo ========================================
echo.

echo Starting Backend...
start "Backend - FastAPI" powershell -NoExit -Command "cd '%~dp0backend'; .\venv\Scripts\Activate.ps1; uvicorn app.main:app --reload --port 8000"

timeout /t 3 /nobreak > nul

echo Starting Frontend...
start "Frontend - React" powershell -NoExit -Command "cd '%~dp0frontend'; npm run dev"

echo.
echo ========================================
echo   Both services are starting!
echo ========================================
echo.
echo   Backend:  http://localhost:8000
echo   API Docs: http://localhost:8000/docs
echo   Frontend: http://localhost:8080
echo.
echo   Press any key to exit this window...
pause > nul

