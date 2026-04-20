@echo off
chcp 65001 >nul
cd /d "%~dp0"
start "Remstroikapital Browser" http://localhost:3000
remstroikapital.exe
pause
