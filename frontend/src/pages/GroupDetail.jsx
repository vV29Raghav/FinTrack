import { useState, useEffect } from 'react'
import { useRouter } from '../Router.jsx'
import { Card, StatCard, Button, Badge, Avatar, Tabs, SectionHeader, Modal, Input } from '../components/ui.jsx'
import AddExpenseModal from '../components/AddExpenseModal.jsx'
import ExpenseItem from '../components/ExpenseItem.jsx'
import { groups as apiGroups, expenses as apiExpenses, users as apiUsers, settlements as apiSettlements } from '../api.js'
import { fmt, toast, cn } from '../utils.js'

function SettleRow({ debt, onPay }) {
  return (
    <div className="flex items-center gap-4 p-4 bg-white/[0.03] rounded-2xl border border-white/5 mb-3 group hover:bg-white/[0.05] transition-all">
      <Avatar name={debt.fromUser?.name || 'User'} color={debt.fromUser?.color} size="sm" className="border border-white/10" />
      <span className="text-slate-600">→</span>
      <Avatar name={debt.toUser?.name || 'User'} color={debt.toUser?.color} size="sm" className="border border-white/10" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-white truncate">
          {(debt.fromUser?.name || 'Someone').split(' ')[0]} owes {(debt.toUser?.name || 'Someone').split(' ')[0]}
        </p>
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-600 mt-0.5">Settle balance</p>
      </div>
      <div className="text-right mr-2">
        <div className="text-sm font-black text-red-400">{fmt(debt.amount)}</div>
      </div>
      <Button size="xs" variant="outline" onClick={onPay}>Pay</Button>
    </div>
  )
}

const TABS = [
  { id: 'expenses', label: 'Expenses' },
  { id: 'activity', label: 'Activity' },
]

