// Script para agregar debugging al frontend
const fs = require('fs');
const path = require('path');

console.log('🔍 Agregando debugging al frontend...\n');

// Leer el ProjectForm para agregar logs
const projectFormPath = path.join(__dirname, 'components', 'project-form.tsx');
const editProjectDialogPath = path.join(__dirname, 'components', 'edit-project-dialog.tsx');

function addDebuggingToFile(filePath, fileName) {
  if (!fs.existsSync(filePath)) {
    console.log(`❌ ${fileName} no encontrado`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  
  // Buscar la función onSubmit
  if (content.includes('async function onSubmit')) {
    console.log(`🔍 Agregando debugging a ${fileName}...`);
    
    // Agregar logs al inicio de onSubmit
    content = content.replace(
      /async function onSubmit\(([^)]+)\) \{/,
      `async function onSubmit($1) {
      console.log('🚀 onSubmit iniciado en ${fileName}');
      console.log('📝 Valores del formulario:', values);`
    );

    // Agregar logs antes de fetch
    content = content.replace(
      /const response = await fetch\(/,
      `console.log('📡 Enviando request a API...');
      console.log('💾 Datos a enviar:', JSON.stringify(updateData || dataToSend, null, 2));
      const response = await fetch(`
    );

    // Agregar logs después de fetch
    content = content.replace(
      /const data = await response\.json\(\)/,
      `console.log('📨 Response status:', response.status);
      console.log('📨 Response ok:', response.ok);
      const data = await response.json();
      console.log('📨 Response data:', data);`
    );

    // Agregar logs en success
    content = content.replace(
      /toast\.success\(/,
      `console.log('✅ Operación exitosa');
      toast.success(`
    );

    // Agregar logs en error
    content = content.replace(
      /toast\.error\(/,
      `console.log('❌ Error en operación:', data.error);
      toast.error(`
    );

    // Escribir el archivo con debugging
    const backupPath = filePath + '.backup';
    fs.writeFileSync(backupPath, fs.readFileSync(filePath));
    fs.writeFileSync(filePath, content);
    
    console.log(`✅ ${fileName} actualizado con debugging`);
    console.log(`💾 Backup creado: ${backupPath}`);
  } else {
    console.log(`⚠️ ${fileName} no tiene función onSubmit detectada`);
  }
}

// Agregar debugging a los archivos principales
addDebuggingToFile(projectFormPath, 'ProjectForm');
addDebuggingToFile(editProjectDialogPath, 'EditProjectDialog');

console.log('\n🔧 Debugging agregado. Ahora revisa la consola del navegador cuando uses las funciones.');
console.log('\n📋 Pasos para debuggear:');
console.log('1. Abre las herramientas de desarrollador (F12)');
console.log('2. Ve a la pestaña "Console"');
console.log('3. Intenta crear o editar un proyecto');
console.log('4. Observa los logs que aparecen');
console.log('\n🔍 Busca especialmente:');
console.log('- Si "onSubmit iniciado" aparece');
console.log('- Si "Enviando request a API" aparece');
console.log('- Qué status code retorna la API');
console.log('- Si hay errores de JavaScript');

console.log('\n💡 Para restaurar los archivos originales:');
console.log('- mv components/project-form.tsx.backup components/project-form.tsx');
console.log('- mv components/edit-project-dialog.tsx.backup components/edit-project-dialog.tsx'); 