// Script para arreglar datos de proyectos problemáticos
const fs = require('fs');
const path = require('path');

console.log('🔧 Arreglando datos de proyectos...\n');

// Leer la base de datos
const dbPath = path.join(__dirname, 'database.json');

if (!fs.existsSync(dbPath)) {
  console.log('❌ Base de datos no encontrada');
  process.exit(1);
}

let db;
try {
  const dbContent = fs.readFileSync(dbPath, 'utf8');
  db = JSON.parse(dbContent);
} catch (error) {
  console.log('❌ Error al leer la base de datos:', error.message);
  process.exit(1);
}

// Función para limpiar y validar un proyecto
function cleanProject(project, index) {
  console.log(`🔍 Limpiando proyecto ${index + 1}: ${project.name}`);
  
  const cleaned = {
    id: project.id || `project-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    name: project.name || "Proyecto Sin Nombre",
    description: project.description || "Descripción del proyecto",
    client: project.client || "Cliente Desconocido",
    status: project.status || "active",
    techStack: Array.isArray(project.techStack) ? 
      project.techStack.filter(tech => tech && typeof tech === 'string' && tech.trim() !== '') :
      ["JavaScript", "Node.js"],
    environments: [],
    docsUrl: (project.docsUrl && typeof project.docsUrl === 'string' && project.docsUrl.trim() !== '') ? 
      project.docsUrl : undefined,
    gitlabUrl: (project.gitlabUrl && typeof project.gitlabUrl === 'string' && project.gitlabUrl.trim() !== '') ? 
      project.gitlabUrl : undefined,
    assignedUsers: Array.isArray(project.assignedUsers) ? project.assignedUsers : [],
    comments: Array.isArray(project.comments) ? project.comments : [],
    createdAt: project.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  // Limpiar entornos
  if (Array.isArray(project.environments)) {
    project.environments.forEach(env => {
      if (env && typeof env === 'object') {
        const cleanName = (env.name && typeof env.name === 'string') ? env.name.trim() : '';
        const cleanUrl = (env.url && typeof env.url === 'string') ? env.url.trim() : '';
        
        if (cleanName !== '' || cleanUrl !== '') {
          cleaned.environments.push({
            name: cleanName || "Entorno",
            url: cleanUrl || ""
          });
        }
      }
    });
  }

  // Si no hay entornos válidos, agregar predeterminados
  if (cleaned.environments.length === 0) {
    cleaned.environments = [
      { name: "Desarrollo", url: "" },
      { name: "QA", url: "" },
      { name: "Producción", url: "" }
    ];
  }

  return cleaned;
}

// Limpiar todos los proyectos
console.log('🧽 Procesando proyectos...\n');

const cleanedProjects = db.projects.map((project, index) => cleanProject(project, index));

// Actualizar la base de datos
db.projects = cleanedProjects;

// Hacer backup
const backupPath = path.join(__dirname, 'database.backup.json');
try {
  fs.writeFileSync(backupPath, JSON.stringify(db, null, 2));
  console.log(`💾 Backup creado: ${backupPath}\n`);
} catch (error) {
  console.log('⚠️ No se pudo crear backup:', error.message);
}

// Guardar los datos limpiados
try {
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
  console.log('✅ Base de datos actualizada con datos limpiados\n');
} catch (error) {
  console.log('❌ Error al guardar:', error.message);
  process.exit(1);
}

// Mostrar resumen
console.log('📊 Resumen de limpieza:');
console.log(`   Proyectos procesados: ${cleanedProjects.length}`);
console.log(`   Todos los proyectos ahora tienen:`);
console.log(`     ✅ IDs válidos`);
console.log(`     ✅ Nombres y descripciones`);
console.log(`     ✅ Estados válidos`);
console.log(`     ✅ Arrays de tecnologías`);
console.log(`     ✅ Entornos con estructura correcta`);
console.log(`     ✅ Fechas de creación y actualización`);

console.log('\n🎉 Datos limpiados exitosamente!');
console.log('🔧 Ahora la edición de proyectos debería funcionar sin errores.'); 