# 🚀 Guía de Deployment - SmartWay Project Management

Esta guía te ayudará a desplegar la aplicación de gestión de proyectos SmartWay usando Docker.

## 📋 Prerrequisitos

- **Docker Desktop** instalado y corriendo
- **Git** para clonar el repositorio
- **Puerto 6012** disponible (HTTP)
- **Puerto 6013** disponible (HTTPS para producción)

## 🔧 Métodos de Deployment

### 1. Deployment Rápido de Desarrollo

```bash
# Clonar repositorio
git clone <repository-url>
cd project-management

# Deploy automático
./deploy.sh dev        # Linux/Mac
deploy-windows.bat     # Windows

# Verificar que está corriendo
docker compose up --build -d

# Ver logs
docker compose logs -f

# Parar aplicación
docker compose down
```

**Resultado:** Aplicación disponible en `http://localhost:6012`

### 2. Usar docker compose de producción (con Nginx)

```bash
docker compose -f docker-compose.prod.yml up --build -d
```

**Resultado:** 
- HTTP: `http://localhost:6012`
- HTTPS: `https://localhost:6013` (requiere certificados SSL)

## 🐳 Comandos Docker Útiles

### Logs y Debugging
```bash
# Ver logs en tiempo real
docker compose logs -f smartway-app

# Entrar al contenedor
docker compose exec smartway-app sh

# Backup de base de datos
docker cp $(docker compose ps -q smartway-app):/app/data/database.json ./backup-$(date +%Y%m%d).json

# Restaurar base de datos
docker cp ./backup.json $(docker compose ps -q smartway-app):/app/data/database.json
docker compose restart smartway-app
```

### Mantenimiento
```bash
# Reiniciar aplicación
docker compose down
docker compose up --build -d

# Limpiar recursos Docker
docker system prune -f

# Ver estado de contenedores
docker compose ps

# Ver recursos utilizados
docker stats
```

## 🔍 Verificación del Deployment

### Health Check
```bash
curl http://localhost:6012/api/health
```

**Respuesta esperada:**
```json
{
  "status": "healthy",
  "timestamp": "2024-06-01T02:57:18.617Z",
  "uptime": 45.123
}
```

### Funcionalidad Básica
1. Acceder a `http://localhost:6012`
2. Login con: `dev@smartway.com.ar` / `admin123`
3. Verificar que carga el dashboard
4. Crear un proyecto de prueba

## 🚨 Troubleshooting

### Problema: Puerto ya en uso
```bash
# Encontrar proceso que usa el puerto
netstat -tulpn | grep 6012    # Linux
netstat -ano | findstr :6012  # Windows

# Parar contenedores conflictivos
docker compose down
docker container prune -f
```

### Problema: Error de build
```bash
# Limpiar caché Docker
docker builder prune -f
docker system prune -a -f

# Build limpio
docker compose up --build --force-recreate -d
```

### Problema: Base de datos corrupta
```bash
# Verificar logs: `docker compose logs smartway-app`
# Verificar puertos: `docker compose ps`

# Si es necesario, reiniciar con datos limpios
docker compose down -v  # ⚠️ Elimina la base de datos
./deploy.sh dev         # Crea nueva base de datos
```

### Problema: Aplicación no responde
```bash
# Reiniciar forzado
docker compose down
docker compose up --build -d

# Verificar recursos del sistema
docker stats
```

## 📁 Estructura de Archivos Docker

```
project-management/
├── Dockerfile                 # Build de la aplicación Next.js
├── docker-compose.yml         # Desarrollo/Simple (puerto 6012)
├── docker-compose.prod.yml    # Producción con Nginx (puertos 6012/6013)
├── docker-compose.windows.yml # Específico para Windows (evita symlinks)
├── nginx.conf                 # Configuración de Nginx para producción
├── deploy.sh                  # Script de deploy para Linux/Mac
├── deploy-windows.bat         # Script de deploy para Windows
└── .dockerignore              # Archivos excluidos del build
```

## ⚙️ Variables de Entorno

### Desarrollo
```bash
NODE_ENV=development
PORT=3000
JWT_SECRET=smartway-super-secret-key-2024
```

### Producción
```bash
# Definir antes del deploy
export JWT_SECRET="tu-clave-super-secreta-aqui"
export NODE_ENV="production"

# Luego ejecutar
docker compose -f docker-compose.prod.yml up --build -d
```

## 🔒 Seguridad

### JWT Secret
- **Desarrollo:** Usa clave por defecto
- **Producción:** Definir `JWT_SECRET` personalizada

### Puertos Expuestos
- **6012:** HTTP (siempre disponible)
- **6013:** HTTPS (solo en producción con SSL)

### Base de Datos
- Almacenada en volumen Docker persistente
- Backups automáticos recomendados en producción

## 🌐 Acceso a la Aplicación

### URLs Principales
- **Dashboard:** `http://localhost:6012`
- **Login:** `http://localhost:6012/login`
- **API Health:** `http://localhost:6012/api/health`

### Usuarios por Defecto
- **Admin:** `dev@smartway.com.ar` / `admin123`
- **Manager:** `luis.rodriguez@smartway.com` / `password123`
- **Developer:** `carlos.mendoza@smartway.com` / `password123`

## 🏗️ Arquitectura del Deployment

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│     Nginx       │    │   Next.js App   │    │  JSON Database  │
│   (Producción)  │───▶│   (Port 3000)   │───▶│   (Volumen)     │
│   Ports 6012/13 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
        │                        │                        │
        │                        │                        │
        ▼                        ▼                        ▼
   Load Balancer            Application Logic         Data Storage
   SSL Termination          API Routes                Persistent
   Static Files             Authentication           JSON File
```

## 🔄 Estrategias de Update

### Update de Código
```bash
# Pull nuevo código
git pull origin main

# Rebuild y redeploy
docker compose up --build  # ✅ Funciona en Windows Y Linux
```

### Update de Dependencias
```bash
# Update package.json
npm update

# Rebuild imagen Docker
docker compose build --no-cache
docker compose up -d
```

### Rollback Rápido
```bash
# Volver a versión anterior
git checkout <commit-anterior>
docker compose up --build -d
``` 