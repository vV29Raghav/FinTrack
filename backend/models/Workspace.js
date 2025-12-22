const mongoose = require('mongoose');
const { Schema } = mongoose;

const WorkspaceSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String },
  owner: { type: String, required: true },
  members: [
    {
      userId: { type: String, required: true },
      role: {
        type: String,
        enum: ['admin', 'member', 'viewer'],
        default: 'member',
      },
      joinedAt: { type: Date, default: Date.now },
    },
  ],
}, { timestamps: true });

module.exports = mongoose.model('Workspace', WorkspaceSchema);
