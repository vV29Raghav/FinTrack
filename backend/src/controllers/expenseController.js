import { Expense, Group, Notification } from '../models/index.js'
import { asyncHandler } from '../middleware/index.js'
import { recalcGroupBalances, buildSplits } from '../utils/balanceEngine.js'

// GET /api/expenses
export const getUserExpenses = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1
  const limit = parseInt(req.query.limit) || 10
  const skip = (page - 1) * limit

  const [expenses, total] = await Promise.all([
    Expense.find({
      $or: [
        { paidBy: req.user._id },
        { 'splits.user': req.user._id }
      ]
    })
      .populate('paidBy', 'name avatar color')
      .populate('groupId', 'name icon color')
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit),

    Expense.countDocuments({
      $or: [
        { paidBy: req.user._id },
        { 'splits.user': req.user._id }
      ]
    }),
  ])

  const formattedExpenses = expenses.map(expense => {
    const currentUserId = req.user._id.toString()

    const mySplit = expense.splits.find(
      split => split.user.toString() === currentUserId
    )

    const isPaidByCurrentUser =
      expense.paidBy._id.toString() === currentUserId

    // Calculate current user's share
    let myShare = 0

    if (mySplit) {
      myShare = isPaidByCurrentUser
        ? expense.amount - mySplit.amount
        : -mySplit.amount
    } else if (isPaidByCurrentUser) {
      myShare = expense.amount
    }

    return {
      ...expense.toObject(),
      myShare,
    }
  })

  return res.json({
    expenses: formattedExpenses,
    total,
    page,
    pages: Math.ceil(total / limit),
  })
})

// GET /api/expenses/group/:groupId
export const getGroupExpenses = asyncHandler(async (req, res) => {
  const { groupId } = req.params

  const page = parseInt(req.query.page) || 1
  const limit = parseInt(req.query.limit) || 20
  const skip = (page - 1) * limit

  // Check whether user belongs to this group
  const group = await Group.findById(groupId)

  if (!group) {
    return res.status(404).json({ message: 'Group not found' })
  }

  const isMember = group.members.some(
    member => member.user.toString() === req.user._id.toString()
  )

  if (!isMember) {
    return res.status(403).json({ message: 'Not a member' })
  }

  const [expenses, total] = await Promise.all([
    Expense.find({ groupId })
      .populate('paidBy', 'name avatar color')
      .populate('splits.user', 'name avatar color')
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit),

    Expense.countDocuments({ groupId }),
  ])

  const formattedExpenses = expenses.map(expense => {
    const currentUserId = req.user._id.toString()

    const mySplit = expense.splits.find(
      split => split.user._id.toString() === currentUserId
    )

    const isPaidByCurrentUser =
      expense.paidBy._id.toString() === currentUserId

    let myShare = 0

    if (mySplit) {
      myShare = isPaidByCurrentUser
        ? expense.amount - mySplit.amount
        : -mySplit.amount
    }

    return {
      ...expense.toObject(),
      myShare,
    }
  })

  return res.json({
    expenses: formattedExpenses,
    total,
    page,
    pages: Math.ceil(total / limit),
  })
})

