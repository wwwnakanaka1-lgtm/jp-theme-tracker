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

echo Your local IP: %LOCAL_IP%
echo.
echo Backend:  http://%LOCAL_IP%:8000
echo Frontend: http://%LOCAL_IP%:3000
echo.
echo ----------------------------------------
echo Access from smartphone:
echo   Open browser and go to:
echo   http://%LOCAL_IP%:3000
echo ----------------------------------------
echo.

REM Start backend in new window
start "Backend" cmd /k "cd /d %~dp0backend && C:\Users\wwwhi\.venv\Scripts\activate.bat && uvicorn main:app --host 0.0.0.0 --port 8000 --reload"

REM Wait 3 seconds for backend to start
echo Waiting for backend to start...
timeout /t 3 /nobreak > nul

REM Start frontend in new window
start "Frontend" cmd /k "cd /d %~dp0frontend && npm run dev -- -H 0.0.0.0"

echo.
echo ========================================
echo   Servers are starting in new windows!
echo
echo   Backend:  http://%LOCAL_IP%:8000
echo   Frontend: http://%LOCAL_IP%:3000
echo ========================================
echo.
echo Press any key to close this window...
echo (Servers will keep running)
pause > nul
