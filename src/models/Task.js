const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true, required: true },
    leadId: { type: String, index: true, required: true },
    leadName: { type: String, default: '' },
    title: { type: String, default: 'Follow-up comercial' },
    dueAt: { type: Date, required: true },
    message: { type: String, default: '' },
    priority: { type: String, default: 'MÉDIA', index: true },
    automationType: { type: String, default: 'MANUAL', index: true },
    done: { type: Boolean, default: false },
    completedAt: { type: Date, default: null }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Task', taskSchema);
