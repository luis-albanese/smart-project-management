@echo off
REM Script de deployment específico para Windows (evita errores de symlinks)

set MODE=%1
if "%MODE%"=="" set MODE=dev

echo 🚀 Deployment Windows en modo: %MODE%

REM Verificar si estamos en directorio correcto
if not exist "package.json" (
    echo ❌ Error: No se encuentra package.json
    echo Ejecuta desde el directorio raíz del proyecto
    exit /b 1
)

REM Limpiar builds anteriores
echo 🧹 Limpiando builds anteriores...
if exist ".next" rmdir /s /q ".next"
if exist "node_modules" rmdir /s /q "node_modules"
if exist "package-lock.json" del "package-lock.json"
if exist "pnpm-lock.yaml" del "pnpm-lock.yaml"

REM Instalar con npm (más compatible con Windows)
echo 📦 Instalando dependencias con npm...
npm install

if "%MODE%"=="dev" goto :build_dev
if "%MODE%"=="docker" goto :build_docker

:build_dev
echo 🔨 Build para desarrollo...
npm run build
if %errorlevel% neq 0 (
    echo ❌ Error en build de desarrollo
    echo 💡 Prueba ejecutar como Administrador
    exit /b 1
)
echo ✅ Build exitoso para desarrollo
goto :end

:build_docker
echo 🐳 Build para Docker (sin symlinks)...
docker-compose -f docker-compose.windows.yml down 2>nul
docker system prune -f
docker-compose -f docker-compose.windows.yml up --build -d

if %errorlevel% neq 0 (
    echo ❌ Error en build de Docker
    echo 💡 Verifica que Docker esté corriendo
    exit /b 1
)

echo ✅ Docker build exitoso
echo 📱 Aplicación disponible en: http://localhost:6012
goto :end

:end
echo.
echo 🎉 Deployment completado!
echo.
echo 💡 Comandos útiles:
echo    - Deploy desarrollo: deploy-windows.bat dev
echo    - Deploy Docker: deploy-windows.bat docker
echo    - Ver logs: docker-compose -f docker-compose.windows.yml logs -f 