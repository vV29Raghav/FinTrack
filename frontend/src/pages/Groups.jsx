import { useState, useEffect } from 'react'
import { useRouter } from '../Router.jsx'
import { Card, Button, Modal, Input, Badge, AvatarGroup, Tabs, EmptyState, SectionHeader } from '../components/ui.jsx'
import { groups as apiGroups } from '../api.js'
import { fmt, toast, cn } from '../utils.js'

const CATS = [
  { v:'Trip',   icon:'✈️', label:'Trip'   },
  { v:'Home',   icon:'🏠', label:'Home'   },
  { v:'Office', icon:'💼', label:'Office' },
  { v:'Other',  icon:'🎯', label:'Other'  },
]

function GroupCard({ group, onClick }) {
  return (
    <Card hover onClick={onClick}>
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-6 bg-white/5 border border-white/5" 
           style={{ color: group.color || '#10b981' }}>
        {group.icon || '👥'}
      </div>
      <h3 className="text-lg font-bold text-white mb-1">{group.name}</h3>
      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6">{group.members.length} members · {group.category}</p>
      
      <div className="flex items-center justify-between pt-6 border-t border-white/5">
        <AvatarGroup members={group.members.map(m => m.user)} max={4} />
        <Badge variant={(group.myBalance || 0) >= 0 ? 'green' : 'red'}>
          {(group.myBalance || 0) >= 0 ? '+' : '−'}{fmt(Math.abs(group.myBalance || 0))}
        </Badge>
      </div>
    </Card>
  )
}

function CreateGroupModal({ open, onClose, onCreated }) {
  const [name, setName]     = useState('')
  const [cat, setCat]       = useState('Other')
  const [loading, setLoad]  = useState(false)

  const submit = async () => {
    if (!name.trim()) { toast.error('Please enter a group name'); return }
    setLoad(true)
    try {
      const res = await apiGroups.create({ name, category: cat, icon: CATS.find(c => c.v === cat)?.icon || '👥' })
      toast.success(`Group "${name}" created! 🎉`)
      onCreated(res.data.group)
      onClose(); setName(''); setCat('Other')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create group')
    } finally {
      setLoad(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Create Group">
      <div className="flex flex-col gap-8">
        <Input label="Group Name" placeholder="e.g. Goa Trip 2024"
          value={name} onChange={e => setName(e.target.value)} />

        <div>
          <label className="text-xs font-bold uppercase tracking-widest text-slate-500 block mb-4">Category</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {CATS.map(c => (
              <button key={c.v} onClick={() => setCat(c.v)}
                className={cn(
                  "flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all duration-200",
                  cat === c.v 
                    ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-400" 
                    : "bg-white/5 border-white/5 text-slate-500 hover:bg-white/10"
                )}>
                <span className="text-2xl">{c.icon}</span>
                <span className="text-[10px] font-black uppercase tracking-widest">{c.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-4 pt-4">
          <Button variant="secondary" full onClick={onClose}>Cancel</Button>
          <Button full loading={loading} onClick={submit}>Create Group</Button>
        </div>
      </div>
    </Modal>
  )
}

const TABS = [
  { id:'all',      label:'All Groups' },
  { id:'archived', label:'Archived', count:0 },
]

export default function Groups() {
  const { navigate } = useRouter()
  const [tab, setTab]       = useState('all')
  const [showCreate, setC]  = useState(false)
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchGroups = async () => {
    try {
      const res = await apiGroups.getAll()
      setGroups(res.data.groups)
    } catch (err) {
      toast.error('Failed to load groups')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchGroups()
  }, [])

  return (
    <div>
      <SectionHeader 
        title="Groups" 
        sub="Manage your shared expense workspaces"
        action={<Button icon="+" onClick={() => setC(true)}>Create Group</Button>}
      />

      <Tabs tabs={TABS} active={tab} onChange={setTab} />

      {tab === 'all' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.length === 0 && !loading && (
            <div className="col-span-full">
              <EmptyState icon="👥" title="No Groups Yet" desc="Create a group to start splitting expenses with friends!" />
            </div>
          )}
          {groups.map(g => (
            <GroupCard key={g._id} group={g} onClick={() => navigate('/groups/'+g._id)} />
          ))}
        </div>
      )}

      {tab === 'archived' && (
        <EmptyState icon="📦" title="No Archived Groups"
          desc="Groups you archive will appear here for reference." />
      )}

      <CreateGroupModal open={showCreate} onClose={() => setC(false)} onCreated={(newG) => setGroups([newG, ...groups])} />
    </div>
  )
}
