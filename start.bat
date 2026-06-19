@echo off
title Classico Pro - Launcher
color 0b

:: 1. Kill any existing node.exe process safely
echo [*] Stopping any previous server instance...
taskkill /f /im node.exe >nul 2>&1
timeout /t 2 /nobreak >nul

:: 2. Start the Backend Server (Completely Hidden)
echo [*] Starting Background Services...
wscript.exe "%~dp0hide_server.vbs"
timeout /t 3 /nobreak >nul

:: 3. Ask for boot mode (with a timeout of 3 seconds defaulting to Normal mode)
echo.
echo ===========================================
echo   Choose Startup Mode:
echo   [1] Normal App Mode (Recommended)
echo   [2] Developer/Debug Mode (Full Browser)
echo ===========================================
echo.
choice /c 12 /t 3 /d 1 /m "Select option (defaults to Normal in 3s): "

if errorlevel 2 goto :debug_mode
if errorlevel 1 goto :normal_mode

:normal_mode
echo.
echo [*] Launching App in Secure Standalone Mode...
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

:debug_mode
cls
color 0e
echo [!] Starting in DEBUG MODE (Full Browser)
start http://localhost:3000
echo.
echo Debug mode active. Press F12 in the browser window to see logs.
pause
exit
