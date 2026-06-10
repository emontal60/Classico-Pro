@echo off
title Classico Pro - Launcher
color 0b

:: 1. Kill any existing node.exe process safely (faster and no freeze)
echo [*] Stopping any previous server instance...
taskkill /f /im node.exe >nul 2>&1

:: Wait a moment for port to be released
timeout /t 2 /nobreak >nul

:: 2. Start the Backend Server (Completely Hidden)
echo [*] Starting Background Services...
wscript.exe "%~dp0hide_server.vbs"

:: 3. Wait for server to boot up (3 seconds to be safe)
echo [*] Waiting for server to start...
timeout /t 3 /nobreak >nul

:: 4. Launch the UI in App Mode
echo [*] Launching App Window...
if exist "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" (
    start "" "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" --app=http://localhost:3000
) else if exist "C:\Program Files\Microsoft\Edge\Application\msedge.exe" (
    start "" "C:\Program Files\Microsoft\Edge\Application\msedge.exe" --app=http://localhost:3000
) else if exist "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" (
    start "" "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" --app=http://localhost:3000
) else if exist "C:\Program Files\Google\Chrome\Application\chrome.exe" (
    start "" "C:\Program Files\Google\Chrome\Application\chrome.exe" --app=http://localhost:3000
) else (
    start http://localhost:3000
)

exit
