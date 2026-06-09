@echo off
title Classico SaaS - Launcher
color 0b

:: 1. Clean up only the process running on port 3000 (Very Safe)
echo Checking port 3000...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000') do (
    echo Killing previous server on PID %%a
    taskkill /f /pid %%a >nul 2>&1
)

:: 2. Start the Backend Server (Completely Hidden)
echo Starting Background Services...
wscript.exe "hide_server.vbs"

:: Wait for server
timeout /t 2 /nobreak >nul

:: 3. Launch the UI in App Mode (Separate Window, reusing default profile for zero resource overhead)
echo Launching App Window...
if exist "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" (
    start "" "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" --app=http://localhost:3000
) else if exist "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" (
    start "" "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" --app=http://localhost:3000
) else (
    start http://localhost:3000
)

exit
