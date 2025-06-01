@echo off
title SmartWay Project Management - Deploy Script

echo ===============================================
echo   SMARTWAY PROJECT MANAGEMENT - DEPLOY
echo ===============================================

:: Verificar si Docker está corriendo
docker info >nul 2>&1
if errorlevel 1 (
    echo ❌ Error: Docker no está corriendo
    echo 💡 Inicia Docker Desktop y vuelve a intentar
    pause
    exit /b 1
)

:: Verificar si existe package-lock.json, si no generarlo
if not exist "package-lock.json" (
    if exist "pnpm-lock.yaml" (
        echo 📦 Generando package-lock.json desde pnpm-lock.yaml...
        npm install --package-lock-only >nul 2>&1
        echo ✅ package-lock.json generado
    )
)

echo ✅ Docker está corriendo
echo.

:: Parar contenedores existentes si los hay
echo 🛑 Parando contenedores existentes...
docker compose -f docker-compose.windows.yml down >nul 2>&1

echo 🧹 Limpiando recursos Docker antiguos...
docker system prune -f >nul

echo.
echo 🚀 Construyendo e iniciando contenedores...
docker compose -f docker-compose.windows.yml up --build -d

if errorlevel 1 (
    echo ❌ Error al iniciar los contenedores
    pause
    exit /b 1
)

echo.
echo ⏳ Esperando que la aplicación esté lista...
timeout /t 10 /nobreak >nul

echo.
echo ✅ ¡Deployment completado exitosamente!
echo.
echo 📱 Aplicación disponible en:
echo    - URL: http://localhost:6012
echo    - Usuario Admin: dev@smartway.com.ar
echo    - Password: admin123
echo.
echo 🔧 Comandos útiles:
echo    - Ver logs: docker compose -f docker-compose.windows.yml logs -f
echo    - Parar: docker compose -f docker-compose.windows.yml down
echo    - Reiniciar: docker compose -f docker-compose.windows.yml restart
echo.
pause 