"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3, PieChart } from "lucide-react"

export function StatsFallback() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Cargando Gráfico...
          </CardTitle>
          <CardDescription>Los datos se están cargando</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="w-full h-[300px] flex items-center justify-center bg-muted/20 rounded-lg">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            Cargando Gráfico...
          </CardTitle>
          <CardDescription>Los datos se están cargando</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="w-full h-[300px] flex items-center justify-center bg-muted/20 rounded-lg">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
