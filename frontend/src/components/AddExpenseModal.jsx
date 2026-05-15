import { useState, useEffect } from 'react'
import { Modal, Button, Input, Select } from './ui.jsx'
import { useAuth } from '../AppContext.jsx'
import { groups as apiGroups, expenses as apiExpenses } from '../api.js'
import { toast, cn } from '../utils.js'

const SPLIT_TYPES = ['equal','exact','percentage','shares']
const CATS = [
  { v:'food',          l:'🍽️ Food & Dining' },
  { v:'travel',        l:'✈️ Travel' },
  { v:'housing',       l:'🏠 Housing' },
  { v:'entertainment', l:'🎬 Entertainment' },
  { v:'utilities',     l:'💡 Utilities' },
  { v:'shopping',      l:'🛍️ Shopping' },
  { v:'healthcare',    l:'⚕️ Healthcare' },
  { v:'other',         l:'💸 Other' },
]

export default function AddExpenseModal({ open, onClose, groupId: initialGroupId, onAdded }) {
  const { user } = useAuth()
  const [groups, setGroups] = useState([])
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(false)
  
  const [form, setForm] = useState({
    description: '', amount: '', currency: 'INR',
    groupId: '',
    paidBy: '', category: 'food',
    splitType: 'equal',
    date: new Date().toISOString().split('T')[0],
    note: ''
  })

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const [splitsData, setSplitsData] = useState({
    exactAmounts: {},
    percentages: {},
    sharesMap: {}
  })

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const res = await apiGroups.getAll()
        setGroups(res.data.groups)
        const defaultG = initialGroupId || (res.data.groups.length > 0 ? res.data.groups[0]._id : 'personal')
        if (defaultG) {
          setForm(f => ({ ...f, groupId: defaultG, paidBy: user?._id }))
        }
      } catch (err) {}
    }
    if (open && user?._id) fetchGroups()
  }, [open, initialGroupId, user?._id])

  useEffect(() => {
    const fetchMembers = async () => {
      if (!form.groupId || form.groupId === 'personal') {
        const myId = user?._id
        if (myId) {
          setMembers([{ user: { _id: myId, name: 'You (Personal)', color: user?.color } }])
          setSplitsData({ exactAmounts: { [myId]: '' }, percentages: { [myId]: 100 }, sharesMap: { [myId]: 1 } })
        }
        return
      }
      try {
        const res = await apiGroups.getById(form.groupId)
        const mems = res.data.group.members
        setMembers(mems)
        
        const initialExact = {}
        const initialPct = {}
        const initialShares = {}
        mems.forEach(m => {
          initialExact[m.user._id] = ''
          initialPct[m.user._id] = ''
          initialShares[m.user._id] = '1'
        })
        setSplitsData({
          exactAmounts: initialExact,
          percentages: initialPct,
          sharesMap: initialShares
        })
      } catch (err) {}
    }
    fetchMembers()
  }, [form.groupId, user?._id])

  const setSplitVal = (type, userId, val) => {
    setSplitsData(prev => ({
      ...prev,
      [type]: { ...prev[type], [userId]: val }
    }))
  }

  const submit = async (e) => {
    e.preventDefault()
    const { description, amount, paidBy, groupId } = form
    if (!groupId) { toast.error('Please select a group or personal'); return }
    if (!description.trim()) { toast.error('Please add a description'); return }
    const numAmount = parseFloat(amount)
    if (isNaN(numAmount) || numAmount <= 0) { toast.error('Please enter a valid amount'); return }
    if (!paidBy) { toast.error('Payer information missing.'); return }
    
    if (form.splitType === 'exact') {
      const sum = Object.values(splitsData.exactAmounts).reduce((s, v) => s + parseFloat(v || 0), 0)
      if (Math.abs(sum - amount) > 0.01) {
        toast.error(`Total split amount (₹${sum}) must equal expense amount (₹${amount})`)
        return
      }
    } else if (form.splitType === 'percentage') {
      const sum = Object.values(splitsData.percentages).reduce((s, v) => s + parseFloat(v || 0), 0)
      if (Math.abs(sum - 100) > 0.01) {
        toast.error(`Total percentage (${sum}%) must equal 100%`)
        return
      }
    } else if (form.splitType === 'shares') {
      const total = Object.values(splitsData.sharesMap).reduce((s, v) => s + parseFloat(v || 0), 0)
      if (total <= 0) {
        toast.error('Total shares must be greater than zero')
        return
      }
    }

    setLoading(true)
    try {
      await apiExpenses.create({
        ...form,
        amount,
        exactAmounts: splitsData.exactAmounts,
        percentages: splitsData.percentages,
        sharesMap: splitsData.sharesMap
      })
      toast.success('Expense added! 🎉')
      onAdded && onAdded()
      onClose()
      setForm({ ...form, description: '', amount: '', note: '' })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add expense')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Add Expense">
      <form onSubmit={submit} className="space-y-6">
        <Input label="Description" placeholder="e.g. Dinner at Barbeque Nation"
          value={form.description} onChange={e => set('description', e.target.value)} required/>

        <div className="grid grid-cols-2 gap-4">
          <Input label="Amount" type="number" placeholder="0.00" min="0" step="0.01"
            value={form.amount} onChange={e => set('amount', e.target.value)} required/>
          <Select label="Currency" value={form.currency} onChange={e => set('currency', e.target.value)}>
            <option value="INR" className="bg-slate-900">₹ INR</option>
            <option value="USD" className="bg-slate-900">$ USD</option>
            <option value="EUR" className="bg-slate-900">€ EUR</option>
          </Select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select label="Group / Space" value={form.groupId} onChange={e => set('groupId', e.target.value)}>
            <option value="personal" className="bg-slate-900">👤 Personal (Self)</option>
            {groups.map(g => <option key={g._id} value={g._id} className="bg-slate-900">{g.icon} {g.name}</option>)}
          </Select>

          <Select label="Category" value={form.category} onChange={e => set('category', e.target.value)}>
            {CATS.map(c => <option key={c.v} value={c.v} className="bg-slate-900">{c.l}</option>)}
          </Select>
        </div>

        <Select label="Paid By" value={form.paidBy} onChange={e => set('paidBy', e.target.value)}>
          {members.map(m => (
            <option key={m.user._id} value={m.user._id} className="bg-slate-900">
              {m.user._id === user?._id ? 'You' : m.user.name}
            </option>
          ))}
        </Select>

        {/* Split Logic */}
        {form.groupId !== 'personal' && (
          <div className="p-6 rounded-[2rem] bg-white/[0.02] border border-white/5">
            <label className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 mb-4 block text-center">Split Settings</label>
            <div className="flex gap-1 bg-white/5 p-1.5 rounded-2xl mb-6">
              {SPLIT_TYPES.map(t => (
                <button key={t} type="button" onClick={() => set('splitType', t)}
                  className={cn('flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all duration-300',
                    form.splitType === t 
                      ? 'bg-emerald-500 text-black shadow-[0_4px_12px_rgba(16,185,129,0.3)]' 
                      : 'text-slate-500 hover:text-slate-300 hover:bg-white/5')}>
                  {t}
                </button>
              ))}
            </div>

            {form.splitType !== 'equal' && (
              <div className="space-y-4">
                {members.map(m => (
                  <div key={m.user._id} className="flex items-center gap-4">
                    <span className="flex-1 text-sm font-bold text-slate-400">{m.user._id === user?._id ? 'You' : m.user.name.split(' ')[0]}</span>
                    <div className="w-24">
                      <Input type="number" 
                        placeholder={form.splitType === 'exact' ? '₹' : form.splitType === 'percentage' ? '%' : '1'} 
                        value={splitsData[form.splitType === 'exact' ? 'exactAmounts' : form.splitType === 'percentage' ? 'percentages' : 'sharesMap'][m.user._id]}
                        onChange={e => setSplitVal(form.splitType === 'exact' ? 'exactAmounts' : form.splitType === 'percentage' ? 'percentages' : 'sharesMap', m.user._id, e.target.value)} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-white/5">
           <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
           <Button type="submit" loading={loading}>Add Expense</Button>
        </div>
      </form>
    </Modal>
  )
}
