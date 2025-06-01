// Script para probar la edición de proyectos
const fs = require('fs');
const path = require('path');

console.log('🧪 Probando datos de proyectos para edición...\n');

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

// Verificar estructura de proyectos
console.log('📋 Verificando estructura de proyectos...');

if (!db.projects || !Array.isArray(db.projects)) {
  console.log('❌ No se encontraron proyectos');
  process.exit(1);
}

console.log(`✅ ${db.projects.length} proyectos encontrados\n`);

// Analizar cada proyecto
db.projects.forEach((project, index) => {
  console.log(`🔍 Proyecto ${index + 1}: ${project.name || 'Sin nombre'}`);
  
  // Verificar campos requeridos
  const issues = [];
  
  if (!project.id) issues.push('❌ Sin ID');
  if (!project.name) issues.push('❌ Sin nombre');
  if (!project.description) issues.push('❌ Sin descripción');
  if (!project.client) issues.push('❌ Sin cliente');
  if (!project.status) issues.push('❌ Sin estado');
  
  // Verificar techStack
  if (!project.techStack) {
    issues.push('❌ techStack undefined');
  } else if (!Array.isArray(project.techStack)) {
    issues.push('❌ techStack no es array');
  } else if (project.techStack.length === 0) {
    issues.push('⚠️ techStack vacío');
  } else {
    // Verificar elementos del techStack
    const invalidTech = project.techStack.find(tech => 
      typeof tech !== 'string' || tech === null || tech === undefined
    );
    if (invalidTech !== undefined) {
      issues.push(`❌ techStack con elementos inválidos: ${invalidTech}`);
    }
  }
  
  // Verificar environments
  if (!project.environments) {
    issues.push('❌ environments undefined');
  } else if (!Array.isArray(project.environments)) {
    issues.push('❌ environments no es array');
  } else {
    // Verificar cada environment
    project.environments.forEach((env, envIndex) => {
      if (!env) {
        issues.push(`❌ environment ${envIndex} es null/undefined`);
      } else {
        if (typeof env.name !== 'string') {
          issues.push(`❌ environment ${envIndex} sin nombre válido`);
        }
        if (typeof env.url !== 'string') {
          issues.push(`❌ environment ${envIndex} sin URL válida`);
        }
      }
    });
  }
  
  // Verificar URLs opcionales
  if (project.docsUrl && typeof project.docsUrl !== 'string') {
    issues.push('❌ docsUrl no es string');
  }
  if (project.gitlabUrl && typeof project.gitlabUrl !== 'string') {
    issues.push('❌ gitlabUrl no es string');
  }
  
  // Mostrar resultados
  if (issues.length === 0) {
    console.log('   ✅ Estructura correcta');
  } else {
    console.log('   Problemas encontrados:');
    issues.forEach(issue => console.log(`     ${issue}`));
  }
  
  console.log(''); // Línea en blanco
});

console.log('🎯 Resumen:');
const totalProjects = db.projects.length;
const validProjects = db.projects.filter(project => {
  return project.id && 
         project.name && 
         project.description && 
         project.client && 
         project.status &&
         Array.isArray(project.techStack) &&
         Array.isArray(project.environments);
}).length;

console.log(`   Total proyectos: ${totalProjects}`);
console.log(`   Proyectos válidos: ${validProjects}`);
console.log(`   Proyectos con problemas: ${totalProjects - validProjects}`);

if (validProjects === totalProjects) {
  console.log('\n🎉 Todos los proyectos tienen estructura válida para edición');
} else {
  console.log('\n⚠️ Algunos proyectos pueden causar errores al editar');
}

console.log('\n🔧 Ejemplo de estructura correcta:');
console.log(JSON.stringify({
  id: "project-123",
  name: "Proyecto Ejemplo",
  description: "Descripción del proyecto",
  client: "Cliente XYZ",
  status: "active",
  techStack: ["React", "Node.js", "MongoDB"],
  environments: [
    { name: "Desarrollo", url: "https://dev.ejemplo.com" },
    { name: "Producción", url: "https://ejemplo.com" }
  ],
  docsUrl: "https://docs.ejemplo.com",
  gitlabUrl: "https://gitlab.com/proyecto",
  assignedUsers: [],
  comments: [],
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z"
}, null, 2)); 