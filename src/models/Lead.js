const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true, required: true },
    leadKey: { type: String, index: true, required: true },
    data: { type: Object, required: true }
  },
  { timestamps: true }
);

leadSchema.index({ userId: 1, leadKey: 1 }, { unique: true });

module.exports = mongoose.model('Lead', leadSchema);
