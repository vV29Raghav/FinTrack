const express = require('express');
const router = express.Router();
const Workspace = require('../models/Workspace');
const User = require('../models/User');

// ======================
// Send workspace invite via email
// ======================
router.post('/invite', async (req, res) => {
  try {
    const { email, workspaceName, workspaceId, role, invitedBy } = req.body;

    if (!email || !workspaceName || !workspaceId) {
      return res.status(400).json({
        success: false,
        message: 'Email, workspace name, and workspace ID are required',
      });
    }

    const transporter = req.app.get('transporter');
    const frontendUrl = req.app.get('frontendUrl');
    const inviteLink = `${frontendUrl}/dashboard/workspace/join?workspaceId=${workspaceId}&role=${role || 'member'}`;

    // If email is configured, send email
    if (transporter) {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: `You've been invited to join ${workspaceName} on FinTrack`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Workspace Invitation</h2>
            <p>Hello!</p>
            <p><strong>${invitedBy}</strong> has invited you to join the workspace <strong>${workspaceName}</strong> on FinTrack.</p>
            <p>Your role will be: <strong>${role || 'Member'}</strong></p>
            <p>Click the button below to accept the invitation and join the workspace:</p>
            <a href="${inviteLink}" style="display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 8px; margin: 20px 0;">Join Workspace</a>
            <p>Or copy and paste this link into your browser:</p>
            <p style="color: #6b7280; word-break: break-all;">${inviteLink}</p>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 12px;">If you didn't expect this invitation, you can safely ignore this email.</p>
          </div>
        `,
      };

      await transporter.sendMail(mailOptions);
      res.json({
        success: true,
        message: 'Invitation email sent successfully',
        inviteLink,
      });
    } else {
      // Email not configured, return invite link only
      res.json({
        success: true,
        message: 'Email service not configured. Share this link with the user:',
        inviteLink,
      });
    }
  } catch (error) {
    console.error('Error sending invite:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending invitation',
      error: error.message,
    });
  }
});

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
