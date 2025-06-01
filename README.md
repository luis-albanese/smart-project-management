# Sistema de Gestión de Proyectos SmartWay

Sistema completo de gestión de proyectos desarrollado con Next.js, TypeScript y una base de datos JSON para una fábrica de software.

## 🚀 Características

### ✅ Autenticación y Autorización
- Sistema de login con JWT y cookies seguras
- Roles de usuario: Admin, Manager, Developer, Designer
- Rutas protegidas con middleware
- Sesiones persistentes

### 👥 Gestión de Usuarios
- CRUD completo de usuarios
- Asignación de proyectos a usuarios
- Perfiles con departamentos y roles
- Control de estado (activo/inactivo)

### 📁 Gestión de Proyectos
- CRUD completo de proyectos
- Estados: Activo, Completado, Mantenimiento, Pausado
- Prioridades: Baja, Media, Alta
- Tecnologías y ambientes de desarrollo
- Asignación de usuarios a proyectos
- Sistema de comentarios
- **Vista detallada completa** - Modal con toda la información del proyecto

### 📊 Panel de Estadísticas
- KPIs en tiempo real
- Distribución por estados de proyectos
- Proyectos por cliente
- Tecnologías más utilizadas
- Métricas de usuarios y rendimiento

### 🔐 Seguridad
- Passwords encriptados con bcrypt
- Tokens JWT con firma segura
- Validación de permisos por rol
- Protección contra auto-eliminación
- Sincronización bidireccional de datos

## 🛠️ Instalación

1. **Clonar el repositorio**
```bash
git clone <repository-url>
cd project-management
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Verificar sistema**
```bash
npm run check
```

4. **Poblar la base de datos con datos de prueba**
```bash
npm run seed
```

5. **Iniciar el servidor de desarrollo**
```bash
npm run dev
```

6. **Acceder a la aplicación**
```
http://localhost:3000
```

## 👤 Usuarios de Prueba

### Usuario Admin
- **Email:** dev@smartway.com.ar
- **Password:** admin123
- **Permisos:** Acceso total al sistema

### Usuarios Generados
Después de ejecutar `npm run seed`, tendrás 4 usuarios adicionales:
- **Carlos Mendoza** (Developer) - carlos.mendoza@smartway.com
- **Ana García** (Designer) - ana.garcia@smartway.com  
- **Luis Rodriguez** (Manager) - luis.rodriguez@smartway.com
- **María González** (Developer) - maria.gonzalez@smartway.com

**Password para todos:** `password123`

## 📊 Datos de Prueba

El script de seed genera:
- **5 usuarios** (incluyendo admin)
- **10 proyectos** diversos con clientes reales
- **Asignaciones automáticas** usuario-proyecto
- **Tecnologías variadas** (React, Vue, Angular, Node.js, Python, etc.)
- **Estados realistas** de proyectos
- **Fechas coherentes** para estadísticas

## 🏗️ Arquitectura

### Frontend
- **Next.js 15** con App Router
- **TypeScript** para tipado fuerte
- **Tailwind CSS** para estilos
- **shadcn/ui** para componentes
- **React Hook Form + Zod** para formularios

### Backend
- **API Routes** de Next.js
- **Base de datos JSON** para simplicidad
- **JWT con jose** para autenticación
- **bcryptjs** para encriptación
- **Middleware** para protección de rutas

### Estructura de Datos
```
database.json
├── users[]
│   ├── id, name, email, password
│   ├── role, department, status
│   ├── assignedProjects[]
│   └── createdAt, updatedAt, lastLogin
└── projects[]
    ├── id, name, description, client
    ├── status, priority, dates
    ├── techStack[], environments[]
    ├── assignedUsers[], comments[]
    └── createdAt, updatedAt
```

## 🔧 Scripts Disponibles

```bash
# Desarrollo
npm run dev          # Servidor de desarrollo
npm run build        # Build para producción
npm run start        # Servidor de producción

# Utilidades
npm run lint         # Linter de código
npm run seed         # Poblar base de datos
npm run check        # Verificar sistema
npm run test-api     # Probar APIs (servidor debe estar corriendo)
npm run test:details # Verificar funcionalidad de detalles del proyecto
npm run test:roles   # Verificar restricciones de permisos por rol
```

## 🚨 Troubleshooting

### Problema: Bucle Infinito o Error "no se puede usar"

**Síntomas:**
- La aplicación se carga infinitamente
- Errores en la consola del navegador
- Páginas en blanco

**Soluciones:**

1. **Reiniciar servidor completamente**
```bash
# En Windows
taskkill /F /IM node.exe
npm run dev

