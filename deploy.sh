#!/bin/bash

# Smartway Project Management - Script de Deployment
# Uso: ./deploy.sh [dev|prod]

set -e

MODE=${1:-dev}
echo "🚀 Iniciando deployment en modo: $MODE"

# Verificar que Docker esté corriendo
if ! docker info > /dev/null 2>&1; then
    echo "❌ Error: Docker no está corriendo"
    exit 1
fi

# Verificar y crear package-lock.json si no existe
check_package_lock() {
    if [ ! -f "package-lock.json" ] && [ -f "pnpm-lock.yaml" ]; then
        echo "📦 Generando package-lock.json desde pnpm-lock.yaml..."
        # Hacer backup del node_modules actual si existe
        if [ -d "node_modules" ]; then
            mv node_modules node_modules.bak
        fi
        # Instalar con npm para generar package-lock.json
        npm install --package-lock-only
        # Restaurar node_modules si había backup
        if [ -d "node_modules.bak" ]; then
            rm -rf node_modules
            mv node_modules.bak node_modules
        fi
        echo "✅ package-lock.json generado"
    elif [ -f "package-lock.json" ]; then
        echo "✅ package-lock.json encontrado"
    else
        echo "⚠️  No se encontró pnpm-lock.yaml ni package-lock.json"
    fi
}

# Función para deployment de desarrollo
deploy_dev() {
    echo "📦 Deployment de Desarrollo (Puerto 6012)"
    
    # Verificar package-lock.json
    check_package_lock
    
    # Parar contenedores existentes
    docker compose down 2>/dev/null || true
    
    # Limpiar recursos antiguos
    docker system prune -f
    
    # Build y ejecutar
    docker compose up --build -d
    
    echo "✅ Aplicación corriendo en http://localhost:6012"
}

# Función para deployment de producción
deploy_prod() {
    echo "🏭 Deployment de Producción (Puerto 6012, HTTPS 6013)"
    
    # Verificar package-lock.json
    check_package_lock
    
    # Verificar JWT_SECRET
    if [ -z "$JWT_SECRET" ]; then
        echo "⚠️  Advertencia: JWT_SECRET no definido"
        echo "💡 Ejecuta: export JWT_SECRET=\"tu_clave_secreta_aqui\""
        read -p "¿Continuar con clave por defecto? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
    
    # Parar contenedores existentes
    docker compose -f docker-compose.prod.yml down 2>/dev/null || true
    
    # Limpiar recursos antiguos
    docker system prune -f
    
    # Build y ejecutar
    docker compose -f docker-compose.prod.yml up --build -d
    
    echo "✅ Aplicación corriendo en:"
    echo "   HTTP:  http://localhost:6012"
    echo "   HTTPS: https://localhost:6013 (si SSL configurado)"
}

# Función para mostrar logs
show_status() {
    echo "📊 Estado de los contenedores:"
    if [ "$MODE" = "prod" ]; then
        docker compose -f docker-compose.prod.yml ps
    else
        docker compose ps
    fi
    
    echo ""
    echo "🔍 Recursos utilizados:"
    echo "Red: smartway_project_management_network"
    echo "Volumen: smartway_project_management_data"
    echo "Puerto: 6012 (HTTP), 6013 (HTTPS)"
}

# Ejecutar según el modo
case $MODE in
    "dev")
        deploy_dev
        ;;
    "prod")
        deploy_prod
        ;;
    "status")
        show_status
        exit 0
        ;;
    *)
        echo "❌ Modo no válido: $MODE"
        echo "💡 Uso: ./deploy.sh [dev|prod|status]"
        exit 1
        ;;
esac

# Esperar a que la aplicación esté lista
echo "⏳ Esperando que la aplicación esté lista..."
sleep 10

# Verificar health check
if curl -f http://localhost:6012/api/health > /dev/null 2>&1; then
    echo "✅ Health check exitoso"
else
    echo "⚠️  Health check falló, verificando logs..."
    if [ "$MODE" = "prod" ]; then
        docker compose -f docker-compose.prod.yml logs --tail=20 smartway-app
    else
        docker compose logs --tail=20 smartway-app
    fi
fi

show_status

echo ""
echo "🎉 Deployment completado!"
echo "📱 Accede a la aplicación en: http://localhost:6012" 