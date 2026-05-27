import { create } from 'zustand'
import { api } from '../lib/api'
import toast from 'react-hot-toast'

export type TaskStatus = 'todo' | 'in_progress' | 'in_review' | 'done'
export type Priority = 'low' | 'medium' | 'high'
export type ProjectStatus = 'active' | 'on_hold' | 'completed'
export type Label = 'bug' | 'feature' | 'design' | 'docs' | 'urgente'

export interface Comment {
  id: string
  author: string
  avatar: string
  text: string
  createdAt: string
}

export interface Task {
  id: string
  title: string
  description?: string
  status: TaskStatus
  priority: Priority
  assignee?: string
  dueDate?: string
  projectId: string
  labels?: Label[]
  comments?: Comment[]
  createdAt?: string
  updatedAt?: string
}

export interface Project {
  id: string
  name: string
  description: string
  color: string
  status: ProjectStatus
  dueDate: string
  memberCount: number
}

interface ProjectStore {
  projects: Project[]
  tasks: Task[]
  loaded: boolean
  init: () => Promise<void>
  reset: () => void
  moveTask: (taskId: string, newStatus: TaskStatus) => void
  updateTask: (taskId: string, updates: Partial<Task>) => void
  addTask: (task: Omit<Task, 'id'>) => void
  deleteTask: (taskId: string) => void
  addProject: (project: Omit<Project, 'id'>) => void
  deleteProject: (projectId: string) => void
  addComment: (taskId: string, comment: Omit<Comment, 'id'>) => void
}

export const useProjectStore = create<ProjectStore>()((set, get) => ({
  projects: [],
  tasks: [],
  loaded: false,

  init: async () => {
    if (get().loaded) return
    try {
      const projects = await api.get<Project[]>('/api/projects')
      const taskGroups = await Promise.all(
        projects.map(p => api.get<Task[]>(`/api/projects/${p.id}/tasks`))
      )
      set({ projects, tasks: taskGroups.flat(), loaded: true })
    } catch {
      set({ loaded: true })
    }
  },

  reset: () => set({ projects: [], tasks: [], loaded: false }),

  moveTask: (taskId, newStatus) => {
    const prev = get().tasks.find(t => t.id === taskId)
    set(s => ({ tasks: s.tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t) }))
    api.patch(`/api/tasks/${taskId}/move`, { status: newStatus }).catch(() => {
      if (prev) set(s => ({ tasks: s.tasks.map(t => t.id === taskId ? prev : t) }))
    })
  },

  updateTask: (taskId, updates) => {
    set(s => ({ tasks: s.tasks.map(t => t.id === taskId ? { ...t, ...updates } : t) }))
    api.put(`/api/tasks/${taskId}`, updates).catch(() => toast.error('Erro ao atualizar tarefa'))
  },

  addTask: (task) => {
    const tempId = `temp-${Date.now()}`
    set(s => ({ tasks: [...s.tasks, { ...task, id: tempId }] }))
    api.post<Task>(`/api/projects/${task.projectId}/tasks`, task).then(created => {
      set(s => ({ tasks: s.tasks.map(t => t.id === tempId ? created : t) }))
    }).catch(() => {
      set(s => ({ tasks: s.tasks.filter(t => t.id !== tempId) }))
      toast.error('Erro ao criar tarefa')
    })
  },

  deleteTask: (taskId) => {
    const backup = get().tasks.find(t => t.id === taskId)
    set(s => ({ tasks: s.tasks.filter(t => t.id !== taskId) }))
    api.delete(`/api/tasks/${taskId}`).catch(() => {
      if (backup) set(s => ({ tasks: [...s.tasks, backup] }))
      toast.error('Erro ao deletar tarefa')
    })
  },

  addProject: (project) => {
    const tempId = `temp-${Date.now()}`
    set(s => ({ projects: [...s.projects, { ...project, id: tempId }] }))
    api.post<Project>('/api/projects', project).then(created => {
      set(s => ({ projects: s.projects.map(p => p.id === tempId ? created : p) }))
    }).catch(() => {
      set(s => ({ projects: s.projects.filter(p => p.id !== tempId) }))
      toast.error('Erro ao criar projeto')
    })
  },

  deleteProject: (projectId) => {
    const removedProject = get().projects.find(p => p.id === projectId)
    const removedTasks = get().tasks.filter(t => t.projectId === projectId)
    set(s => ({
      projects: s.projects.filter(p => p.id !== projectId),
      tasks: s.tasks.filter(t => t.projectId !== projectId),
    }))
    api.delete(`/api/projects/${projectId}`).catch(() => {
      if (removedProject) set(s => ({
        projects: [...s.projects, removedProject],
        tasks: [...s.tasks, ...removedTasks],
      }))
      toast.error('Erro ao deletar projeto')
    })
  },

  addComment: (taskId, comment) => {
    const tempId = `temp-${Date.now()}`
    set(s => ({
      tasks: s.tasks.map(t => t.id === taskId
        ? { ...t, comments: [...(t.comments ?? []), { ...comment, id: tempId }] }
        : t
      ),
    }))
    api.post<Comment>(`/api/tasks/${taskId}/comments`, { text: comment.text }).then(created => {
      set(s => ({
        tasks: s.tasks.map(t => t.id === taskId
          ? { ...t, comments: (t.comments ?? []).map(c => c.id === tempId ? created : c) }
          : t
        ),
      }))
    }).catch(() => {
      set(s => ({
        tasks: s.tasks.map(t => t.id === taskId
          ? { ...t, comments: (t.comments ?? []).filter(c => c.id !== tempId) }
          : t
        ),
      }))
      toast.error('Erro ao adicionar comentário')
    })
  },
}))
