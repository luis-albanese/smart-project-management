import { useState, useEffect } from 'react'

interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'manager' | 'developer' | 'designer'
  department: string
}

interface Permissions {
  canCreateProjects: boolean
  canEditProjects: boolean
  canDeleteProjects: boolean
  canViewUsers: boolean
  canCreateUsers: boolean
  canEditUsers: boolean
  canDeleteUsers: boolean
  canViewStats: boolean
  canAssignUsers: boolean
}

export function usePermissions() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [permissions, setPermissions] = useState<Permissions>({
    canCreateProjects: false,
    canEditProjects: false,
    canDeleteProjects: false,
    canViewUsers: false,
    canCreateUsers: false,
    canEditUsers: false,
    canDeleteUsers: false,
    canViewStats: false,
    canAssignUsers: false,
  })

  useEffect(() => {
    fetchUser()
  }, [])

  const fetchUser = async () => {
    try {
      const response = await fetch('/api/auth/me')
      if (response.ok) {
        const data = await response.json()
        // La respuesta viene con { user: userData }
        const userData = data.user || data
        setUser(userData)
        calculatePermissions(userData.role)
      }
    } catch (error) {
      console.error('Error fetching user:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculatePermissions = (role: string) => {
    const newPermissions: Permissions = {
      canCreateProjects: false,
      canEditProjects: false,
      canDeleteProjects: false,
      canViewUsers: false,
      canCreateUsers: false,
      canEditUsers: false,
      canDeleteUsers: false,
      canViewStats: false,
      canAssignUsers: false,
    }

    switch (role) {
      case 'admin':
        // Admin puede hacer todo
        newPermissions.canCreateProjects = true
        newPermissions.canEditProjects = true
        newPermissions.canDeleteProjects = true
        newPermissions.canViewUsers = true
        newPermissions.canCreateUsers = true
        newPermissions.canEditUsers = true
        newPermissions.canDeleteUsers = true
        newPermissions.canViewStats = true
        newPermissions.canAssignUsers = true
        break
      
      case 'manager':
        // Manager puede ver estadísticas pero no gestionar usuarios
        newPermissions.canViewStats = true
        break
      
      case 'developer':
      case 'designer':
        // Solo acceso de lectura básico
        break
    }

    setPermissions(newPermissions)
  }

  return {
    user,
    loading,
    permissions,
    isAdmin: user?.role === 'admin',
    isManager: user?.role === 'manager',
    isDeveloper: user?.role === 'developer',
    isDesigner: user?.role === 'designer',
  }
} 