"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { 
  ExternalLink, 
  FileText, 
  GitBranch, 
  Globe, 
  Users, 
  Calendar,
  Tag,
  Building,
  Info,
} from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"

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

type Project = {
  id: string
  name: string
  description: string
  client: string
  environments: Environment[]
  techStack: string[]
  status: string
  docsUrl?: string
  gitlabUrl?: string
  comments?: Comment[]
  assignedUsers?: string[]
  createdAt?: string
  updatedAt?: string
}

interface ProjectDetailsDialogProps {
  isOpen: boolean
  onClose: () => void
  project: Project
  users?: Array<{ id: string; name: string; email: string }>
}

export function ProjectDetailsDialog({ 
  isOpen, 
  onClose, 
  project,
  users = []
}: ProjectDetailsDialogProps) {
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

  const getAssignedUserNames = () => {
    if (!project.assignedUsers || !users.length) return []
    
    return project.assignedUsers.map(userId => {
      const user = users.find(u => u.id === userId)
      return user ? user.name : `Usuario ${userId}`
    })
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "No disponible"
    try {
      return format(new Date(dateString), "dd 'de' MMMM 'de' yyyy 'a las' HH:mm", { locale: es })
    } catch {
      return dateString
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Info className="h-5 w-5" />
            Detalles del Proyecto
          </DialogTitle>
          <DialogDescription>
            Información completa del proyecto {project.name}
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="max-h-[70vh] pr-4">
          <div className="space-y-6">
            {/* Información General */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Building className="h-4 w-4" />
                <h3 className="text-lg font-semibold">Información General</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Nombre</label>
                  <p className="text-base font-medium">{project.name}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Cliente</label>
                  <p className="text-base">{project.client}</p>
                </div>
                
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-muted-foreground">Descripción</label>
                  <p className="text-base leading-relaxed">{project.description}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Estado</label>
                  <div className="mt-1">
                    <Badge className={`${statusColors[project.status as keyof typeof statusColors]} text-white`}>
                      {statusLabels[project.status as keyof typeof statusLabels]}
                    </Badge>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">ID del Proyecto</label>
                  <p className="text-sm text-muted-foreground font-mono">{project.id}</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Tecnologías */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4" />
                <h3 className="text-lg font-semibold">Tecnologías</h3>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {project.techStack.length > 0 ? (
                  project.techStack.map((tech) => (
                    <Badge key={tech} variant="outline" className="text-sm">
                      {tech}
                    </Badge>
                  ))
                ) : (
                  <p className="text-muted-foreground">No se han especificado tecnologías</p>
                )}
              </div>
            </div>

            <Separator />

            {/* Ambientes */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                <h3 className="text-lg font-semibold">Ambientes</h3>
                {project.environments.length > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {project.environments.length}
                  </Badge>
                )}
              </div>
              
              <div className="space-y-3">
                {project.environments.length > 0 ? (
                  project.environments.map((env, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{env.name}</p>
                        <p className="text-sm text-muted-foreground">{env.url}</p>
                      </div>
                      <Button size="sm" variant="outline" asChild>
                        <a href={env.url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4 mr-1" />
                          Abrir
                        </a>
                      </Button>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground">No se han configurado ambientes</p>
                )}
              </div>
            </div>

            <Separator />

            {/* Enlaces */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <ExternalLink className="h-4 w-4" />
                <h3 className="text-lg font-semibold">Enlaces</h3>
              </div>
              
              <div className="space-y-3">
                {project.docsUrl && (
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      <div>
                        <p className="font-medium">Documentación</p>
                        <p className="text-sm text-muted-foreground">{project.docsUrl}</p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline" asChild>
                      <a href={project.docsUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4 mr-1" />
                        Abrir
                      </a>
                    </Button>
                  </div>
                )}
                
                {project.gitlabUrl && (
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <GitBranch className="h-4 w-4" />
                      <div>
                        <p className="font-medium">Repositorio GitLab</p>
                        <p className="text-sm text-muted-foreground">{project.gitlabUrl}</p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline" asChild>
                      <a href={project.gitlabUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4 mr-1" />
                        Abrir
                      </a>
                    </Button>
                  </div>
                )}
                
                {!project.docsUrl && !project.gitlabUrl && (
                  <p className="text-muted-foreground">No se han configurado enlaces</p>
                )}
              </div>
            </div>

            <Separator />

            {/* Usuarios Asignados */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <h3 className="text-lg font-semibold">Usuarios Asignados</h3>
                {project.assignedUsers && project.assignedUsers.length > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {project.assignedUsers.length}
                  </Badge>
                )}
              </div>
              
              <div className="space-y-2">
                {getAssignedUserNames().length > 0 ? (
                  getAssignedUserNames().map((userName, index) => (
                    <div key={index} className="flex items-center p-2 border rounded">
                      <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{userName}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground">No hay usuarios asignados</p>
                )}
              </div>
            </div>

            <Separator />

            {/* Fechas */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <h3 className="text-lg font-semibold">Fechas</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Creado</label>
                  <p className="text-sm">{formatDate(project.createdAt)}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Última actualización</label>
                  <p className="text-sm">{formatDate(project.updatedAt)}</p>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>
        
        <div className="flex justify-end pt-4 border-t">
          <Button onClick={onClose}>Cerrar</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
} 