import { NextRequest, NextResponse } from 'next/server';
import { projectQueries, userQueries } from '@/lib/database';
import { getSessionUser } from '@/lib/auth';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSessionUser();

    if (!session) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    // Solo admins y managers pueden asignar usuarios
    if (!['admin', 'manager'].includes(session.role)) {
      return NextResponse.json(
        { error: 'Permisos insuficientes' },
        { status: 403 }
      );
    }

    const { userIds } = await request.json();

    if (!Array.isArray(userIds)) {
      return NextResponse.json(
        { error: 'userIds debe ser un array' },
        { status: 400 }
      );
    }

    // Verificar que el proyecto existe
    const project = await projectQueries.getById(id);
    if (!project) {
      return NextResponse.json(
        { error: 'Proyecto no encontrado' },
        { status: 404 }
      );
    }

    // Actualizar el proyecto con los usuarios asignados
    const updatedProject = await projectQueries.update(id, {
      assignedUsers: userIds
    });

    // Actualizar los usuarios con los proyectos asignados
    const allUsers = await userQueries.getAll();
    for (const user of allUsers) {
      const userProjects = user.assignedProjects || [];
      
      if (userIds.includes(user.id)) {
        // Agregar el proyecto si no está ya asignado
        if (!userProjects.includes(id)) {
          userProjects.push(id);
          await userQueries.update(user.id, { 
            assignedProjects: userProjects 
          });
        }
      } else {
        // Remover el proyecto si estaba asignado
        if (userProjects.includes(id)) {
          const filteredProjects = userProjects.filter(projectId => projectId !== id);
          await userQueries.update(user.id, { 
            assignedProjects: filteredProjects 
          });
        }
      }
    }

    return NextResponse.json({
      message: 'Usuarios asignados exitosamente',
      project: updatedProject,
    });
  } catch (error) {
    console.error('Error asignando usuarios:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
} 