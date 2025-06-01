import { NextRequest, NextResponse } from 'next/server';
import { projectQueries, initializeDatabase } from '@/lib/database';
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

    const projects = await projectQueries.getAll(session.id, session.role);

    return NextResponse.json({
      projects,
    });
  } catch (error) {
    console.error('Error obteniendo proyectos:', error);
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

    // Solo admins y managers pueden crear proyectos
    if (!['admin', 'manager'].includes(session.role)) {
      return NextResponse.json(
        { error: 'Permisos insuficientes' },
        { status: 403 }
      );
    }

    const projectData = await request.json();

    // Validar campos requeridos
    if (!projectData.name || !projectData.description || !projectData.client) {
      return NextResponse.json(
        { error: 'Nombre, descripción y cliente son requeridos' },
        { status: 400 }
      );
    }

    const newProject = await projectQueries.create(projectData);

    if (!newProject) {
      return NextResponse.json(
        { error: 'Error al crear proyecto' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Proyecto creado exitosamente',
      project: newProject,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creando proyecto:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
} 