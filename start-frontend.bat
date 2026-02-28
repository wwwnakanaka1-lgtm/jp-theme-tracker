@echo off
setlocal enabledelayedexpansion
title [Next.js] JP Theme Tracker - :3000
echo ========================================
echo   Starting Frontend Server...
echo ========================================

REM Read backend port from config
set BACKEND_PORT=8000
if exist "%~dp0port_config.json" (
    for /f "tokens=2 delims=:," %%a in ('type "%~dp0port_config.json" ^| findstr "backend_port"') do (
        set "BACKEND_PORT=%%a"
    )
    REM Remove spaces
    set "BACKEND_PORT=!BACKEND_PORT: =!"
)

echo Using backend port: !BACKEND_PORT!

REM Write .env.local file for Next.js
echo NEXT_PUBLIC_API_URL=http://localhost:!BACKEND_PORT!> "%~dp0frontend\.env.local"
echo Created .env.local with API URL: http://localhost:!BACKEND_PORT!

REM Find available frontend port
set PORT=3000
:find_port
netstat -ano 2>nul | findstr ":%PORT% " | findstr "LISTENING" >nul 2>&1
if %errorlevel%==0 (
    echo [WARN] Port %PORT% is in use, trying next...
    set /a PORT+=1
    goto :find_port
)

title [Next.js] JP Theme Tracker - :!PORT!
echo Starting frontend on port !PORT!...
cd /d "%~dp0frontend"
npm run dev -- -H 0.0.0.0 -p !PORT!
