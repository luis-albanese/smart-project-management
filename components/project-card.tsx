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
import { ExternalLink, MoreVertical, Pencil, Trash2, FileText, GitBranch, Users, Eye } from "lucide-react"
import { ConfirmationDialog } from "@/components/confirmation-dialog"
import { AssignUsersDialog } from "@/components/assign-users-dialog"
import { ProjectDetailsDialog } from "@/components/project-details-dialog"
import { Project, User } from "@/types/project"
import { useState } from "react"

type Environment = {
  name: string
  url: string
}

type Comment = {
  id: string
  text: string
  author: string
  date: string
}

interface ProjectCardProps {
  project: Project
  onEdit?: (project: Project) => void
  onDelete?: (projectId: string) => void
  onRefresh?: () => void
  users?: User[]
  userRole?: string
}

export function ProjectCard({ 
  project, 
  onEdit, 
  onDelete, 
  onRefresh, 
  users = [], 
  userRole 
}: ProjectCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showAssignUsersDialog, setShowAssignUsersDialog] = useState(false)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)

  const statusColors = {
    active: "bg-green-500",
    maintenance: "bg-amber-500",
    completed: "bg-blue-500",
    archived: "bg-gray-500",
    paused: "bg-orange-500",
  }

  const statusLabels = {
    active: "Activo",
    maintenance: "Mantenimiento",
    completed: "Completado",
    archived: "Archivado",
    paused: "Pausado",
  }

  const isAdmin = userRole === 'admin'
  const canEdit = isAdmin && onEdit
  const canDelete = isAdmin && onDelete
  const canAssignUsers = isAdmin

  const handleDeleteClick = () => {
    setShowDeleteDialog(true)
  }

  const handleConfirmDelete = () => {
    if (onDelete) {
      onDelete(project.id)
    }
  }

  const handleEditClick = () => {
    if (onEdit) {
      onEdit(project)
    }
  }

  const handleDetailsClick = () => {
    setShowDetailsDialog(true)
  }

  const hasActions = canEdit || canDelete || canAssignUsers || true

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl">{project.name}</CardTitle>
            <CardDescription>{project.client}</CardDescription>
          </div>
          {hasActions && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                  <span className="sr-only">Abrir menú</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {canEdit && (
                  <DropdownMenuItem onClick={handleEditClick}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Editar
                  </DropdownMenuItem>
                )}
                
                {canAssignUsers && (
                  <DropdownMenuItem onClick={() => setShowAssignUsersDialog(true)}>
                    <Users className="mr-2 h-4 w-4" />
                    Asignar Usuarios
                  </DropdownMenuItem>
                )}
                
                <DropdownMenuItem onClick={handleDetailsClick}>
                  <Eye className="mr-2 h-4 w-4" />
                  Ver Detalles
                </DropdownMenuItem>
                
                {(canEdit || canAssignUsers) && canDelete && <DropdownMenuSeparator />}
                
                {canDelete && (
                  <DropdownMenuItem onClick={handleDeleteClick} className="text-red-600">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Eliminar
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <p className="text-sm text-muted-foreground mb-4">{project.description}</p>

        <div className="space-y-3">
          {project.environments.map((env) => (
            <div key={env.name} className="flex items-center justify-between">
              <span className="text-sm font-medium">{env.name}</span>
              <div className="flex items-center">
                <span className="text-xs text-muted-foreground truncate max-w-[120px] mr-1">
                  {env.url.replace(/^https?:\/\//, "")}
                </span>
                <a
                  href={env.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:text-primary/80"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  <span className="sr-only">Abrir {env.name}</span>
                </a>
              </div>
            </div>
          ))}
        </div>
        {(project.docsUrl || project.gitlabUrl) && (
          <div className="mt-4 pt-3 border-t space-y-2">
            {project.docsUrl && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium flex items-center">
                  <FileText className="h-3.5 w-3.5 mr-1" />
                  Documentación
                </span>
                <a
                  href={project.docsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:text-primary/80"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            )}
            {project.gitlabUrl && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium flex items-center">
                  <GitBranch className="h-3.5 w-3.5 mr-1" />
                  GitLab
                </span>
                <a
                  href={project.gitlabUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:text-primary/80"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between pt-4">
        <div className="flex flex-wrap gap-1">
          {project.techStack.map((tech) => (
            <Badge key={tech} variant="secondary" className="text-xs">
              {tech}
            </Badge>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Badge className={`${statusColors[project.status as keyof typeof statusColors]} text-white`}>
            {statusLabels[project.status as keyof typeof statusLabels]}
          </Badge>
        </div>
      </CardFooter>

      {canDelete && (
        <ConfirmationDialog
          isOpen={showDeleteDialog}
          onClose={() => setShowDeleteDialog(false)}
          onConfirm={handleConfirmDelete}
          title="Eliminar Proyecto"
          description={`¿Estás seguro de que quieres eliminar el proyecto "${project.name}"? Esta acción no se puede deshacer.`}
          confirmText="Eliminar"
          cancelText="Cancelar"
          variant="destructive"
        />
      )}

      {canAssignUsers && (
        <AssignUsersDialog
          isOpen={showAssignUsersDialog}
          onClose={() => setShowAssignUsersDialog(false)}
          project={{
            id: project.id,
            name: project.name,
            assignedUsers: project.assignedUsers || []
          }}
          onSuccess={() => {
            if (onRefresh) onRefresh()
          }}
        />
      )}

      <ProjectDetailsDialog
        isOpen={showDetailsDialog}
        onClose={() => setShowDetailsDialog(false)}
        project={project}
        users={users}
      />
    </Card>
  )
}
