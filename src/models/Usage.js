const mongoose = require('mongoose');

const usageSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true, required: true },
    day: { type: String, index: true, required: true },
    count: { type: Number, default: 0 }
  },
  { timestamps: true }
);

usageSchema.index({ userId: 1, day: 1 }, { unique: true });

module.exports = mongoose.model('Usage', usageSchema);
