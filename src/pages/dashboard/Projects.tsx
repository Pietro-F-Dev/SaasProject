import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { Link } from 'react-router-dom'
import { Plus, Kanban, Trash2, X, Loader2, FolderOpen } from 'lucide-react'
import { motion } from 'framer-motion'
import { useProjectStore } from '../../store/projectStore'
import type { Project } from '../../store/projectStore'
import { ProjectCardSkeleton } from '../../components/Skeleton'
import toast from 'react-hot-toast'

const statusColors = { active: 'bg-[#ECFDF5] text-[#059669]', on_hold: 'bg-[#FEF3C7] text-[#D97706]', completed: 'bg-[#EFF6FF] text-[#6366F1]' }
const statusLabels = { active: 'Ativo', on_hold: 'Em espera', completed: 'Concluído' }
const projectColors = ['#059669', '#6366F1', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6']

export default function Projects() {
  const { projects, tasks, addProject, deleteProject } = useProjectStore()
  const { user } = useAuth()
  const canCreateProject = user?.role === 'owner' || user?.role === 'admin'
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1F2937] dark:text-[#F9FAFB]">Projetos</h1>
          <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF] mt-1">{projects.length} projetos no total</p>
        </div>
        {canCreateProject && (
          <motion.button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-[#059669] hover:bg-[#047857] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.96 }}
          >
            <Plus size={16} />
            Novo projeto
          </motion.button>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <ProjectCardSkeleton key={i} />)}
        </div>
      ) : projects.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-20 gap-4"
        >
          <div className="w-16 h-16 rounded-2xl bg-[#F3F4F6] dark:bg-[#374151] flex items-center justify-center">
            <FolderOpen size={28} className="text-[#9CA3AF]" />
          </div>
          <div className="text-center">
            <p className="font-semibold text-[#1F2937] dark:text-[#F9FAFB]">Nenhum projeto ainda</p>
            <p className="text-sm text-[#9CA3AF] mt-1">Crie seu primeiro projeto para começar a organizar tarefas</p>
          </div>
          {canCreateProject && (
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 bg-[#059669] hover:bg-[#047857] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              <Plus size={16} /> Criar primeiro projeto
            </button>
          )}
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project, i) => {
            const projectTasks = tasks.filter(t => t.projectId === project.id)
            const doneTasks = projectTasks.filter(t => t.status === 'done').length
            const progress = projectTasks.length > 0 ? Math.round((doneTasks / projectTasks.length) * 100) : 0

            return (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -4, boxShadow: '0 8px 24px rgba(0,0,0,0.08)', transition: { duration: 0.18 } }}
                whileTap={{ scale: 0.99 }}
                transition={{ duration: 0.25, delay: i * 0.05 }}
                className="bg-white dark:bg-[#1F2937] border border-[#E5E7EB] dark:border-[#374151] rounded-xl p-5 flex flex-col gap-4 cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm" style={{ backgroundColor: project.color }}>
                      {project.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-medium text-[#1F2937] dark:text-[#F9FAFB] text-sm">{project.name}</h3>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColors[project.status]}`}>
                        {statusLabels[project.status]}
                      </span>
                    </div>
                  </div>
                  <motion.button
                    onClick={() => {
                      deleteProject(project.id)
                      toast.success('Projeto removido')
                    }}
                    className="text-[#9CA3AF] hover:text-red-500 transition-colors p-1 rounded"
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.85 }}
                  >
                    <Trash2 size={15} />
                  </motion.button>
                </div>

                <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] leading-relaxed">{project.description}</p>

                <div>
                  <div className="flex justify-between text-xs text-[#9CA3AF] mb-1.5">
                    <span>{doneTasks}/{projectTasks.length} tarefas</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="h-1.5 bg-[#E5E7EB] dark:bg-[#374151] rounded-full">
                    <motion.div
                      className="h-1.5 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.6, delay: 0.1 }}
                      style={{ backgroundColor: project.color }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-[#F3F4F6] dark:border-[#374151]">
                  <span className="text-xs text-[#9CA3AF]">{project.memberCount} membros · até {project.dueDate}</span>
                  <Link
                    to={`/dashboard/kanban/${project.id}`}
                    className="flex items-center gap-1.5 text-xs text-[#059669] hover:underline font-medium"
                  >
                    <Kanban size={13} />
                    Abrir kanban
                  </Link>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {showModal && <NewProjectModal onClose={() => setShowModal(false)} addProject={addProject} />}
    </div>
  )
}

