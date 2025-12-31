const express = require('express');
const router = express.Router();
const Workspace = require('../models/Workspace');
const User = require('../models/User');
const crypto = require('crypto');

// ======================
// Create a workspace
// ======================
router.post('/', async (req, res) => {
  try {
    const { name, description, ownerId } = req.body;

    if (!name || !ownerId) {
      return res.status(400).json({ success: false, message: 'Workspace name and ownerId are required' });
    }

    // Fetch user to check subscription tier and existing workspaces
    const user = await User.findOne({ clerkId: ownerId });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const workspaceCount = user.workspaces.length;
    let limit = 2; // Default for free
    if (user.subscriptionTier === 'premium') limit = 20;
    if (user.subscriptionTier === 'enterprise') limit = 100;

    if (workspaceCount >= limit) {
      return res.status(403).json({
        success: false,
        message: `Workspace limit reached. ${user.subscriptionTier === 'free' ? 'Free' : 'Premium'} accounts are limited to ${limit} workspaces.`
      });
    }

    const workspace = new Workspace({
      name,
      description,
      owner: ownerId,
      members: [{ userId: ownerId, name: user.name, role: 'admin' }]
    });

    await workspace.save();

    // Add workspace to owner's document
    user.workspaces.push(workspace._id);
    await user.save();

    res.status(201).json({ success: true, workspace });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error creating workspace', error: error.message });
  }
});

// ======================
// Invite a member
// ======================
router.post('/invite', async (req, res) => {
  try {
    const { workspaceId, email, role, senderId } = req.body;
    if (!workspaceId || !email || !senderId) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) return res.status(404).json({ success: false, message: 'Workspace not found' });

    // Check ownership for invitation
    if (workspace.owner !== senderId) {
      return res.status(403).json({ success: false, message: 'Only the owner can invite members to this workspace' });
    }

    // Generate token
    const token = crypto.randomBytes(20).toString('hex');

    // Add to pending invites
    workspace.invites.push({ email, token, role: role || 'member' });
    await workspace.save();

    // Send email
    const transporter = req.app.get('transporter');
    const frontendUrl = req.app.get('frontendUrl');
    const joinLink = `${frontendUrl}/dashboard/workspace/join?token=${token}&workspaceId=${workspaceId}`;

    if (transporter) {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: `Invitation to join workspace: ${workspace.name}`,
        html: `
          <h3>You've been invited!</h3>
          <p>You've been invited to join the <b>${workspace.name}</b> workspace on FinTrack.</p>
          <a href="${joinLink}" style="padding: 10px 20px; background: #2563eb; color: white; text-decoration: none; border-radius: 5px;">Join Workspace</a>
          <p>If the button doesn't work, copy and paste this link: ${joinLink}</p>
        `,
      };
      await transporter.sendMail(mailOptions);
    }

    res.json({ success: true, message: 'Invitation sent successfully', joinLink });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error sending invitation', error: error.message });
  }
});

// ======================
// Join workspace (via invite or direct)
// ======================
router.post('/join', async (req, res) => {
  try {
    const { workspaceId, userId, role, token } = req.body;
    if (!workspaceId || !userId) {
      return res.status(400).json({ success: false, message: 'workspaceId and userId are required' });
    }

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) return res.status(404).json({ success: false, message: 'Workspace not found' });

    // If joining via token, verify it
    if (token) {
      const inviteIndex = workspace.invites.findIndex(i => i.token === token);
      if (inviteIndex === -1) {
        return res.status(400).json({ success: false, message: 'Invalid or expired invitation token' });
      }
      // Remove the invite once used
      workspace.invites.splice(inviteIndex, 1);
    }

    // Prevent duplicate member
    const alreadyMember = workspace.members.find(m => m.userId === userId);
    if (alreadyMember) return res.status(400).json({ success: false, message: 'User already a member' });

    // Get user name to store in member list
    const user = await User.findOne({ clerkId: userId }).lean();

    workspace.members.push({
      userId,
      name: user ? user.name : 'Unknown', // Store name for easier display
      role: role || 'member'
    });
    await workspace.save();

    // Add workspace to user document
    await User.findOneAndUpdate(
      { clerkId: userId },
      { $addToSet: { workspaces: workspace._id } }
    );

    res.json({ success: true, workspace });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error joining workspace', error: error.message });
  }
});

