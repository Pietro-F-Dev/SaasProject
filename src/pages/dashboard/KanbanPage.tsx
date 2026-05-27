import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import type { DragStartEvent, DragEndEvent } from '@dnd-kit/core'
import { DndContext, DragOverlay, closestCorners, PointerSensor, useSensor, useSensors, useDroppable } from '@dnd-kit/core'
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, ArrowLeft, Flag, X, Trash2, GripVertical, Loader2, Kanban, CalendarDays, List, ChevronLeft, ChevronRight, Tag, MessageSquare, Send, Search, Activity, AlertCircle } from 'lucide-react'
import { useProjectStore } from '../../store/projectStore'
import type { Task, TaskStatus, Priority, Label } from '../../store/projectStore'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import confetti from 'canvas-confetti'

const columns: { id: TaskStatus; label: string; color: string }[] = [
  { id: 'todo', label: 'A fazer', color: '#9CA3AF' },
  { id: 'in_progress', label: 'Em andamento', color: '#F59E0B' },
  { id: 'in_review', label: 'Em revisão', color: '#6366F1' },
  { id: 'done', label: 'Concluído', color: '#059669' },
]

const priorityColors: Record<Priority, string> = {
  low: 'text-[#6B7280] bg-[#F3F4F6] dark:bg-[#374151]',
  medium: 'text-[#F59E0B] bg-[#FEF3C7] dark:bg-[#451a03]',
  high: 'text-[#EF4444] bg-[#FEF2F2] dark:bg-[#450a0a]',
}
const priorityLabels: Record<Priority, string> = { low: 'Baixa', medium: 'Média', high: 'Alta' }


const columnColors: Record<TaskStatus, string> = {
  todo: '#9CA3AF',
  in_progress: '#F59E0B',
  in_review: '#6366F1',
  done: '#059669',
}

