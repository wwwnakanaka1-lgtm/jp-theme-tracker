@echo off
echo ========================================
echo   Starting Frontend Server...
echo ========================================
cd /d "%~dp0frontend"
npm run dev -- -H 0.0.0.0
