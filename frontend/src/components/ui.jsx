import { useEffect, useState } from 'react'
import { cn, toast as toastSys } from '../utils.js'

// ── Button ────────────────────────────────────────────────────────────
const BTN_V = {
  primary:   'bg-emerald-500 hover:bg-emerald-400 text-black shadow-lg shadow-emerald-500/10 active:scale-95',
  secondary: 'bg-white/[0.05] hover:bg-white/[0.08] text-white border border-white/10 active:scale-95',
  ghost:     'hover:bg-white/[0.05] text-slate-400 hover:text-white active:scale-95',
  danger:    'bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 active:scale-95',
  outline:   'border border-white/10 hover:border-emerald-500/50 hover:text-emerald-400 text-slate-300 active:scale-95',
}
const BTN_S = {
  xs: 'h-8 px-3 text-[10px] uppercase tracking-widest rounded-lg gap-1.5',
  sm: 'h-10 px-4 text-xs uppercase tracking-widest rounded-xl gap-2',
  md: 'h-12 px-6 text-sm font-bold rounded-xl gap-2.5',
  lg: 'h-14 px-8 text-base font-bold rounded-2xl gap-3',
}
export function Button({ children, variant='primary', size='md', className='', loading, icon, full, ...p }) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap',
        BTN_V[variant], BTN_S[size], full && 'w-full', className
      )}
      disabled={p.disabled || loading} {...p}
    >
      {loading
        ? <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z"/>
          </svg>
        : icon && <span className="text-lg">{icon}</span>
      }
      {children}
    </button>
  )
}

// ── Input ─────────────────────────────────────────────────────────────
export function Input({ label, error, wrapClass='', iconL, iconR, ...p }) {
  return (
    <div className={cn('flex flex-col gap-2', wrapClass)}>
      {label && <label className="text-xs font-bold uppercase tracking-widest text-slate-500">{label}</label>}
      <div className="relative">
        {iconL && <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">{iconL}</span>}
        <input
          className={cn(
            'w-full rounded-xl border bg-white/[0.02] px-4 py-3 text-sm text-white transition-all',
            'placeholder-slate-600 border-white/10',
            'focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50',
            'disabled:opacity-60 disabled:cursor-not-allowed',
            error && 'border-red-500/50 focus:ring-red-500/10',
            iconL && 'pl-11', iconR && 'pr-11'
          )} {...p}
        />
        {iconR && <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500">{iconR}</span>}
      </div>
      {error && <p className="text-[10px] font-bold text-red-500 uppercase tracking-wider">{error}</p>}
    </div>
  )
}

// ── Select ────────────────────────────────────────────────────────────
export function Select({ label, wrapClass='', children, ...p }) {
  return (
    <div className={cn('flex flex-col gap-2', wrapClass)}>
      {label && <label className="text-xs font-bold uppercase tracking-widest text-slate-500">{label}</label>}
      <select
        className="w-full rounded-xl border bg-white/[0.02] px-4 py-3 text-sm text-white border-white/10 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all cursor-pointer appearance-none"
        {...p}
      >{children}</select>
    </div>
  )
}

// ── Modal ─────────────────────────────────────────────────────────────
// ── Modal ─────────────────────────────────────────────────────────────
export function Modal({
  open,
  onClose,
  title,
  children,
  size = 'md'
}) {
  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-2xl',
  }

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[9999] overflow-y-auto">
      
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Modal Wrapper */}
      <div className="flex min-h-screen items-center justify-center p-4 md:p-8">
        
        {/* Modal */}
        <div
          className={cn(
            'relative w-full rounded-[2.5rem] border border-white/10 bg-[#0a0f18] shadow-[0_30px_120px_rgba(0,0,0,0.8)]',
            'max-h-[85vh] flex flex-col overflow-hidden',
            sizes[size]
          )}
        >
          
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/5 bg-white/[0.02] px-8 py-6 backdrop-blur-xl">
            <h2 className="text-xl font-bold text-white">
              {title || 'Modal'}
            </h2>

            <button
              onClick={onClose}
              className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-400 transition-all hover:bg-white/[0.05] hover:text-white"
            >
              ✕
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="overflow-y-auto flex-1 px-8 py-8 custom-scrollbar">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Card ──────────────────────────────────────────────────────────────
export function Card({ children, className='', hover, onClick, pad=true }) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'bg-white/[0.02] rounded-3xl border border-white/10 backdrop-blur-sm',
        pad && 'p-8',
        hover && 'cursor-pointer transition-all duration-300 hover:bg-white/[0.04] hover:border-emerald-500/20 hover:-translate-y-1',
        onClick && 'cursor-pointer',
        className
      )}
    >{children}</div>
  )
}

// ── StatCard ──────────────────────────────────────────────────────────
export function StatCard({ label, value, sub, color='emerald', icon }) {
  const border = { emerald:'border-emerald-500/50', red:'border-red-500/50', blue:'border-blue-500/50', amber:'border-amber-500/50' }[color]
  const glow = { emerald:'bg-emerald-500/5', red:'bg-red-500/5', blue:'bg-blue-500/5', amber:'bg-amber-500/5' }[color]
  return (
    <div className={cn('relative bg-white/[0.02] rounded-3xl border border-white/10 p-8 overflow-hidden', border, glow)}>
      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-4">
        {icon}<span>{label}</span>
      </div>
      <div className="text-3xl font-black text-white">{value}</div>
      {sub && <div className="text-xs font-bold text-slate-500 mt-2">{sub}</div>}
    </div>
  )
}

