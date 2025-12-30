const mongoose = require('mongoose');
const { Schema } = mongoose;

const WorkspaceSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String },
  owner: { type: String, required: true },
  members: [
    {
      userId: { type: String, required: true },
      name: { type: String },
      salary: { type: Number, default: 0 },
      role: {
        type: String,
        enum: ['admin', 'member', 'viewer'],
        default: 'member',
      },
      joinedAt: { type: Date, default: Date.now },
    },
  ],
  invites: [
    {
      email: { type: String, required: true },
      token: { type: String, required: true },
      role: { type: String, default: 'member' },
      sentAt: { type: Date, default: Date.now },
    }
  ],
  budget: { type: Number, default: 0 },
  currency: { type: String, default: 'USD' },
}, { timestamps: true });

module.exports = mongoose.model('Workspace', WorkspaceSchema);
