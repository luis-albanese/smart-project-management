import { NextRequest, NextResponse } from 'next/server';
import { userQueries, initializeDatabase } from '@/lib/database';
import { generateToken, createSessionCookie } from '@/lib/auth';

// Inicializar la base de datos al cargar la API
let dbInitialized = false;

export async function POST(request: NextRequest) {
  try {
    // Inicializar la base de datos solo una vez
    if (!dbInitialized) {
      await initializeDatabase();
      dbInitialized = true;
    }

    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email y contraseña son requeridos' },
        { status: 400 }
      );
    }

    // Verificar credenciales
    const user = await userQueries.verifyPassword(email, password);

    if (!user) {
      return NextResponse.json(
        { error: 'Credenciales inválidas' },
        { status: 401 }
      );
    }

    // Verificar que el usuario esté activo
    if (user.status !== 'active') {
      return NextResponse.json(
        { error: 'Usuario inactivo' },
        { status: 403 }
      );
    }

    // Generar token JWT
    const token = await generateToken({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
    });

    // Crear cookie de sesión
    const sessionCookie = createSessionCookie(token);

    const response = NextResponse.json({
      message: 'Login exitoso',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        status: user.status,
        avatar: user.avatar,
      },
    });

    // Establecer cookie
    response.cookies.set(sessionCookie);

    return response;
  } catch (error) {
    console.error('Error en login:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
} 