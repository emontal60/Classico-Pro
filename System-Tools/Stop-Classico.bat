@echo off
title Classico Emergency Stop
color 0c
echo -------------------------------------------------
echo         CLASSICO EMERGENCY STOP
echo -------------------------------------------------
echo.
echo [!] Attempting to terminate all Classico processes...

:: Kill the backend server process using Port 3000
netstat -ano | findstr :3000 | findstr LISTENING >nul
if %errorlevel% == 0 (
    echo [1/2] Terminating Backend Engine...
    for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000 ^| findstr LISTENING') do taskkill /f /pid %%a >nul 2>&1
) else (
    echo [1/2] Backend Engine is not running.
)

:: Try to close the Classico UI Application
echo [2/2] Closing UI Application Windows...
taskkill /f /im chrome.exe /fi "WINDOWTITLE eq Classico*" >nul 2>&1


echo.
echo [OK] System has been force-closed.
echo.
timeout /t 2 >nul
exit
