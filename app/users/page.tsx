"use client"

import { AuthGuard } from "@/components/auth-guard"
import { Navbar } from "@/components/navbar"
import { NavigationTabs } from "@/components/navigation-tabs"
import { PageTransition } from "@/components/page-transition"
import { UserCard } from "@/components/user-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Search, Loader2, AlertCircle } from "lucide-react"
import { useState, useEffect } from "react"
import { UserDialog } from "@/components/user-dialog"
import { DeleteConfirmationDialog } from "@/components/delete-confirmation-dialog"
import { usePermissions } from "@/hooks/use-permissions"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'developer' | 'designer';
  department: string;
  status: 'active' | 'inactive';
  avatar?: string;
  joinDate: string;
  lastLogin?: string;
  projectsCount: number;
  assignedProjects: string[];
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedRole, setSelectedRole] = useState("all")
  const [showUserDialog, setShowUserDialog] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [userToDelete, setUserToDelete] = useState<User | null>(null)
  const [deletingUser, setDeletingUser] = useState(false)
  const { permissions, loading: permissionsLoading } = usePermissions()
  const router = useRouter()

  useEffect(() => {
    if (!permissionsLoading && !permissions.canViewUsers) {
      // Redirigir si no tiene permisos
      router.push('/')
      toast.error('No tienes permisos para acceder a esta sección')
      return
    }
    if (permissions.canViewUsers) {
      fetchUsers()
    }
  }, [permissions, permissionsLoading])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/users')
      const data = await response.json()

      if (response.ok) {
        setUsers(data.users)
      } else {
        console.error('Error al cargar usuarios:', data.error)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  const openCreateDialog = () => {
    setEditingUser(null)
    setShowUserDialog(true)
  }

  const openEditDialog = (user: User) => {
    setEditingUser(user)
    setShowUserDialog(true)
  }

  const handleDeleteUser = (user: User) => {
    setUserToDelete(user)
    setShowDeleteDialog(true)
  }

  const confirmDeleteUser = async () => {
    if (!userToDelete) return

    try {
      setDeletingUser(true)
      const response = await fetch(`/api/users/${userToDelete.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('Usuario eliminado exitosamente')
        await fetchUsers()
      } else {
        const data = await response.json()
        toast.error(data.error || 'Error al eliminar usuario')
      }
    } catch (error) {
      console.error('Error deleting user:', error)
      toast.error('Error de conexión al eliminar usuario')
    } finally {
      setDeletingUser(false)
      setShowDeleteDialog(false)
      setUserToDelete(null)
    }
  }

  const handleSaveUser = async (userData: any) => {
    try {
      const isEditing = !!editingUser
      const url = isEditing ? `/api/users/${editingUser.id}` : '/api/users'
      const method = isEditing ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(isEditing ? 'Usuario actualizado exitosamente' : 'Usuario creado exitosamente')
        setShowUserDialog(false)
        setEditingUser(null)
        await fetchUsers()
      } else {
        toast.error(data.error || 'Error al guardar usuario')
      }
    } catch (error) {
      console.error('Error saving user:', error)
      toast.error('Error de conexión al guardar usuario')
    }
  }

  // Filtrar usuarios
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.department.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = selectedRole === "all" || user.role === selectedRole
    return matchesSearch && matchesRole
  })

  if (permissionsLoading) {
    return (
      <AuthGuard>
        <Navbar />
        <NavigationTabs />
        <PageTransition>
          <div className="container mx-auto py-8">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <Loader2 className="animate-spin mx-auto h-8 w-8 text-primary mb-4" />
                <p>Verificando permisos...</p>
              </div>
            </div>
          </div>
        </PageTransition>
      </AuthGuard>
    )
  }

  if (!permissions.canViewUsers) {
    return (
      <AuthGuard>
        <Navbar />
        <NavigationTabs />
        <PageTransition>
          <div className="container mx-auto py-8">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Acceso Denegado</h3>
                <p className="text-muted-foreground mb-4">
                  No tienes permisos para acceder a esta sección
                </p>
                <Button onClick={() => router.push('/')}>
                  Volver al Dashboard
                </Button>
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
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Gestión de Usuarios</h1>
            {permissions.canCreateUsers && (
              <Button onClick={openCreateDialog}>
                <Plus className="mr-2 h-4 w-4" />
                Nuevo Usuario
              </Button>
            )}
          </div>

          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar usuarios..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="h-10 rounded-md border border-input bg-background px-3 py-2"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
            >
              <option value="all">Todos los roles</option>
              <option value="admin">Administrador</option>
              <option value="manager">Manager</option>
              <option value="developer">Desarrollador</option>
              <option value="designer">Diseñador</option>
            </select>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <Loader2 className="animate-spin mx-auto h-8 w-8 text-primary mb-4" />
                <p>Cargando usuarios...</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredUsers.map((user) => (
                <UserCard 
                  key={user.id} 
                  user={user} 
                  onEdit={permissions.canEditUsers ? openEditDialog : undefined} 
                  onDelete={permissions.canDeleteUsers ? handleDeleteUser : undefined} 
                />
              ))}
            </div>
          )}

          {/* Dialog para crear/editar usuario */}
          {permissions.canCreateUsers && (
            <UserDialog
              isOpen={showUserDialog}
              onClose={() => {
                setShowUserDialog(false)
                setEditingUser(null)
              }}
              onSave={handleSaveUser}
              user={editingUser}
            />
          )}

          {/* Dialog de confirmación para eliminar */}
          <DeleteConfirmationDialog
            isOpen={showDeleteDialog}
            onClose={() => {
              setShowDeleteDialog(false)
              setUserToDelete(null)
            }}
            onConfirm={confirmDeleteUser}
            title="Eliminar Usuario"
            description="¿Estás seguro de que deseas eliminar este usuario?"
            itemName={userToDelete?.name || ""}
            isLoading={deletingUser}
          />
        </div>
      </PageTransition>
    </AuthGuard>
  )
}