export default function GroupDetail() {
  const { path, navigate } = useRouter()
  const groupId = path.split('/').pop()
  const [group, setGroup] = useState(null)
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('expenses')
  const [showAdd, setShowAdd] = useState(false)
  const [showInvite, setShowInvite] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])

  const fetchData = async () => {
    try {
      const [groupRes, expenseRes] = await Promise.all([
        apiGroups.getById(groupId),
        apiExpenses.getByGroup(groupId),
      ])
      setGroup(groupRes.data.group)
      setExpenses(expenseRes.data.expenses)
    } catch (err) {
      toast.error('Failed to load group details')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (groupId) fetchData()
  }, [groupId])

  const handlePay = async (debt) => {
    try {
      await apiSettlements.pay({
        groupId,
        fromUserId: debt.fromUser._id,
        toUserId: debt.toUser._id,
        amount: debt.amount,
      })
      toast.success('Settlement recorded ✅')
      fetchData()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to settle')
    }
  }

  const handleSearch = async (query) => {
    setSearchQuery(query)
    if (query.length < 3) { setSearchResults([]); return }
    try {
      const response = await apiUsers.search(query)
      setSearchResults(response.data.users)
    } catch (err) {}
  }

  const handleAddMember = async (userId) => {
    try {
      await apiGroups.addMember(groupId, userId)
      toast.success('Member added! 🤝')
      setShowInvite(false)
      setSearchQuery('')
      setSearchResults([])
      fetchData()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add member')
    }
  }

  if (loading) return <div className="py-20 text-center text-slate-500 font-bold uppercase tracking-widest text-xs">Loading group details...</div>
  if (!group) return <div className="py-20 text-center text-red-500 font-bold uppercase tracking-widest text-xs">Group not found</div>

  const debts = group.simplifiedDebts || []

  return (
    <>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div className="flex items-center gap-5">
           <Button variant="ghost" size="sm" onClick={() => navigate('/groups')}>← Back</Button>
           <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl bg-white/5 border border-white/5" 
                style={{ color: group.color || '#10b981' }}>
             {group.icon || '👥'}
           </div>
           <div>
              <h1 className="text-3xl font-black text-white mb-1">{group.name}</h1>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{group.members.length} members · {group.category}</p>
           </div>
        </div>
        <Button icon="+" size="lg" onClick={() => setShowAdd(true)}>Add Expense</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        <StatCard label="Total Expenses" value={fmt(group.totalExpenses || 0)} color="blue" icon="📋" />
        <StatCard 
          label={(group.myBalance || 0) >= 0 ? 'You Are Owed' : 'You Owe'} 
          value={fmt(Math.abs(group.myBalance || 0))} 
          color={(group.myBalance || 0) >= 0 ? 'emerald' : 'red'} 
          icon={(group.myBalance || 0) >= 0 ? '💰' : '📤'} 
        />
        <StatCard label="Members" value={group.members.length} color="amber" icon="👥" />
      </div>

      {/* Body */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left - Expenses */}
        <div className="lg:col-span-2">
          <Card>
            <Tabs tabs={TABS} active={tab} onChange={setTab} />
            <div className="space-y-1">
              {tab === 'expenses' && (
                expenses.length === 0 
                  ? <div className="py-20 text-center text-slate-600 font-bold uppercase tracking-widest text-xs border border-dashed border-white/5 rounded-3xl">No expenses yet</div>
                  : expenses.map(e => <ExpenseItem key={e._id} expense={e} showGroup={false} />)
              )}
              {tab === 'activity' && <div className="py-20 text-center text-slate-600 font-bold uppercase tracking-widest text-xs border border-dashed border-white/5 rounded-3xl">Activity feed coming soon...</div>}
            </div>
          </Card>
        </div>

        {/* Right - Settle & Members */}
        <div className="space-y-8">
          {/* Settle Up */}
          <Card>
            <SectionHeader title="Settle Up" sub="Simplified debt view" />
            <div className="mt-4">
              {debts.length === 0
                ? <div className="py-14 text-center text-emerald-400 font-bold uppercase tracking-widest text-xs bg-emerald-500/5 rounded-3xl border border-emerald-500/10">🎉 All settled up!</div>
                : debts.map((d, i) => <SettleRow key={i} debt={d} onPay={() => handlePay(d)} />)
              }
            </div>
          </Card>

          {/* Members List */}
          <Card>
            <SectionHeader title="Members" 
              action={<Button variant="outline" size="xs" onClick={() => setShowInvite(true)}>+ Add</Button>} />
            <div className="mt-4 space-y-4">
              {group.members.map((m, i) => (
                <div key={m.user?._id} className="flex items-center gap-4 py-1">
                  <Avatar name={m.user?.name || 'User'} color={m.user?.color} size="sm" className="border border-white/10" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white truncate">{m.user?.name || 'User'}</p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-600">{m.role}</p>
                  </div>
                  {m.role === 'admin' && <Badge variant="gray">Admin</Badge>}
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <AddExpenseModal open={showAdd} onClose={() => setShowAdd(false)} groupId={groupId} onAdded={fetchData} />

      <Modal open={showInvite} onClose={() => setShowInvite(false)} title="Invite Member" size="sm">
        <div className="flex flex-col gap-6">
          <Input label="Search User" placeholder="Name or email..." value={searchQuery} onChange={e => handleSearch(e.target.value)} />
          <div className="max-h-64 overflow-y-auto space-y-2 pr-2">
            {searchResults.map(u => (
              <div key={u._id} onClick={() => handleAddMember(u._id)}
                className="flex items-center gap-4 p-3 rounded-2xl hover:bg-white/5 cursor-pointer transition-all border border-white/5">
                <Avatar name={u.name} color={u.color} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white truncate">{u.name}</p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-600 truncate">{u.email}</p>
                </div>
                <Button size="xs" variant="outline">Add</Button>
              </div>
            ))}
            {searchQuery.length >= 3 && searchResults.length === 0 && (
              <p className="text-center text-slate-600 font-bold uppercase tracking-widest text-xs py-10">No users found</p>
            )}
          </div>
          <Button variant="secondary" full onClick={() => setShowInvite(false)}>Cancel</Button>
        </div>
      </Modal>
    </>
  )
}