@echo off
title AY Hub
cd /d "%~dp0"
echo Iniciando AY Hub...
call npm.cmd run build
echo.
echo AY Hub aberto em http://127.0.0.1:3333
echo Mantenha esta janela aberta.
echo.
cd /d "%~dp0backend"
node src\server.js
pause
