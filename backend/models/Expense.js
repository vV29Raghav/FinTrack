const mongoose = require('mongoose');
const { Schema } = mongoose;

const ExpenseSchema = new Schema({
  name: { type: String, required: true },
  amount: { type: Number, required: true },
  date: { type: Date, required: true },
  category: { type: String, required: true },
  description: { type: String },
  userId: { type: String, required: true },
  workspaceId: { type: Schema.Types.ObjectId, ref: 'Workspace' },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  attachments: [{ type: String }],
  submittedBy: { type: String, required: true },
  approvedBy: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Expense', ExpenseSchema);