// ======================
// Remove a member
// ======================
router.delete('/:id/members/:userId', async (req, res) => {
  try {
    const { ownerId } = req.query; // Sender must provide their ID to verify ownership
    const workspaceId = req.params.id;
    const memberToRemove = req.params.userId;

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) return res.status(404).json({ success: false, message: 'Workspace not found' });

    // Verify ownership
    if (workspace.owner !== ownerId) {
      return res.status(403).json({ success: false, message: 'Only the owner can remove members' });
    }

    // Prevent owner from removing themselves (optional, but safer)
    if (memberToRemove === workspace.owner) {
      return res.status(400).json({ success: false, message: 'Owner cannot be removed from workspace' });
    }

    // Remove from members array
    workspace.members = workspace.members.filter(m => m.userId !== memberToRemove);
    await workspace.save();

    // Remove workspace from user's document
    await User.findOneAndUpdate(
      { clerkId: memberToRemove },
      { $pull: { workspaces: workspace._id } }
    );

    res.json({ success: true, message: 'Member removed successfully', workspace });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error removing member', error: error.message });
  }
});

// ======================
// Update member salary
// ======================
router.patch('/:id/members/:userId/salary', async (req, res) => {
  try {
    const { ownerId, salary } = req.body;
    const workspaceId = req.params.id;
    const memberId = req.params.userId;

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) return res.status(404).json({ success: false, message: 'Workspace not found' });

    // Verify ownership
    if (workspace.owner !== ownerId) {
      return res.status(403).json({ success: false, message: 'Only the owner can set member salaries' });
    }

    // Find member and update salary
    const member = workspace.members.find(m => m.userId === memberId);
    if (!member) return res.status(404).json({ success: false, message: 'Member not found in workspace' });

    member.salary = parseFloat(salary) || 0;
    await workspace.save();

    res.json({ success: true, message: 'Member salary updated', workspace });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating member salary', error: error.message });
  }
});

// ======================
// Get workspace details
// ======================
router.get('/:id', async (req, res) => {
  try {
    const workspace = await Workspace.findById(req.params.id).lean();

    if (!workspace) return res.status(404).json({ success: false, message: 'Workspace not found' });

    // Dynamically populate member names if they are missing or "Unknown"
    const updatedMembers = await Promise.all(workspace.members.map(async (member) => {
      if (!member.name || member.name === 'Unknown' || member.name === 'Anonymous') {
        const user = await User.findOne({ clerkId: member.userId }).lean();
        if (user) {
          return { ...member, name: user.name };
        }
      }
      return member;
    }));

    workspace.members = updatedMembers;

    res.json({ success: true, workspace });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching workspace', error: error.message });
  }
});

// ======================
// Update workspace details (e.g., budget, name)
// ======================
router.put('/:id', async (req, res) => {
  try {
    const { name, description, budget, currency, userId } = req.body;
    const workspace = await Workspace.findById(req.params.id);

    if (!workspace) return res.status(404).json({ success: false, message: 'Workspace not found' });

    // Check ownership
    if (workspace.owner !== userId) {
      return res.status(403).json({ success: false, message: 'Only the owner can update workspace details' });
    }

    if (name !== undefined) workspace.name = name;
    if (description !== undefined) workspace.description = description;
    if (budget !== undefined) workspace.budget = budget;
    if (currency !== undefined) workspace.currency = currency;

    await workspace.save();
    res.json({ success: true, workspace });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating workspace', error: error.message });
  }
});

// ======================
// List all workspaces for a user
// ======================
router.get('/user/:clerkId', async (req, res) => {
  try {
    const user = await User.findOne({ clerkId: req.params.clerkId })
      .populate('workspaces')
      .lean();

    if (!user) {
      return res.json({ success: true, workspaces: [] });
    }

    // Filter out any null workspaces in case of dangling references
    let validWorkspaces = (user.workspaces || []).filter(ws => ws !== null);

    // Dynamically populate member names for each workspace
    validWorkspaces = await Promise.all(validWorkspaces.map(async (ws) => {
      const updatedMembers = await Promise.all(ws.members.map(async (member) => {
        if (!member.name || member.name === 'Unknown' || member.name === 'Anonymous') {
          const u = await User.findOne({ clerkId: member.userId }).lean();
          if (u) return { ...member, name: u.name };
        }
        return member;
      }));
      return { ...ws, members: updatedMembers };
    }));

    res.json({ success: true, workspaces: validWorkspaces });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching user workspaces', error: error.message });
  }
});

module.exports = router;
