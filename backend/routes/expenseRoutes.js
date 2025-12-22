const express = require('express');
const router = express.Router();
const Expense = require('../models/Expense');
const upload = require('../config/multer');
const { suggestCategory } = require('../utils/categorization');

// ======================
// GET all expenses
// ======================
router.get('/', async (req, res) => {
  try {
    const { userId, workspaceId, status } = req.query;
    const query = {};

    if (userId) query.userId = userId;
    if (workspaceId) query.workspaceId = workspaceId;
    if (status) query.status = status;

    const expenses = await Expense.find(query).sort({ date: -1 }).lean();
    res.json({ success: true, expenses });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch expenses' });
  }
});

// ======================
// GET expense statistics
// ======================
router.get('/stats', async (req, res) => {
  try {
    const { userId } = req.query;
    const match = userId ? { userId } : {};

    const total = await Expense.aggregate([
      { $match: match },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const pendingApprovals = await Expense.countDocuments({
      ...match,
      status: 'pending',
    });

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const monthly = await Expense.aggregate([
      { $match: { ...match, date: { $gte: startOfMonth } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    // Calculate average daily spend for current month
    const today = new Date();
    const daysInMonth = today.getDate(); // Days passed in current month
    const monthlyTotal = monthly[0]?.total || 0;
    const averageDaily = daysInMonth > 0 ? (monthlyTotal / daysInMonth).toFixed(2) : '0.00';

    res.json({
      success: true,
      stats: {
        totalExpenses: (total[0]?.total || 0).toFixed(2),
        thisMonth: monthlyTotal.toFixed(2),
        pendingApprovals,
        averageDaily,
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch statistics' });
  }
});

// ======================
// CREATE expense
// ======================
router.post('/', async (req, res) => {
  try {
    const {
      name,
      amount,
      date,
      category,
      description,
      userId,
      workspaceId,
      submittedBy,
    } = req.body;

    if (!name || !amount || !date || !category || !userId) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const expense = new Expense({
      name,
      amount,
      date,
      category,
      description,
      userId,
      workspaceId,
      submittedBy: submittedBy || userId,
      status: 'pending',
    });

    await expense.save();
    res.status(201).json({ success: true, expense });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create expense' });
  }
});

// ======================
// UPDATE expense
// ======================
router.put('/:id', async (req, res) => {
  try {
    const expense = await Expense.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense not found' });
    }

    res.json({ success: true, expense });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update expense' });
  }
});

// ======================
// APPROVE / REJECT expense
// ======================
router.patch('/:id/status', async (req, res) => {
  try {
    const { status, approvedBy } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const expense = await Expense.findByIdAndUpdate(
      req.params.id,
      { status, approvedBy },
      { new: true }
    );

    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense not found' });
    }

    res.json({ success: true, expense });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update status' });
  }
});

// ======================
// DELETE expense
// ======================
router.delete('/:id', async (req, res) => {
  try {
    const expense = await Expense.findByIdAndDelete(req.params.id);
    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense not found' });
    }
    res.json({ success: true, message: 'Expense deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete expense' });
  }
});

// ======================
// UPLOAD receipt/attachment
// ======================
router.post('/:id/upload', upload.single('receipt'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const expense = await Expense.findById(req.params.id);
    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense not found' });
    }

    // Add file path to attachments
    const filePath = `/uploads/${req.file.filename}`;
    expense.attachments = expense.attachments || [];
    expense.attachments.push(filePath);
    await expense.save();

    res.json({
      success: true,
      message: 'File uploaded successfully',
      file: filePath,
      expense,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to upload file',
      error: error.message,
    });
  }
});

// ======================
// SUGGEST category for expense
// ======================
router.post('/suggest-category', (req, res) => {
  try {
    const { name, description } = req.body;
    
    if (!name) {
      return res.status(400).json({ success: false, message: 'Expense name is required' });
    }
    
    const suggestedCategory = suggestCategory(name, description);
    
    res.json({
      success: true,
      suggestedCategory,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to suggest category',
      error: error.message,
    });
  }
});

module.exports = router;
