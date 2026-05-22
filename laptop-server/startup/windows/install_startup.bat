@echo off
setlocal

set "STARTUP=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup"
set "SRC=%~dp0start_arc.vbs"
set "DST=%STARTUP%\arc_companion.vbs"

copy /Y "%SRC%" "%DST%" >nul
if %errorlevel% equ 0 (
    echo [OK] Arc Companion added to startup.
    echo      It will launch automatically at next login.
    echo      Log file: %~dp0..\..\arc.log
) else (
    echo [FAIL] Could not copy to startup folder.
    echo        Try running this script as Administrator.
)

pause
