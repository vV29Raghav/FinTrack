import { Notification } from '../models/index.js'
import { asyncHandler } from '../middleware/index.js'

// GET /api/notifications
export const getNotifications = asyncHandler(async (req, res) => {
  const userId = req.user._id

  const notifications = await Notification.find({ userId })
    .sort({ createdAt: -1 })
    .limit(50)

  const unreadCount = await Notification.countDocuments({
    userId,
    read: false
  })

  res.status(200).json({ notifications, unreadCount })
})

// PATCH /api/notifications/:id/read
export const markRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, userId: req.user._id },
    { read: true },
    { new: true }
  )

  if (!notification) {
    return res.status(404).json({ message: 'Notification not found' })
  }

  res.status(200).json({ message: 'Marked as read' })
})

// PATCH /api/notifications/read-all
export const markAllRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { userId: req.user._id, read: false },
    { read: true }
  )

  res.status(200).json({ message: 'All marked as read' })
})

// DELETE /api/notifications/:id
export const deleteNotification = asyncHandler(async (req, res) => {
  const deleted = await Notification.findOneAndDelete({
    _id: req.params.id,
    userId: req.user._id
  })

  if (!deleted) {
    return res.status(404).json({ message: 'Notification not found' })
  }

  res.status(200).json({ message: 'Deleted' })
})