const mongoose = require('mongoose');
const { Schema } = mongoose;

const UserSchema = new Schema({
  clerkId: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  name: { type: String, required: true },
  userType: {
    type: String,
    enum: ['personal', 'business'],
    default: 'personal',
  },
  workspaces: [{ type: Schema.Types.ObjectId, ref: 'Workspace' }],
  subscriptionTier: {
    type: String,
    enum: ['free', 'premium', 'enterprise'],
    default: 'free',
  },
  subscriptionEndDate: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
