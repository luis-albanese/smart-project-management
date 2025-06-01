import { NextRequest, NextResponse } from 'next/server';
import { projectQueries, userQueries } from '@/lib/database';
import { getSessionUser } from '@/lib/auth';

export async function GET(
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

    const project = await projectQueries.getById(id);

    if (!project) {
      return NextResponse.json(
        { error: 'Proyecto no encontrado' },
        { status: 404 }
      );
    }

    // Solo admins y managers pueden ver todos los proyectos, otros solo los asignados
    if (session.role !== 'admin' && session.role !== 'manager') {
      if (!project.assignedUsers.includes(session.id)) {
        return NextResponse.json(
          { error: 'No tienes acceso a este proyecto' },
          { status: 403 }
        );
      }
    }

    return NextResponse.json({
      project,
    });
  } catch (error) {
    console.error('Error obteniendo proyecto:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function PUT(
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

    // Solo admins y managers pueden editar proyectos
    if (!['admin', 'manager'].includes(session.role)) {
      return NextResponse.json(
        { error: 'Permisos insuficientes' },
        { status: 403 }
      );
    }

    const projectData = await request.json();

    // Verificar que el proyecto existe
    const existingProject = await projectQueries.getById(id);
    if (!existingProject) {
      return NextResponse.json(
        { error: 'Proyecto no encontrado' },
        { status: 404 }
      );
    }

    // Validar campos requeridos
    if (projectData.name && projectData.name.trim().length < 2) {
      return NextResponse.json(
        { error: 'El nombre debe tener al menos 2 caracteres' },
        { status: 400 }
      );
    }

    if (projectData.description && projectData.description.trim().length < 10) {
      return NextResponse.json(
        { error: 'La descripción debe tener al menos 10 caracteres' },
        { status: 400 }
      );
    }

    if (projectData.client && projectData.client.trim().length < 2) {
      return NextResponse.json(
        { error: 'El cliente es requerido' },
        { status: 400 }
      );
    }

    const updatedProject = await projectQueries.update(id, projectData);

    if (!updatedProject) {
      return NextResponse.json(
        { error: 'Error al actualizar proyecto' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Proyecto actualizado exitosamente',
      project: updatedProject,
    });
  } catch (error) {
    console.error('Error actualizando proyecto:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    // Solo admins pueden eliminar proyectos
    if (session.role !== 'admin') {
      return NextResponse.json(
        { error: 'Solo los administradores pueden eliminar proyectos' },
        { status: 403 }
      );
    }

    // Verificar que el proyecto existe
    const existingProject = await projectQueries.getById(id);
    if (!existingProject) {
      return NextResponse.json(
        { error: 'Proyecto no encontrado' },
        { status: 404 }
      );
    }

    // Remover el proyecto de todos los usuarios que lo tenían asignado ANTES de eliminarlo
    try {
      const assignedUsers = existingProject.assignedUsers || [];
      for (const userId of assignedUsers) {
        const user = await userQueries.getById(userId);
        if (user) {
          const updatedProjects = (user.assignedProjects || []).filter(projectId => projectId !== id);
          await userQueries.update(userId, {
            assignedProjects: updatedProjects
          });
        }
      }
    } catch (syncError) {
      console.error('Error removiendo proyecto de usuarios:', syncError);
      // No fallar la eliminación por errores de sincronización
    }

    const deleted = await projectQueries.delete(id);

    if (!deleted) {
      return NextResponse.json(
        { error: 'Error al eliminar proyecto' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Proyecto eliminado exitosamente',
    });
  } catch (error) {
    console.error('Error eliminando proyecto:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
} 