"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { MessageSquare, Send, User } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

type Comment = {
  id: string
  text: string
  author: string
  date: string
}

interface CommentsDialogProps {
  projectId: string
  projectName: string
  comments: Comment[]
}

export function CommentsDialog({ projectId, projectName, comments }: CommentsDialogProps) {
  const [newComment, setNewComment] = useState("")
  const [projectComments, setProjectComments] = useState(comments)

  const handleAddComment = () => {
    if (newComment.trim()) {
      const comment: Comment = {
        id: Math.random().toString(36).substring(2, 9),
        text: newComment,
        author: localStorage.getItem("userEmail") || "Usuario",
        date: new Date().toLocaleDateString("es-ES", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
      }
      setProjectComments([...projectComments, comment])
      setNewComment("")
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <MessageSquare className="h-3.5 w-3.5 mr-1" />
          {projectComments.length}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Comentarios - {projectName}</DialogTitle>
          <DialogDescription>Conversaciones y notas sobre el proyecto</DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          {projectComments.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No hay comentarios aún</p>
              <p className="text-sm">Sé el primero en agregar un comentario</p>
            </div>
          ) : (
            projectComments.map((comment) => (
              <Card key={comment.id}>
                <CardContent className="pt-4">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-primary" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <p className="text-sm font-medium text-foreground">{comment.author}</p>
                        <p className="text-xs text-muted-foreground">{comment.date}</p>
                      </div>
                      <p className="text-sm text-foreground whitespace-pre-wrap">{comment.text}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        <div className="border-t pt-4 space-y-3">
          <Textarea
            placeholder="Escribe un comentario..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="min-h-[80px]"
          />
          <div className="flex justify-end">
            <Button onClick={handleAddComment} disabled={!newComment.trim()}>
              <Send className="h-4 w-4 mr-2" />
              Enviar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
