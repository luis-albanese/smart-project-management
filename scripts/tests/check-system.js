const fs = require('fs');
const path = require('path');

console.log('🔍 Verificando sistema...');

// Verificar base de datos
const dbPath = path.join(process.cwd(), 'database.json');
if (fs.existsSync(dbPath)) {
  try {
    const data = fs.readFileSync(dbPath, 'utf8');
    const db = JSON.parse(data);
    console.log('✅ Base de datos encontrada:');
    console.log(`   - ${db.users?.length || 0} usuarios`);
    console.log(`   - ${db.projects?.length || 0} proyectos`);
  } catch (error) {
    console.log('❌ Error leyendo base de datos:', error.message);
  }
} else {
  console.log('❌ Base de datos no encontrada');
}

// Verificar archivos críticos
const criticalFiles = [
  'app/api/auth/me/route.ts',
  'app/api/stats/route.ts',
  'app/stats/page.tsx',
  'components/auth-guard.tsx',
  'lib/database.ts',
  'lib/auth.ts'
];

console.log('\n📁 Verificando archivos críticos:');
criticalFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - FALTANTE`);
  }
});

console.log('\n🚀 Sistema listo para usar:');
console.log('1. Ejecutar: npm run dev');
console.log('2. Acceder: http://localhost:3000');
console.log('3. Login: dev@smartway.com.ar / admin123');
console.log('\n📊 Para poblar con datos de prueba:');
console.log('npm run seed'); 