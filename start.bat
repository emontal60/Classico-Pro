@echo off
title Classico SaaS - Launcher
color 0b

:: 1. Clean up old processes
taskkill /f /im node.exe >nul 2>&1

:: 2. Start the Backend Server (Completely Hidden)
echo Starting Background Services...
wscript.exe "hide_server.vbs"

:: Wait for server
timeout /t 2 /nobreak >nul

:: 3. Launch the UI
if exist "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" (
    start "" "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" --app=http://localhost:3000 --user-data-dir="%APPDATA%\ClassicoAppProfile"
) else if exist "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" (
    start "" "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" --app=http://localhost:3000 --user-data-dir="%APPDATA%\ClassicoAppProfile"
) else (
    start http://localhost:3000
)

exit
