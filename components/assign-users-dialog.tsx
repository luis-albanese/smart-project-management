"use client"

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { useState, useEffect, useMemo, useCallback } from "react"
import { toast } from "sonner"
import { Users } from "lucide-react"

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
}

interface Project {
  id: string;
  name: string;
  assignedUsers: string[];
}

interface AssignUsersDialogProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project | null;
  onSuccess: () => void;
}

export function AssignUsersDialog({ isOpen, onClose, project, onSuccess }: AssignUsersDialogProps) {
  const [users, setUsers] = useState<User[]>([])
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingUsers, setLoadingUsers] = useState(false)

  // Memorizar assignedUsers para evitar re-renderizados
  const assignedUsers = useMemo(() => {
    return project?.assignedUsers || []
  }, [project?.id, JSON.stringify(project?.assignedUsers)])

  const fetchUsers = useCallback(async () => {
    setLoadingUsers(true)
    try {
      const response = await fetch('/api/users')
      const data = await response.json()

      if (response.ok) {
        setUsers(data.users)
      } else {
        toast.error(data.error || 'Error al cargar usuarios')
      }
    } catch (error) {
      console.error('Error fetching users:', error)
      toast.error('Error de conexión al cargar usuarios')
    } finally {
      setLoadingUsers(false)
    }
  }, [])

  // Cargar usuarios cuando se abre el dialog
  useEffect(() => {
    if (isOpen) {
      fetchUsers()
    }
  }, [isOpen, fetchUsers])

  // Actualizar selectedUserIds cuando cambie el proyecto
  useEffect(() => {
    if (project) {
      setSelectedUserIds(assignedUsers)
    }
  }, [project?.id, assignedUsers])

  const handleUserToggle = (userId: string) => {
    setSelectedUserIds(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    )
  }

  const handleSave = async () => {
    if (!project) return

    setLoading(true)
    try {
      const response = await fetch(`/api/projects/${project.id}/assign-users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userIds: selectedUserIds }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Usuarios asignados exitosamente')
        onSuccess()
        onClose()
      } else {
        toast.error(data.error || 'Error al asignar usuarios')
      }
    } catch (error) {
      console.error('Error assigning users:', error)
      toast.error('Error de conexión al asignar usuarios')
    } finally {
      setLoading(false)
    }
  }

  if (!project) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Asignar Usuarios - {project.name}
          </DialogTitle>
          <DialogDescription>
            Selecciona los usuarios que tendrán acceso a este proyecto
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {loadingUsers ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="space-y-4 max-h-[300px] overflow-y-auto">
              {users.map((user) => (
                <div key={user.id} className="flex items-center space-x-3 p-3 rounded-lg border">
                  <Checkbox
                    id={user.id}
                    checked={selectedUserIds.includes(user.id)}
                    onCheckedChange={() => handleUserToggle(user.id)}
                  />
                  <div className="flex-1">
                    <label 
                      htmlFor={user.id} 
                      className="text-sm font-medium cursor-pointer"
                    >
                      {user.name}
                    </label>
                    <p className="text-xs text-muted-foreground">
                      {user.email} - {user.role} ({user.department})
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={loading || loadingUsers}>
            {loading ? "Guardando..." : "Guardar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 