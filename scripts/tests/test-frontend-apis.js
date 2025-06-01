// Script para probar las APIs de proyectos directamente
const http = require('http');

console.log('🧪 Probando APIs de proyectos...\n');

// Función para hacer requests HTTP
function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: parsed
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: body
          });
        }
      });
    });

    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

async function testAPIs() {
  const baseOptions = {
    hostname: 'localhost',
    port: 3000,
    headers: {
      'Content-Type': 'application/json',
    }
  };

  try {
    // 1. Probar login primero
    console.log('🔐 1. Probando login...');
    const loginResponse = await makeRequest({
      ...baseOptions,
      path: '/api/auth/login',
      method: 'POST'
    }, {
      email: 'dev@smartway.com.ar',
      password: 'admin123'
    });

    console.log(`   Status: ${loginResponse.status}`);
    if (loginResponse.status !== 200) {
      console.log('❌ Login falló');
      console.log('   Response:', loginResponse.data);
      return;
    }

    // Extraer cookies de autenticación
    const cookies = loginResponse.headers['set-cookie'];
    const cookieHeader = cookies ? cookies.join('; ') : '';
    console.log('✅ Login exitoso');

    // 2. Probar obtener proyectos
    console.log('\n📋 2. Probando GET /api/projects...');
    const getProjectsResponse = await makeRequest({
      ...baseOptions,
      path: '/api/projects',
      method: 'GET',
      headers: {
        ...baseOptions.headers,
        'Cookie': cookieHeader
      }
    });

    console.log(`   Status: ${getProjectsResponse.status}`);
    if (getProjectsResponse.status === 200) {
      console.log('✅ GET projects exitoso');
      console.log(`   Proyectos encontrados: ${getProjectsResponse.data.projects?.length || 0}`);
    } else {
      console.log('❌ GET projects falló');
      console.log('   Response:', getProjectsResponse.data);
    }

    // 3. Probar crear proyecto
    console.log('\n➕ 3. Probando POST /api/projects (crear)...');
    const newProject = {
      name: 'Proyecto de Prueba API',
      description: 'Este es un proyecto creado para probar la API desde el servidor',
      client: 'Cliente de Prueba',
      status: 'active',
      techStack: ['JavaScript', 'Node.js', 'Next.js'],
      environments: [
        { name: 'Desarrollo', url: 'https://dev.ejemplo.com' },
        { name: 'Producción', url: 'https://ejemplo.com' }
      ],
      docsUrl: 'https://docs.ejemplo.com',
      gitlabUrl: 'https://gitlab.com/proyecto-prueba'
    };

    const createResponse = await makeRequest({
      ...baseOptions,
      path: '/api/projects',
      method: 'POST',
      headers: {
        ...baseOptions.headers,
        'Cookie': cookieHeader
      }
    }, newProject);

    console.log(`   Status: ${createResponse.status}`);
    if (createResponse.status === 201) {
      console.log('✅ CREATE project exitoso');
      console.log(`   Proyecto creado: ${createResponse.data.project?.name}`);
      console.log(`   ID: ${createResponse.data.project?.id}`);
      
      // 4. Probar editar el proyecto recién creado
      const projectId = createResponse.data.project?.id;
      if (projectId) {
        console.log('\n✏️ 4. Probando PUT /api/projects/[id] (editar)...');
        const updateData = {
          name: 'Proyecto de Prueba API - EDITADO',
          description: 'Este proyecto ha sido editado para probar la API',
          client: 'Cliente de Prueba - EDITADO',
          status: 'maintenance',
          techStack: ['JavaScript', 'Node.js', 'Next.js', 'React'],
          environments: [
            { name: 'Desarrollo', url: 'https://dev.ejemplo.com' },
            { name: 'QA', url: 'https://qa.ejemplo.com' },
            { name: 'Producción', url: 'https://ejemplo.com' }
          ]
        };

        const updateResponse = await makeRequest({
          ...baseOptions,
          path: `/api/projects/${projectId}`,
          method: 'PUT',
          headers: {
            ...baseOptions.headers,
            'Cookie': cookieHeader
          }
        }, updateData);

        console.log(`   Status: ${updateResponse.status}`);
        if (updateResponse.status === 200) {
          console.log('✅ UPDATE project exitoso');
          console.log(`   Proyecto actualizado: ${updateResponse.data.project?.name}`);
        } else {
          console.log('❌ UPDATE project falló');
          console.log('   Response:', updateResponse.data);
        }

        // 5. Probar eliminar el proyecto
        console.log('\n🗑️ 5. Probando DELETE /api/projects/[id] (eliminar)...');
        const deleteResponse = await makeRequest({
          ...baseOptions,
          path: `/api/projects/${projectId}`,
          method: 'DELETE',
          headers: {
            ...baseOptions.headers,
            'Cookie': cookieHeader
          }
        });

        console.log(`   Status: ${deleteResponse.status}`);
        if (deleteResponse.status === 200) {
          console.log('✅ DELETE project exitoso');
        } else {
          console.log('❌ DELETE project falló');
          console.log('   Response:', deleteResponse.data);
        }
      }
    } else {
      console.log('❌ CREATE project falló');
      console.log('   Response:', createResponse.data);
    }

  } catch (error) {
    console.log('❌ Error durante las pruebas:', error.message);
  }
}

console.log('🚀 Iniciando pruebas de APIs...\n');
testAPIs().then(() => {
  console.log('\n🏁 Pruebas completadas');
}).catch((error) => {
  console.log('\n💥 Error:', error.message);
}); 