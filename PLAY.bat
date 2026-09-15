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

if not exist node_modules\typescript\bin\tsc (
  echo Installing the one development dependency...
  call npm.cmd ci
  if errorlevel 1 (
    echo.
    echo npm install failed. Check your internet connection and try again.
    pause
    exit /b 1
  )
)

echo.
echo Starting COMPILE / CRASH at http://localhost:5173
start "COMPILE CRASH Browser" cmd /c "timeout /t 2 /nobreak >nul & start http://localhost:5173"
call npm.cmd run dev

endlocal
