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
node -e "const fs = require('fs'); const root = JSON.parse(fs.readFileSync('package.json')); const pkg = JSON.parse(fs.readFileSync('classico-v3/package.json')); pkg.version = root.version; fs.writeFileSync('classico-v3/package.json', JSON.stringify(pkg, null, 2) + '\n');"

:build_step
echo.
echo [3/4] Building and Publishing the Installer (EXE) to GitHub...
echo [System] This may take a few minutes, please wait...
set /p GH_TOKEN=<github-token.txt
call npm run electron:build -- -p always
set BUILD_ERR=%ERRORLEVEL%

if %BUILD_ERR% neq 0 (
    echo.
    echo [!] ERROR: Building or publishing to GitHub failed.
    echo [!] This is usually caused by network issues or internet disconnection.
    echo.
    choice /c yn /m "Do you want to retry building and publishing? "
    if errorlevel 2 (
        echo [System] Skipping publish step and proceeding...
    ) else (
        echo [System] Retrying...
        goto :build_step
    )
)

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

:git_push_step
git push -u origin main --force
set PUSH_ERR=%ERRORLEVEL%

if %PUSH_ERR% neq 0 (
    echo.
    echo [!] ERROR: Git push failed.
    echo [!] This is usually caused by internet disconnection or repository access issues.
    echo.
    choice /c yn /m "Do you want to retry pushing code to GitHub? "
    if errorlevel 2 (
        echo [System] Skipping git push.
    ) else (
        echo [System] Retrying git push...
        goto :git_push_step
    )
)
goto :eof

