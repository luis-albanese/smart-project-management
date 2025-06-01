import { NextRequest, NextResponse } from 'next/server';
import { userQueries, projectQueries } from '@/lib/database';
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

    const user = await userQueries.getById(id);

    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Filtrar contraseña de la respuesta
    const { password, ...userWithoutPassword } = user;

    return NextResponse.json({
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error('Error obteniendo usuario:', error);
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

    // Los usuarios pueden editar su propio perfil, pero solo admins/managers pueden editar otros
    if (session.id !== id && !['admin', 'manager'].includes(session.role)) {
      return NextResponse.json(
        { error: 'Permisos insuficientes' },
        { status: 403 }
      );
    }

    const userData = await request.json();

    // Si no es admin, no puede cambiar el rol
    if (session.role !== 'admin' && userData.role) {
      return NextResponse.json(
        { error: 'Solo los administradores pueden cambiar roles' },
        { status: 403 }
      );
    }

    // Verificar que el usuario existe
    const existingUser = await userQueries.getById(id);
    if (!existingUser) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Si se está cambiando el email, verificar que no esté en uso
    if (userData.email && userData.email !== existingUser.email) {
      const emailInUse = await userQueries.getByEmail(userData.email);
      if (emailInUse) {
        return NextResponse.json(
          { error: 'El email ya está en uso' },
          { status: 409 }
        );
      }
    }

    const updatedUser = await userQueries.update(id, userData);

    if (!updatedUser) {
      return NextResponse.json(
        { error: 'Error al actualizar usuario' },
        { status: 500 }
      );
    }

    // Si se actualizaron los proyectos asignados, sincronizar la relación bidireccional
    if (userData.assignedProjects !== undefined) {
      try {
        // Obtener los proyectos anteriores y actuales
        const oldProjects: string[] = existingUser.assignedProjects || [];
        const newProjects: string[] = userData.assignedProjects || [];

        // Encontrar proyectos que se agregaron y removieron
        const addedProjects: string[] = newProjects.filter(projectId => !oldProjects.includes(projectId));
        const removedProjects: string[] = oldProjects.filter(projectId => !newProjects.includes(projectId));

        // Actualizar proyectos agregados
        for (const projectId of addedProjects) {
          const project = await projectQueries.getById(projectId);
          if (project) {
            const currentUsers = project.assignedUsers || [];
            if (!currentUsers.includes(id)) {
              await projectQueries.update(projectId, {
                assignedUsers: [...currentUsers, id]
              });
            }
          }
        }

        // Actualizar proyectos removidos
        for (const projectId of removedProjects) {
          const project = await projectQueries.getById(projectId);
          if (project) {
            const currentUsers = project.assignedUsers || [];
            const updatedUsers = currentUsers.filter(userId => userId !== id);
            await projectQueries.update(projectId, {
              assignedUsers: updatedUsers
            });
          }
        }
      } catch (syncError) {
        console.error('Error sincronizando proyectos:', syncError);
        // No fallar la actualización del usuario por errores de sincronización
      }
    }

    // Filtrar contraseña de la respuesta
    const { password, ...userWithoutPassword } = updatedUser;

    return NextResponse.json({
      message: 'Usuario actualizado exitosamente',
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error('Error actualizando usuario:', error);
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

    // Solo admins pueden eliminar usuarios
    if (session.role !== 'admin') {
      return NextResponse.json(
        { error: 'Solo los administradores pueden eliminar usuarios' },
        { status: 403 }
      );
    }

    // No permitir auto-eliminación
    if (session.id === id) {
      return NextResponse.json(
        { error: 'No puedes eliminar tu propia cuenta' },
        { status: 400 }
      );
    }

    // Verificar que el usuario existe
    const existingUser = await userQueries.getById(id);
    if (!existingUser) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    const deleted = await userQueries.delete(id);

    if (!deleted) {
      return NextResponse.json(
        { error: 'Error al eliminar usuario' },
        { status: 500 }
      );
    }

    // Remover el usuario de todos los proyectos asignados
    try {
      const userProjects = existingUser.assignedProjects || [];
      for (const projectId of userProjects) {
        const project = await projectQueries.getById(projectId);
        if (project) {
          const updatedUsers = (project.assignedUsers || []).filter(userId => userId !== id);
          await projectQueries.update(projectId, {
            assignedUsers: updatedUsers
          });
        }
      }
    } catch (syncError) {
      console.error('Error removiendo usuario de proyectos:', syncError);
      // No fallar la eliminación por errores de sincronización
    }

    return NextResponse.json({
      message: 'Usuario eliminado exitosamente',
    });
  } catch (error) {
    console.error('Error eliminando usuario:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
} 