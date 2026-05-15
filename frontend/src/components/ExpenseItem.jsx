import { catIcon, catBg, fmt, fmtDate, cn } from '../utils.js'

export default function ExpenseItem({ expense, showGroup = true }) {
  const { description, amount, paidBy, category, date, myShare, settled } = expense
  const gName = expense.groupName || (expense.groupId && typeof expense.groupId === 'object' ? expense.groupId.name : null)
  
  return (
    <div className="flex items-center gap-4 py-4 border-b border-white/5 last:border-0 group hover:bg-white/[0.02] transition-all px-2 rounded-2xl">
      <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0 bg-white/5 border border-white/5">
        {catIcon(category)}
      </div>
      
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-white truncate">{description}</p>
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mt-1">
          {paidBy?.name?.split(' ')[0] || 'Someone'} paid
          {showGroup && gName && <span className="text-emerald-500/50"> · {gName}</span>}
          {' · '}{fmtDate(date)}
        </p>
      </div>

      <div className="text-right flex-shrink-0">
        <p className="text-sm font-black text-white">{fmt(amount)}</p>
        {myShare !== undefined && (
          <p className={cn('text-[11px] font-black mt-1 uppercase tracking-tighter',
            myShare > 0 ? 'text-emerald-400' : myShare < 0 ? 'text-red-400' : 'text-slate-600')}>
            {myShare > 0 ? '+' : myShare < 0 ? '−' : ''}{myShare !== 0 ? fmt(Math.abs(myShare)) : 'settled'}
          </p>
        )}
        {settled && <span className="text-[9px] font-black uppercase tracking-widest bg-white/5 text-slate-500 rounded-lg px-2 py-0.5 mt-1 block">settled</span>}
      </div>
    </div>
  )
}
