@echo off
echo ========================================
echo   Starting Backend Server (Auto Port)
echo ========================================
cd /d "%~dp0backend"
call C:\Users\wwwhi\.venv\Scripts\activate.bat
python main.py
