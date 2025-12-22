const mongoose = require('mongoose');
const { Schema } = mongoose;

const MessageSchema = new Schema({
  workspaceId: { type: Schema.Types.ObjectId, ref: 'Workspace' },
  senderId: { type: String, required: true },
  recipientId: { type: String, required: true },
  content: { type: String, required: true },
  type: {
    type: String,
    enum: ['expense_request', 'note', 'notification'],
    default: 'note',
  },
  relatedExpenseId: { type: Schema.Types.ObjectId, ref: 'Expense' },
  isRead: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Message', MessageSchema);
