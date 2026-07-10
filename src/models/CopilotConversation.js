const mongoose = require('mongoose');

const copilotMessageSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true, required: true },
    role: { type: String, enum: ['user', 'assistant'], required: true },
    content: { type: String, required: true },
    provider: { type: String, default: 'local' },
    model: { type: String, default: 'local' },
    recommendedActions: { type: [String], default: [] },
    metadata: { type: Object, default: {} }
  },
  { timestamps: true }
);

copilotMessageSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('CopilotConversation', copilotMessageSchema);
