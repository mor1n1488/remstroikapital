@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo ======================================
echo   Сборка EXE версии проекта

echo ======================================

where node >nul 2>nul
if errorlevel 1 (
  echo [ОШИБКА] Node.js не найден в системе.
  pause
  exit /b 1
)

if not exist node_modules (
  echo [1/5] Устанавливаю зависимости проекта...
  call npm install
  if errorlevel 1 (
    echo [ОШИБКА] npm install завершился с ошибкой.
    pause
    exit /b 1
  )
)

echo [2/5] Устанавливаю упаковщик pkg...
call npm install --save-dev pkg
if errorlevel 1 (
  echo [ОШИБКА] Не удалось установить pkg.
  pause
  exit /b 1
)

echo [3/5] Создаю папку dist...
if not exist dist mkdir dist

echo [4/5] Собираю EXE...
call npx pkg server.js --targets node18-win-x64 --output dist\remstroikapital.exe
if errorlevel 1 (
  echo [ОШИБКА] Сборка exe завершилась с ошибкой.
  pause
  exit /b 1
)

echo [5/5] Копирую статические файлы и БД...
xcopy public dist\public /E /I /Y >nul
if not exist dist\data mkdir dist\data
if exist data\remstroikapital.db copy /Y data\remstroikapital.db dist\data\remstroikapital.db >nul
copy /Y run_exe_version.bat dist\run_exe_version.bat >nul

echo.
echo Готово. EXE находится в папке dist
pause
