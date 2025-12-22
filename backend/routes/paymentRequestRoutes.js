const express = require('express');
const router = express.Router();
const PaymentRequest = require('../models/PaymentRequest');

// ======================
// Create payment request
// ======================
router.post('/', async (req, res) => {
  try {
    const { senderId, senderName, recipientId, recipientName, amount, description, workspaceId } = req.body;

    if (!senderId || !recipientId || !amount || !description) {
      return res.status(400).json({
        success: false,
        message: 'senderId, recipientId, amount, and description are required',
      });
    }

    const paymentRequest = new PaymentRequest({
      senderId,
      senderName,
      recipientId,
      recipientName,
      amount,
      description,
      workspaceId,
    });

    await paymentRequest.save();

    // Emit real-time notification via Socket.io
    const io = req.app.get('io');
    const connectedUsers = req.app.get('connectedUsers');
    const recipientSocketId = connectedUsers.get(recipientId);

    if (recipientSocketId) {
      io.to(recipientSocketId).emit('receive_payment_request', {
        id: paymentRequest._id,
        senderId,
        senderName,
        amount,
        description,
        timestamp: paymentRequest.createdAt,
      });
    }

    res.status(201).json({ success: true, paymentRequest });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating payment request',
      error: error.message,
    });
  }
});

// ======================
// Get payment requests for a user
// ======================
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { type } = req.query; // 'sent' or 'received'

    let query = {};
    if (type === 'sent') {
      query.senderId = userId;
    } else if (type === 'received') {
      query.recipientId = userId;
    } else {
      // Get all payment requests for user (sent or received)
      query = {
        $or: [{ senderId: userId }, { recipientId: userId }],
      };
    }

    const paymentRequests = await PaymentRequest.find(query)
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, paymentRequests });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching payment requests',
      error: error.message,
    });
  }
});

// ======================
// Update payment request status
// ======================
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;

    if (!['approved', 'rejected', 'paid'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status',
      });
    }

    const paymentRequest = await PaymentRequest.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!paymentRequest) {
      return res.status(404).json({
        success: false,
        message: 'Payment request not found',
      });
    }

    // Notify sender of status update
    const io = req.app.get('io');
    const connectedUsers = req.app.get('connectedUsers');
    const senderSocketId = connectedUsers.get(paymentRequest.senderId);

    if (senderSocketId) {
      io.to(senderSocketId).emit('payment_request_updated', {
        id: paymentRequest._id,
        status,
        recipientName: paymentRequest.recipientName,
      });
    }

    res.json({ success: true, paymentRequest });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating payment request',
      error: error.message,
    });
  }
});

module.exports = router;
