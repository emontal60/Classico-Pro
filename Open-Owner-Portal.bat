@echo off
title Classico Owner Portal
echo [System] Opening Secure Cloud Portal in App Mode...

:: Try Chrome first
start chrome --app="http://127.0.0.1:3000/portal"

:: If Chrome fails, try Edge (available on all Windows)
if %ERRORLEVEL% NEQ 0 (
    echo [System] Chrome not found, trying Microsoft Edge...
    start msedge --app="http://127.0.0.1:3000/portal"
)

if %ERRORLEVEL% NEQ 0 (
    echo [Error] Could not launch in App Mode. Opening in default browser...
    start "" "http://127.0.0.1:3000/portal"
)

timeout /t 2 >nul
exit
