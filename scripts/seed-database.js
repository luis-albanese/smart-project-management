const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

// Función para generar ID únicos
function generateId(prefix = '') {
  return `${prefix}${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Función para generar fechas aleatorias del último año
function randomDateInLastYear() {
  const now = new Date();
  const yearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
  const randomTime = yearAgo.getTime() + Math.random() * (now.getTime() - yearAgo.getTime());
  return new Date(randomTime).toISOString();
}

// Función para obtener fecha aleatoria de los últimos 6 meses
function randomDateInLast6Months() {
  const now = new Date();
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
  const randomTime = sixMonthsAgo.getTime() + Math.random() * (now.getTime() - sixMonthsAgo.getTime());
  return new Date(randomTime).toISOString();
}

// Datos base para generar contenido realista
const departments = ['Frontend', 'Backend', 'DevOps', 'QA', 'UI/UX'];
const roles = ['developer', 'designer', 'manager'];
const projectStatuses = ['active', 'completed', 'maintenance', 'paused'];
const environments = ['development', 'staging', 'production'];

const techStacks = [
  ['React', 'Next.js', 'TypeScript', 'Tailwind CSS'],
  ['Vue.js', 'Nuxt.js', 'JavaScript', 'SCSS'],
  ['Angular', 'TypeScript', 'RxJS', 'Angular Material'],
  ['Node.js', 'Express', 'MongoDB', 'JWT'],
  ['Python', 'Django', 'PostgreSQL', 'Redis'],
  ['Java', 'Spring Boot', 'MySQL', 'Docker'],
  ['React Native', 'Expo', 'Firebase', 'AsyncStorage'],
  ['Flutter', 'Dart', 'SQLite', 'Provider'],
  ['PHP', 'Laravel', 'MySQL', 'Vue.js'],
  ['C#', '.NET Core', 'SQL Server', 'Entity Framework']
];

const clients = [
  'Banco Nacional',
  'Seguros La Paz',
  'Retail Express',
  'Logística Sur',
  'MedCenter',
  'TechStartup Inc',
  'Universidad Central',
  'Gobierno Municipal',
  'Constructora Beta',
  'Food Delivery'
];

const projectNames = [
  'Sistema de Gestión de Clientes',
  'Plataforma E-commerce',
  'App Mobile Corporativa',
  'Dashboard Analítico',
  'Portal de Empleados',
  'Sistema de Inventario',
  'Aplicación de Delivery',
  'CRM Empresarial',
  'Plataforma de Pagos',
  'Sistema de Reservas',
  'App de Monitoreo',
  'Portal Educativo',
  'Sistema de Facturación',
  'Marketplace Digital',
  'App de Salud'
];

const projectDescriptions = [
  'Desarrollo de una plataforma integral para la gestión de clientes con funcionalidades avanzadas de CRM y analytics.',
  'Creación de un e-commerce completo con carrito de compras, pagos en línea y panel administrativo.',
  'Aplicación móvil nativa para la gestión interna de la empresa con sincronización en tiempo real.',
  'Dashboard interactivo para visualización de métricas de negocio con gráficos dinámicos y reportes.',
  'Portal interno para empleados con gestión de recursos humanos, nóminas y comunicación interna.',
  'Sistema robusto de control de inventario con alertas automáticas y integración con proveedores.',
  'Aplicación de delivery con geolocalización, tracking en tiempo real y sistema de pagos integrado.',
  'Plataforma CRM personalizada para mejorar la gestión de relaciones con clientes y ventas.',
  'Sistema seguro de procesamiento de pagos con múltiples métodos y dashboard de transacciones.',
  'Plataforma de reservas online con calendario dinámico, notificaciones y gestión de disponibilidad.',
  'Aplicación de monitoreo de sistemas con alertas en tiempo real y métricas de rendimiento.',
  'Portal educativo con gestión de cursos, estudiantes y contenido multimedia interactivo.',
  'Sistema automatizado de facturación con generación de reportes y integración contable.',
  'Marketplace digital con múltiples vendedores, sistema de reviews y gestión de comisiones.',
  'Aplicación de salud para seguimiento de pacientes con historiales médicos y telemedicina.'
];

async function generateUsers() {
  const users = [
    // Admin (ya existe, no lo generamos de nuevo)
  ];

  const names = [
    { name: 'Carlos Mendoza', email: 'carlos.mendoza@smartway.com' },
    { name: 'Ana García', email: 'ana.garcia@smartway.com' },
    { name: 'Luis Rodriguez', email: 'luis.rodriguez@smartway.com' },
    { name: 'María González', email: 'maria.gonzalez@smartway.com' }
  ];

  for (let i = 0; i < 4; i++) {
    const hashedPassword = await bcrypt.hash('password123', 10);
    const user = {
      id: generateId('user-'),
      name: names[i].name,
      email: names[i].email,
      password: hashedPassword,
      role: roles[i % roles.length],
      department: departments[i % departments.length],
      status: Math.random() > 0.1 ? 'active' : 'inactive', // 90% activos
      avatar: `/placeholder.svg?height=40&width=40`,
      joinDate: new Date().toLocaleDateString('es-ES'),
      projectsCount: 0, // Se calculará después
      assignedProjects: [], // Se asignará después
      createdAt: randomDateInLastYear(),
      updatedAt: randomDateInLast6Months(),
      lastLogin: new Date().toLocaleString('es-ES')
    };
    users.push(user);
  }

  return users;
}

function generateProjects(users) {
  const projects = [];

  for (let i = 0; i < 10; i++) {
    const techStack = techStacks[Math.floor(Math.random() * techStacks.length)];
    const client = clients[Math.floor(Math.random() * clients.length)];
    const name = projectNames[Math.floor(Math.random() * projectNames.length)];
    const description = projectDescriptions[Math.floor(Math.random() * projectDescriptions.length)];
    
    // Asignar usuarios aleatorios al proyecto (1-3 usuarios)
    const numAssignedUsers = Math.floor(Math.random() * 3) + 1;
    const shuffledUsers = [...users].sort(() => 0.5 - Math.random());
    const assignedUsers = shuffledUsers.slice(0, numAssignedUsers).map(u => u.id);

    const project = {
      id: generateId('project-'),
      name,
      description,
      client,
      status: projectStatuses[Math.floor(Math.random() * projectStatuses.length)],
      priority: 'low', // Solo prioridad baja
      startDate: randomDateInLastYear().split('T')[0], // Solo fecha, sin hora
      endDate: Math.random() > 0.3 ? randomDateInLast6Months().split('T')[0] : '', // 70% tienen fecha de fin
      environments: [
        { name: 'Desarrollo', url: `https://dev-${name.toLowerCase().replace(/\s+/g, '-')}.smartway.com` },
        { name: 'QA', url: `https://qa-${name.toLowerCase().replace(/\s+/g, '-')}.smartway.com` },
        { name: 'Producción', url: `https://${name.toLowerCase().replace(/\s+/g, '-')}.smartway.com` }
      ].slice(0, Math.floor(Math.random() * 3) + 1), // 1-3 ambientes con URLs
      techStack,
      docsUrl: Math.random() > 0.3 ? `https://docs.smartway.com/${name.toLowerCase().replace(/\s+/g, '-')}` : undefined,
      gitlabUrl: Math.random() > 0.2 ? `https://gitlab.smartway.com/${client.toLowerCase().replace(/\s+/g, '-')}/${name.toLowerCase().replace(/\s+/g, '-')}` : undefined,
      assignedUsers,
      comments: Math.random() > 0.5 ? [
        {
          id: generateId('comment-'),
          userId: assignedUsers[0] || 'admin-1',
          content: 'Proyecto iniciado correctamente. Primeras funcionalidades implementadas.',
          createdAt: randomDateInLast6Months()
        }
      ] : [],
      createdAt: randomDateInLastYear(),
      updatedAt: randomDateInLast6Months()
    };

    projects.push(project);
  }

  return projects;
}