const labelStyles: Record<Label, { bg: string; text: string }> = {
  bug: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-600 dark:text-red-400' },
  feature: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-600 dark:text-purple-400' },
  design: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-600 dark:text-blue-400' },
  docs: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-600 dark:text-yellow-400' },
  urgente: { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-600 dark:text-orange-400' },
}

const ALL_LABELS: Label[] = ['bug', 'feature', 'design', 'docs', 'urgente']

type ViewMode = 'kanban' | 'calendar' | 'list'

export default function KanbanPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const { projects, tasks, moveTask, addTask, deleteTask, updateTask, addComment } = useProjectStore()
  const { user } = useAuth()
  const isViewer = user?.role === 'viewer'
  const project = projects.find(p => p.id === projectId)
  const projectTasks = tasks.filter(t => t.projectId === projectId)

  const [activeTask, setActiveTask] = useState<Task | null>(null)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [addingColumn, setAddingColumn] = useState<TaskStatus | null>(null)
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [view, setView] = useState<ViewMode>('kanban')
  const [searchQuery, setSearchQuery] = useState('')
  const [labelFilter, setLabelFilter] = useState<Label | null>(null)
  const [activityOpen, setActivityOpen] = useState(false)

  const fireConfetti = () => {
    confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 }, colors: ['#059669', '#10B981', '#34D399', '#6EE7B7', '#A7F3D0'] })
  }

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }))

  const handleDragStart = (e: DragStartEvent) => {
    setActiveTask(tasks.find(t => t.id === e.active.id) || null)
  }

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e
    setActiveTask(null)
    if (!over) return
    const taskId = active.id as string
    const overId = over.id as string
    const isColumn = columns.some(c => c.id === overId)
    const originalTask = tasks.find(t => t.id === taskId)
    if (isColumn) {
      moveTask(taskId, overId as TaskStatus)
      if (overId === 'done' && originalTask?.status !== 'done') fireConfetti()
    } else {
      const overTask = tasks.find(t => t.id === overId)
      if (overTask && overTask.id !== taskId) {
        moveTask(taskId, overTask.status)
        if (overTask.status === 'done' && originalTask?.status !== 'done') fireConfetti()
      }
    }
  }

  const handleAddTask = (status: TaskStatus) => {
    if (!newTaskTitle.trim() || !projectId) return
    addTask({ title: newTaskTitle.trim(), status, priority: 'medium', projectId })
    toast.success('Tarefa criada!')
    setNewTaskTitle('')
    setAddingColumn(null)
  }

  // Sync selectedTask from store (so comments/labels update in modal)
  const selectedTaskFromStore = selectedTask ? tasks.find(t => t.id === selectedTask.id) || selectedTask : null

  const filteredTasks = projectTasks.filter(t => {
    const matchSearch = !searchQuery || t.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchLabel = !labelFilter || (t.labels || []).includes(labelFilter)
    return matchSearch && matchLabel
  })

  if (!project) return (
    <div className="flex flex-col items-center justify-center h-64 gap-4">
      <p className="text-[#6B7280]">Projeto não encontrado</p>
      <Link to="/dashboard/projects" className="text-[#059669] hover:underline text-sm">← Voltar</Link>
    </div>
  )

  return (
    <div className="h-full flex flex-col gap-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-4">
          <Link to="/dashboard/projects" className="text-[#9CA3AF] hover:text-[#6B7280] transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg" style={{ backgroundColor: project.color }} />
            <div>
              <h1 className="font-bold text-[#1F2937] dark:text-[#F9FAFB] text-lg leading-none">{project.name}</h1>
              <p className="text-xs text-[#9CA3AF] mt-0.5">{projectTasks.length} tarefas</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Buscar tarefas..."
              className="pl-8 pr-3 py-1.5 text-sm bg-white dark:bg-[#1F2937] border border-[#E5E7EB] dark:border-[#374151] rounded-lg text-[#1F2937] dark:text-[#F9FAFB] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#059669] w-40"
            />
          </div>

          <div className="flex items-center gap-1">
            {ALL_LABELS.map(label => (
              <motion.button
                key={label}
                onClick={() => setLabelFilter(prev => prev === label ? null : label)}
                className={`text-[10px] font-semibold px-2 py-1 rounded-full border transition-all ${
                  labelFilter === label
                    ? `${labelStyles[label].bg} ${labelStyles[label].text} border-current`
                    : 'border-[#E5E7EB] dark:border-[#374151] text-[#9CA3AF] hover:border-[#D1D5DB]'
                }`}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
              >
                {label}
              </motion.button>
            ))}
          </div>

          <motion.button
            onClick={() => setActivityOpen(true)}
            className="p-2 text-[#6B7280] dark:text-[#9CA3AF] hover:bg-[#F3F4F6] dark:hover:bg-[#374151] rounded-lg transition-colors"
            title="Ver atividade"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.88 }}
          >
            <Activity size={16} />
          </motion.button>
        </div>

        <div className="flex items-center gap-1 bg-[#F3F4F6] dark:bg-[#111827] rounded-lg p-1">
          {([
            { id: 'kanban', icon: Kanban, label: 'Kanban' },
            { id: 'calendar', icon: CalendarDays, label: 'Calendário' },
            { id: 'list', icon: List, label: 'Lista' },
          ] as const).map(v => (
            <motion.button
              key={v.id}
              onClick={() => setView(v.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                view === v.id
                  ? 'bg-white dark:bg-[#374151] text-[#1F2937] dark:text-[#F9FAFB] shadow-sm'
                  : 'text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#1F2937] dark:hover:text-[#F9FAFB]'
              }`}
              whileTap={{ scale: 0.95 }}
            >
              <v.icon size={13} /> {v.label}
            </motion.button>
          ))}
        </div>
      </div>

      {view === 'kanban' && (
        <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div className="flex gap-4 overflow-x-auto pb-4 flex-1">
            {columns.map(col => {
              const colTasks = filteredTasks.filter(t => t.status === col.id)
              return (
                <Column
                  key={col.id}
                  column={col}
                  tasks={colTasks}
                  onTaskClick={setSelectedTask}
                  isAdding={addingColumn === col.id}
                  newTaskTitle={newTaskTitle}
                  setNewTaskTitle={setNewTaskTitle}
                  onAddStart={() => !isViewer && setAddingColumn(col.id)}
                  onAddCancel={() => { setAddingColumn(null); setNewTaskTitle('') }}
                  onAddConfirm={() => handleAddTask(col.id)}
                  canAdd={!isViewer}
                />
              )
            })}
          </div>

          <DragOverlay>
            {activeTask ? <TaskCard task={activeTask} isOverlay /> : null}
          </DragOverlay>
        </DndContext>
      )}

      {view === 'calendar' && (
        <div className="flex-1 overflow-y-auto">
          <CalendarView tasks={filteredTasks} onTaskClick={setSelectedTask} />
        </div>
      )}

      {view === 'list' && (
        <div className="flex-1 overflow-y-auto">
          <ListView tasks={filteredTasks} onTaskClick={setSelectedTask} />
        </div>
      )}

      {selectedTaskFromStore && (
        <TaskModal
          task={selectedTaskFromStore}
          readOnly={isViewer}
          onClose={() => setSelectedTask(null)}
          onUpdate={(updates) => {
            if (updates.status === 'done' && selectedTaskFromStore.status !== 'done') fireConfetti()
            updateTask(selectedTaskFromStore.id, updates)
            setSelectedTask({ ...selectedTaskFromStore, ...updates })
          }}
          onDelete={() => { deleteTask(selectedTaskFromStore.id); toast.success('Tarefa removida'); setSelectedTask(null) }}
          onAddComment={(text) => {
            if (user) addComment(selectedTaskFromStore.id, { author: user.name, avatar: user.avatar, text, createdAt: new Date().toISOString().split('T')[0] })
          }}
        />
      )}

      <ActivityDrawer open={activityOpen} onClose={() => setActivityOpen(false)} projectId={projectId!} />
    </div>
  )
}

function Column({ column, tasks, onTaskClick, isAdding, newTaskTitle, setNewTaskTitle, onAddStart, onAddCancel, onAddConfirm, canAdd }: {
  column: { id: TaskStatus; label: string; color: string }
  tasks: Task[]
  onTaskClick: (task: Task) => void
  isAdding: boolean
  newTaskTitle: string
  setNewTaskTitle: (v: string) => void
  onAddStart: () => void
  onAddCancel: () => void
  onAddConfirm: () => void
  canAdd: boolean
}) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id })

  return (
    <div className="flex flex-col w-72 shrink-0">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: column.color }} />
          <span className="text-sm font-medium text-[#374151] dark:text-[#D1D5DB]">{column.label}</span>
          <span className="text-xs bg-[#F3F4F6] dark:bg-[#374151] text-[#9CA3AF] px-2 py-0.5 rounded-full">{tasks.length}</span>
        </div>
        {canAdd && (
          <motion.button
            onClick={onAddStart}
            className="text-[#9CA3AF] hover:text-[#059669] transition-colors"
            whileHover={{ scale: 1.2, rotate: 90 }}
            whileTap={{ scale: 0.85 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
          >
            <Plus size={16} />
          </motion.button>
        )}
      </div>

      <div
        ref={setNodeRef}
        className={`flex-1 min-h-[200px] rounded-xl p-2 transition-colors ${isOver ? 'bg-[#ECFDF5] dark:bg-[#064E3B]/30 ring-2 ring-[#059669]/30' : 'bg-[#F3F4F6] dark:bg-[#111827]'}`}
      >
        <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          <div className="flex flex-col gap-2">
            {tasks.map(task => (
              <SortableTaskCard key={task.id} task={task} onClick={() => onTaskClick(task)} />
            ))}
          </div>
        </SortableContext>

        {isAdding && (
          <div className="mt-2 bg-white dark:bg-[#1F2937] rounded-lg p-2 border border-[#E5E7EB] dark:border-[#374151]">
            <input
              autoFocus
              value={newTaskTitle}
              onChange={e => setNewTaskTitle(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') onAddConfirm(); if (e.key === 'Escape') onAddCancel() }}
              placeholder="Nome da tarefa..."
              className="w-full text-sm bg-transparent text-[#1F2937] dark:text-[#F9FAFB] placeholder:text-[#9CA3AF] outline-none"
            />
            <div className="flex gap-2 mt-2">
              <button onClick={onAddConfirm} disabled={!newTaskTitle.trim()} className="text-xs bg-[#059669] disabled:opacity-50 text-white px-2.5 py-1 rounded-md font-medium">
                Adicionar
              </button>
              <button onClick={onAddCancel} className="text-xs text-[#9CA3AF] hover:text-[#6B7280]">Cancelar</button>
            </div>
          </div>
        )}

        {tasks.length === 0 && !isAdding && canAdd && (
          <motion.button
            onClick={onAddStart}
            className="w-full flex flex-col items-center justify-center h-24 text-[#9CA3AF] hover:text-[#6B7280] transition-colors"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
          >
            <motion.div whileHover={{ rotate: 90 }} transition={{ type: 'spring', stiffness: 400, damping: 17 }}>
              <Plus size={20} className="mb-1" />
            </motion.div>
            <span className="text-xs">Adicionar tarefa</span>
          </motion.button>
        )}
      </div>
    </div>
  )
}

function SortableTaskCard({ task, onClick }: { task: Task; onClick: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id })
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 }}
    >
      <TaskCard task={task} onClick={onClick} dragListeners={listeners} dragAttributes={attributes} />
    </div>
  )
}

function TaskCard({ task, onClick, dragListeners, dragAttributes, isOverlay }: {
  task: Task
  onClick?: () => void
  dragListeners?: ReturnType<typeof useSortable>['listeners']
  dragAttributes?: ReturnType<typeof useSortable>['attributes']
  isOverlay?: boolean
}) {
  const today = new Date().toISOString().split('T')[0]
  const isOverdue = !isOverlay && task.dueDate && task.dueDate < today && task.status !== 'done'

  return (
    <motion.div
      onClick={onClick}
      className={`bg-white dark:bg-[#1F2937] rounded-lg p-3 border cursor-pointer group transition-shadow ${
        isOverlay ? 'shadow-xl rotate-2 scale-105 border-[#E5E7EB] dark:border-[#374151]'
        : isOverdue ? 'border-red-300 dark:border-red-800'
        : 'border-[#E5E7EB] dark:border-[#374151]'
      }`}
      whileHover={!isOverlay ? { y: -2, boxShadow: '0 4px 16px rgba(0,0,0,0.08)', transition: { duration: 0.15 } } : undefined}
      whileTap={!isOverlay ? { scale: 0.99 } : undefined}
    >
      <div className="flex items-start gap-2">
        <div
          {...dragListeners}
          {...dragAttributes}
          className="text-[#D1D5DB] dark:text-[#4B5563] hover:text-[#9CA3AF] cursor-grab active:cursor-grabbing mt-0.5 shrink-0"
          onClick={e => e.stopPropagation()}
        >
          <GripVertical size={14} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-[#1F2937] dark:text-[#F9FAFB] leading-relaxed">{task.title}</p>
          {task.description && (
            <p className="text-[11px] text-[#9CA3AF] mt-1 truncate">{task.description}</p>
          )}
          {task.labels && task.labels.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {task.labels.map(label => (
                <span key={label} className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${labelStyles[label].bg} ${labelStyles[label].text}`}>
                  {label}
                </span>
              ))}
            </div>
          )}
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full ${priorityColors[task.priority]}`}>
              <Flag size={9} />
              {priorityLabels[task.priority]}
            </span>
            {isOverdue && (
              <span className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">
                <AlertCircle size={9} />
                Atrasado
              </span>
            )}
            {task.assignee && (
              <div className="w-5 h-5 rounded-full bg-[#ECFDF5] dark:bg-[#064E3B] flex items-center justify-center text-[9px] font-bold text-[#059669] shrink-0" title={task.assignee}>
                {task.assignee.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}
              </div>
            )}
            {task.comments && task.comments.length > 0 && (
              <span className="flex items-center gap-0.5 text-[10px] text-[#9CA3AF]">
                <MessageSquare size={10} /> {task.comments.length}
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function CalendarView({ tasks, onTaskClick }: { tasks: Task[]; onTaskClick: (task: Task) => void }) {
  const [date, setDate] = useState(new Date())
  const year = date.getFullYear()
  const month = date.getMonth()

  const firstDow = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells = [...Array(firstDow).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)]

  const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
  const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']

  const getTasksForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return tasks.filter(t => t.dueDate === dateStr)
  }

  const today = new Date()
  const isToday = (day: number) => day === today.getDate() && month === today.getMonth() && year === today.getFullYear()

  return (
    <div className="bg-white dark:bg-[#1F2937] rounded-xl border border-[#E5E7EB] dark:border-[#374151] p-5">
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-semibold text-[#1F2937] dark:text-[#F9FAFB]">{monthNames[month]} {year}</h2>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setDate(new Date(year, month - 1))}
            className="p-1.5 rounded-lg hover:bg-[#F3F4F6] dark:hover:bg-[#374151] text-[#6B7280] transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={() => setDate(new Date())}
            className="px-2.5 py-1 text-xs font-medium text-[#059669] hover:bg-[#ECFDF5] dark:hover:bg-[#064E3B]/30 rounded-lg transition-colors"
          >
            Hoje
          </button>
          <button
            onClick={() => setDate(new Date(year, month + 1))}
            className="p-1.5 rounded-lg hover:bg-[#F3F4F6] dark:hover:bg-[#374151] text-[#6B7280] transition-colors"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map(d => (
          <div key={d} className="text-center text-xs font-semibold text-[#9CA3AF] py-1">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          if (!day) return <div key={`empty-${i}`} />
          const dayTasks = getTasksForDay(day)
          const today_ = isToday(day)

          return (
            <div
              key={day}
              className={`min-h-[72px] rounded-lg p-1.5 border transition-colors ${today_ ? 'border-[#059669] bg-[#F0FDF4] dark:bg-[#064E3B]/15' : 'border-[#E5E7EB] dark:border-[#374151]'}`}
            >
              <p className={`text-xs font-semibold mb-1 ${today_ ? 'text-[#059669]' : 'text-[#6B7280] dark:text-[#9CA3AF]'}`}>{day}</p>
              <div className="space-y-0.5">
                {dayTasks.slice(0, 2).map(task => (
                  <button
                    key={task.id}
                    onClick={() => onTaskClick(task)}
                    className="w-full text-left text-[9px] font-medium px-1.5 py-0.5 rounded truncate transition-colors"
                    style={{ backgroundColor: `${columnColors[task.status]}20`, color: columnColors[task.status] }}
                  >
                    {task.title}
                  </button>
                ))}
                {dayTasks.length > 2 && (
                  <p className="text-[9px] text-[#9CA3AF] px-1">+{dayTasks.length - 2} mais</p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function ListView({ tasks, onTaskClick }: { tasks: Task[]; onTaskClick: (task: Task) => void }) {
  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 gap-3">
        <List size={32} className="text-[#D1D5DB]" />
        <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">Nenhuma tarefa neste projeto</p>
      </div>
    )
  }

  const grouped = columns.reduce((acc, col) => {
    const colTasks = tasks.filter(t => t.status === col.id)
    if (colTasks.length > 0) acc[col.id] = { label: col.label, color: col.color, tasks: colTasks }
    return acc
  }, {} as Record<string, { label: string; color: string; tasks: Task[] }>)

  return (
    <div className="space-y-4">
      {Object.entries(grouped).map(([status, group]) => (
        <div key={status}>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: group.color }} />
            <span className="text-xs font-semibold text-[#6B7280] dark:text-[#9CA3AF] uppercase tracking-wider">{group.label}</span>
            <span className="text-xs bg-[#F3F4F6] dark:bg-[#374151] text-[#9CA3AF] px-1.5 py-0.5 rounded-full">{group.tasks.length}</span>
          </div>
          <div className="space-y-1.5">
            {group.tasks.map(task => (
              <motion.button
                key={task.id}
                onClick={() => onTaskClick(task)}
                className="w-full flex items-center gap-4 bg-white dark:bg-[#1F2937] border border-[#E5E7EB] dark:border-[#374151] rounded-xl px-4 py-3 text-left"
                whileHover={{ x: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', transition: { duration: 0.15 } }}
                whileTap={{ scale: 0.99 }}
              >
                <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: group.color }} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#1F2937] dark:text-[#F9FAFB] truncate">{task.title}</p>
                  {task.description && <p className="text-xs text-[#9CA3AF] truncate mt-0.5">{task.description}</p>}
                  {task.labels && task.labels.length > 0 && (
                    <div className="flex gap-1 mt-1">
                      {task.labels.map(label => (
                        <span key={label} className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${labelStyles[label].bg} ${labelStyles[label].text}`}>
                          {label}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${priorityColors[task.priority]}`}>
                    {priorityLabels[task.priority]}
                  </span>
                  {task.dueDate && (
                    <span className="text-[10px] text-[#9CA3AF] hidden sm:block">{task.dueDate}</span>
                  )}
                  {task.assignee && (
                    <div className="w-6 h-6 rounded-full bg-[#ECFDF5] dark:bg-[#064E3B] flex items-center justify-center text-[9px] font-bold text-[#059669] shrink-0" title={task.assignee}>
                      {task.assignee.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}
                    </div>
                  )}
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function TaskModal({ task, readOnly, onClose, onUpdate, onDelete, onAddComment }: {
  task: Task
  readOnly?: boolean
  onClose: () => void
  onUpdate: (u: Partial<Task>) => void
  onDelete: () => void
  onAddComment: (text: string) => void
}) {
  const [title, setTitle] = useState(task.title)
  const [description, setDescription] = useState(task.description || '')
  const [priority, setPriority] = useState<Priority>(task.priority)
  const [status, setStatus] = useState<TaskStatus>(task.status)
  const [labels, setLabels] = useState<Label[]>(task.labels || [])
  const [saving, setSaving] = useState(false)
  const [commentText, setCommentText] = useState('')
  const [activeTab, setActiveTab] = useState<'details' | 'comments'>('details')

  const toggleLabel = (label: Label) => {
    setLabels(prev => prev.includes(label) ? prev.filter(l => l !== label) : [...prev, label])
  }

  const handleSave = async () => {
    setSaving(true)
    await new Promise(r => setTimeout(r, 300))
    onUpdate({ title, description, priority, status, labels })
    toast.success('Tarefa atualizada!')
    setSaving(false)
  }

  const handleComment = () => {
    if (!commentText.trim()) return
    onAddComment(commentText.trim())
    setCommentText('')
    toast.success('Comentário adicionado!')
  }

  const commentsCount = task.comments?.length ?? 0

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <motion.div
        className="bg-white dark:bg-[#1F2937] rounded-2xl w-full max-w-lg shadow-xl"
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.15 }}
      >
        <div className="flex items-center justify-between p-5 border-b border-[#E5E7EB] dark:border-[#374151]">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setActiveTab('details')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'details' ? 'bg-[#F3F4F6] dark:bg-[#374151] text-[#1F2937] dark:text-[#F9FAFB]' : 'text-[#6B7280] hover:text-[#1F2937] dark:text-[#9CA3AF] dark:hover:text-[#F9FAFB]'}`}
            >
              Detalhes
            </button>
            <button
              onClick={() => setActiveTab('comments')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${activeTab === 'comments' ? 'bg-[#F3F4F6] dark:bg-[#374151] text-[#1F2937] dark:text-[#F9FAFB]' : 'text-[#6B7280] hover:text-[#1F2937] dark:text-[#9CA3AF] dark:hover:text-[#F9FAFB]'}`}
            >
              <MessageSquare size={13} />
              Comentários
              {commentsCount > 0 && (
                <span className="text-[10px] bg-[#059669] text-white px-1.5 py-0.5 rounded-full leading-none">{commentsCount}</span>
              )}
            </button>
          </div>
          <button onClick={onClose} className="text-[#9CA3AF] hover:text-[#6B7280]"><X size={20} /></button>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'details' ? (
            <motion.div
              key="details"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.1 }}
              className="p-5 space-y-4"
            >
              <div>
                <label className="block text-xs font-medium text-[#6B7280] dark:text-[#9CA3AF] mb-1.5 uppercase tracking-wider">Título</label>
                <input
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  readOnly={readOnly}
                  className={`w-full px-3 py-2 rounded-lg border border-[#E5E7EB] dark:border-[#374151] bg-white dark:bg-[#111827] text-[#1F2937] dark:text-[#F9FAFB] text-sm focus:outline-none focus:ring-2 focus:ring-[#059669] ${readOnly ? 'opacity-70 cursor-default' : ''}`}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#6B7280] dark:text-[#9CA3AF] mb-1.5 uppercase tracking-wider">Descrição</label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  readOnly={readOnly}
                  rows={2}
                  placeholder="Sem descrição"
                  className={`w-full px-3 py-2 rounded-lg border border-[#E5E7EB] dark:border-[#374151] bg-white dark:bg-[#111827] text-[#1F2937] dark:text-[#F9FAFB] text-sm focus:outline-none focus:ring-2 focus:ring-[#059669] resize-none placeholder:text-[#9CA3AF] ${readOnly ? 'opacity-70 cursor-default' : ''}`}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#6B7280] dark:text-[#9CA3AF] mb-1.5 uppercase tracking-wider">Status</label>
                  <select
                    value={status}
                    onChange={e => setStatus(e.target.value as TaskStatus)}
                    disabled={readOnly}
                    className={`w-full px-3 py-2 rounded-lg border border-[#E5E7EB] dark:border-[#374151] bg-white dark:bg-[#111827] text-[#1F2937] dark:text-[#F9FAFB] text-sm focus:outline-none focus:ring-2 focus:ring-[#059669] ${readOnly ? 'opacity-70 cursor-default' : ''}`}
                  >
                    <option value="todo">A fazer</option>
                    <option value="in_progress">Em andamento</option>
                    <option value="in_review">Em revisão</option>
                    <option value="done">Concluído</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#6B7280] dark:text-[#9CA3AF] mb-1.5 uppercase tracking-wider">Prioridade</label>
                  <select
                    value={priority}
                    onChange={e => setPriority(e.target.value as Priority)}
                    disabled={readOnly}
                    className={`w-full px-3 py-2 rounded-lg border border-[#E5E7EB] dark:border-[#374151] bg-white dark:bg-[#111827] text-[#1F2937] dark:text-[#F9FAFB] text-sm focus:outline-none focus:ring-2 focus:ring-[#059669] ${readOnly ? 'opacity-70 cursor-default' : ''}`}
                  >
                    <option value="low">Baixa</option>
                    <option value="medium">Média</option>
                    <option value="high">Alta</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="flex items-center gap-1.5 text-xs font-medium text-[#6B7280] dark:text-[#9CA3AF] mb-2 uppercase tracking-wider">
                  <Tag size={11} /> Etiquetas
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {ALL_LABELS.map(label => (
                    <motion.button
                      key={label}
                      type="button"
                      onClick={() => toggleLabel(label)}
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full border-2 transition-all ${
                        labels.includes(label)
                          ? `${labelStyles[label].bg} ${labelStyles[label].text} border-current`
                          : 'border-[#E5E7EB] dark:border-[#374151] text-[#9CA3AF] hover:border-[#D1D5DB]'
                      }`}
                      whileHover={{ scale: 1.07 }}
                      whileTap={{ scale: 0.92 }}
                    >
                      {label}
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="comments"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.1 }}
              className="flex flex-col"
            >
              <div className="p-5 space-y-4 max-h-60 overflow-y-auto">
                {!task.comments || task.comments.length === 0 ? (
                  <div className="text-center py-6">
                    <MessageSquare size={28} className="text-[#D1D5DB] mx-auto mb-2" />
                    <p className="text-sm text-[#9CA3AF]">Nenhum comentário ainda</p>
                  </div>
                ) : (
                  task.comments.map(comment => (
                    <div key={comment.id} className="flex gap-3">
                      <div className="w-7 h-7 rounded-full bg-[#ECFDF5] dark:bg-[#064E3B] flex items-center justify-center text-[10px] font-bold text-[#059669] shrink-0">
                        {comment.avatar}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-semibold text-[#1F2937] dark:text-[#F9FAFB]">{comment.author}</span>
                          <span className="text-[10px] text-[#9CA3AF]">{comment.createdAt}</span>
                        </div>
                        <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] leading-relaxed">{comment.text}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="p-4 border-t border-[#E5E7EB] dark:border-[#374151] flex gap-2">
                <input
                  value={commentText}
                  onChange={e => setCommentText(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleComment() } }}
                  placeholder="Adicionar comentário..."
                  className="flex-1 px-3 py-2 rounded-lg border border-[#E5E7EB] dark:border-[#374151] bg-white dark:bg-[#111827] text-[#1F2937] dark:text-[#F9FAFB] text-sm focus:outline-none focus:ring-2 focus:ring-[#059669] placeholder:text-[#9CA3AF]"
                />
                <button
                  onClick={handleComment}
                  disabled={!commentText.trim()}
                  className="p-2 bg-[#059669] hover:bg-[#047857] disabled:opacity-50 text-white rounded-lg transition-colors"
                >
                  <Send size={15} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center gap-3 p-5 border-t border-[#E5E7EB] dark:border-[#374151]">
          {!readOnly && (
            <motion.button
              onClick={onDelete}
              className="p-2 text-[#9CA3AF] hover:text-red-500 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.88 }}
            >
              <Trash2 size={17} />
            </motion.button>
          )}
          {readOnly && (
            <span className="text-xs text-[#9CA3AF] bg-[#F3F4F6] dark:bg-[#374151] px-2.5 py-1 rounded-lg">
              Somente leitura
            </span>
          )}
          <div className="flex-1" />
          <button onClick={onClose} className="px-4 py-2 border border-[#E5E7EB] dark:border-[#374151] rounded-lg text-sm text-[#6B7280] hover:bg-[#F9FAFB] dark:hover:bg-[#374151] transition-colors">
            Fechar
          </button>
          {!readOnly && activeTab === 'details' && (
            <button
              onClick={handleSave}
              disabled={saving || !title.trim()}
              className="flex items-center gap-2 px-4 py-2 bg-[#059669] hover:bg-[#047857] disabled:opacity-60 text-white rounded-lg text-sm font-medium transition-colors"
            >
              {saving && <Loader2 size={14} className="animate-spin" />}
              Salvar
            </button>
          )}
        </div>
      </motion.div>
    </div>
  )
}

const statusColors: Record<TaskStatus, string> = {
  todo: '#9CA3AF',
  in_progress: '#F59E0B',
  in_review: '#6366F1',
  done: '#059669',
}

const statusLabels: Record<TaskStatus, string> = {
  todo: 'A fazer',
  in_progress: 'Em andamento',
  in_review: 'Em revisão',
  done: 'Concluído',
}

function relativeTime(dateStr: string | undefined): string {
  if (!dateStr) return ''
  const diff = Date.now() - new Date(dateStr).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'agora'
  if (minutes < 60) return `${minutes} min atrás`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h atrás`
  return `${Math.floor(hours / 24)}d atrás`
}

function ActivityDrawer({ open, onClose, projectId }: { open: boolean; onClose: () => void; projectId: string }) {
  const { tasks } = useProjectStore()
  const activities = tasks
    .filter(t => t.projectId === projectId)
    .slice()
    .sort((a, b) => new Date(b.updatedAt ?? b.createdAt ?? 0).getTime() - new Date(a.updatedAt ?? a.createdAt ?? 0).getTime())
    .slice(0, 7)
    .map(t => ({
      initials: (t.assignee ?? 'U').split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase(),
      title: t.title,
      detail: statusLabels[t.status],
      time: relativeTime(t.updatedAt ?? t.createdAt),
      color: statusColors[t.status],
    }))

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50">
          <motion.div
            className="absolute inset-0 bg-black/20 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="absolute right-0 top-0 h-full w-80 bg-white dark:bg-[#1F2937] border-l border-[#E5E7EB] dark:border-[#374151] shadow-2xl flex flex-col"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          >
            <div className="flex items-center justify-between p-4 border-b border-[#E5E7EB] dark:border-[#374151]">
              <div className="flex items-center gap-2">
                <Activity size={15} className="text-[#059669]" />
                <h3 className="font-semibold text-sm text-[#1F2937] dark:text-[#F9FAFB]">Atividade recente</h3>
              </div>
              <button onClick={onClose} className="text-[#9CA3AF] hover:text-[#6B7280] transition-colors">
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {activities.length === 0 ? (
                <p className="text-xs text-center text-[#9CA3AF] mt-8">Nenhuma atividade ainda</p>
              ) : activities.map((activity, i) => (
                <div key={i} className="flex gap-3">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
                    style={{ backgroundColor: `${activity.color}20`, color: activity.color }}
                  >
                    {activity.initials}
                  </div>
                  <div>
                    <p className="text-xs font-medium text-[#1F2937] dark:text-[#F9FAFB]">{activity.title}</p>
                    <p className="text-xs text-[#9CA3AF] mt-0.5">{activity.detail}</p>
                    <p className="text-[10px] text-[#D1D5DB] dark:text-[#4B5563] mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-[#E5E7EB] dark:border-[#374151]">
              <p className="text-xs text-center text-[#9CA3AF]">Exibindo as últimas {activities.length} atividades</p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
