"use client"

import { AuthGuard } from "@/components/auth-guard"
import { Navbar } from "@/components/navbar"
import { NavigationTabs } from "@/components/navigation-tabs"
import { PageTransition } from "@/components/page-transition"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ProjectCard } from "@/components/project-card"
import { Plus, AlertCircle, Loader2, Search } from "lucide-react"
import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { EditProjectDialog } from "@/components/edit-project-dialog"
import { usePermissions } from "@/hooks/use-permissions"
import { Project, User } from "@/types/project"
import Link from "next/link"

export default function Dashboard() {
  const [projects, setProjects] = useState<Project[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [usersLoading, setUsersLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [showAllProjects, setShowAllProjects] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const { permissions, loading: permissionsLoading } = usePermissions()
  const { toast } = useToast()

  useEffect(() => {
    refreshProjects()
    loadUsers()
    loadCurrentUser()
  }, [])

  const refreshProjects = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/projects')
      if (response.ok) {
        const data = await response.json()
        // Ordenar proyectos por fecha de creación (más nuevos primero)
        const sortedProjects = data.projects.sort((a: Project, b: Project) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0
          return dateB - dateA
        })
        setProjects(sortedProjects)
      }
    } catch (error) {
      console.error('Error loading projects:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadUsers = async () => {
    try {
      setUsersLoading(true)
      const response = await fetch('/api/users')
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users || [])
      }
    } catch (error) {
      console.error('Error loading users:', error)
    } finally {
      setUsersLoading(false)
    }
  }

  const loadCurrentUser = async () => {
    try {
      const response = await fetch('/api/auth/me')
      if (response.ok) {
        const data = await response.json()
        setCurrentUser(data.user)
      }
    } catch (error) {
      console.error('Error loading current user:', error)
    }
  }

  const handleDeleteProject = async (projectId: string) => {
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast({
          title: "Éxito",
          description: "Proyecto eliminado exitosamente",
        })
        await refreshProjects()
      } else {
        const data = await response.json()
        toast({
          title: "Error",
          description: data.error || 'Error al eliminar proyecto',
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error deleting project:', error)
      toast({
        title: "Error",
        description: 'Error de conexión al eliminar proyecto',
        variant: "destructive",
      })
    }
  }

  const handleEditProject = (project: Project) => {
    setEditingProject(project)
    setShowEditDialog(true)
  }

  const handleEditSuccess = () => {
    refreshProjects()
    setShowEditDialog(false)
    setEditingProject(null)
  }

  // Filtrar proyectos por búsqueda
  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  // Determinar cuántos proyectos mostrar
  const projectsToShow = showAllProjects ? filteredProjects : filteredProjects.slice(0, 6)

  // Solo admin puede crear, editar y eliminar
  const isAdmin = currentUser?.role === 'admin'

  if (loading || permissionsLoading || usersLoading) {
    return (
      <AuthGuard>
        <Navbar />
        <NavigationTabs />
        <PageTransition>
          <div className="container mx-auto py-8">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <Loader2 className="animate-spin mx-auto h-8 w-8 text-primary mb-4" />
                <p>Cargando proyectos...</p>
              </div>
            </div>
          </div>
        </PageTransition>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard>
      <Navbar />
      <NavigationTabs />
      <PageTransition>
        <div className="container mx-auto py-8 space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Dashboard de Proyectos</h1>
              <p className="text-muted-foreground">
                Gestiona y supervisa todos los proyectos de la empresa
              </p>
            </div>
            {isAdmin && (
              <Link href="/add-project">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo Proyecto
                </Button>
              </Link>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Proyectos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{projects.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Activos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {projects.filter(p => p.status === 'active').length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Completados</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {projects.filter(p => p.status === 'completed').length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">En Mantenimiento</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {projects.filter(p => p.status === 'maintenance').length}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Buscador de Proyectos */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar proyectos por nombre o cliente..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            {searchTerm && (
              <div className="text-sm text-muted-foreground">
                {filteredProjects.length} de {projects.length} proyectos
              </div>
            )}
          </div>

          {/* Projects List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">
                {searchTerm 
                  ? `Resultados de búsqueda (${filteredProjects.length})`
                  : showAllProjects 
                    ? 'Todos los Proyectos' 
                    : 'Proyectos Recientes'
                }
              </h2>
              {!searchTerm && filteredProjects.length > 6 && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowAllProjects(!showAllProjects)}
                >
                  {showAllProjects ? 'Ver menos' : `Ver todos (${projects.length})`}
                </Button>
              )}
            </div>
            
            {projectsToShow.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  {searchTerm ? (
                    <>
                      <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">No se encontraron proyectos</h3>
                      <p className="text-muted-foreground mb-4">
                        No hay proyectos que coincidan con "{searchTerm}"
                      </p>
                      <Button variant="outline" onClick={() => setSearchTerm("")}>
                        Limpiar búsqueda
                      </Button>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">No hay proyectos</h3>
                      <p className="text-muted-foreground mb-4">
                        {isAdmin 
                          ? 'Comienza creando tu primer proyecto'
                          : 'No tienes proyectos asignados aún'
                        }
                      </p>
                      {isAdmin && (
                        <Link href="/add-project">
                          <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Crear Proyecto
                          </Button>
                        </Link>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projectsToShow.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    users={users}
                    userRole={currentUser?.role}
                    onEdit={isAdmin ? handleEditProject : undefined}
                    onDelete={isAdmin ? handleDeleteProject : undefined}
                    onRefresh={refreshProjects}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Dialog para editar proyecto - solo admin */}
        {isAdmin && (
          <EditProjectDialog
            isOpen={showEditDialog}
            onClose={() => {
              setShowEditDialog(false)
              setEditingProject(null)
            }}
            project={editingProject}
            onSuccess={handleEditSuccess}
          />
        )}
      </PageTransition>
    </AuthGuard>
  )
}
