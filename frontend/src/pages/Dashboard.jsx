import { useState, useEffect } from 'react'
import { useApp, useAuth } from '../AppContext.jsx'
import { useRouter } from '../Router.jsx'
import { Card, StatCard, SectionHeader, Button, Avatar, Badge } from '../components/ui.jsx'
import AddExpenseModal from '../components/AddExpenseModal.jsx'
import ExpenseItem from '../components/ExpenseItem.jsx'
import { reports, expenses as apiExpenses, groups as apiGroups, settlements as apiSettlements } from '../api.js'
import { fmt, fmtK, greeting, toast, cn } from '../utils.js'

// ── Mini bar chart (pure SVG, optimized for dark theme) ─────────────────
function BarChart({ data }) {
  if (!data || data.length === 0) return <div className="py-20 text-center text-slate-600 font-bold uppercase tracking-widest text-xs">No data available</div>
  const max = Math.max(...data.map(d => d.amount), 1)
  const BAR_W = 32, GAP = 12, H = 180, PAD = 30
  const total = data.length
  const svgW = total * (BAR_W + GAP)

  return (
    <div className="overflow-x-auto py-4">
      <svg width="100%" viewBox={`0 0 ${svgW} ${H + PAD}`} style={{ height: H + PAD }}>
        {data.map((d, i) => {
          const barH = Math.max(8, Math.round((d.amount / max) * H))
          const x = i * (BAR_W + GAP)
          const y = H - barH
          const isActive = i === data.length - 1
          return (
            <g key={`${d.year}-${d.month}`} className="group cursor-default">
              {/* Ghost Bar */}
              <rect x={x} y={0} width={BAR_W} height={H} rx="8" fill="currentColor" className="text-white/[0.03]" />
              {/* Actual Bar */}
              <rect
                x={x} y={y} width={BAR_W} height={barH}
                rx="8" fill={isActive ? '#10b981' : '#10b981'}
                opacity={isActive ? 1 : 0.2}
                className="transition-all duration-300 group-hover:opacity-60"
              />
              <text x={x + BAR_W / 2} y={H + PAD - 8}
                textAnchor="middle" fontSize="10" fontWeight="700" fill={isActive ? '#10b981' : '#475569'} className="uppercase tracking-tighter">{d.month}</text>
              {isActive && (
                <text x={x + BAR_W / 2} y={y - 10}
                  textAnchor="middle" fontSize="11" fill="#10b981" fontWeight="900">
                  {fmtK(d.amount)}
                </text>
              )}
            </g>
          )
        })}
      </svg>
    </div>
  )
}

