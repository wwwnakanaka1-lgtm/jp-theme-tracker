@echo off
chcp 65001 > nul
echo ========================================
echo   Japan Stock Theme Tracker
echo   Starting all servers...
echo ========================================
echo.

REM Get local IP address (Wi-Fi adapter)
for /f "tokens=14" %%a in ('ipconfig ^| findstr "192.168"') do (
    set LOCAL_IP=%%a
    goto :found
)
:found

REM Start backend in new window (auto port selection)
echo Starting backend with auto port selection...
start "Backend" cmd /k "cd /d %~dp0backend && C:\Users\wwwhi\.venv\Scripts\activate.bat && python main.py"

REM Wait for backend to start and write port config
echo Waiting for backend to start...
timeout /t 5 /nobreak > nul

setlocal enabledelayedexpansion

REM Read port from config file
set BACKEND_PORT=8000
if exist "%~dp0port_config.json" (
    for /f "tokens=2 delims=:," %%a in ('type "%~dp0port_config.json" ^| findstr "backend_port"') do (
        set "BACKEND_PORT=%%a"
    )
    set "BACKEND_PORT=!BACKEND_PORT: =!"
)

REM Write .env.local file for Next.js
echo NEXT_PUBLIC_API_URL=http://localhost:!BACKEND_PORT!> "%~dp0frontend\.env.local"
echo Created .env.local with API URL: http://localhost:!BACKEND_PORT!

echo.
echo Your local IP: %LOCAL_IP%
echo.
echo Backend:  http://%LOCAL_IP%:!BACKEND_PORT!
echo Frontend: http://%LOCAL_IP%:3000
echo.
echo ----------------------------------------
echo Access from smartphone:
echo   Open browser and go to:
echo   http://%LOCAL_IP%:3000
echo ----------------------------------------
echo.

REM Start frontend
start "Frontend" cmd /k "cd /d %~dp0frontend && npm run dev -- -H 0.0.0.0"

echo.
echo ========================================
echo   Servers are starting in new windows!
echo.
echo   Backend:  http://%LOCAL_IP%:%BACKEND_PORT%
echo   Frontend: http://%LOCAL_IP%:3000
echo ========================================
echo.
echo Press any key to close this window...
echo (Servers will keep running)
pause > nul
