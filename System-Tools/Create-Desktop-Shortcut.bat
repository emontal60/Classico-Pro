@echo off
title Classico - Create Desktop Shortcut
color 0b
echo -------------------------------------------------
echo      CREATE CLASSICO DESKTOP SHORTCUT
echo -------------------------------------------------
echo.
set "START_BAT_PATH=%~dp0..\start.bat"
set "DESKTOP_FOLDER=%USERPROFILE%\Desktop"
set "SHORTCUT_NAME=Classico Engine.lnk"

echo [1/2] Creating Smart Shortcut on Desktop...
powershell "$s=(New-Object -COM WScript.Shell).CreateShortcut('%DESKTOP_FOLDER%\%SHORTCUT_NAME%');$s.TargetPath='%START_BAT_PATH%';$s.WorkingDirectory='%~dp0..';$s.IconLocation='%~dp0app-main-icon.png';$s.Save()"

echo [2/2] Finalizing...
echo.
echo ✅ Done! A new shortcut with the Classico icon has been created on your desktop.
echo ✅ تم! تم إنشاء اختصار جديد بأيقونة البرنامج على سطح المكتب.
echo.
timeout /t 3 >nul
exit
