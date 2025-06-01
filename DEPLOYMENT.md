# 🚀 Smartway Project Management - Guía de Deployment

## 📋 Requisitos Previos

- Docker y Docker Compose instalados
- Puerto 6012 disponible (puerto principal)
- Puerto 6013 disponible (para HTTPS en producción)
- Al menos 512MB de RAM disponible

## 🏗️ Deployment Simple

### 1. Clonar el repositorio
```bash
git clone <your-repo-url>
cd smartway-project-management
```

### 2. Configurar variables de entorno
```bash
cp env.example .env
```

Editar `.env` y cambiar:
```bash
JWT_SECRET=your_super_secure_jwt_secret_here
```

### 3. Ejecutar con Docker Compose
```bash
# Build y ejecutar
docker-compose up --build -d

# Ver logs
docker-compose logs -f

# Parar
docker-compose down
```

## 🏭 Deployment de Producción

### 1. Configurar variables de entorno de producción
```bash
export JWT_SECRET="your_super_secure_jwt_secret_here"
```

### 2. Usar docker-compose de producción (con Nginx)
```bash
docker-compose -f docker-compose.prod.yml up --build -d
```

### 3. Para HTTPS, configurar SSL en nginx.conf
- Descomenta la sección SSL en `nginx.conf`
- Coloca certificados en la carpeta `ssl/`
- Actualiza `server_name` con tu dominio

## 🔧 Comandos Útiles

### Ver logs de la aplicación
```bash
docker-compose logs -f smartway-app
```

### Acceder al contenedor
```bash
docker-compose exec smartway-app sh
```

### Backup de la base de datos
```bash
docker cp $(docker-compose ps -q smartway-app):/app/data/database.json ./backup-$(date +%Y%m%d).json
```

### Restaurar base de datos
```bash
docker cp ./backup.json $(docker-compose ps -q smartway-app):/app/data/database.json
docker-compose restart smartway-app
```

### Actualizar la aplicación
```bash
git pull
docker-compose down
docker-compose up --build -d
```

### Ver recursos utilizados
```bash
# Ver volúmenes
docker volume ls | grep smartway_project_management

# Ver redes
docker network ls | grep smartway_project_management

# Ver contenedores
docker-compose ps
```

## 🔐 Seguridad

### Variables de entorno importantes:
- `JWT_SECRET`: Clave secreta para JWT (cámbiala en producción)
- `NODE_ENV`: Debe ser `production` en producción

### Configuración de Nginx (incluida):
- Rate limiting en API y login
- Headers de seguridad
- Compresión gzip
- Caché de archivos estáticos

## 📊 Monitoreo

### Health Check
La aplicación expone un endpoint de health check en:
```
GET /api/health
```

### Métricas disponibles:
- Status de la aplicación
- Timestamp
- Uptime
- Environment

## 🐛 Troubleshooting

### La aplicación no inicia:
1. Verificar logs: `docker-compose logs smartway-app`
2. Verificar puertos: `docker-compose ps`
3. Verificar variables de entorno

### Base de datos se pierde:
- Los datos se persisten en el volumen `smartway_project_management_data`
- Para verificar: `docker volume ls | grep smartway_project_management`

### Problemas de permisos:
```bash
docker-compose down
docker-compose up --build -d
```

### Conflictos con otros proyectos:
- Usa red aislada: `smartway_project_management_network`
- Volumen específico: `smartway_project_management_data`
- Puerto específico: `6012` (y `6013` para HTTPS)

## 🌐 URLs

- **Aplicación (Desarrollo)**: http://localhost:6012
- **Health Check**: http://localhost:6012/api/health
- **Con Nginx (Producción)**: http://localhost:6012
- **HTTPS (Producción)**: https://localhost:6013

## 🔌 Puertos Utilizados

- **6012**: Puerto principal HTTP
- **6013**: Puerto HTTPS (solo en producción con Nginx)
- **3000**: Puerto interno del contenedor (no expuesto)

## 👥 Usuarios por Defecto

Los usuarios se crean automáticamente en el primer inicio:
- **Admin**: dev@smartway.com.ar / admin123
- **Manager**: luis.rodriguez@smartway.com / manager123
- **Developer**: carlos.mendoza@smartway.com / dev123

## 📂 Estructura de Archivos Docker

```
project/
├── Dockerfile              # Imagen de la aplicación
├── docker-compose.yml      # Desarrollo/Simple (puerto 6012)
├── docker-compose.prod.yml # Producción con Nginx (puertos 6012/6013)
├── nginx.conf              # Configuración Nginx
├── .dockerignore           # Archivos a ignorar
├── env.example             # Variables de entorno ejemplo
└── DEPLOYMENT.md           # Esta guía
```

## 🏗️ Recursos Docker Específicos

Para evitar conflictos en servidores con múltiples proyectos:

- **Red**: `smartway_project_management_network`
- **Volumen**: `smartway_project_management_data`
- **Puertos**: `6012` (HTTP), `6013` (HTTPS)
- **Contenedor**: `smartway-app`

## 🪟 Windows: Solución a Errores de Symlinks

### ✅ **SOLUCIONADO AUTOMÁTICAMENTE**

**La aplicación ahora detecta automáticamente la plataforma:**
- **Windows**: Build normal (sin standalone) ❌ symlinks
- **Linux**: Build standalone optimizado ✅ para Docker

### Configuración Automática
```javascript
// next.config.mjs - Configuración inteligente
output: process.platform === 'linux' ? 'standalone' : undefined
```

### Comportamiento Por Plataforma

#### 🪟 **Windows** (Desarrollo)
```bash
# Build automáticamente SIN standalone
npm run build  # ✅ Funciona sin problemas de permisos

# Resultado: .next/ (build completo)
# Inicio: npm start
```

#### 🐧 **Linux** (Docker/Producción)  
```bash
# Build automáticamente CON standalone  
npm run build  # ✅ Optimizado para containers

# Resultado: .next/standalone/ (build optimizado)
# Inicio: node server.js
```

### Prueba Rápida en Windows
```cmd
# Script de prueba específico
test-build.bat
```

### ~~Problema Común~~ ✅ **RESUELTO**
~~Error: EPERM: operation not permitted, symlink~~
~~Failed to copy traced files~~

**Ahora estos errores NO ocurren en Windows** porque standalone está desactivado automáticamente.

### ~~Soluciones Rápidas~~ ✅ **YA NO NECESARIAS**

~~#### Opción 1: Ejecutar como Administrador~~
~~#### Opción 2: Habilitar Modo Desarrollador~~
~~#### Opción 3: Usar npm en lugar de pnpm~~

### Docker en Windows
```cmd
# El Dockerfile se adapta automáticamente
docker-compose up --build  # ✅ Funciona en Windows Y Linux
``` 