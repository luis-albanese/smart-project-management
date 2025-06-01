"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useState } from "react"
import { Plus, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"

const environmentSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  url: z.string().url("URL inválida"),
})

const formSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  description: z.string().min(10, "La descripción debe tener al menos 10 caracteres"),
  client: z.string().min(2, "El cliente es requerido"),
  techStack: z.string().min(2, "Las tecnologías son requeridas"),
  docsUrl: z.string().url("URL inválida").optional().or(z.literal("")),
  gitlabUrl: z.string().url("URL inválida").optional().or(z.literal("")),
  status: z.string(),
})

export function ProjectForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [environments, setEnvironments] = useState([
    { name: "Desarrollo", url: "" },
    { name: "QA", url: "" },
    { name: "Producción", url: "" },
  ])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      client: "",
      techStack: "",
      docsUrl: "",
      gitlabUrl: "",
      status: "active",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
      console.log('🚀 onSubmit iniciado en ProjectForm');
      console.log('📝 Valores del formulario:', values);
    try {
      setLoading(true)
      
      // Validar entornos
      const validEnvironments = environments.filter((env) => env.url.trim() !== "")

      if (validEnvironments.length === 0) {
        console.log('❌ Error: Debe agregar al menos un entorno con URL');
        toast.error("⚠️ Debe agregar al menos un entorno con URL válida")
        return
      }

      // Validar que las URLs de entornos sean válidas
      const invalidEnvironments = environments.filter(env => {
        if (env.url.trim() === "") return false; // Ya filtrados arriba
        try {
          new URL(env.url);
          return false; // URL válida
        } catch {
          return true; // URL inválida
        }
      });

      if (invalidEnvironments.length > 0) {
        console.log('❌ Error: URLs de entornos inválidas');
        toast.error(`⚠️ Las siguientes URLs de entornos son inválidas: ${invalidEnvironments.map(env => env.name || 'Sin nombre').join(', ')}`)
        return
      }

      // Convertir techStack de string a array
      const techStackArray = values.techStack
        .split(",")
        .map((tech) => tech.trim())
        .filter((tech) => tech !== "")

      // Preparar datos para enviar
      const dataToSend = {
        ...values,
        techStack: techStackArray,
        environments: validEnvironments,
      };

      // Crear proyecto usando la API
      console.log('📡 Enviando request a API...');
      console.log('💾 Datos a enviar:', JSON.stringify(dataToSend, null, 2));
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      })

      console.log('📨 Response status:', response.status);
      console.log('📨 Response ok:', response.ok);
      const data = await response.json();
      console.log('📨 Response data:', data);

      if (response.ok) {
        console.log('✅ Operación exitosa');
        toast.success('Proyecto creado exitosamente')
        
        // Esperar un momento para que el usuario vea la notificación
        setTimeout(() => {
          router.push("/")
        }, 1500)
      } else {
        console.log('❌ Error en operación:', data.error);
        toast.error(data.error || 'Error al crear proyecto')
      }
    } catch (error) {
      console.error("Error al crear el proyecto:", error)
      toast.error('Error de conexión al crear proyecto')
    } finally {
      setLoading(false)
    }
  }

  const addEnvironment = () => {
    setEnvironments([...environments, { name: "", url: "" }])
  }

  const removeEnvironment = (index: number) => {
    const newEnvironments = [...environments]
    newEnvironments.splice(index, 1)
    setEnvironments(newEnvironments)
  }

  const updateEnvironment = (index: number, field: string, value: string) => {
    const newEnvironments = [...environments]
    newEnvironments[index] = { ...newEnvironments[index], [field]: value }
    setEnvironments(newEnvironments)
  }

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Información del Proyecto</CardTitle>
              <CardDescription>Ingresa los datos básicos del proyecto</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre del Proyecto</FormLabel>
                    <FormControl>
                      <Input placeholder="Portal de Clientes" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Breve descripción del proyecto" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="client"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cliente</FormLabel>
                    <FormControl>
                      <Input placeholder="Nombre del cliente" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="techStack"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tecnologías</FormLabel>
                    <FormControl>
                      <Input placeholder="React, Node.js, MongoDB" {...field} />
                    </FormControl>
                    <FormDescription>Separadas por comas</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="docsUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL Documentación</FormLabel>
                    <FormControl>
                      <Input placeholder="https://docs.proyecto.com" {...field} />
                    </FormControl>
                    <FormDescription>Enlace a la carpeta de documentación</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="gitlabUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Repositorio GitLab</FormLabel>
                    <FormControl>
                      <Input placeholder="https://gitlab.com/proyecto" {...field} />
                    </FormControl>
                    <FormDescription>Enlace al repositorio en GitLab</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estado</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona un estado" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="active">Activo</SelectItem>
                        <SelectItem value="maintenance">Mantenimiento</SelectItem>
                        <SelectItem value="completed">Completado</SelectItem>
                        <SelectItem value="archived">Archivado</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Entornos</CardTitle>
              <CardDescription>Configura las URLs de los diferentes entornos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {environments.map((env, index) => (
                  <div key={index} className="grid gap-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium">Entorno {index + 1}</h4>
                      {environments.length > 1 && (
                        <Button type="button" variant="ghost" size="sm" onClick={() => removeEnvironment(index)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-sm font-medium">Nombre</label>
                        <Input
                          value={env.name}
                          onChange={(e) => updateEnvironment(index, "name", e.target.value)}
                          placeholder="Desarrollo, QA, Producción"
                          className={!env.name.trim() ? "border-amber-200 bg-amber-50/50" : ""}
                        />
                        {!env.name.trim() && (
                          <p className="text-xs text-amber-600 mt-1">⚠️ Nombre requerido</p>
                        )}
                      </div>
                      <div>
                        <label className="text-sm font-medium">URL</label>
                        <Input
                          value={env.url}
                          onChange={(e) => updateEnvironment(index, "url", e.target.value)}
                          placeholder="https://ejemplo.com"
                          className={
                            !env.url.trim() 
                              ? "border-rose-200 bg-rose-50/50" 
                              : env.url.trim() && !isValidUrl(env.url) 
                                ? "border-orange-200 bg-orange-50/50"
                                : env.url.trim() 
                                  ? "border-emerald-200 bg-emerald-50/50"
                                  : ""
                          }
                        />
                        {!env.url.trim() ? (
                          <p className="text-xs text-rose-600 mt-1">❌ URL requerida</p>
                        ) : env.url.trim() && !isValidUrl(env.url) ? (
                          <p className="text-xs text-orange-600 mt-1">⚠️ URL inválida</p>
                        ) : env.url.trim() ? (
                          <p className="text-xs text-emerald-600 mt-1">✅ URL válida</p>
                        ) : null}
                      </div>
                    </div>
                  </div>
                ))}

                <Button type="button" variant="outline" size="sm" className="w-full" onClick={addEnvironment}>
                  <Plus className="mr-2 h-4 w-4" />
                  Agregar Entorno
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => router.push("/")}>
            Cancelar
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Creando..." : "Guardar Proyecto"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
