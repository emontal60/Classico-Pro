@echo off
title Classico Pro - Project Manager
cd /d "%~dp0"

:menu
cls
echo.
echo ===========================================
echo    CLASSICO PRO - PROJECT MANAGER
echo ===========================================
echo.
echo  [1] Save Changes to GitHub (Push Source Code)
echo  [2] Release NEW Version (Build EXE + Push)
echo  [3] Exit
echo.
set /p choice="Select an option (1-3): "

if "%choice%"=="1" goto push_only
if "%choice%"=="2" goto release_full
if "%choice%"=="3" exit
goto menu

:push_only
echo.
echo [!] Saving changes to GitHub...
call :git_logic
echo.
echo [SUCCESS] Source code updated on GitHub.
pause
goto menu

:release_full
echo.
set /p confirm="[?] Are you sure you want to build and release a NEW version? (y/n): "
if /i "%confirm%" neq "y" goto menu

echo.
echo [1/4] Cleaning old builds...
if exist "dist_electron" rd /s /q "dist_electron"
if exist "classico-v3\dist" rd /s /q "classico-v3\dist"

echo.
echo [2/4] Incrementing version (Automatic)...
:: Force increment to avoid git check issues
call npm version patch --no-git-tag-version --force

echo.
echo [3/4] Building the Installer (EXE)...
echo [System] This may take a few minutes, please wait...
call npm run electron:build

echo.
echo [4/4] Syncing with GitHub...
call :git_logic

echo.
echo ===========================================
echo    SUCCESS! New Version Ready.
echo ===========================================
echo [Done] Version has been incremented.
echo [Path] Check 'dist_electron' for the new Setup file.
pause
goto menu

:git_logic
echo [Git] Preparing files...
if not exist ".gitignore" (
    echo node_modules/ > .gitignore
    echo classico-v3/node_modules/ >> .gitignore
    echo dist_electron/ >> .gitignore
    echo classico-v3/dist/ >> .gitignore
)
if not exist ".git" (
    git init
    git remote add origin https://github.com/emontal60/Classico-Pro.git
)
git config user.email "ayman@example.com"
git config user.name "Ayman Classico"
git add .
git commit -m "Update Classico Pro: %date% %time%"
git branch -M main
git push -u origin main --force
goto :eof
