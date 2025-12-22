const mongoose = require('mongoose');
const { Schema } = mongoose;

const RecurringExpenseSchema = new Schema({
  name: { type: String, required: true },
  amount: { type: Number, required: true },
  category: { type: String, required: true },
  description: { type: String },
  userId: { type: String, required: true },
  frequency: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'yearly'],
    required: true,
  },
  startDate: { type: Date, required: true },
  endDate: { type: Date },
  lastProcessed: { type: Date },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('RecurringExpense', RecurringExpenseSchema);
