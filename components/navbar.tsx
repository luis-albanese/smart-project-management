"use client"

import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { LogOut, User } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import Image from "next/image"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"

interface UserData {
  id: string
  name: string
  email: string
  role: string
  department: string
}

export function Navbar() {
  const [user, setUser] = useState<UserData | null>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/auth/me', {
          credentials: 'include'
        })
        
        if (response.ok) {
          const data = await response.json()
          setUser(data.user)
        }
      } catch (error) {
        console.error('Error obteniendo datos del usuario:', error)
      }
    }

    fetchUser()
  }, [])

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      })

      if (response.ok) {
        toast.success('Sesión cerrada exitosamente')
        router.push("/login")
        router.refresh()
      } else {
        toast.error('Error al cerrar sesión')
      }
    } catch (error) {
      console.error('Error en logout:', error)
      toast.error('Error de conexión al cerrar sesión')
    }
  }

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Image src="/logo-smartway.png" alt="Smartway" width={120} height={36} className="dark:invert" />
          <div className="hidden md:block">
            <h1 className="text-lg font-semibold">Gestión de Proyectos</h1>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <ThemeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <User className="h-4 w-4" />
                <span className="sr-only">Menú de usuario</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {user && (
                <>
                  <div className="px-2 py-1.5 text-sm">
                    <div className="font-medium">{user.name}</div>
                    <div className="text-muted-foreground text-xs">{user.email}</div>
                    <div className="text-muted-foreground text-xs capitalize">{user.role} - {user.department}</div>
                  </div>
                  <DropdownMenuSeparator />
                </>
              )}
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Cerrar Sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  )
}
