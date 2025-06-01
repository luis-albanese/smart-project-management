import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { BarChart3, TrendingUp, Users, FolderOpen, Activity } from "lucide-react"

export default function StatsLoading() {
  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Estadísticas de Proyectos</h1>
        <p className="text-muted-foreground">Año 2024</p>
      </div>

      {/* KPIs Loading */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[FolderOpen, Activity, Users, TrendingUp].map((Icon, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 w-20 bg-muted animate-pulse rounded" />
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-16 bg-muted animate-pulse rounded mb-2" />
              <div className="h-3 w-24 bg-muted animate-pulse rounded" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Loading */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader>
              <div className="h-6 w-48 bg-muted animate-pulse rounded mb-2" />
              <div className="h-4 w-64 bg-muted animate-pulse rounded" />
            </CardHeader>
            <CardContent>
              <div className="w-full h-[300px] bg-muted/20 animate-pulse rounded-lg flex items-center justify-center">
                <BarChart3 className="h-12 w-12 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
