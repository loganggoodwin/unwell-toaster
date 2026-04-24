@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js was not found.
  echo Install Node.js from https://nodejs.org/ and then run this file again.
  pause
  exit /b 1
)
node cli.js
pause
