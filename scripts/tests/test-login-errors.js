const BASE_URL = 'http://localhost:3000';

async function testLoginErrors() {
  console.log('🧪 TESTING LOGIN ERRORS\n');

  const testCases = [
    {
      name: 'Credenciales incorrectas',
      data: { email: 'dev@smartway.com.ar', password: 'wrong_password' },
      expectedStatus: 401
    },
    {
      name: 'Usuario inexistente',
      data: { email: 'noexiste@smartway.com', password: 'admin123' },
      expectedStatus: 401
    },
    {
      name: 'Email vacío',
      data: { email: '', password: 'admin123' },
      expectedStatus: 400
    },
    {
      name: 'Contraseña vacía',
      data: { email: 'dev@smartway.com.ar', password: '' },
      expectedStatus: 400
    },
    {
      name: 'Credenciales correctas',
      data: { email: 'dev@smartway.com.ar', password: 'admin123' },
      expectedStatus: 200
    }
  ];

  for (const testCase of testCases) {
    try {
      console.log(`🔍 Probando: ${testCase.name}`);
      
      const response = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testCase.data),
      });

      const data = await response.json();
      
      console.log(`   Status: ${response.status} (esperado: ${testCase.expectedStatus})`);
      console.log(`   Respuesta:`, data);
      
      if (response.status === testCase.expectedStatus) {
        console.log(`   ✅ CORRECTO\n`);
      } else {
        console.log(`   ❌ INCORRECTO - Status no coincide\n`);
      }
      
    } catch (error) {
      console.log(`   ❌ ERROR:`, error.message);
    }
  }
}

testLoginErrors(); 