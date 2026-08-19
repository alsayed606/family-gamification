@echo off
title Family Gamification — GitHub Deploy
color 0A

echo.
echo ============================================================
echo   Family Gamification System — GitHub Deployment Script
echo ============================================================
echo.

:: ---------------------------------------------------------------
:: STEP 1: Ask for GitHub username
:: ---------------------------------------------------------------
set /p USERNAME="Enter your GitHub username: "

if "%USERNAME%"=="" (
  echo ERROR: Username cannot be empty.
  pause
  exit /b 1
)

set REPO_URL=https://github.com/%USERNAME%/family-gamification.git

echo.
echo Repo URL will be: %REPO_URL%
echo.
set /p CONFIRM="Is this correct? (y/n): "
if /i not "%CONFIRM%"=="y" (
  echo Cancelled. Re-run the script and try again.
  pause
  exit /b 0
)

:: ---------------------------------------------------------------
:: STEP 2: Initialize git and push
:: ---------------------------------------------------------------
echo.
echo [1/5] Initializing git...
git init
if errorlevel 1 ( echo ERROR: git not found. Install Git from https://git-scm.com && pause && exit /b 1 )

echo [2/5] Staging all files...
git add .

echo [3/5] Creating first commit...
git commit -m "Initial commit: Family Gamification System"

echo [4/5] Setting branch to main...
git branch -M main

echo [5/5] Connecting to GitHub and pushing...
git remote remove origin 2>nul
git remote add origin %REPO_URL%
git push -u origin main

if errorlevel 1 (
  echo.
  echo ============================================================
  echo   Push failed. Common fixes:
  echo   1. Make sure the repo exists at: %REPO_URL%
  echo   2. Create it at https://github.com/new
  echo      Name: family-gamification  /  Visibility: Public
  echo      Do NOT add README or .gitignore
  echo   3. Re-run this script
  echo ============================================================
) else (
  echo.
  echo ============================================================
  echo   SUCCESS! Your app is deploying now.
  echo.
  echo   Next steps:
  echo   1. Go to: https://github.com/%USERNAME%/family-gamification
  echo      Settings - Pages - Source: main / (root) - Save
  echo.
  echo   2. App will be live in ~2 min at:
  echo      https://%USERNAME%.github.io/family-gamification/src/html/
  echo.
  echo   3. Copy config/firestore.rules into Firebase Console
  echo      Use a DEDICATED Firebase project - never a shared one.
  echo      See docs/PHASE-0.md
  echo ============================================================
)

echo.
pause
