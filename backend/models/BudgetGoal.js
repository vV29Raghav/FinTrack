const mongoose = require('mongoose');
const { Schema } = mongoose;

const BudgetGoalSchema = new Schema({
  userId: { type: String, required: true },
  name: { type: String, required: true },
  category: { type: String },
  targetAmount: { type: Number, required: true },
  period: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'yearly'],
    default: 'monthly',
  },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  currentSpent: { type: Number, default: 0 },
  alertThreshold: { type: Number, default: 80 }, // Alert when 80% of budget is reached
  alertSent: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('BudgetGoal', BudgetGoalSchema);
