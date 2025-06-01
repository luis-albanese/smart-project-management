# 🗄️ Base de Datos en Docker - Smartway Project Management

## 📋 **Resumen**

La aplicación usa un sistema de base de datos JSON para almacenar usuarios y proyectos. Esta documentación explica cómo funciona en entorno Docker y cómo gestionarla.

## 🏗️ **Arquitectura de la Base de Datos**

### **En Desarrollo Local:**
```
project-root/
├── database.json          # Base de datos local
├── database.backup.json   # Respaldo automático
└── lib/database.ts        # Lógica de acceso a datos
```

### **En Docker:**
```
/app/
├── data/
│   └── database.json      # Base de datos persistente
└── .next/                 # Aplicación compilada
```

## ✅ **Configuración Actual de Persistencia**

### **1. Volúmenes Docker Configurados:**

**Docker Compose Normal (`docker-compose.yml`):**
```yaml
volumes:
  - smartway_project_management_data:/app/data

volumes:
  smartway_project_management_data:
    driver: local
```

**Docker Compose Producción (`docker-compose.prod.yml`):**
```yaml
volumes:
  - smartway_project_management_data:/app/data

volumes:
  smartway_project_management_data:
    driver: local
```

### **2. Configuración de Rutas:**
```typescript
// En lib/database.ts
const dbPath = process.env.NODE_ENV === 'production' 
  ? '/app/data/database.json'    // Docker
  : path.join(process.cwd(), 'database.json');  // Local
```

### **3. Permisos en Dockerfile:**
```dockerfile
# Crear directorio con permisos correctos
RUN mkdir -p /app/data && chown nextjs:nodejs /app/data

# Copiar base de datos inicial si existe
COPY --from=builder --chown=nextjs:nodejs /app/database.json* /app/data/
```

## 🔧 **Gestión de la Base de Datos**

### **Inicialización Automática:**
- Si no existe `database.json`, se crea automáticamente
- Se crea el usuario admin por defecto:
  - **Email:** `dev@smartway.com.ar`
  - **Password:** `admin123`
  - **Rol:** `admin`

### **Comandos Útiles:**

#### **Ver datos del volumen:**
```bash
# Inspeccionar el volumen
docker volume inspect smartway_project_management_data

# Ver archivos en el volumen
docker compose exec smartway-app ls -la /app/data/
```

#### **Backup de la base de datos:**
```bash
# Desde contenedor en ejecución
docker compose exec smartway-app cat /app/data/database.json > backup-$(date +%Y%m%d-%H%M%S).json

# Copiar desde volumen
docker run --rm -v smartway_project_management_data:/data alpine tar -czf - -C /data . > database-backup-$(date +%Y%m%d-%H%M%S).tar.gz
```

#### **Restaurar base de datos:**
```bash
# Copiar archivo al contenedor
docker compose cp backup.json smartway-app:/app/data/database.json

# Reiniciar para aplicar cambios
docker compose restart smartway-app
```

#### **Resetear base de datos:**
```bash
# Detener contenedor
docker compose down

# Eliminar volumen (CUIDADO: Borra todos los datos)
docker volume rm smartway_project_management_data

# Reiniciar (se creará nueva base de datos)
docker compose up -d
```

## 📊 **Monitoreo de la Base de Datos**

### **Ver logs de la base de datos:**
```bash
docker compose logs smartway-app | grep -i database
```

### **Verificar estado de la base de datos:**
```bash
# Endpoint de health check
curl http://localhost:6012/api/health

# Ver estadísticas
curl http://localhost:6012/api/stats
```

## 🔄 **Migración de Datos**

### **De desarrollo a Docker:**
```bash
# 1. Backup de datos locales
cp database.json database-backup-local.json

# 2. Copiar al contenedor Docker
docker compose cp database.json smartway-app:/app/data/

# 3. Reiniciar contenedor
docker compose restart smartway-app
```

### **Entre entornos Docker:**
```bash
# 1. Backup del entorno origen
docker compose exec smartway-app cat /app/data/database.json > migration-data.json

# 2. En el entorno destino
docker compose cp migration-data.json smartway-app:/app/data/database.json
docker compose restart smartway-app
```

## 🚨 **Consideraciones Importantes**

### **✅ Ventajas del sistema actual:**
- **Simplicidad:** No requiere servidor de base de datos externo
- **Portabilidad:** Todo en un solo archivo JSON
- **Backup fácil:** Archivo único para respaldar
- **Desarrollo rápido:** No hay configuración compleja

### **⚠️ Limitaciones:**
- **Concurrencia:** Limitada para múltiples usuarios simultáneos
- **Rendimiento:** Puede degradarse con muchos datos
- **Transacciones:** No hay soporte nativo para transacciones ACID

### **🔮 Migración futura a base de datos real:**

Si en el futuro necesitas migrar a PostgreSQL/MongoDB:

1. **Mantener la interfaz actual** en `lib/database.ts`
2. **Cambiar la implementación** por queries SQL/NoSQL
3. **Los datos JSON** se pueden importar fácilmente

## 📋 **Estructura de Datos**

```typescript
interface Database {
  users: User[];      // Usuarios del sistema
  projects: Project[]; // Proyectos
}

interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: 'admin' | 'manager' | 'developer' | 'designer';
  department: string;
  status: 'active' | 'inactive';
  // ... más campos
}

interface Project {
  id: string;
  name: string;
  description: string;
  client: string;
  environments: Environment[];
  techStack: string[];
  status: 'active' | 'maintenance' | 'completed' | 'paused' | 'archived';
  // ... más campos
}
```

## 🔐 **Seguridad**

- **Passwords hasheados** con bcrypt
- **JWT tokens** para autenticación
- **Permisos por rol** implementados
- **Validación** en todas las APIs

## 🆘 **Troubleshooting**

### **Problema: Base de datos no persiste**
```bash
# Verificar volumen
docker volume ls | grep smartway

# Si no existe el volumen, recrear:
docker compose down
docker compose up -d
```

### **Problema: Permisos denegados**
```bash
# Verificar permisos en el contenedor
docker compose exec smartway-app ls -la /app/data/

# Si hay problemas, reconstruir imagen:
docker compose down
docker compose build --no-cache
docker compose up -d
```

### **Problema: Datos corruptos**
```bash
# Validar JSON
docker compose exec smartway-app cat /app/data/database.json | jq .

# Si está corrupto, restaurar backup:
docker compose cp backup.json smartway-app:/app/data/database.json
docker compose restart smartway-app
```

---

**💡 Tip:** Para entornos de producción críticos, considera implementar backups automáticos programados del volumen Docker. 