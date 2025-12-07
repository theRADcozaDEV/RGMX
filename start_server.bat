@echo off
title RGMX LED Server
cd /d "%~dp0"

:loop
cls
echo ==========================================
echo      Starting RGMX LED Control Server
echo ==========================================
echo.
python server/led_server.py
echo.
echo ==========================================
echo   Server stopped. Restarting in 5 seconds...
echo ==========================================
timeout /t 5
goto loop
