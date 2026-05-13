import { useState, useEffect } from 'react'
import { Card, Button, Badge } from '../components/ui.jsx'
import { notifications as apiNotifs } from '../api.js'
import { toast } from '../utils.js'

const TYPE_ICONS = {
  expense:    '💸',
  settlement: '✅',
  invite:     '📨',
  reminder:   '⏰',
}

export default function Notifications() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchNotifs = async () => {
    try {
      const res = await apiNotifs.getAll()
      setNotifications(res.data.notifications)
    } catch (err) {}
    setLoading(false)
  }

  useEffect(() => {
    fetchNotifs()
  }, [])

  const unreadCount = notifications.filter(n => !n.read).length

  const markRead = async (id) => {
    try {
      await apiNotifs.markRead(id)
      setNotifications(notifications.map(n => n._id === id ? { ...n, read: true } : n))
    } catch (err) {}
  }

  const markAllRead = async () => {
    try {
      await apiNotifs.markAllRead()
      setNotifications(notifications.map(n => ({ ...n, read: true })))
      toast.success('All marked as read')
    } catch (err) {}
  }

  return (
    <div>
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between',
        marginBottom:30, gap:12, flexWrap:'wrap' }}>
        <div>
          <h1 style={{ fontSize:28, fontWeight:900, marginBottom:6, color:'#0f172a' }}>
            Notifications
          </h1>

          {unreadCount > 0 && (
            <p style={{ color:'#64748b', fontSize:15, fontWeight:500 }}>
              {unreadCount} unread
            </p>
          )}
        </div>

        {unreadCount > 0 && (
          <Button variant="secondary" size="sm" onClick={markAllRead}>
            Mark all read
          </Button>
        )}
      </div>

      <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
        {loading ? <div className="py-10 text-center text-slate-400">Loading notifications...</div> :
         notifications.length === 0 ? (
          <Card>
            <div style={{ textAlign:'center', padding:'52px 0', color:'#94a3b8' }}>
              <div style={{ fontSize:42, marginBottom:12 }}>🔔</div>
              <p style={{ fontWeight:500 }}>You're all caught up!</p>
            </div>
          </Card>
        ) :
        notifications.map(n => (
          <div key={n._id} onClick={() => !n.read && markRead(n._id)}
            style={{ display:'flex', gap:12, padding:'16px 18px', borderRadius:18,
              border: n.read ? '1px solid var(--border,#e2e8f0)' : '1px solid #a7f3d0',
              background: n.read ? 'white' : '#f0fdf4',
              cursor: n.read ? 'default' : 'pointer',
              transition:'all .15s ease' }}>

            {/* Unread dot */}
            <div style={{ width:8, height:8, borderRadius:'50%',
              background: n.read ? 'transparent' : '#10b981',
              flexShrink:0, marginTop:6 }} />

            {/* Icon */}
            <div style={{ width:38, height:38, borderRadius:12, background:'#f1f5f9',
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:18, flexShrink:0 }}>
              {TYPE_ICONS[n.type] || '🔔'}
            </div>

            {/* Content */}
            <div style={{ flex:1 }}>
              <p style={{ fontSize:14, fontWeight:700, marginBottom:4 }}>
                {n.title}
              </p>

              <p style={{ fontSize:13, color:'#64748b', lineHeight:1.5 }}>
                {n.message}
              </p>

              <p style={{ fontSize:11, color:'#94a3b8', marginTop:6 }}>
                {new Date(n.createdAt).toLocaleString()}
              </p>
            </div>

            {!n.read && <Badge variant="green">New</Badge>}
          </div>
        ))}
      </div>
    </div>
  )
}