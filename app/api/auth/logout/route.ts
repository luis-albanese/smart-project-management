import { NextResponse } from 'next/server';
import { createLogoutCookie } from '@/lib/auth';

export async function POST() {
  try {
    const logoutCookie = createLogoutCookie();
    
    const response = NextResponse.json({
      message: 'Logout exitoso',
    });

    // Eliminar cookie de sesión
    response.cookies.set(logoutCookie);

    return response;
  } catch (error) {
    console.error('Error en logout:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
} 