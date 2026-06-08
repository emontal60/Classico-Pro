@echo off
title Classico - Add to Windows Startup
color 0b
echo -------------------------------------------------
echo      ADD CLASSICO TO WINDOWS STARTUP
echo -------------------------------------------------
echo.
set "START_BAT_PATH=%~dp0..\start.bat"
set "STARTUP_FOLDER=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup"
set "SHORTCUT_NAME=ClassicoApp.lnk"

echo [1/2] Creating Startup Shortcut...
powershell "$s=(New-Object -COM WScript.Shell).CreateShortcut('%STARTUP_FOLDER%\%SHORTCUT_NAME%');$s.TargetPath='%START_BAT_PATH%';$s.WorkingDirectory='%~dp0..';$s.Save()"

echo [2/2] Finalizing...
echo.
echo ✅ Done! Classico will now start automatically when you turn on your computer.
echo ✅ تم! سيتم تشغيل البرنامج تلقائياً عند بدء تشغيل الجهاز.
echo.
pause
exit
