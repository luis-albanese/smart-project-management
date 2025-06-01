import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';

// Ruta de la base de datos JSON
const dbPath = path.join(process.cwd(), 'database.json');

// Estructura de la base de datos
interface Database {
  users: User[];
  projects: Project[];
}

// Inicializar base de datos
function initDatabase(): Database {
  try {
    if (fs.existsSync(dbPath)) {
      const data = fs.readFileSync(dbPath, 'utf8');
      const db = JSON.parse(data);
      
      // Asegurar que la estructura esté completa
      if (!db.projects) {
        db.projects = [];
      }
      if (!db.users) {
        db.users = [];
      }
      
      // Guardar la estructura actualizada
      saveDatabase(db);
      return db;
    }
  } catch (error) {
    console.log('Creando nueva base de datos...');
  }

  // Si no existe o hay error, crear base de datos vacía
  const defaultDb: Database = {
    users: [],
    projects: []
  };
  
  saveDatabase(defaultDb);
  return defaultDb;
}

// Guardar base de datos
function saveDatabase(db: Database) {
  try {
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf8');
  } catch (error) {
    console.error('Error guardando base de datos:', error);
  }
}

// Crear tabla de usuarios y usuario admin por defecto
export async function initializeDatabase() {
  const db = initDatabase();
  
  // Crear usuario admin por defecto si no existe
  const existingAdmin = db.users.find(user => user.email === 'dev@smartway.com.ar');
  
  if (!existingAdmin) {
    const hashedPassword = bcrypt.hashSync('admin123', 10);
    const adminUser: User = {
      id: 'admin-1',
      name: 'Administrador',
      email: 'dev@smartway.com.ar',
      password: hashedPassword,
      role: 'admin',
      department: 'Administración',
      status: 'active',
      avatar: '/placeholder.svg?height=40&width=40',
      joinDate: new Date().toISOString().split('T')[0],
      lastLogin: undefined,
      projectsCount: 0,
      assignedProjects: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    db.users.push(adminUser);
    saveDatabase(db);
  }
}

// Tipos TypeScript
export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: 'admin' | 'manager' | 'developer' | 'designer';
  department: string;
  status: 'active' | 'inactive';
  avatar?: string;
  joinDate: string;
  lastLogin?: string;
  projectsCount: number;
  assignedProjects: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  client: string;
  environments: Environment[];
  techStack: string[];
  status: 'active' | 'maintenance' | 'completed' | 'paused';
  docsUrl?: string;
  gitlabUrl?: string;
  comments: Comment[];
  assignedUsers: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Environment {
  name: string;
  url: string;
}

export interface Comment {
  id: string;
  text: string;
  author: string;
  date: string;
}

export interface CreateProjectData {
  name: string;
  description: string;
  client: string;
  environments?: Environment[];
  techStack?: string[];
  status?: 'active' | 'maintenance' | 'completed' | 'paused';
  docsUrl?: string;
  gitlabUrl?: string;
  assignedUsers?: string[];
}

export interface UpdateProjectData {
  name?: string;
  description?: string;
  client?: string;
  environments?: Environment[];
  techStack?: string[];
  status?: 'active' | 'maintenance' | 'completed' | 'paused';
  docsUrl?: string;
  gitlabUrl?: string;
  assignedUsers?: string[];
}

export interface CreateUserData {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'manager' | 'developer' | 'designer';
  department: string;
  status?: 'active' | 'inactive';
  assignedProjects?: string[];
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  password?: string;
  role?: 'admin' | 'manager' | 'developer' | 'designer';
  department?: string;
  status?: 'active' | 'inactive';
  assignedProjects?: string[];
}

// Funciones de base de datos para usuarios
export const userQueries = {
  // Obtener todos los usuarios
  getAll: async () => {
    const db = initDatabase();
    return db.users.map(user => ({
      ...user,
      assignedProjects: user.assignedProjects || []
    }));
  },

  // Obtener usuario por ID
  getById: async (id: string) => {
    const db = initDatabase();
    const user = db.users.find(user => user.id === id);
    if (user) {
      return {
        ...user,
        assignedProjects: user.assignedProjects || []
      };
    }
    return undefined;
  },

  // Obtener usuario por email
  getByEmail: async (email: string) => {
    const db = initDatabase();
    const user = db.users.find(user => user.email === email);
    if (user) {
      return {
        ...user,
        assignedProjects: user.assignedProjects || []
      };
    }
    return undefined;
  },

  // Crear usuario
  create: async (userData: CreateUserData) => {
    const db = initDatabase();
    const hashedPassword = bcrypt.hashSync(userData.password, 10);
    const id = `user-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    
    const newUser: User = {
      id,
      name: userData.name,
      email: userData.email,
      password: hashedPassword,
      role: userData.role,
      department: userData.department,
      status: userData.status || 'active',
      avatar: `/placeholder.svg?height=40&width=40&query=avatar-${userData.name.split(' ')[0].toLowerCase()}`,
      joinDate: new Date().toISOString().split('T')[0],
      lastLogin: undefined,
      projectsCount: userData.assignedProjects?.length || 0,
      assignedProjects: userData.assignedProjects || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.users.push(newUser);
    saveDatabase(db);
    
    return newUser;
  },

  // Actualizar usuario
  update: async (id: string, userData: UpdateUserData) => {
    const db = initDatabase();
    const userIndex = db.users.findIndex(user => user.id === id);
    
    if (userIndex === -1) return null;

    const existingUser = db.users[userIndex];
    const updatedUser: User = {
      ...existingUser,
      ...userData,
      id, // Mantener el ID original
      updatedAt: new Date().toISOString()
    };

    // Si se actualiza la contraseña, hashearla
    if (userData.password) {
      updatedUser.password = bcrypt.hashSync(userData.password, 10);
    }

    // Actualizar projectsCount si se cambian los proyectos asignados
    if (userData.assignedProjects !== undefined) {
      updatedUser.projectsCount = userData.assignedProjects.length;
      updatedUser.assignedProjects = userData.assignedProjects;
    }

    db.users[userIndex] = updatedUser;
    saveDatabase(db);
    
    return updatedUser;
  },

  // Eliminar usuario
  delete: async (id: string) => {
    const db = initDatabase();
    const userIndex = db.users.findIndex(user => user.id === id);
    
    if (userIndex === -1) return false;

    db.users.splice(userIndex, 1);
    saveDatabase(db);
    
    return true;
  },

  // Actualizar último login
  updateLastLogin: async (id: string) => {
    const db = initDatabase();
    const userIndex = db.users.findIndex(user => user.id === id);
    
    if (userIndex !== -1) {
      db.users[userIndex].lastLogin = new Date().toLocaleString('es-ES');
      db.users[userIndex].updatedAt = new Date().toISOString();
      saveDatabase(db);
    }
  },

  // Verificar contraseña
  verifyPassword: async (email: string, password: string) => {
    const user = await userQueries.getByEmail(email);
    if (!user) return null;

    const isValid = bcrypt.compareSync(password, user.password!);
    if (isValid) {
      await userQueries.updateLastLogin(user.id);
      // No retornar la contraseña
      const { password: _, ...userWithoutPassword } = user;
      return userWithoutPassword;
    }
    return null;
  }
};

// Funciones de base de datos para proyectos
export const projectQueries = {
  // Obtener todos los proyectos (filtrados por usuario si no es admin)
  getAll: async (userId?: string, userRole?: string) => {
    const db = initDatabase();
    
    // Si no hay projects en la DB, retornar array vacío
    if (!db.projects) {
      return [];
    }
    
    let projects = db.projects.map(project => ({
      ...project,
      environments: project.environments || [],
      techStack: project.techStack || [],
      comments: project.comments || [],
      assignedUsers: project.assignedUsers || []
    }));

    // Si es admin, retornar todos los proyectos
    if (userRole === 'admin') {
      return projects;
    }

    // Si no es admin y se proporciona userId, filtrar por proyectos asignados
    if (userId && userRole !== 'admin') {
      projects = projects.filter(project => 
        project.assignedUsers.includes(userId)
      );
    }

    return projects;
  },

  // Obtener proyecto por ID
  getById: async (id: string) => {
    const db = initDatabase();
    const project = db.projects.find(project => project.id === id);
    if (project) {
      return {
        ...project,
        environments: project.environments || [],
        techStack: project.techStack || [],
        comments: project.comments || [],
        assignedUsers: project.assignedUsers || []
      };
    }
    return undefined;
  },

  // Crear proyecto
  create: async (projectData: CreateProjectData) => {
    const db = initDatabase();
    const id = `project-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    
    const newProject: Project = {
      id,
      name: projectData.name,
      description: projectData.description,
      client: projectData.client,
      environments: projectData.environments || [],
      techStack: projectData.techStack || [],
      status: projectData.status || 'active',
      docsUrl: projectData.docsUrl,
      gitlabUrl: projectData.gitlabUrl,
      comments: [],
      assignedUsers: projectData.assignedUsers || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.projects.push(newProject);
    saveDatabase(db);
    
    return newProject;
  },

  // Actualizar proyecto
  update: async (id: string, projectData: UpdateProjectData) => {
    const db = initDatabase();
    const projectIndex = db.projects.findIndex(project => project.id === id);
    
    if (projectIndex === -1) return null;

    const existingProject = db.projects[projectIndex];
    const updatedProject: Project = {
      ...existingProject,
      ...projectData,
      id, // Mantener el ID original
      updatedAt: new Date().toISOString()
    };

    // Asegurar que los arrays no sean undefined
    if (projectData.environments !== undefined) {
      updatedProject.environments = projectData.environments;
    }
    if (projectData.techStack !== undefined) {
      updatedProject.techStack = projectData.techStack;
    }
    if (projectData.assignedUsers !== undefined) {
      updatedProject.assignedUsers = projectData.assignedUsers;
    }

    db.projects[projectIndex] = updatedProject;
    saveDatabase(db);
    
    return updatedProject;
  },

  // Eliminar proyecto
  delete: async (id: string) => {
    const db = initDatabase();
    const projectIndex = db.projects.findIndex(project => project.id === id);
    
    if (projectIndex === -1) return false;

    db.projects.splice(projectIndex, 1);
    saveDatabase(db);
    
    return true;
  },

  // Agregar comentario a un proyecto
  addComment: async (projectId: string, comment: { text: string, author: string }) => {
    const db = initDatabase();
    const projectIndex = db.projects.findIndex(project => project.id === projectId);
    
    if (projectIndex === -1) return null;

    const newComment: Comment = {
      id: `comment-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      text: comment.text,
      author: comment.author,
      date: new Date().toLocaleString('es-ES')
    };

    db.projects[projectIndex].comments.push(newComment);
    db.projects[projectIndex].updatedAt = new Date().toISOString();
    saveDatabase(db);
    
    return db.projects[projectIndex];
  },

  // Eliminar comentario de un proyecto
  removeComment: async (projectId: string, commentId: string) => {
    const db = initDatabase();
    const projectIndex = db.projects.findIndex(project => project.id === projectId);
    
    if (projectIndex === -1) return null;

    const commentIndex = db.projects[projectIndex].comments.findIndex(comment => comment.id === commentId);
    if (commentIndex === -1) return null;

    db.projects[projectIndex].comments.splice(commentIndex, 1);
    db.projects[projectIndex].updatedAt = new Date().toISOString();
    saveDatabase(db);
    
    return db.projects[projectIndex];
  }
}; 