function NewProjectModal({ onClose, addProject }: { onClose: () => void; addProject: (p: Omit<Project, 'id'>) => void }) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [color, setColor] = useState(projectColors[0])
  const [status, setStatus] = useState<Project['status']>('active')
  const [dueDate, setDueDate] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    setLoading(true)
    await new Promise(r => setTimeout(r, 400))
    addProject({ name: name.trim(), description: description.trim(), color, status, dueDate: dueDate || '2026-12-31', memberCount: 1 })
    toast.success('Projeto criado!')
    setLoading(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <motion.div
        className="bg-white dark:bg-[#1F2937] rounded-2xl w-full max-w-md shadow-xl"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.15 }}
      >
        <div className="flex items-center justify-between p-5 border-b border-[#E5E7EB] dark:border-[#374151]">
          <h2 className="font-semibold text-[#1F2937] dark:text-[#F9FAFB]">Novo projeto</h2>
          <button onClick={onClose} className="text-[#9CA3AF] hover:text-[#6B7280]"><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#374151] dark:text-[#D1D5DB] mb-1.5">Nome do projeto *</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Ex: Website Redesign"
              className="w-full px-3 py-2.5 rounded-lg border border-[#E5E7EB] dark:border-[#374151] bg-white dark:bg-[#111827] text-[#1F2937] dark:text-[#F9FAFB] text-sm focus:outline-none focus:ring-2 focus:ring-[#059669] placeholder:text-[#9CA3AF]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#374151] dark:text-[#D1D5DB] mb-1.5">Descrição</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Descreva o objetivo do projeto..."
              rows={3}
              className="w-full px-3 py-2.5 rounded-lg border border-[#E5E7EB] dark:border-[#374151] bg-white dark:bg-[#111827] text-[#1F2937] dark:text-[#F9FAFB] text-sm focus:outline-none focus:ring-2 focus:ring-[#059669] placeholder:text-[#9CA3AF] resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#374151] dark:text-[#D1D5DB] mb-1.5">Status</label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as Project['status'])}
                className="w-full px-3 py-2.5 rounded-lg border border-[#E5E7EB] dark:border-[#374151] bg-white dark:bg-[#111827] text-[#1F2937] dark:text-[#F9FAFB] text-sm focus:outline-none focus:ring-2 focus:ring-[#059669]"
              >
                <option value="active">Ativo</option>
                <option value="on_hold">Em espera</option>
                <option value="completed">Concluído</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#374151] dark:text-[#D1D5DB] mb-1.5">Prazo</label>
              <input
                type="date"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-[#E5E7EB] dark:border-[#374151] bg-white dark:bg-[#111827] text-[#1F2937] dark:text-[#F9FAFB] text-sm focus:outline-none focus:ring-2 focus:ring-[#059669]"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#374151] dark:text-[#D1D5DB] mb-2">Cor</label>
            <div className="flex gap-2">
              {projectColors.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-full transition-transform ${color === c ? 'scale-125 ring-2 ring-offset-2 ring-[#059669]' : 'hover:scale-110'}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-[#E5E7EB] dark:border-[#374151] rounded-lg text-sm text-[#6B7280] hover:bg-[#F9FAFB] dark:hover:bg-[#374151] transition-colors">
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="flex-1 bg-[#059669] hover:bg-[#047857] disabled:opacity-60 text-white py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
            >
              {loading && <Loader2 size={15} className="animate-spin" />}
              Criar projeto
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}
