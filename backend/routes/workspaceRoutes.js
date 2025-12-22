const express = require('express');
const router = express.Router();
const Workspace = require('../models/Workspace');
const User = require('../models/User');

// ======================
// Create a workspace
// ======================
router.post('/workspaces', async (req, res) => {
  try {
    const { name, description, ownerId } = req.body;

    if (!name || !ownerId) {
      return res.status(400).json({ success: false, message: 'Workspace name and ownerId are required' });
    }

    const workspace = new Workspace({
      name,
      description,
      owner: ownerId,
      members: [{ userId: ownerId, role: 'admin' }]
    });

    await workspace.save();

    // Add workspace to owner's document
    await User.findOneAndUpdate(
      { clerkId: ownerId },
      { $push: { workspaces: workspace._id } }
    );

    res.status(201).json({ success: true, workspace });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error creating workspace', error: error.message });
  }
});

// ======================
// Join workspace (after invite)
// ======================
router.post('/workspaces/join', async (req, res) => {
  try {
    const { workspaceId, userId, role } = req.body;
    if (!workspaceId || !userId) {
      return res.status(400).json({ success: false, message: 'workspaceId and userId are required' });
    }

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) return res.status(404).json({ success: false, message: 'Workspace not found' });

    // Prevent duplicate member
    const alreadyMember = workspace.members.find(m => m.userId === userId);
    if (alreadyMember) return res.status(400).json({ success: false, message: 'User already a member' });

    workspace.members.push({ userId, role: role || 'member' });
    await workspace.save();

    // Add workspace to user document
    await User.findOneAndUpdate(
      { clerkId: userId },
      { $push: { workspaces: workspace._id } }
    );

    res.json({ success: true, workspace });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error joining workspace', error: error.message });
  }
});

// ======================
// Get workspace details
// ======================
router.get('/workspaces/:id', async (req, res) => {
  try {
    const workspace = await Workspace.findById(req.params.id)
      .populate('members.userId', 'name email') // optional: populate user details
      .lean();

    if (!workspace) return res.status(404).json({ success: false, message: 'Workspace not found' });

    res.json({ success: true, workspace });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching workspace', error: error.message });
  }
});

// ======================
// List all workspaces for a user
// ======================
router.get('/workspaces/user/:clerkId', async (req, res) => {
  try {
    const user = await User.findOne({ clerkId: req.params.clerkId })
      .populate('workspaces')
      .lean();

    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    res.json({ success: true, workspaces: user.workspaces });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching user workspaces', error: error.message });
  }
});

module.exports = router;
