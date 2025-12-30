const express = require('express');
const router = express.Router();
const Expense = require('../models/Expense');

// ======================
// SUGGEST CATEGORY (🔥 MUST BE FIRST)
// ======================
router.post('/suggest-category', (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Expense name is required',
      });
    }

    // Simple rule-based suggestion
    const lower = name.toLowerCase();

    let suggestedCategory = 'Other';

    if (lower.includes('food') || lower.includes('meal') || lower.includes('restaurant')) {
      suggestedCategory = 'Food';
    } else if (lower.includes('uber') || lower.includes('taxi') || lower.includes('bus')) {
      suggestedCategory = 'Transport';
    } else if (lower.includes('rent')) {
      suggestedCategory = 'Rent';
    } else if (lower.includes('electric') || lower.includes('water') || lower.includes('internet')) {
      suggestedCategory = 'Utilities';
    }

    res.json({
      success: true,
      suggestedCategory,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to suggest category',
    });
  }
});

// ======================
// GET all expenses
// ======================
router.get('/', async (req, res) => {
  try {
    const { userId, workspaceId, status } = req.query;
    let query = {};

    if (workspaceId) {
      // If a specific workspace is requested, just show that
      query.workspaceId = workspaceId;
    } else if (userId) {
      // If just userId is provided, get personal expenses + expenses from all workspaces the user is in
      const User = require('../models/User');
      const user = await User.findOne({ clerkId: userId }).lean();

      const workspaceIds = user?.workspaces || [];

      query = {
        $or: [
          { userId: userId }, // Created by user
          { workspaceId: { $in: workspaceIds } } // In user's workspaces
        ]
      };
    }

    if (status) query.status = status;

    const expenses = await Expense.find(query).sort({ date: -1 });
    res.json({ success: true, expenses });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch expenses from MongoDB' });
  }
});

// ======================
// GET stats
// ======================
router.get('/stats', async (req, res) => {
  try {
    const { userId } = req.query;
    const match = userId ? { userId } : {};

    const total = await Expense.aggregate([
      { $match: match },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    const pendingApprovals = await Expense.countDocuments({
      ...match,
      status: 'pending',
    });

    const startOfMonth = new Date();
    startOfMonth.setDate(1);

    const monthly = await Expense.aggregate([
      { $match: { ...match, date: { $gte: startOfMonth } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    res.json({
      success: true,
      stats: {
        totalExpenses: total[0]?.total || 0,
        thisMonth: monthly[0]?.total || 0,
        pendingApprovals,
      },
    });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to fetch statistics' });
  }
});

// ======================
// CREATE expense
// ======================
router.post('/', async (req, res) => {
  try {
    const expense = new Expense(req.body);
    await expense.save();
    res.status(201).json({ success: true, expense });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create expense in MongoDB' });
  }
});

// ======================
// UPDATE expense
// ======================
router.put('/:id', async (req, res) => {
  try {
    const expense = await Expense.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!expense) return res.status(404).json({ success: false });
    res.json({ success: true, expense });
  } catch {
    res.status(500).json({ success: false });
  }
});

// ======================
// DELETE expense
// ======================
router.delete('/:id', async (req, res) => {
  try {
    const expense = await Expense.findByIdAndDelete(req.params.id);
    if (!expense) return res.status(404).json({ success: false });
    res.json({ success: true });
  } catch {
    res.status(500).json({ success: false });
  }
});

module.exports = router;
