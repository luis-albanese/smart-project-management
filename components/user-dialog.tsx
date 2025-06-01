"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Eye, EyeOff, FolderOpen } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

type User = {
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
  assignedProjects?: string[]
}

interface UserDialogProps {
  isOpen: boolean
  onClose: () => void
  onSave: (userData: any) => void
  user?: User | null
}

export function UserDialog({ isOpen, onClose, onSave, user }: UserDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "developer" as 'admin' | 'manager' | 'developer' | 'designer',
    department: "",
    status: "active" as 'active' | 'inactive',
    assignedProjects: [] as string[],
  })
  const [showPassword, setShowPassword] = useState(false)
  const [availableProjects, setAvailableProjects] = useState<Array<{id: string, name: string, client: string}>>([])
  const [loadingProjects, setLoadingProjects] = useState(false)

  // Cargar proyectos desde la API
  useEffect(() => {
    if (isOpen) {
      fetchProjects()
    }
  }, [isOpen])

  const fetchProjects = async () => {
    setLoadingProjects(true)
    try {
      const response = await fetch('/api/projects')
      const data = await response.json()

      if (response.ok) {
        // Mapear los proyectos al formato que necesitamos
        const projects = data.projects.map((project: any) => ({
          id: project.id,
          name: project.name,
          client: project.client
        }))
        setAvailableProjects(projects)
      } else {
        console.error('Error al cargar proyectos:', data.error)
        // Usar proyectos de ejemplo como fallback
        setAvailableProjects([
          { id: "1", name: "Portal Clientes", client: "Seguros XYZ" },
          { id: "2", name: "Sistema de Gestión", client: "Logística ABC" },
          { id: "3", name: "App Móvil Delivery", client: "FastFood" },
        ])
      }
    } catch (error) {
      console.error('Error fetching projects:', error)
      // Usar proyectos de ejemplo como fallback
      setAvailableProjects([
        { id: "1", name: "Portal Clientes", client: "Seguros XYZ" },
        { id: "2", name: "Sistema de Gestión", client: "Logística ABC" },
        { id: "3", name: "App Móvil Delivery", client: "FastFood" },
      ])
    } finally {
      setLoadingProjects(false)
    }
  }

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        password: "", // No mostrar la contraseña existente por seguridad
        role: user.role,
        department: user.department,
        status: user.status,
        assignedProjects: user.assignedProjects || [],
      })
    } else {
      setFormData({
        name: "",
        email: "",
        password: "",
        role: "developer",
        department: "",
        status: "active",
        assignedProjects: [],
      })
    }
  }, [user, isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Si estamos editando y no se proporciona nueva contraseña, no la incluimos
    const dataToSave: any = { ...formData }
    if (user && !formData.password) {
      delete dataToSave.password
    }

    onSave(dataToSave)
    onClose()
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleProjectToggle = (projectId: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      assignedProjects: checked
        ? [...prev.assignedProjects, projectId]
        : prev.assignedProjects.filter((id) => id !== projectId),
    }))
  }

  const handleSelectAllProjects = () => {
    const allProjectIds = availableProjects.map((p) => p.id)
    setFormData((prev) => ({
      ...prev,
      assignedProjects: allProjectIds,
    }))
  }

  const handleDeselectAllProjects = () => {
    setFormData((prev) => ({
      ...prev,
      assignedProjects: [],
    }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>{user ? "Editar Usuario" : "Nuevo Usuario"}</DialogTitle>
          <DialogDescription>
            {user ? "Modifica la información del usuario" : "Completa los datos para crear un nuevo usuario"}
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 min-h-0 overflow-y-auto pr-2">
          <form onSubmit={handleSubmit}>
            <div className="grid gap-6 py-4">
              {/* Información básica */}
              <div className="grid gap-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Nombre
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="email" className="text-right">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="password" className="text-right">
                    {user ? "Nueva Contraseña" : "Contraseña"}
                  </Label>
                  <div className="col-span-3 relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => handleChange("password", e.target.value)}
                      placeholder={user ? "Dejar vacío para no cambiar" : "Contraseña segura"}
                      required={!user}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="role" className="text-right">
                    Rol
                  </Label>
                  <Select value={formData.role} onValueChange={(value) => handleChange("role", value as 'admin' | 'manager' | 'developer' | 'designer')}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Selecciona un rol" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Administrador</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="developer">Desarrollador</SelectItem>
                      <SelectItem value="designer">Diseñador</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="department" className="text-right">
                    Departamento
                  </Label>
                  <Input
                    id="department"
                    value={formData.department}
                    onChange={(e) => handleChange("department", e.target.value)}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="status" className="text-right">
                    Estado
                  </Label>
                  <Select value={formData.status} onValueChange={(value) => handleChange("status", value as 'active' | 'inactive')}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Selecciona un estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Activo</SelectItem>
                      <SelectItem value="inactive">Inactivo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Asignación de proyectos */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FolderOpen className="h-4 w-4" />
                    Proyectos Asignados
                  </CardTitle>
                  <CardDescription>Selecciona los proyectos que este usuario puede ver y gestionar</CardDescription>
                  <div className="flex gap-2">
                    <Button type="button" variant="outline" size="sm" onClick={handleSelectAllProjects}>
                      Seleccionar Todos
                    </Button>
                    <Button type="button" variant="outline" size="sm" onClick={handleDeselectAllProjects}>
                      Deseleccionar Todos
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {loadingProjects ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                      <span className="ml-2 text-sm text-muted-foreground">Cargando proyectos...</span>
                    </div>
                  ) : (
                    <>
                      <div className="grid gap-3 max-h-64 overflow-y-auto pr-2">
                        {availableProjects.map((project) => (
                          <div key={project.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50 border">
                            <Checkbox
                              id={`project-${project.id}`}
                              checked={formData.assignedProjects.includes(project.id)}
                              onCheckedChange={(checked) => handleProjectToggle(project.id, checked as boolean)}
                            />
                            <div className="flex-1 min-w-0">
                              <Label htmlFor={`project-${project.id}`} className="text-sm font-medium cursor-pointer truncate block">
                                {project.name}
                              </Label>
                              <p className="text-xs text-muted-foreground truncate">{project.client}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-3 text-sm text-muted-foreground">
                        {formData.assignedProjects.length} de {availableProjects.length} proyectos seleccionados
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </form>
        </div>
        
        <DialogFooter className="mt-4 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" onClick={handleSubmit}>{user ? "Guardar Cambios" : "Crear Usuario"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