# En Linux/Mac
pkill node
npm run dev
```

2. **Verificar sistema**
```bash
npm run check
```

3. **Limpiar caché del navegador**
- Abrir DevTools (F12)
- Click derecho en el botón de recarga
- Seleccionar "Vaciar caché y recargar forzosamente"

4. **Verificar base de datos**
```bash
# Si no hay datos
npm run seed

# Verificar contenido
cat database.json  # Linux/Mac
type database.json # Windows
```

5. **Probar APIs**
```bash
npm run test-api
```

### Problema: Error de Autenticación

**Solución:**
1. Borrar cookies del navegador
2. Ir a `/login`
3. Usar: dev@smartway.com.ar / admin123

### Problema: Puerto en Uso

```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3000 | xargs kill -9
```

### Problema: Errores de TypeScript

```bash
# Instalar dependencias de tipos
npm install --save-dev @types/node @types/react @types/react-dom

# Verificar versiones
npm list typescript next react
```

## 📱 Funcionalidades por Rol

### 👑 Admin
- **Ver:** Todos los usuarios y proyectos
- **Crear:** Usuarios y proyectos  
- **Editar:** Cualquier usuario o proyecto
- **Eliminar:** Cualquier proyecto (no usuarios con proyectos)
- **Asignar:** Usuarios a proyectos
- **Ver Detalles:** Información completa de cualquier proyecto

### 📋 Manager
- **Ver:** Todos los usuarios y proyectos (solo lectura)
- **Ver Detalles:** Información completa de cualquier proyecto
- **Crear:** No permitido
- **Editar:** No permitido
- **Eliminar:** No permitido

### 💻 Developer/Designer  
- **Ver:** Solo proyectos asignados (solo lectura)
- **Ver Detalles:** Información completa de proyectos asignados
- **Crear:** No permitido
- **Editar:** No permitido
- **Eliminar:** No permitido

### 🚫 Funcionalidades Temporalmente Ocultas
- **Comentarios:** Botón de comentarios oculto para todos los roles

## 🎨 Interfaz

### Navegación
- **Dashboard** - Vista principal con proyectos
- **Usuarios** - Gestión de equipo
- **Estadísticas** - Métricas y dashboards
- **Login/Logout** - Autenticación

### Componentes Principales
- **ProjectCard** - Tarjeta de proyecto con acciones
- **ProjectDetailsDialog** - Modal de vista completa del proyecto
- **UserCard** - Tarjeta de usuario con proyectos asignados
- **EditProjectDialog** - Modal de edición de proyectos
- **UserDialog** - Modal de edición de usuarios
- **AssignUsersDialog** - Asignación de usuarios a proyectos

## 📈 Estadísticas Disponibles

### KPIs
- Total de proyectos
- Proyectos activos
- Número de clientes
- Tasa de éxito (completados vs pausados)

### Visualizaciones
- **Distribución por estado** - Cards con colores
- **Top clientes** - Lista con contadores
- **Tecnologías populares** - Grid de tecnologías
- **Equipo por roles** - Distribución de usuarios

## 🔄 Sincronización de Datos

El sistema mantiene sincronización bidireccional:
- Al asignar usuario a proyecto → Se actualiza `assignedProjects` del usuario
- Al eliminar proyecto → Se remueve de todos los usuarios asignados
- Al eliminar usuario → Se remueve de todos los proyectos asignados
- Contadores automáticos (`projectsCount`) se actualizan en tiempo real

## 🚨 Características de Seguridad

- **Middleware de autenticación** en todas las rutas protegidas
- **Validación de permisos** basada en roles
- **Encriptación de passwords** con salt rounds
- **Tokens JWT** con expiración configurada
- **Cookies HTTP-only** para prevenir XSS
- **Validación de entrada** con Zod schemas

## 🌐 Navegación y UX

- **Transiciones suaves** entre páginas
- **Estados de carga** en todas las operaciones
- **Notificaciones toast** para feedback
- **Modales responsive** para formularios
- **Guards de autenticación** automáticos
- **Tabs de navegación** intuitivas

## 📝 Desarrollo

Para agregar nuevas funcionalidades:

1. **Nuevos campos en modelos** → Actualizar interfaces en `lib/database.ts`
2. **Nuevas APIs** → Crear routes en `app/api/`
3. **Nuevos componentes** → Usar shadcn/ui base en `components/`
4. **Nuevas páginas** → App Router en `app/`

El sistema está diseñado para ser escalable y fácil de mantener.

## 🎯 Próximas Mejoras

- [ ] Filtros avanzados en listados
- [ ] Exportación de reportes
- [ ] Notificaciones en tiempo real
- [ ] Chat interno del proyecto
- [ ] Timeline de actividades
- [ ] Integración con Git
- [ ] Calendario de proyectos
- [ ] Gestión de archivos 