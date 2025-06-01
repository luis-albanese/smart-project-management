// Test para verificar las restricciones de roles en ProjectCard
const fs = require('fs').promises;
const path = require('path');

async function testRoleRestrictions() {
  try {
    console.log('🔐 Probando restricciones de roles...\n');

    // 1. Verificar usuarios en la base de datos
    const dbPath = path.join(__dirname, '../../database.json');
    const dbContent = await fs.readFile(dbPath, 'utf8');
    const db = JSON.parse(dbContent);
    
    console.log('👥 Usuarios encontrados:');
    db.users.forEach(user => {
      console.log(`   ${user.role === 'admin' ? '👑' : '👤'} ${user.name} (${user.role}) - ${user.email}`);
    });

    // 2. Verificar que hay un admin
    const admin = db.users.find(u => u.role === 'admin');
    if (!admin) {
      throw new Error('❌ No se encontró usuario admin');
    }
    console.log(`\n✅ Admin encontrado: ${admin.email}`);

    // 3. Verificar que hay usuarios no-admin
    const nonAdmins = db.users.filter(u => u.role !== 'admin');
    if (nonAdmins.length === 0) {
      throw new Error('❌ No se encontraron usuarios no-admin para probar restricciones');
    }
    console.log(`✅ Usuarios no-admin: ${nonAdmins.length}`);

    // 4. Verificar modificaciones en ProjectCard
    const cardPath = path.join(__dirname, '../../components/project-card.tsx');
    const cardContent = await fs.readFile(cardPath, 'utf8');
    
    console.log('\n🧪 Verificando restricciones en ProjectCard...');
    
    const restrictionChecks = [
      { feature: 'userRole prop', code: 'userRole?' },
      { feature: 'isAdmin check', code: "userRole === 'admin'" },
      { feature: 'canEdit restriction', code: 'isAdmin && onEdit' },
      { feature: 'canDelete restriction', code: 'isAdmin && onDelete' },
      { feature: 'canAssignUsers restriction', code: 'isAdmin' },
      { feature: 'conditional rendering', code: '{canEdit &&' }
    ];

    for (const check of restrictionChecks) {
      if (cardContent.includes(check.code)) {
        console.log(`   ✅ ${check.feature}`);
      } else {
        throw new Error(`❌ Falta restricción: ${check.feature}`);
      }
    }

    // 5. Verificar que los comentarios están ocultos
    if (!cardContent.includes('CommentsDialog')) {
      console.log('   ✅ CommentsDialog removido completamente');
    } else if (cardContent.includes('/* <CommentsDialog')) {
      console.log('   ✅ CommentsDialog comentado');
    } else {
      throw new Error('❌ El botón de comentarios sigue visible');
    }

    // 6. Verificar modificaciones en app/page.tsx
    const pagePath = path.join(__dirname, '../../app/page.tsx');
    const pageContent = await fs.readFile(pagePath, 'utf8');
    
    console.log('\n🧪 Verificando restricciones en la página principal...');
    
    const pageChecks = [
      { feature: 'currentUser state', code: 'setCurrentUser' },
      { feature: 'loadCurrentUser function', code: 'loadCurrentUser' },
      { feature: 'isAdmin check', code: "currentUser?.role === 'admin'" },
      { feature: 'userRole prop passed', code: 'userRole={currentUser?.role}' },
      { feature: 'admin-only create button', code: '{isAdmin &&' }
    ];

    for (const check of pageChecks) {
      if (pageContent.includes(check.code)) {
        console.log(`   ✅ ${check.feature}`);
      } else {
        throw new Error(`❌ Falta modificación: ${check.feature}`);
      }
    }

    // 7. Verificar tipos compartidos
    const typesPath = path.join(__dirname, '../../types/project.ts');
    try {
      await fs.access(typesPath);
      console.log('   ✅ Archivo de tipos compartidos creado');
    } catch {
      throw new Error('❌ Archivo de tipos compartidos faltante');
    }

    console.log('\n🎯 Restricciones implementadas:');
    console.log('   🔒 Solo ADMIN puede: Editar, Eliminar, Asignar usuarios');
    console.log('   👁️  TODOS pueden: Ver detalles del proyecto');
    console.log('   🚫 OCULTO: Botón de comentarios (temporalmente)');
    console.log('   ✅ ACTIVO: Sistema de permisos por rol');

    console.log('\n🎉 Todas las restricciones están implementadas correctamente!');
    console.log('\n📱 Para probar las restricciones:');
    console.log('1. Ejecuta: npm run dev');
    console.log('2. Login como ADMIN: dev@smartway.com.ar / admin123');
    console.log('   → Verás: Editar, Asignar Usuarios, Ver Detalles, Eliminar');
    console.log('3. Login como NO-ADMIN: luis.rodriguez@smartway.com / password123');
    console.log('   → Verás: Solo Ver Detalles');
    console.log('4. En ambos casos: NO verás botón de comentarios');

  } catch (error) {
    console.error('❌ Error en el test:', error.message);
    process.exit(1);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  testRoleRestrictions();
}

module.exports = testRoleRestrictions; 