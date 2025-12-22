const express = require('express');
const router = express.Router();
const Message = require('../models/Message');

// ======================
// Send a new message
// POST /api/messages
// ======================
router.post('/', async (req, res) => {
  try {
    const { workspaceId, senderId, content, recipientId, type, relatedExpenseId } = req.body;

    if (!workspaceId || !senderId || !content) {
      return res.status(400).json({
        success: false,
        message: 'workspaceId, senderId, and content are required',
      });
    }

    const msg = new Message({
      workspaceId,
      senderId,
      recipientId,
      content,
      type,
      relatedExpenseId,
    });

    await msg.save();
    res.status(201).json({ success: true, message: msg });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error sending message',
      error: error.message,
    });
  }
});

// ======================
// Get messages by workspace
// GET /api/messages/workspace/:workspaceId
// ======================
router.get('/workspace/:workspaceId', async (req, res) => {
  try {
    const messages = await Message.find({
      workspaceId: req.params.workspaceId,
    })
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, messages });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching messages',
      error: error.message,
    });
  }
});

// ======================
// Mark message as read
// PATCH /api/messages/:id/read
// ======================
router.patch('/:id/read', async (req, res) => {
  try {
    const msg = await Message.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );

    if (!msg) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }

    res.json({ success: true, message: msg });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error marking message as read',
      error: error.message,
    });
  }
});

module.exports = router;
