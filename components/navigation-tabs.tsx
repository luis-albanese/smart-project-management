"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { usePermissions } from "@/hooks/use-permissions"
import { Home, BarChart3, Users, FolderPlus } from "lucide-react"

const allTabs = [
  {
    name: "Dashboard",
    href: "/",
    icon: Home,
    requiresPermission: null, // Todos pueden ver
  },
  {
    name: "Nuevo Proyecto",
    href: "/add-project",
    icon: FolderPlus,
    requiresPermission: "canCreateProjects",
  },
  {
    name: "Estadísticas",
    href: "/stats",
    icon: BarChart3,
    requiresPermission: "canViewStats",
  },
  {
    name: "Usuarios",
    href: "/users",
    icon: Users,
    requiresPermission: "canViewUsers",
  },
]

export function NavigationTabs() {
  const pathname = usePathname()
  const { permissions, loading } = usePermissions()

  if (loading) {
    return (
      <div className="border-b bg-background">
        <nav className="container mx-auto">
          <div className="flex space-x-8">
            {/* Skeleton para Dashboard (siempre visible) */}
            <div className="flex items-center gap-2 px-1 py-4">
              <div className="h-4 w-4 bg-muted animate-pulse rounded"></div>
              <div className="h-4 w-20 bg-muted animate-pulse rounded"></div>
            </div>
            
            {/* Skeletons adicionales para otras tabs */}
            <div className="flex items-center gap-2 px-1 py-4">
              <div className="h-4 w-4 bg-muted animate-pulse rounded"></div>
              <div className="h-4 w-24 bg-muted animate-pulse rounded"></div>
            </div>
            
            <div className="flex items-center gap-2 px-1 py-4">
              <div className="h-4 w-4 bg-muted animate-pulse rounded"></div>
              <div className="h-4 w-20 bg-muted animate-pulse rounded"></div>
            </div>
          </div>
        </nav>
      </div>
    )
  }

  // Filtrar tabs basado en permisos
  const allowedTabs = allTabs.filter(tab => {
    if (!tab.requiresPermission) return true
    return permissions[tab.requiresPermission as keyof typeof permissions]
  })

  return (
    <div className="border-b bg-background">
      <nav className="container mx-auto">
        <div className="flex space-x-8">
          {allowedTabs.map((tab) => {
            const Icon = tab.icon
            const isActive = pathname === tab.href
            
            return (
              <Link
                key={tab.name}
                href={tab.href}
                className={cn(
                  "flex items-center gap-2 border-b-2 border-transparent px-1 py-4 text-sm font-medium transition-colors hover:text-foreground/80",
                  isActive
                    ? "border-primary text-foreground"
                    : "text-foreground/60"
                )}
              >
                <Icon className="h-4 w-4" />
                {tab.name}
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
