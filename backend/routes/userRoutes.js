const express = require('express');
const router = express.Router();
const User = require('../models/User');

// ======================
// Create or sync user
// POST /api/users
// ======================
router.post('/', async (req, res) => {
  try {
    const { clerkId, email, name, userType } = req.body;

    if (!clerkId || !email || !name) {
      return res.status(400).json({
        success: false,
        message: 'clerkId, email, and name are required',
      });
    }

    let user = await User.findOne({ clerkId });

    if (!user) {
      user = new User({ clerkId, email, name, userType });
      await user.save();
    } else {
      const updates = {};
      if (email !== user.email) updates.email = email;
      if (name !== user.name) updates.name = name;
      if (userType && userType !== user.userType) updates.userType = userType;

      if (Object.keys(updates).length > 0) {
        user = await User.findOneAndUpdate({ clerkId }, updates, { new: true });
      }
    }

    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating or syncing user',
      error: error.message,
    });
  }
});

// ======================
// Get user by clerkId
// GET /api/users/:clerkId
// ======================
router.get('/:clerkId', async (req, res) => {
  try {
    const user = await User.findOne({ clerkId: req.params.clerkId }).lean();
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user',
      error: error.message,
    });
  }
});

// ======================
// Update user
// PUT /api/users/:clerkId
// ======================
router.put('/:clerkId', async (req, res) => {
  try {
    const updates = req.body;

    if (!updates || Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No updates provided',
      });
    }

    const user = await User.findOneAndUpdate(
      { clerkId: req.params.clerkId },
      updates,
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating user',
      error: error.message,
    });
  }
});

module.exports = router;
