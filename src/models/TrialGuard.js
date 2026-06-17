const mongoose = require('mongoose');

const trialGuardSchema = new mongoose.Schema(
  {
    email: { type: String, trim: true, lowercase: true, index: true },
    emailDomain: { type: String, trim: true, lowercase: true, index: true },
    ip: { type: String, index: true },
    deviceId: { type: String, index: true },
    userAgent: { type: String, default: '' },
    status: { type: String, enum: ['allowed', 'blocked'], default: 'allowed', index: true },
    reason: { type: String, default: '' }
  },
  { timestamps: true }
);

trialGuardSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 30 });

module.exports = mongoose.model('TrialGuard', trialGuardSchema);
