import { NextResponse } from 'next/server';
import { projectQueries, userQueries } from '@/lib/database';
import { getSessionUser } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSessionUser();

    if (!session) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    // Obtener todos los proyectos y usuarios
    const projects = await projectQueries.getAll();
    const users = await userQueries.getAll();

    // Calcular estadísticas básicas
    const totalProjects = projects.length;
    const activeProjects = projects.filter(p => p.status === 'active').length;
    const completedProjects = projects.filter(p => p.status === 'completed').length;
    const maintenanceProjects = projects.filter(p => p.status === 'maintenance').length;
    const pausedProjects = projects.filter(p => p.status === 'paused').length;
    
    // Obtener clientes únicos
    const uniqueClients = [...new Set(projects.map(p => p.client))].filter(client => client);
    const totalClients = uniqueClients.length;

    // Calcular tasa de éxito (proyectos completados vs total de proyectos terminados)
    const terminatedProjects = completedProjects + pausedProjects;
    const successRate = terminatedProjects > 0 ? Math.round((completedProjects / terminatedProjects) * 100) : 0;

    // Distribución por estado
    const projectsByStatus = [
      { name: "Activos", value: activeProjects, color: "#10b981" },
      { name: "Mantenimiento", value: maintenanceProjects, color: "#f59e0b" },
      { name: "Completados", value: completedProjects, color: "#3b82f6" },
      { name: "Pausados", value: pausedProjects, color: "#6b7280" },
    ];

    // Proyectos por cliente
    const clientProjectCount = uniqueClients.map(client => ({
      client,
      proyectos: projects.filter(p => p.client === client).length
    })).sort((a, b) => b.proyectos - a.proyectos);

    // Tecnologías más usadas
    const techCount: { [key: string]: number } = {};
    projects.forEach(project => {
      if (project.techStack && Array.isArray(project.techStack)) {
        project.techStack.forEach(tech => {
          techCount[tech] = (techCount[tech] || 0) + 1;
        });
      }
    });

    const techStackUsage = Object.entries(techCount)
      .map(([tech, count]) => ({ tech, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // Top 10 tecnologías

    // Evolución mensual (simulada basada en fechas de creación)
    const currentYear = new Date().getFullYear();
    const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
    
    const monthlyData = monthNames.map((month, index) => {
      const monthProjects = projects.filter(p => {
        if (!p.createdAt) return false;
        const projectDate = new Date(p.createdAt);
        return projectDate.getFullYear() === currentYear && projectDate.getMonth() === index;
      });

      return {
        month,
        nuevos: monthProjects.length,
        completados: monthProjects.filter(p => p.status === 'completed').length,
        activos: monthProjects.filter(p => p.status === 'active').length,
      };
    });

    // Estadísticas de usuarios por rol
    const usersByRole = users.reduce((acc: { [key: string]: number }, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {});

    return NextResponse.json({
      kpis: {
        totalProjects,
        activeProjects,
        totalClients,
        successRate,
        totalUsers: users.length,
        usersByRole
      },
      charts: {
        projectsByStatus,
        clientProjects: clientProjectCount,
        techStackUsage,
        monthlyProjects: monthlyData,
      }
    });
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
} 