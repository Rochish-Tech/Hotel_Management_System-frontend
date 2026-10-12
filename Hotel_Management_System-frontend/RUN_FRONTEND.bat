@echo off
setlocal
cd /d "%~dp0"
title Grand Horizon Frontend
where node >nul 2>&1
if errorlevel 1 (
 echo Node.js is required. Install Node.js 18 or newer from https://nodejs.org/
 pause
 exit /b 1
)
echo =========================================
echo Grand Horizon Frontend
 echo Open: http://localhost:5500
 echo Backend must be running on http://localhost:8081
 echo Press Ctrl+C to stop
 echo =========================================
node server.js
echo.
echo Frontend stopped. If there was an error, read it above.
pause