// ── Avatar ────────────────────────────────────────────────────────────
export function Avatar({ name='', color, size='md', src, className='' }) {
  const sz = { xs:'w-6 h-6 text-[9px]', sm:'w-8 h-8 text-xs', md:'w-10 h-10 text-sm', lg:'w-12 h-12 text-base', xl:'w-16 h-16 text-xl' }[size]
  const ini = name.split(' ').slice(0,2).map(w=>w[0]).join('').toUpperCase()
  if (src) return <img src={src} alt={name} className={cn('rounded-full object-cover flex-shrink-0', sz, className)}/>
  return (
    <div className={cn('rounded-full flex items-center justify-center font-bold text-white flex-shrink-0', sz, className)}
      style={{ background: color || '#10b981' }}>
      {ini}
    </div>
  )
}

export function AvatarGroup({ members=[], max=4 }) {
  const vis = members.slice(0, max), rest = members.length - max
  return (
    <div className="flex items-center">
      {vis.map((m,i) => (
        <div key={m.id||i} className="-ml-3 first:ml-0" title={m.name}>
          <Avatar name={m.name} color={m.color} size="sm" className="border-2 border-slate-950"/>
        </div>
      ))}
      {rest > 0 && (
        <div className="-ml-3 w-8 h-8 rounded-full border-2 border-slate-950 bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-400">+{rest}</div>
      )}
    </div>
  )
}

// ── Badge ─────────────────────────────────────────────────────────────
export function Badge({ children, variant='gray', className='' }) {
  const V = {
    green:  'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    red:    'bg-red-500/10 text-red-400 border-red-500/20',
    amber:  'bg-amber-500/10 text-amber-400 border-amber-500/20',
    blue:   'bg-blue-500/10 text-blue-400 border-blue-500/20',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    gray:   'bg-white/5 text-slate-400 border-white/10',
  }
  return <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border', V[variant], className)}>{children}</span>
}

// ── Toggle ────────────────────────────────────────────────────────────
export function Toggle({ checked, onChange }) {
  return (
    <button
      role="switch" aria-checked={checked} onClick={() => onChange(!checked)}
      className={cn('relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20', checked ? 'bg-emerald-500' : 'bg-white/10')}
    >
      <span className={cn('inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200', checked ? 'translate-x-6' : 'translate-x-1')}/>
    </button>
  )
}

// ── Tabs ──────────────────────────────────────────────────────────────
export function Tabs({ tabs, active, onChange }) {
  return (
    <div className="flex border-b border-white/5 mb-8">
      {tabs.map(t => (
        <button key={t.id} onClick={() => onChange(t.id)}
          className={cn('px-6 py-4 text-sm font-bold border-b-2 -mb-px transition-all duration-200',
            active === t.id ? 'border-emerald-500 text-white' : 'border-transparent text-slate-500 hover:text-slate-300'
          )}>
          {t.label}
          {t.count !== undefined && <span className="ml-2 px-1.5 py-0.5 text-[10px] bg-white/5 rounded-md font-bold">{t.count}</span>}
        </button>
      ))}
    </div>
  )
}

// ── EmptyState ────────────────────────────────────────────────────────
export function EmptyState({ icon='📭', title, desc, action }) {
  return (
    <div className="text-center py-24 px-6 bg-white/[0.01] rounded-[3rem] border border-white/5 border-dashed">
      <div className="text-6xl mb-6">{icon}</div>
      <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
      <p className="text-sm font-medium text-slate-500 max-w-xs mx-auto mb-8 leading-relaxed">{desc}</p>
      {action}
    </div>
  )
}

// ── SectionHeader ─────────────────────────────────────────────────────
export function SectionHeader({ title, sub, action }) {
  return (
    <div className="flex items-end justify-between mb-8">
      <div>
        <h3 className="text-xl font-bold text-white">{title}</h3>
        {sub && <p className="text-sm font-medium text-slate-500 mt-1">{sub}</p>}
      </div>
      {action}
    </div>
  )
}

// ── Toast Container ───────────────────────────────────────────────────
export function ToastContainer() {
  const [toasts, setToasts] = useState([])
  useEffect(() => {
    toastSys._listeners.add(setToasts)
    return () => toastSys._listeners.delete(setToasts)
  }, [])
  const icons = { success:'✅', error:'❌', info:'ℹ️' }
  return (
    <div className="fixed bottom-8 right-8 z-[9999] flex flex-col gap-3 pointer-events-none">
      {toasts.map(t => (
        <div key={t.id}
          className={cn(
            'flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl text-sm font-bold pointer-events-auto bg-slate-900 border border-white/10 animate-fade-up',
            t.type === 'success' && 'border-l-4 border-l-emerald-500',
            t.type === 'error' && 'border-l-4 border-l-red-500',
          )}>
          <span className="text-lg">{icons[t.type]}</span>
          <span className="text-white">{t.msg}</span>
        </div>
      ))}
    </div>
  )
}
