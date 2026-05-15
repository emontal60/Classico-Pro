@echo off
title Classico - Windows Icon Cache Cleaner
color 0e
echo -------------------------------------------------
echo      SYSTEM ICON & THUMBNAIL CACHE CLEANER
echo -------------------------------------------------
echo.
echo [!] This will restart Windows Explorer to refresh icons.
echo [!] سيتم إعادة تشغيل مستعرض الملفات لتحديث الأيقونات.
echo.
echo [!] Please save your work before continuing.
echo [!] يرجى حفظ عملك قبل المتابعة.
echo.
pause

echo.
echo [1/4] Closing Windows Explorer in 3 seconds...
timeout /t 3 >nul
taskkill /f /im explorer.exe >nul 2>&1
timeout /t 2 >nul

echo [2/4] Cleaning Icon Cache...
del /f /q "%localappdata%\IconCache.db" >nul 2>&1
del /f /q "%localappdata%\Microsoft\Windows\Explorer\iconcache*" >nul 2>&1

echo [3/4] Cleaning Thumbnail Cache...
del /f /q "%localappdata%\Microsoft\Windows\Explorer\thumbcache*" >nul 2>&1

echo [4/4] Restarting Windows Explorer...
:: Force restart by explicitly pointing to the exe
start "" "%windir%\explorer.exe"

:: Verification loop to ensure explorer is back
echo Waiting for taskbar to return...
timeout /t 5 >nul
tasklist /fi "IMAGENAME eq explorer.exe" | findstr explorer.exe >nul
if %errorlevel% neq 0 (
    echo [!] Taskbar didn't return. Attempting fallback...
    start "" "%windir%\explorer.exe"
)

echo.
echo ✅ Done! Your system icons should now be updated.
echo ✅ تم! يجب أن تظهر الأيقونات الجديدة الآن.
echo.
echo [TIP] If the screen is still black, press CTRL+ALT+DEL and sign out or restart.
echo [تنبيه] إذا ظلت الشاشة سوداء، يرجى تسجيل الخروج أو إعادة التشغيل.
echo.
pause
exit
