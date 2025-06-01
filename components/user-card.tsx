"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreVertical, Pencil, Trash2, Mail, Calendar, Clock, FolderOpen, User, Eye } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useState, useEffect } from "react"

type UserType = {
  id: string
  name: string
  email: string
  role: 'admin' | 'manager' | 'developer' | 'designer'
  department: string
  status: 'active' | 'inactive'
  avatar?: string
  joinDate: string
  lastLogin?: string
  projectsCount: number
  assignedProjects: string[]
}

interface UserCardProps {
  user: UserType
  onEdit?: (user: UserType) => void
  onDelete?: (user: UserType) => void
}

export function UserCard({ user, onEdit, onDelete }: UserCardProps) {
  const [showProjectsDialog, setShowProjectsDialog] = useState(false)
  const [projectsDetails, setProjectsDetails] = useState<Array<{id: string, name: string, client: string}>>([])
  const [loadingProjects, setLoadingProjects] = useState(false)

  useEffect(() => {
    if (showProjectsDialog && user.assignedProjects?.length > 0) {
      fetchProjectsDetails()
    }
  }, [showProjectsDialog, user.assignedProjects])

  const fetchProjectsDetails = async () => {
    setLoadingProjects(true)
    try {
      const response = await fetch('/api/projects')
      const data = await response.json()

      if (response.ok) {
        const userProjects = data.projects.filter((project: any) => 
          user.assignedProjects.includes(project.id)
        ).map((project: any) => ({
          id: project.id,
          name: project.name,
          client: project.client
        }))
        setProjectsDetails(userProjects)
      } else {
        console.error('Error al cargar proyectos:', data.error)
      }
    } catch (error) {
      console.error('Error fetching projects:', error)
    } finally {
      setLoadingProjects(false)
    }
  }

  const roleColors = {
    admin: "bg-red-500",
    manager: "bg-purple-500",
    developer: "bg-blue-500",
    designer: "bg-green-500",
  }

  const roleLabels = {
    admin: "Administrador",
    manager: "Manager",
    developer: "Desarrollador",
    designer: "Diseñador",
  }

  const statusColors = {
    active: "bg-green-500",
    inactive: "bg-gray-500",
  }

  const statusLabels = {
    active: "Activo",
    inactive: "Inactivo",
  }

  const handleDeleteClick = () => {
    if (onDelete) {
      onDelete(user)
    }
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <User className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div>
              <CardTitle className="text-lg">{user.name}</CardTitle>
              <CardDescription>{user.department}</CardDescription>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">Abrir menú</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onEdit && (
                <DropdownMenuItem onClick={() => onEdit(user)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Editar
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => setShowProjectsDialog(true)}>
                <Eye className="mr-2 h-4 w-4" />
                Ver Proyectos
              </DropdownMenuItem>
              {onDelete && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleDeleteClick} className="text-red-600">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Eliminar
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="space-y-3">
          <div className="flex items-center text-sm text-muted-foreground">
            <Mail className="h-3.5 w-3.5 mr-2" />
            {user.email}
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="h-3.5 w-3.5 mr-2" />
            Ingresó: {new Date(user.joinDate).toLocaleDateString("es-ES")}
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <Clock className="h-3.5 w-3.5 mr-2" />
            Último acceso: {user.lastLogin || 'Nunca'}
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <FolderOpen className="h-3.5 w-3.5 mr-2" />
            {user.assignedProjects?.length || 0} proyectos asignados
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between pt-4">
        <div className="flex gap-2">
          <Badge className={`${roleColors[user.role]} text-white`}>
            {roleLabels[user.role]}
          </Badge>
          <Badge className={`${statusColors[user.status]} text-white`}>
            {statusLabels[user.status]}
          </Badge>
        </div>
      </CardFooter>

      <Dialog open={showProjectsDialog} onOpenChange={setShowProjectsDialog}>
        <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Proyectos Asignados - {user.name}</DialogTitle>
            <DialogDescription>Lista de proyectos que este usuario puede ver y gestionar</DialogDescription>
          </DialogHeader>
          <div className="flex-1 min-h-0 py-4">
            {loadingProjects ? (
              <div className="text-center py-8">
                <FolderOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-sm text-muted-foreground">Cargando proyectos...</p>
              </div>
            ) : projectsDetails.length > 0 ? (
              <div className="space-y-3 max-h-full overflow-y-auto pr-2">
                {projectsDetails.map((project) => (
                  <div key={project.id} className="flex items-center space-x-3 p-3 rounded-lg bg-muted/50 border">
                    <FolderOpen className="h-4 w-4 text-primary flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{project.name}</p>
                      <p className="text-sm text-muted-foreground truncate">{project.client}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FolderOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-sm text-muted-foreground">No tiene proyectos asignados</p>
              </div>
            )}
          </div>
          <div className="pt-4 border-t">
            <Button onClick={() => setShowProjectsDialog(false)} className="w-full">
              Cerrar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
