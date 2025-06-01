// Test para verificar que las nuevas credenciales del admin funcionan
const fs = require('fs').promises;
const path = require('path');

async function testAdminCredentials() {
  try {
    console.log('🔍 Verificando nuevas credenciales del admin...\n');

    // 1. Verificar que la base de datos tiene el nuevo email
    const dbPath = path.join(__dirname, '../../database.json');
    const dbContent = await fs.readFile(dbPath, 'utf8');
    const db = JSON.parse(dbContent);
    
    const admin = db.users.find(u => u.role === 'admin');
    console.log('📊 Usuario admin encontrado:');
    console.log(`   Email: ${admin.email}`);
    console.log(`   Role: ${admin.role}`);
    console.log(`   Status: ${admin.status}\n`);

    if (admin.email !== 'dev@smartway.com.ar') {
      throw new Error(`❌ Email incorrecto: ${admin.email} (esperado: dev@smartway.com.ar)`);
    }

    // 2. Test de login con las nuevas credenciales
    console.log('🧪 Probando login con nuevas credenciales...');
    
    const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'dev@smartway.com.ar',
        password: 'admin123'
      }),
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Login exitoso!');
      console.log(`   Usuario: ${data.user.name}`);
      console.log(`   Email: ${data.user.email}`);
      console.log(`   Role: ${data.user.role}\n`);
    } else {
      const error = await response.text();
      throw new Error(`❌ Login falló: ${response.status} - ${error}`);
    }

    // 3. Verificar que el email anterior no funciona
    console.log('🧪 Verificando que el email anterior no funciona...');
    
    const oldResponse = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@smartway.com',
        password: 'admin123'
      }),
    });

    if (oldResponse.status === 404) {
      console.log('✅ Email anterior correctamente deshabilitado\n');
    } else {
      throw new Error(`❌ El email anterior aún funciona: ${oldResponse.status}`);
    }

    console.log('🎉 Todas las verificaciones pasaron!');
    console.log('\n📋 Nuevas credenciales confirmadas:');
    console.log('   Email: dev@smartway.com.ar');
    console.log('   Password: admin123');

  } catch (error) {
    console.error('❌ Error en el test:', error.message);
    process.exit(1);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  testAdminCredentials();
}

module.exports = testAdminCredentials; 