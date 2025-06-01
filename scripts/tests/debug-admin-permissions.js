// const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000';

async function debugAdminPermissions() {
  console.log('🔍 DEBUGGING ADMIN PERMISSIONS\n');

  try {
    // 1. Login como admin
    console.log('1. 🔐 Intentando login como admin...');
    const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'dev@smartway.com.ar',
        password: 'admin123'
      }),
    });

    if (!loginResponse.ok) {
      console.log('❌ Error en login:', await loginResponse.text());
      return;
    }

    const loginData = await loginResponse.json();
    console.log('✅ Login exitoso');

    // Extraer cookies
    const cookies = loginResponse.headers.get('set-cookie');
    console.log('🍪 Cookies recibidas:', cookies);

    // 2. Verificar /api/auth/me
    console.log('\n2. 👤 Verificando /api/auth/me...');
    const meResponse = await fetch(`${BASE_URL}/api/auth/me`, {
      headers: {
        'Cookie': cookies || ''
      }
    });

    if (!meResponse.ok) {
      console.log('❌ Error en /api/auth/me:', await meResponse.text());
      return;
    }

    const userData = await meResponse.json();
    console.log('✅ Datos del usuario:', JSON.stringify(userData, null, 2));

    // 3. Verificar estructura de respuesta
    console.log('\n3. 🔍 Analizando estructura de respuesta...');
    console.log('- userData.user:', userData.user ? 'EXISTS' : 'MISSING');
    console.log('- userData.role:', userData.role || 'MISSING');
    console.log('- userData.user?.role:', userData.user?.role || 'MISSING');

    // 4. Simular lógica del hook usePermissions
    console.log('\n4. ⚙️ Simulando lógica de permisos...');
    const user = userData.user || userData;
    console.log('- Usuario extraído:', user);
    console.log('- Rol del usuario:', user.role);

    // Calcular permisos como en el hook
    const permissions = {
      canCreateProjects: false,
      canEditProjects: false,
      canDeleteProjects: false,
      canViewUsers: false,
      canCreateUsers: false,
      canEditUsers: false,
      canDeleteUsers: false,
      canViewStats: false,
      canAssignUsers: false,
    };

    if (user.role === 'admin') {
      permissions.canCreateProjects = true;
      permissions.canEditProjects = true;
      permissions.canDeleteProjects = true;
      permissions.canViewUsers = true;
      permissions.canCreateUsers = true;
      permissions.canEditUsers = true;
      permissions.canDeleteUsers = true;
      permissions.canViewStats = true;
      permissions.canAssignUsers = true;
    }

    console.log('✅ Permisos calculados:', JSON.stringify(permissions, null, 2));

    // 5. Verificar tabs que deberían aparecer
    console.log('\n5. 📋 Tabs que deberían aparecer para admin:');
    const tabs = [
      { name: 'Dashboard', permission: null },
      { name: 'Nuevo Proyecto', permission: 'canCreateProjects' },
      { name: 'Estadísticas', permission: 'canViewStats' },
      { name: 'Usuarios', permission: 'canViewUsers' },
    ];

    tabs.forEach(tab => {
      const shouldShow = !tab.permission || permissions[tab.permission];
      console.log(`- ${tab.name}: ${shouldShow ? '✅ VISIBLE' : '❌ OCULTO'}`);
    });

  } catch (error) {
    console.error('❌ Error general:', error.message);
  }
}

debugAdminPermissions(); 