// POST /api/expenses
export const createExpense = asyncHandler(async (req, res) => {
  const {
    groupId,
    description,
    amount,
    currency,
    paidBy,
    splitType,
    memberIds,
    exactAmounts,
    percentages,
    sharesMap,
    category,
    note,
    date,
  } = req.body

  const isPersonal = !groupId || groupId === 'personal'

  if (!description || !amount || !paidBy) {
    return res.status(400).json({
      message: 'description, amount and paidBy are required',
    })
  }

  let group = null

  if (!isPersonal) {
    group = await Group.findById(groupId)

    if (!group) {
      return res.status(404).json({ message: 'Group not found' })
    }
  }

  const memberUserIds = isPersonal
    ? [paidBy]
    : (memberIds || group.members.map(member => member.user.toString()))

  try {
    const splits = buildSplits({
      amount: parseFloat(amount),
      splitType: isPersonal ? 'equal' : (splitType || 'equal'),
      memberIds: memberUserIds,
      exactAmounts: exactAmounts || {},
      percentages: percentages || {},
      sharesMap: sharesMap || {},
    })

    const expense = await Expense.create({
      groupId: isPersonal ? null : groupId,
      description: description.trim(),
      amount: parseFloat(amount),
      currency: currency || group?.currency || 'INR',
      paidBy,
      splitType: isPersonal ? 'equal' : (splitType || 'equal'),
      splits,
      category: category || 'other',
      note,
      date: date ? new Date(date) : new Date(),
      createdBy: req.user._id,
    })

    // Update balances after adding expense
    if (!isPersonal) {
      await recalcGroupBalances(groupId, Group, Expense)
    }

    const populatedExpense = await expense
      .populate('paidBy', 'name avatar color')
      .then(exp =>
        exp.populate('splits.user', 'name avatar color')
      )

    // Send notifications to other group members
    if (!isPersonal && group) {
      const notificationTargets = group.members
        .filter(
          member => member.user.toString() !== req.user._id.toString()
        )
        .map(member => ({
          userId: member.user,
          type: 'expense',
          title: 'New expense added',
          message: `${req.user.name} added "${description}" – ₹${amount} in ${group.name}`,
          refId: expense._id,
          refType: 'Expense',
        }))

      if (notificationTargets.length) {
        await Notification.insertMany(notificationTargets)
      }
    }

    // Emit socket events
    if (!isPersonal) {
      req.io?.to(`group:${groupId}`).emit('expense_added', {
        expense: populatedExpense,
      })

      req.io?.to(`group:${groupId}`).emit('balance_updated', {
        groupId,
      })
    }

    return res.status(201).json({
      expense: populatedExpense,
    })

  } catch (err) {
    console.error('Create Expense Error:', err)

    return res.status(400).json({
      message: err.message,
      error: err,
    })
  }
})

// PUT /api/expenses/:id
export const updateExpense = asyncHandler(async (req, res) => {
  const expense = await Expense.findById(req.params.id)

  if (!expense) {
    return res.status(404).json({ message: 'Expense not found' })
  }

  const group = await Group.findById(expense.groupId)

  const isAdmin = group?.members.some(
    member =>
      member.user.toString() === req.user._id.toString() &&
      member.role === 'admin'
  )

  const isCreator =
    expense.createdBy?.toString() === req.user._id.toString()

  if (!isAdmin && !isCreator) {
    return res.status(403).json({ message: 'Not allowed' })
  }

  const {
    description,
    amount,
    category,
    note,
    date,
    splitType,
    memberIds,
    exactAmounts,
    percentages,
    sharesMap,
  } = req.body

  if (description) expense.description = description
  if (category) expense.category = category

  if (note !== undefined) {
    expense.note = note
  }

  if (date) {
    expense.date = new Date(date)
  }

  if (amount || splitType || memberIds) {
    const newAmount = parseFloat(amount || expense.amount)

    const memberUserIds =
      memberIds || expense.splits.map(split => split.user.toString())

    expense.amount = newAmount

    expense.splits = buildSplits({
      amount: newAmount,
      splitType: splitType || expense.splitType,
      memberIds: memberUserIds,
      exactAmounts: exactAmounts || {},
      percentages: percentages || {},
      sharesMap: sharesMap || {},
    })

    expense.splitType = splitType || expense.splitType
  }

  await expense.save()

  await recalcGroupBalances(
    expense.groupId,
    Group,
    Expense
  )

  req.io?.to(`group:${expense.groupId}`).emit(
    'expense_updated',
    { expense }
  )

  req.io?.to(`group:${expense.groupId}`).emit(
    'balance_updated',
    { groupId: expense.groupId }
  )

  return res.json({ expense })
})

// DELETE /api/expenses/:id
export const deleteExpense = asyncHandler(async (req, res) => {
  const expense = await Expense.findById(req.params.id)

  if (!expense) {
    return res.status(404).json({ message: 'Expense not found' })
  }

  const group = await Group.findById(expense.groupId)

  const isAdmin = group?.members.some(
    member =>
      member.user.toString() === req.user._id.toString() &&
      member.role === 'admin'
  )

  const isCreator =
    expense.createdBy?.toString() === req.user._id.toString()

  if (!isAdmin && !isCreator) {
    return res.status(403).json({ message: 'Not allowed' })
  }

  const groupId = expense.groupId

  await expense.deleteOne()

  await recalcGroupBalances(groupId, Group, Expense)

  // Emit delete events
  req.io?.to(`group:${groupId}`).emit('expense_deleted', {
    expenseId: req.params.id,
    groupId,
  })

  req.io?.to(`group:${groupId}`).emit('balance_updated', {
    groupId,
  })

  return res.json({
    message: 'Expense deleted',
  })
})