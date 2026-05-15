@echo off
title Classico Deployer - Full Project Push
cd /d "%~dp0"

echo [1] Checking for .gitignore...
if not exist ".gitignore" (
    echo Creating .gitignore...
    echo node_modules/ > .gitignore
    echo classico-v3/node_modules/ >> .gitignore
    echo dist_electron/ >> .gitignore
    echo classico-v3/dist/ >> .gitignore
    echo *.log >> .gitignore
)

echo [2] Initializing/Updating Local Repository...
:: If .git doesn't exist, init it
if not exist ".git" (
    git init
    git remote add origin https://github.com/emontal60/Classico-Pro.git
)

:: Set user info if not set
git config user.email "ayman@example.com"
git config user.name "Ayman Classico"

echo [3] Staging All Project Files...
:: This will include server.js, OwnerPortal.html, and all source code
git add .

echo [4] Committing Changes...
git commit -m "Update Classico Pro: %date% %time%"

echo [5] Pushing to GitHub (Main Branch)...
echo.
echo IMPORTANT: This will sync your local code with GitHub.
echo This is REQUIRED for Auto-Updates to work.
echo.

:: Try to push normally first
git branch -M main
git push -u origin main --force

if %errorlevel% neq 0 (
    echo.
    echo [!] PUSH FAILED. 
    echo Please make sure you have internet and the correct permissions.
) else (
    echo.
    echo [SUCCESS] Full Project is now on GitHub!
    echo Auto-Updates will now work correctly using this repository.
)

pause
exit
