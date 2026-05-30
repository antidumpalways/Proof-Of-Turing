@echo off
REM ============================================================
REM  Proof-of-Turing — Unified Demo Runner (Windows)
REM  Run this to show judges the complete PoT flow
REM ============================================================
TITLE Proof-of-Turing Demo

echo ============================================================
echo  Proof-of-Turing — Demo Runner
echo ============================================================
echo.

REM ─── Step 1: Check Python ───
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [FAIL] Python not found. Install Python 3.10+
    pause
    exit /b 1
)
echo [OK] Python found

REM ─── Step 2: Install backend deps ───
echo.
echo [1/6] Installing backend dependencies...
cd backend
pip install -r requirements.txt -q
if %errorlevel% neq 0 (
    echo [FAIL] pip install failed
    pause
    exit /b 1
)
cd ..
echo [OK] Backend dependencies installed

REM ─── Step 3: Train ML model ───
echo.
echo [2/6] Training ML model...
cd backend
python train_model.py
if %errorlevel% neq 0 (
    echo [WARN] ML model training had issues (non-critical)
)
cd ..
echo [OK] ML model ready

REM ─── Step 4: Start backend ───
echo.
echo [3/6] Starting PoT Oracle backend (port 8000)...
start "PoT-Oracle" cmd /c "cd backend && uvicorn main:app --reload --host 0.0.0.0 --port 8000"
echo [OK] Backend starting... waiting 5 seconds
timeout /t 5 /nobreak >nul

REM ─── Step 5: Start frontend ───
echo.
echo [4/6] Starting frontend (port 3000)...
start "PoT-Frontend" cmd /c "cd frontend && npm run dev"
echo [OK] Frontend starting...

REM ─── Step 6: Run mock agents ───
echo.
echo [5/6] Running mock agents...
echo.
echo  This will simulate:
echo    [AI]    Real AI Agent — natural timing, diverse strategies
echo    [BOT]   Script Agent  — fixed timing, repetitive actions
echo.
echo  The backend will analyze both and show the score difference!
echo.

start "PoT-Mock-AI" cmd /c "cd scripts && python mock-agent.py --type both --count 15"
echo [OK] Mock agents started!

REM ─── Step 7: Show URLs ───
echo.
echo [6/6] Demo is running!
echo.
echo ============================================================
echo  OPEN THESE LINKS IN YOUR BROWSER:
echo.
echo  Dashboard:    http://localhost:3000
echo  API Status:   http://localhost:8000
echo  WebSocket:    ws://localhost:8000/api/v1/ws
echo ============================================================
echo.
echo  CLI commands to try:
echo    curl http://localhost:8000/api/v1/health
echo    curl http://localhost:8000/api/v1/alpha/0xYourWallet
echo    curl http://localhost:8000/api/v1/scan/0xYourWallet
echo.
echo  Press any key to stop all services...
pause >nul

REM ─── Cleanup ───
echo.
echo Stopping services...
taskkill /f /im "python.exe" /fi "WINDOWTITLE eq PoT-*" >nul 2>&1
taskkill /f /im "node.exe" /fi "WINDOWTITLE eq PoT-*" >nul 2>&1
echo Done.
