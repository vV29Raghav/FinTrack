import { useApp, useAuth } from '../AppContext.jsx'
import { useRouter } from '../Router.jsx'
import { Avatar } from './ui.jsx'
import { cn } from '../utils.js'

const NAV = [
  { to:'/dashboard',      icon:'📊', label:'Dashboard' },
  { to:'/groups',         icon:'👥', label:'Groups' },
  { to:'/friends',        icon:'🤝', label:'Friends' },
  { to:'/activity',       icon:'🕐', label:'Activity' },
  { to:'/reports',        icon:'📈', label:'Reports' },
  { to:'/notifications',  icon:'🔔', label:'Notifications', badge:true },
  { to:'/settings',       icon:'⚙️',  label:'Settings' },
]

function Logo({ className = '' }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-emerald-500/20">
        F
      </div>
      <span className="font-bold text-xl tracking-tight text-white">FinTrack</span>
    </div>
  )
}

function NavItem({ to, icon, label, badge, unread, path, navigate, onClose }) {
  const active = path === to || (to !== '/dashboard' && path.startsWith(to))
  return (
    <button
      onClick={() => { navigate(to); onClose && onClose() }}
      className={cn(
        'w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-200 mb-1',
        active ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/10' : 'text-slate-500 hover:bg-white/5 hover:text-white'
      )}
    >
      <span className="text-lg w-6 flex items-center justify-center">{icon}</span>
      <span className="flex-1 text-left">{label}</span>
      {badge && unread > 0 && (
        <span className="bg-emerald-500 text-black text-[10px] font-black px-1.5 py-0.5 rounded-lg min-w-[18px] text-center">{unread}</span>
      )}
    </button>
  )
}

export default function Sidebar({ open, onClose }) {
  const { state } = useApp()
  const { user, logout } = useAuth()
  const { path, navigate } = useRouter()
  const unread = state.notifications.filter(n => !n.read).length

  const handleLogout = () => { logout(); navigate('/') }

  return (
    <>
      {open && <div className="fixed inset-0 bg-slate-950/80 z-40 md:hidden backdrop-blur-md" onClick={onClose}/>}
      <aside 
        className={cn(
          'app-sidebar bg-slate-950 border-r border-white/5 flex flex-col transition-transform duration-300 z-50',
          open && 'open'
        )}>
        {/* Logo */}
        <div className="px-6 py-8 border-b border-white/5">
          <Logo />
        </div>

        {/* User Profile */}
        <div className="px-5 py-6">
          <div className="flex items-center gap-3 bg-white/[0.03] p-3 rounded-2xl border border-white/5">
            <Avatar name={user?.name || 'User'} color={user?.color} size="md"/>
            <div className="flex-1 min-w-0">
              <div className="text-white text-sm font-bold truncate">{user?.name || 'User'}</div>
              <div className="text-slate-500 text-[11px] font-medium truncate uppercase tracking-wider">{user?.email || ''}</div>
            </div>
          </div>
        </div>

        {/* Nav Sections */}
        <nav className="flex-1 overflow-y-auto px-4 py-2">
          <div className="text-slate-600 text-[10px] font-black uppercase tracking-[0.2em] px-4 py-4">App Menu</div>
          {NAV.slice(0,4).map(item => (
            <NavItem key={item.to} {...item} unread={unread} path={path} navigate={navigate} onClose={onClose}/>
          ))}
          <div className="text-slate-600 text-[10px] font-black uppercase tracking-[0.2em] px-4 py-6">Intelligence</div>
          {NAV.slice(4).map(item => (
            <NavItem key={item.to} {...item} unread={unread} path={path} navigate={navigate} onClose={onClose}/>
          ))}
        </nav>

        {/* Sign out */}
        <div className="px-4 py-6 border-t border-white/5">
          <button onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-slate-500 hover:bg-red-500/10 hover:text-red-400 transition-all">
            <span className="text-lg w-6 flex items-center justify-center">🚪</span>
            Sign Out
          </button>
        </div>
      </aside>
    </>
  )
}