function DebtRow({ debt, onPay }) {
  return (
    <div className="flex items-center gap-4 p-4 bg-white/[0.03] rounded-2xl border border-white/5 mb-3 group hover:bg-white/[0.05] transition-all">
      <Avatar name={debt.from} color={debt.fromColor} size="sm" className="border border-white/10" />
      <span className="text-slate-600">→</span>
      <Avatar name={debt.to}   color={debt.toColor}   size="sm" className="border border-white/10" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-white truncate">
          {debt.from.split(' ')[0]} owes {debt.to.split(' ')[0]}
        </p>
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-600 mt-0.5">Settle balance</p>
      </div>
      <div className="text-right mr-2">
        <div className="text-sm font-black text-red-400">{fmt(debt.amount)}</div>
      </div>
      <Button size="xs" variant="outline" onClick={() => onPay(debt)}>Pay</Button>
    </div>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const { navigate } = useRouter()
  const [showAdd, setShowAdd] = useState(false)
  const [summary, setSummary] = useState({ totalOwed: 0, totalOwe: 0, netBalance: 0 })
  const [recentExpenses, setRecentExpenses] = useState([])
  const [groups, setGroups] = useState([])
  const [monthlyData, setMonthlyData] = useState([])
  const [debts, setDebts] = useState([])
  const [loading, setLoading] = useState(true)

  const firstName = user?.name?.split(' ')[0] || 'Friend'

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sumRes, expRes, grpRes, monRes] = await Promise.all([
          reports.getSummary(),
          apiExpenses.getUserRecent(),
          apiGroups.getAll(),
          reports.getMonthly()
        ])
        setSummary(sumRes.data)
        setRecentExpenses(expRes.data.expenses)
        setGroups(grpRes.data.groups)
        setMonthlyData(monRes.data.monthly || [])
        
        const allDebts = []
        grpRes.data.groups.forEach(g => {
          if (g.simplifiedDebts) {
            g.simplifiedDebts.forEach(d => {
              if (d.fromUser?._id === user?._id || d.toUser?._id === user?._id) {
                allDebts.push({
                  ...d,
                  groupId: g._id,
                  from: d.fromUser?.name || 'User',
                  to: d.toUser?.name || 'User',
                  fromColor: d.fromUser?.color,
                  toColor: d.toUser?.color
                })
              }
            })
          }
        })
        setDebts(allDebts.slice(0, 5))
        setLoading(false)
      } catch (err) {
        toast.error('Failed to load dashboard data')
        setLoading(false)
      }
    }
    fetchData()
  }, [user?._id])

  const handlePay = async (debt) => {
    try {
      await apiSettlements.pay({
        groupId: debt.groupId,
        fromUserId: debt.fromUser?._id,
        toUserId: debt.toUser?._id,
        amount: debt.amount
      })
      toast.success('Settlement recorded! ✅')
      window.location.reload()
    } catch (err) {
      toast.error('Failed to record settlement')
    }
  }

  return (
    <>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-white mb-2">
            {greeting()}, {firstName} 👋
          </h1>
          <p className="text-slate-500 font-medium">Your financial overview and activity</p>
        </div>
        <Button icon="+" size="lg" onClick={() => setShowAdd(true)}>Add Expense</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <StatCard label="Owed to You" value={fmt(summary.totalOwed)} sub="Collect from friends" color="emerald" icon="💰" />
        <StatCard label="You Owe" value={fmt(summary.totalOwe)} sub="Pending payments" color="red" icon="📤" />
        <StatCard label="Net Balance" value={(summary.netBalance >= 0 ? '+' : '') + fmt(summary.netBalance)} sub="Overall standing" color="blue" icon="⚖️" />
        <StatCard label="This Month" value={fmt(monthlyData && monthlyData.length > 0 ? monthlyData[monthlyData.length-1]?.amount || 0 : 0)} sub="Total spent" color="amber" icon="📋" />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Recent Expenses */}
        <Card className="flex flex-col h-full">
          <SectionHeader title="Recent Activity" sub="Last 5 transactions"
            action={<Button variant="ghost" size="sm" onClick={() => navigate('/activity')}>View All</Button>} />
          <div className="flex-1 space-y-2">
            {recentExpenses.length === 0 
              ? <div className="py-20 text-center text-slate-600 font-bold uppercase tracking-widest text-xs border border-dashed border-white/5 rounded-3xl">No recent expenses</div>
              : recentExpenses.slice(0,5).map(e => <ExpenseItem key={e._id} expense={e} />)
            }
          </div>
        </Card>

        {/* Monthly spending */}
        <Card>
          <SectionHeader title="Monthly Spending" sub="Last 6 months breakdown"
            action={<Badge variant="green">Live</Badge>} />
          <BarChart data={monthlyData} />
        </Card>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Settlements */}
        <Card>
          <SectionHeader title="Pending Settlements" sub="Fast settlement view" />
          <div className="mt-2">
            {debts.length === 0
              ? <div className="py-20 text-center text-slate-600 font-bold uppercase tracking-widest text-xs border border-dashed border-white/5 rounded-3xl">🎉 All settled up!</div>
              : debts.map((d, i) => <DebtRow key={i} debt={d} onPay={() => handlePay(d)} />)
            }
          </div>
        </Card>

        {/* Groups */}
        <Card>
          <SectionHeader title="Active Groups" sub={`Managing ${groups.length} groups`}
            action={<Button variant="ghost" size="sm" onClick={() => navigate('/groups')}>View All</Button>} />
          <div className="space-y-1">
            {groups.length === 0 
              ? <div className="py-20 text-center text-slate-600 font-bold uppercase tracking-widest text-xs border border-dashed border-white/5 rounded-3xl">No active groups</div>
              : groups.slice(0,4).map(g => (
                <div key={g._id} onClick={() => navigate('/groups/'+g._id)}
                  className="flex items-center gap-4 p-4 rounded-2xl hover:bg-white/[0.04] cursor-pointer transition-all border border-transparent hover:border-white/5">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-2xl" style={{ color: g.color || '#10b981' }}>
                    {g.icon || '👥'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white truncate">{g.name}</p>
                    <p className="text-xs font-medium text-slate-500">{g.members.length} members</p>
                  </div>
                  <div className="text-right">
                    <div className={cn("text-sm font-black", (g.myBalance || 0) >= 0 ? 'text-emerald-400' : 'text-red-400')}>
                      {(g.myBalance || 0) >= 0 ? '+' : '−'}{fmtK(Math.abs(g.myBalance || 0))}
                    </div>
                  </div>
                </div>
              ))
            }
          </div>
        </Card>
      </div>

      <AddExpenseModal open={showAdd} onClose={() => setShowAdd(false)} />
    </>
  )
}
