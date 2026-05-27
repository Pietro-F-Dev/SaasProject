import { useState, useEffect } from 'react'
import { createBrowserRouter, RouterProvider, Outlet, useOutletContext } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import { AuthProvider } from './context/AuthContext'
import { Toaster } from 'react-hot-toast'
import ProtectedRoute from './components/router/ProtectedRoute'
import AdminRoute from './components/router/AdminRoute'
import CommandPalette from './components/CommandPalette'
import OnboardingWizard from './components/OnboardingWizard'
import KeyboardShortcuts from './components/KeyboardShortcuts'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Signup from './pages/Signup'
import DashboardLayout from './pages/dashboard/DashboardLayout'
import Overview from './pages/dashboard/Overview'
import Projects from './pages/dashboard/Projects'
import KanbanPage from './pages/dashboard/KanbanPage'
import Settings from './pages/dashboard/Settings'
import Team from './pages/dashboard/Team'
import Reports from './pages/dashboard/Reports'
import AdminLayout from './pages/admin/AdminLayout'
import AdminOverview from './pages/admin/AdminOverview'
import AdminUsers from './pages/admin/AdminUsers'
import NotFound from './pages/NotFound'
import Checkout from './pages/Checkout'

type RootContext = { onOpenCmdPalette: () => void }

function RootLayout() {
  const [cmdOpen, setCmdOpen] = useState(false)
  const [shortcutsOpen, setShortcutsOpen] = useState(false)
  const [onboardingOpen, setOnboardingOpen] = useState(false)

  useEffect(() => {
    if (localStorage.getItem('flowdesk_onboarding_needed') === 'true') {
      localStorage.removeItem('flowdesk_onboarding_needed')
      setOnboardingOpen(true)
    }
  }, [])

  useEffect(() => {
    const isInputFocused = () =>
      ['input', 'textarea', 'select'].includes((document.activeElement?.tagName ?? '').toLowerCase())

    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setCmdOpen(prev => !prev)
        return
      }
      if (e.key === 'Escape') {
        setCmdOpen(false)
        setShortcutsOpen(false)
        setOnboardingOpen(false)
        return
      }
      if (e.key === '?' && !isInputFocused()) {
        setShortcutsOpen(prev => !prev)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  return (
    <>
      <Outlet context={{ onOpenCmdPalette: () => setCmdOpen(true) } satisfies RootContext} />
      <CommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)} />
      <KeyboardShortcuts open={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />
      {onboardingOpen && <OnboardingWizard onComplete={() => setOnboardingOpen(false)} />}
    </>
  )
}

function DashboardLayoutWrapper() {
  const { onOpenCmdPalette } = useOutletContext<RootContext>()
  return <DashboardLayout onOpenCmdPalette={onOpenCmdPalette} />
}

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { path: '/', element: <Landing /> },
      { path: '/login', element: <Login /> },
      { path: '/signup', element: <Signup /> },
      { path: '/checkout', element: <Checkout /> },
      {
        path: '/dashboard',
        element: <ProtectedRoute><DashboardLayoutWrapper /></ProtectedRoute>,
        children: [
          { index: true, element: <Overview /> },
          { path: 'projects', element: <Projects /> },
          { path: 'kanban/:projectId', element: <KanbanPage /> },
          { path: 'team', element: <Team /> },
          { path: 'reports', element: <Reports /> },
          { path: 'settings', element: <Settings /> },
        ],
      },
      {
        path: '/admin',
        element: <AdminRoute><AdminLayout /></AdminRoute>,
        children: [
          { index: true, element: <AdminOverview /> },
          { path: 'users', element: <AdminUsers /> },
        ],
      },
      { path: '*', element: <NotFound /> },
    ],
  },
])

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <RouterProvider router={router} />
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: { borderRadius: '10px', fontSize: '14px' },
            success: { iconTheme: { primary: '#059669', secondary: '#fff' } },
          }}
        />
      </AuthProvider>
    </ThemeProvider>
  )
}
