// Test para verificar que la funcionalidad de detalles del proyecto funciona
const fs = require('fs').promises;
const path = require('path');

async function testProjectDetails() {
  try {
    console.log('🔍 Probando funcionalidad de detalles del proyecto...\n');

    // 1. Verificar que la base de datos tiene proyectos
    const dbPath = path.join(__dirname, '../../database.json');
    const dbContent = await fs.readFile(dbPath, 'utf8');
    const db = JSON.parse(dbContent);
    
    console.log('📊 Datos encontrados:');
    console.log(`   Proyectos: ${db.projects?.length || 0}`);
    console.log(`   Usuarios: ${db.users?.length || 0}\n`);

    if (!db.projects || db.projects.length === 0) {
      throw new Error('❌ No hay proyectos en la base de datos. Ejecuta: npm run seed');
    }

    // 2. Verificar componentes creados
    const componentsToCheck = [
      '../../components/project-details-dialog.tsx',
      '../../components/project-card.tsx'
    ];

    console.log('📁 Verificando componentes...');
    for (const componentPath of componentsToCheck) {
      const fullPath = path.join(__dirname, componentPath);
      try {
        await fs.access(fullPath);
        console.log(`   ✅ ${componentPath.split('/').pop()}`);
      } catch {
        throw new Error(`❌ Componente faltante: ${componentPath}`);
      }
    }

    // 3. Verificar que el ProjectDetailsDialog tiene el contenido correcto
    const dialogPath = path.join(__dirname, '../../components/project-details-dialog.tsx');
    const dialogContent = await fs.readFile(dialogPath, 'utf8');
    
    const requiredFeatures = [
      'ProjectDetailsDialog',
      'Información General',
      'Tecnologías',
      'Ambientes',
      'Enlaces',
      'Usuarios Asignados',
      'Comentarios',
      'Fechas'
    ];

    console.log('\n🧪 Verificando características del dialog...');
    for (const feature of requiredFeatures) {
      if (dialogContent.includes(feature)) {
        console.log(`   ✅ ${feature}`);
      } else {
        throw new Error(`❌ Característica faltante: ${feature}`);
      }
    }

    // 4. Verificar que ProjectCard tiene el botón "Ver Detalles"
    const cardPath = path.join(__dirname, '../../components/project-card.tsx');
    const cardContent = await fs.readFile(cardPath, 'utf8');
    
    if (cardContent.includes('Ver Detalles') && cardContent.includes('Eye')) {
      console.log('   ✅ Botón "Ver Detalles" en ProjectCard');
    } else {
      throw new Error('❌ Botón "Ver Detalles" no encontrado en ProjectCard');
    }

    // 5. Mostrar ejemplo de proyecto para detalles
    const sampleProject = db.projects[0];
    console.log('\n📋 Proyecto de ejemplo para pruebas:');
    console.log(`   Nombre: ${sampleProject.name}`);
    console.log(`   Cliente: ${sampleProject.client}`);
    console.log(`   Estado: ${sampleProject.status}`);
    console.log(`   Tecnologías: ${sampleProject.techStack?.join(', ') || 'Ninguna'}`);
    console.log(`   Ambientes: ${sampleProject.environments?.length || 0}`);
    console.log(`   Usuarios asignados: ${sampleProject.assignedUsers?.length || 0}`);
    console.log(`   Comentarios: ${sampleProject.comments?.length || 0}`);

    console.log('\n🎉 Todas las verificaciones pasaron!');
    console.log('\n📱 Para probar la funcionalidad:');
    console.log('1. Ejecuta: npm run dev');
    console.log('2. Ve a: http://localhost:3000');
    console.log('3. Haz login con: dev@smartway.com.ar / admin123');
    console.log('4. En cualquier tarjeta de proyecto, haz clic en ⋮ → 👁️ Ver Detalles');
    console.log('5. Se abrirá un modal con toda la información del proyecto');

  } catch (error) {
    console.error('❌ Error en el test:', error.message);
    process.exit(1);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  testProjectDetails();
}

module.exports = testProjectDetails; 