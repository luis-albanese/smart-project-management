export type Environment = {
  name: string
  url: string
}

export type Comment = {
  id: string
  text: string
  author: string
  date: string
}

export type Project = {
  id: string
  name: string
  description: string
  client: string
  environments: Environment[]
  techStack: string[]
  status: string
  docsUrl?: string
  gitlabUrl?: string
  comments?: Comment[]
  assignedUsers?: string[]
  createdAt?: string
  updatedAt?: string
}

export type User = {
  id: string
  name: string
  email: string
  role: string
  department: string
} 