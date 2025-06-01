const http = require('http');

function testEndpoint(path, method = 'GET') {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path,
      method,
      timeout: 5000
    };

    const req = http.request(options, (res) => {
      resolve({
        status: res.statusCode,
        path,
        success: res.statusCode < 500
      });
    });

    req.on('error', (err) => {
      resolve({
        status: 'ERROR',
        path,
        error: err.message,
        success: false
      });
    });

    req.on('timeout', () => {
      resolve({
        status: 'TIMEOUT',
        path,
        error: 'Request timeout',
        success: false
      });
    });

    req.end();
  });
}

async function testSystem() {
  console.log('🧪 Probando sistema...\n');

  const endpoints = [
    '/api/auth/me',
    '/api/stats',
    '/api/users',
    '/api/projects',
    '/',
    '/login',
    '/stats'
  ];

  for (const endpoint of endpoints) {
    const result = await testEndpoint(endpoint);
    const icon = result.success ? '✅' : '❌';
    console.log(`${icon} ${endpoint} - ${result.status}`);
    
    if (!result.success && result.error) {
      console.log(`   Error: ${result.error}`);
    }
  }

  console.log('\n🔍 Verificación completa');
}

// Solo ejecutar si el servidor está corriendo
setTimeout(() => {
  testSystem().catch(err => {
    console.log('❌ Error probando sistema:', err.message);
    console.log('💡 Asegúrate de que el servidor esté ejecutándose: npm run dev');
  });
}, 2000); 