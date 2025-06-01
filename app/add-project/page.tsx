import { ProjectForm } from "@/components/project-form"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { AuthGuard } from "@/components/auth-guard"
import { Navbar } from "@/components/navbar"
import { PageTransition } from "@/components/page-transition"

export default function AddProjectPage() {
  return (
    <AuthGuard>
      <Navbar />
      <PageTransition>
        <div className="container mx-auto py-8 space-y-6">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="outline" size="icon">
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Volver</span>
              </Button>
            </Link>
            <h1 className="text-3xl font-bold">Nuevo Proyecto</h1>
          </div>

          <ProjectForm />
        </div>
      </PageTransition>
    </AuthGuard>
  )
}