function assignProjectsToUsers(users, projects) {
  // Reiniciar contadores y asignaciones
  users.forEach(user => {
    user.assignedProjects = [];
    user.projectsCount = 0;
  });

  // Asignar proyectos a usuarios
  projects.forEach(project => {
    project.assignedUsers.forEach(userId => {
      const user = users.find(u => u.id === userId);
      if (user && !user.assignedProjects.includes(project.id)) {
        user.assignedProjects.push(project.id);
        user.projectsCount++;
      }
    });
  });

  return users;
}

async function seedDatabase() {
  try {
    console.log('🌱 Generando datos de prueba...');

    // Leer base de datos actual
    const dbPath = path.join(process.cwd(), 'database.json');
    let currentData = { users: [], projects: [] };
    
    if (fs.existsSync(dbPath)) {
      const data = fs.readFileSync(dbPath, 'utf8');
      currentData = JSON.parse(data);
    }

    // Verificar si ya existe el admin
    const adminUser = currentData.users.find(u => u.email === 'dev@smartway.com.ar');
    const newUsers = await generateUsers();
    
    if (adminUser) {
      newUsers.unshift(adminUser);
    }

    console.log('👥 Generando usuarios...');
    const projects = generateProjects(newUsers);
    console.log('📁 Generando proyectos...');
    
    const updatedUsers = assignProjectsToUsers(newUsers, projects);
    console.log('🔗 Asignando proyectos a usuarios...');

    // Crear nueva base de datos
    const newDatabase = {
      users: updatedUsers,
      projects
    };

    // Guardar en archivo
    fs.writeFileSync(dbPath, JSON.stringify(newDatabase, null, 2));

    console.log('✅ Base de datos poblada exitosamente!');
    console.log(`📊 Datos generados:`);
    console.log(`   - ${updatedUsers.length} usuarios (incluyendo admin)`);
    console.log(`   - ${projects.length} proyectos`);
    console.log(`   - ${projects.reduce((acc, p) => acc + p.assignedUsers.length, 0)} asignaciones usuario-proyecto`);
    
    // Mostrar estadísticas
    const statusCount = projects.reduce((acc, p) => {
      acc[p.status] = (acc[p.status] || 0) + 1;
      return acc;
    }, {});
    
    console.log(`   - Estados de proyectos:`, statusCount);
    
    const userStats = updatedUsers.map(u => `${u.name}: ${u.projectsCount} proyectos`);
    console.log(`   - Proyectos por usuario:`);
    userStats.forEach(stat => console.log(`     ${stat}`));

  } catch (error) {
    console.error('❌ Error poblando base de datos:', error);
    process.exit(1);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase }; 