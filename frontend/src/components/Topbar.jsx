import { useApp, useAuth } from '../AppContext.jsx'
import { useRouter } from '../Router.jsx'
import { Avatar, Button } from './ui.jsx'

export default function Topbar({ onMenu }) {
  const { path, navigate } = useRouter()
  const { user } = useAuth()
  const { state } = useApp()

  const title = {
    '/dashboard': 'Dashboard',
    '/groups': 'Groups',
    '/friends': 'Friends',
    '/activity': 'Activity',
    '/reports': 'Reports',
    '/notifications': 'Notifications',
    '/settings': 'Settings'
  }[path] || 'FinTrack'

  const unreadCount = state.notifications.filter(n => !n.read).length

  return (
    <header className="h-20 bg-slate-950/80 backdrop-blur-md border-b border-white/5 sticky top-0 z-40 px-6 md:px-10 flex items-center justify-between">
      
      {/* Left: Menu Toggle & Title */}
      <div className="flex items-center gap-5">
        <button 
          onClick={onMenu}
          className="md:hidden w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white"
        >
          ☰
        </button>
        <div className="hidden md:block">
          <h1 className="text-xl font-black text-white tracking-tight">{title}</h1>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-4">
        
        {/* Search Mockup */}
        <div className="hidden lg:flex items-center gap-2 bg-white/5 border border-white/5 px-4 py-2 rounded-xl text-slate-500 w-64">
          <span className="text-sm">🔍</span>
          <span className="text-xs font-bold uppercase tracking-widest">Search...</span>
        </div>

        {/* Notifications */}
        <button 
          onClick={() => navigate('/notifications')}
          className="relative w-11 h-11 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-xl hover:bg-white/10 transition-colors"
        >
          🔔
          {unreadCount > 0 && (
            <span className="absolute top-2 right-2 w-2 h-2 bg-emerald-500 rounded-full border-2 border-slate-950" />
          )}
        </button>

        {/* User Mini */}
        <div className="flex items-center gap-3 pl-2 border-l border-white/5 h-10">
          <div className="hidden sm:block text-right">
            <div className="text-xs font-bold text-white">{user?.name?.split(' ')[0]}</div>
            <div className="text-[9px] font-black uppercase tracking-widest text-emerald-500">Premium</div>
          </div>
          <Avatar name={user?.name} color={user?.color} size="sm" className="border border-white/10" />
        </div>
      </div>
    </header>
  )
}
