import { NextRequest, NextResponse } from 'next/server';
import { userQueries, initializeDatabase } from '@/lib/database';
import { getSessionUser } from '@/lib/auth';

// Inicializar la base de datos al cargar la API
let dbInitialized = false;

export async function GET(request: NextRequest) {
  try {
    // Inicializar la base de datos solo una vez
    if (!dbInitialized) {
      await initializeDatabase();
      dbInitialized = true;
    }

    const session = await getSessionUser();

    if (!session) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    const users = await userQueries.getAll();
    
    // Filtrar contraseñas de la respuesta
    const usersWithoutPasswords = users.map(({ password, ...user }) => user);

    return NextResponse.json({
      users: usersWithoutPasswords,
    });
  } catch (error) {
    console.error('Error obteniendo usuarios:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Inicializar la base de datos solo una vez
    if (!dbInitialized) {
      await initializeDatabase();
      dbInitialized = true;
    }

    const session = await getSessionUser();

    if (!session) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    // Solo admins y managers pueden crear usuarios
    if (!['admin', 'manager'].includes(session.role)) {
      return NextResponse.json(
        { error: 'Permisos insuficientes' },
        { status: 403 }
      );
    }

    const userData = await request.json();

    // Validar campos requeridos
    if (!userData.name || !userData.email || !userData.password || !userData.role || !userData.department) {
      return NextResponse.json(
        { error: 'Todos los campos son requeridos' },
        { status: 400 }
      );
    }

    // Verificar que el email no esté en uso
    const existingUser = await userQueries.getByEmail(userData.email);
    if (existingUser) {
      return NextResponse.json(
        { error: 'El email ya está en uso' },
        { status: 409 }
      );
    }

    const newUser = await userQueries.create(userData);

    if (!newUser) {
      return NextResponse.json(
        { error: 'Error al crear usuario' },
        { status: 500 }
      );
    }

    // Filtrar contraseña de la respuesta
    const { password, ...userWithoutPassword } = newUser;

    return NextResponse.json({
      message: 'Usuario creado exitosamente',
      user: userWithoutPassword,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creando usuario:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
} 