import { useApp, useAuth } from './AppContext.jsx'
import { useRouter } from './Router.jsx'
import { ToastContainer } from './components/ui.jsx'
import Sidebar from './components/Sidebar.jsx'
import Topbar from './components/Topbar.jsx'
import LandingPage from './pages/LandingPage.jsx'
import { LoginPage, SignupPage } from './pages/AuthPages.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Groups from './pages/Groups.jsx'
import GroupDetail from './pages/GroupDetail.jsx'
import Friends from './pages/Friends.jsx'
import Activity from './pages/Activity.jsx'
import Reports from './pages/Reports.jsx'
import Notifications from './pages/Notifications.jsx'
import Settings from './pages/Settings.jsx'
import { useState, useEffect } from 'react'

function AppShell() {
  const { path } = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Close sidebar on route change
  useEffect(() => { setSidebarOpen(false) }, [path])

  const renderPage = () => {
    if (path === '/dashboard')     return <Dashboard />
    if (path === '/groups')        return <Groups />
    if (path.startsWith('/groups/')) return <GroupDetail />
    if (path === '/friends')       return <Friends />
    if (path === '/activity')      return <Activity />
    if (path === '/reports')       return <Reports />
    if (path === '/notifications') return <Notifications />
    if (path === '/settings')      return <Settings />
    return <Dashboard />
  }

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0 main-content">
        <Topbar onMenu={() => setSidebarOpen(o => !o)} />
        <main className="flex-1 overflow-y-auto">
          <div className="section-container py-10 animate-fade-up" key={path}>
            {renderPage()}
          </div>
        </main>
      </div>
    </div>
  )
}

export default function App() {
  const { state } = useApp()
  const { path, navigate } = useRouter()

  // Redirect logic
  useEffect(() => {
    if (!state.isAuthenticated && path !== '/' && path !== '/login' && path !== '/signup') {
      navigate('/login')
    }
    if (state.isAuthenticated && (path === '/' || path === '/login' || path === '/signup')) {
      navigate('/dashboard')
    }
  }, [state.isAuthenticated, path])

  // Apply dark mode class
  useEffect(() => {
    if (state.isDark) document.documentElement.classList.add('dark')
    else document.documentElement.classList.remove('dark')
  }, [state.isDark])

  if (!state.isAuthenticated) {
    if (path === '/login')  return <><LoginPage /><ToastContainer /></>
    if (path === '/signup') return <><SignupPage /><ToastContainer /></>
    return <><LandingPage /><ToastContainer /></>
  }

  return <><AppShell /><ToastContainer /></>
}
