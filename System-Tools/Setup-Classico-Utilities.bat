@echo off
title Classico - Setup Utilities
color 0b
:menu
cls
echo -------------------------------------------------
echo         CLASSICO SYSTEM SETUP UTILITIES
echo -------------------------------------------------
echo.
echo  [1] Create Desktop Shortcut (إنشاء اختصار لسطح المكتب)
echo  [2] Add to Windows Startup (إضافة لبدء التشغيل مع الويندوز)
echo  [3] Remove from Startup (إزالة من بدء التشغيل)
echo  [4] Exit (خروج)
echo.
echo -------------------------------------------------
set /p choice="Enter choice [1-4]: "

if "%choice%"=="1" goto shortcut
if "%choice%"=="2" goto startup
if "%choice%"=="3" goto remstartup
if "%choice%"=="4" exit
goto menu

:shortcut
echo.
echo [!] Creating Smart Shortcut on Desktop...
set "START_BAT_PATH=%~dp0..\start.bat"
set "DESKTOP_FOLDER=%USERPROFILE%\Desktop"
set "SHORTCUT_NAME=Classico Engine.lnk"
powershell "$s=(New-Object -COM WScript.Shell).CreateShortcut('%DESKTOP_FOLDER%\%SHORTCUT_NAME%');$s.TargetPath='%START_BAT_PATH%';$s.WorkingDirectory='%~dp0..';$s.IconLocation='%~dp0app-main-icon.png';$s.Save()"
echo ✅ Desktop shortcut created!
pause
goto menu

:startup
echo.
echo [!] Adding Classico to Windows Startup...
set "START_BAT_PATH=%~dp0..\start.bat"
set "STARTUP_FOLDER=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup"
set "SHORTCUT_NAME=ClassicoApp.lnk"
powershell "$s=(New-Object -COM WScript.Shell).CreateShortcut('%STARTUP_FOLDER%\%SHORTCUT_NAME%');$s.TargetPath='%START_BAT_PATH%';$s.WorkingDirectory='%~dp0..';$s.Save()"
echo ✅ Added to Startup successfully!
pause
goto menu

:remstartup
echo.
echo [!] Removing Classico from Windows Startup...
set "STARTUP_FOLDER=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup"
set "SHORTCUT_NAME=ClassicoApp.lnk"
if exist "%STARTUP_FOLDER%\%SHORTCUT_NAME%" (
    del "%STARTUP_FOLDER%\%SHORTCUT_NAME%"
    echo ✅ Removed from Startup.
) else (
    echo [!] Shortcut not found in Startup folder.
)
pause
goto menu
