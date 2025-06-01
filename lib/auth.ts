import { SignJWT, jwtVerify, JWTPayload } from 'jose';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-this-in-production'
);

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'developer' | 'designer';
  department: string;
}

export async function generateToken(user: SessionUser): Promise<string> {
  return await new SignJWT({ ...user } as JWTPayload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(secret);
}

export async function verifyToken(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    
    // Verificar que el payload tiene las propiedades necesarias
    if (
      typeof payload.id === 'string' &&
      typeof payload.name === 'string' &&
      typeof payload.email === 'string' &&
      typeof payload.role === 'string' &&
      typeof payload.department === 'string'
    ) {
      return {
        id: payload.id,
        name: payload.name,
        email: payload.email,
        role: payload.role as SessionUser['role'],
        department: payload.department,
      };
    }
    
    return null;
  } catch {
    return null;
  }
}

export async function getSessionUser(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('session-token');
    
    if (!token) {
      return null;
    }

    return await verifyToken(token.value);
  } catch {
    return null;
  }
}

export async function getSessionFromRequest(request: NextRequest): Promise<SessionUser | null> {
  try {
    const token = request.cookies.get('session-token');
    
    if (!token) {
      return null;
    }

    return await verifyToken(token.value);
  } catch {
    return null;
  }
}

export function createSessionCookie(token: string) {
  return {
    name: 'session-token',
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge: 60 * 60 * 24, // 24 horas
    path: '/',
  };
}

export function createLogoutCookie() {
  return {
    name: 'session-token',
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge: 0,
    path: '/',
  };
} 