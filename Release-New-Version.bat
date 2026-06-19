@echo off
title Classico Pro - Auto Release Manager
cd /d "%~dp0"

cls
echo.
echo ===========================================
echo    CLASSICO PRO - AUTO RELEASE MANAGER
echo ===========================================
echo.
echo [1/4] Cleaning old builds...
if exist "dist_electron" rd /s /q "dist_electron"
if exist "classico-v3\dist" rd /s /q "classico-v3\dist"

echo.
echo [2/4] Incrementing version (Automatic)...
:: Force increment to avoid git check issues
call npm version patch --no-git-tag-version --force

echo.
echo [3/4] Building and Publishing the Installer (EXE) to GitHub...
echo [System] This may take a few minutes, please wait...
set /p GH_TOKEN=<github-token.txt
call npm run electron:build -- -p always

echo.
echo [4/4] Syncing Source Code with GitHub...
call :git_logic

echo.
echo ===========================================
echo    SUCCESS! New Version Ready.
echo ===========================================
echo [Done] Version has been incremented.
echo [Path] Check 'dist_electron' for the new Setup file.
pause
exit

:git_logic
echo [Git] Preparing files...
if not exist ".gitignore" (
    echo node_modules/ > .gitignore
    echo classico-v3/node_modules/ >> .gitignore
    echo dist_electron/ >> .gitignore
    echo classico-v3/dist/ >> .gitignore
)
:: Ensure token is ignored
findstr /x /c:"github-token.txt" .gitignore >nul || echo github-token.txt>> .gitignore
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
