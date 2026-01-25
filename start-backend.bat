@echo off
echo ========================================
echo   Starting Backend Server...
echo ========================================
cd /d "%~dp0backend"
call C:\Users\wwwhi\.venv\Scripts\activate.bat
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
