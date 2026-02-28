@echo off
setlocal enabledelayedexpansion
title [API] JP Theme Tracker - :8000
echo ========================================
echo   Starting Backend Server (Auto Port)
echo ========================================

cd /d "%~dp0backend"
call C:\Users\wwwhi\.venv\Scripts\activate.bat

REM Find available port
set PORT=8000
:find_port
netstat -ano 2>nul | findstr ":%PORT% " | findstr "LISTENING" >nul 2>&1
if %errorlevel%==0 (
    echo [WARN] Port %PORT% is in use, trying next...
    set /a PORT+=1
    goto :find_port
)

title [API] JP Theme Tracker - :!PORT!
echo Using port: !PORT!
python main.py --port !PORT!
