@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo ======================================
echo   Ремстройкапитал - запуск сайта

echo ======================================

after_install_check:
where node >nul 2>nul
if errorlevel 1 (
  echo [ОШИБКА] Node.js не найден в системе.
  echo Установите Node.js и повторите запуск.
  echo Сайт: https://nodejs.org/
  pause
  exit /b 1
)

if not exist node_modules (
  echo [1/3] Устанавливаю зависимости...
  call npm install
  if errorlevel 1 (
    echo [ОШИБКА] Не удалось установить зависимости.
    pause
    exit /b 1
  )
)

echo [2/3] Запускаю сервер...
start "Remstroikapital Browser" http://localhost:3000
call npm start

if errorlevel 1 (
  echo [ОШИБКА] Сервер завершился с ошибкой.
  pause
  exit /b 1
)
