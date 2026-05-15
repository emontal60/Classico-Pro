@echo off
title Classico SaaS - DEBUG MODE
color 0e

echo [!] Starting in DEBUG MODE (Full Browser)
taskkill /f /im node.exe >nul 2>&1
wscript.exe "hide_server.vbs"
timeout /t 2 /nobreak >nul

:: Launch in regular browser window instead of --app
start http://localhost:3000

echo Debug mode active. Press F12 in the browser window to see logs.
pause
