@echo off
chcp 65001 > nul
echo ========================================
echo   Japan Stock Theme Tracker
echo   Stopping all servers...
echo ========================================
echo.

REM Kill Python/uvicorn processes (Backend)
echo Stopping backend servers...
taskkill /F /FI "WINDOWTITLE eq Backend*" >nul 2>&1
taskkill /F /IM python.exe /FI "WINDOWTITLE eq Backend*" >nul 2>&1

REM Kill Node processes (Frontend)
echo Stopping frontend servers...
taskkill /F /FI "WINDOWTITLE eq Frontend*" >nul 2>&1

REM Also kill any orphaned processes on typical ports
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":8000 " ^| findstr "LISTENING"') do (
    echo Killing process on port 8000 (PID: %%a)
    taskkill /F /PID %%a >nul 2>&1
)
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":8001 " ^| findstr "LISTENING"') do (
    echo Killing process on port 8001 (PID: %%a)
    taskkill /F /PID %%a >nul 2>&1
)
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":8002 " ^| findstr "LISTENING"') do (
    echo Killing process on port 8002 (PID: %%a)
    taskkill /F /PID %%a >nul 2>&1
)
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3000 " ^| findstr "LISTENING"') do (
    echo Killing process on port 3000 (PID: %%a)
    taskkill /F /PID %%a >nul 2>&1
)

REM Clean up PID file
if exist "%~dp0.server.pid" del "%~dp0.server.pid"

echo.
echo ========================================
echo   All servers stopped!
echo ========================================
echo.
timeout /t 2 /nobreak > nul
