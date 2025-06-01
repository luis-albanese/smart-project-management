"use client"

import { AuthGuard } from "@/components/auth-guard"
import { Navbar } from "@/components/navbar"
import { NavigationTabs } from "@/components/navigation-tabs"
import { PageTransition } from "@/components/page-transition"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, Users, FolderOpen, Activity } from "lucide-react"
import { useEffect, useState } from "react"

interface StatsData {
  kpis: {
    totalProjects: number;
    activeProjects: number;
    totalClients: number;
    successRate: number;
    totalUsers: number;
  };
  charts: {
    projectsByStatus: Array<{ name: string; value: number; color: string }>;
    clientProjects: Array<{ client: string; proyectos: number }>;
    techStackUsage: Array<{ tech: string; count: number }>;
  };
}

export default function StatsPage() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('/api/stats', {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Cache-Control': 'no-cache'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        } else {
          setError('Error al cargar estadísticas');
        }
      } catch (err) {
        console.error('Error:', err);
        setError('Error de conexión');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <AuthGuard>
        <Navbar />
        <NavigationTabs />
        <PageTransition>
          <div className="container mx-auto py-8">
            <div className="flex items-center justify-center h-64">
              <div className="text-center space-y-4">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent mx-auto"></div>
                <p className="text-sm text-muted-foreground">Cargando estadísticas...</p>
              </div>
            </div>
          </div>
        </PageTransition>
      </AuthGuard>
    );
  }

  if (error || !stats) {
    return (
      <AuthGuard>
        <Navbar />
        <NavigationTabs />
        <PageTransition>
          <div className="container mx-auto py-8">
            <div className="flex items-center justify-center h-64">
              <div className="text-center space-y-4">
                <p className="text-sm text-muted-foreground">{error || 'No hay datos disponibles'}</p>
                <button 
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 text-sm"
                >
                  Recargar
                </button>
              </div>
            </div>
          </div>
        </PageTransition>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <Navbar />
      <NavigationTabs />
      <PageTransition>
        <div className="container mx-auto py-8 space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Estadísticas de Proyectos</h1>
              <p className="text-muted-foreground">Panel de métricas y análisis</p>
            </div>
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Proyectos</CardTitle>
                <FolderOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.kpis.totalProjects}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.kpis.totalUsers} usuarios en el sistema
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Proyectos Activos</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.kpis.activeProjects}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.kpis.totalProjects > 0 
                    ? Math.round((stats.kpis.activeProjects / stats.kpis.totalProjects) * 100) 
                    : 0}% del total
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Clientes</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.kpis.totalClients}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.kpis.totalClients > 0 ? 
                    `~${Math.round(stats.kpis.totalProjects / stats.kpis.totalClients)} proyectos/cliente` : 
                    'Sin clientes'
                  }
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tasa de Éxito</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.kpis.successRate}%</div>
                <p className="text-xs text-muted-foreground">
                  Proyectos completados exitosamente
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Estados de Proyectos */}
          <Card>
            <CardHeader>
              <CardTitle>Distribución por Estado</CardTitle>
              <CardDescription>Estado actual de todos los proyectos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {stats.charts.projectsByStatus.map((status, index) => (
                  <div key={index} className="text-center p-4 rounded-lg border">
                    <div 
                      className="w-8 h-8 rounded-full mx-auto mb-2"
                      style={{ backgroundColor: status.color }}
                    ></div>
                    <div className="font-semibold text-lg">{status.value}</div>
                    <div className="text-sm text-muted-foreground">{status.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {stats.kpis.totalProjects > 0 
                        ? Math.round((status.value / stats.kpis.totalProjects) * 100)
                        : 0}%
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Clientes */}
          <Card>
            <CardHeader>
              <CardTitle>Top Clientes</CardTitle>
              <CardDescription>Clientes con más proyectos</CardDescription>
            </CardHeader>
            <CardContent>
              {stats.charts.clientProjects.length > 0 ? (
                <div className="space-y-3">
                  {stats.charts.clientProjects.slice(0, 5).map((client, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="font-medium">{client.client}</div>
                      <div className="flex items-center gap-2">
                        <div className="text-lg font-bold">{client.proyectos}</div>
                        <div className="text-sm text-muted-foreground">proyectos</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No hay datos de clientes disponibles
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tecnologías */}
          <Card>
            <CardHeader>
              <CardTitle>Tecnologías Populares</CardTitle>
              <CardDescription>Tecnologías más utilizadas en proyectos</CardDescription>
            </CardHeader>
            <CardContent>
              {stats.charts.techStackUsage.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {stats.charts.techStackUsage.slice(0, 6).map((tech, index) => (
                    <div key={index} className="text-center p-3 rounded-lg border">
                      <div className="font-semibold text-lg">{tech.count}</div>
                      <div className="text-sm text-muted-foreground">{tech.tech}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No hay datos de tecnologías disponibles
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </PageTransition>
    </AuthGuard>
  )
}
