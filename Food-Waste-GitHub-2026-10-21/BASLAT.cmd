@echo off
cd /d "%~dp0"
set PORT=3100
if exist "%LOCALAPPDATA%\FoodWaste\postgres-data\PG_VERSION" (
  "%LOCALAPPDATA%\FoodWaste\postgresql\bin\pg_ctl.exe" -D "%LOCALAPPDATA%\FoodWaste\postgres-data" status >nul 2>&1
  if errorlevel 1 "%LOCALAPPDATA%\FoodWaste\postgresql\bin\pg_ctl.exe" -D "%LOCALAPPDATA%\FoodWaste\postgres-data" -l "%LOCALAPPDATA%\FoodWaste\postgres-data\server.log" -o "-p 5433 -h 127.0.0.1" start
)
echo Food ^& Waste uygulamasi baslatiliyor.
echo Tarayicida http://127.0.0.1:3100 adresini acin.
echo Uygulama acik kaldigi surece bu pencereyi kapatmayin.
node server.mjs
pause
