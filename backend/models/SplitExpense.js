const mongoose = require('mongoose');
const { Schema } = mongoose;

const SplitExpenseSchema = new Schema({
  name: { type: String, required: true },
  totalAmount: { type: Number, required: true },
  date: { type: Date, required: true },
  category: { type: String, required: true },
  description: { type: String },
  createdBy: { type: String, required: true },
  participants: [
    {
      userId: { type: String, required: true },
      userName: { type: String },
      shareAmount: { type: Number, required: true },
      isPaid: { type: Boolean, default: false },
      paidAt: { type: Date },
    },
  ],
  workspaceId: { type: Schema.Types.ObjectId, ref: 'Workspace' },
  status: {
    type: String,
    enum: ['pending', 'partial', 'completed'],
    default: 'pending',
  },
}, { timestamps: true });

module.exports = mongoose.model('SplitExpense', SplitExpenseSchema);
