@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo.
  echo COMPILE / CRASH needs Node.js 22 or newer.
  echo Install Node.js LTS from https://nodejs.org/ then run PLAY.bat again.
  echo.
  pause
  exit /b 1
)
echo.
echo Starting COMPILE / CRASH at http://localhost:5173
start "COMPILE CRASH Browser" cmd /c "timeout /t 1 /nobreak >nul & start http://localhost:5173"
node scripts\server.mjs
endlocal
