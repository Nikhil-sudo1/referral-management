# Start Backend Server
Write-Host "Starting Backend Server..." -ForegroundColor Green
Set-Location -Path $PSScriptRoot\backend
& .\venv\Scripts\Activate.ps1
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

