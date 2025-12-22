const mongoose = require('mongoose');
const { Schema } = mongoose;

const PaymentRequestSchema = new Schema({
  senderId: { type: String, required: true },
  senderName: { type: String, required: true },
  recipientId: { type: String, required: true },
  recipientName: { type: String },
  amount: { type: Number, required: true },
  description: { type: String, required: true },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'paid'],
    default: 'pending',
  },
  workspaceId: { type: Schema.Types.ObjectId, ref: 'Workspace' },
}, { timestamps: true });

module.exports = mongoose.model('PaymentRequest', PaymentRequestSchema);
