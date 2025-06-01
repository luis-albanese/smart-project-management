import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getSessionFromRequest } from './lib/auth';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Rutas públicas que no requieren autenticación
  const publicPaths = ['/login'];
  
  // Rutas de API que no requieren autenticación
  const publicApiPaths = ['/api/auth/login'];

  // Si es una ruta pública, permitir acceso
  if (publicPaths.includes(pathname) || publicApiPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Verificar autenticación para todas las demás rutas
  const session = await getSessionFromRequest(request);

  // Si no hay sesión válida, redireccionar al login
  if (!session) {
    if (pathname.startsWith('/api/')) {
      // Para rutas API, retornar 401
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    } else {
      // Para rutas de página, redireccionar al login
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Si está en login y ya está autenticado, redireccionar al dashboard
  if (pathname === '/login' && session) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$|.*\\.svg$).*)',
  ],
}; 