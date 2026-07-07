const mongoose = require('mongoose');

const adminAuditLogSchema = new mongoose.Schema(
  {
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    targetUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true, default: null },
    action: { type: String, required: true, index: true },
    before: { type: Object, default: {} },
    after: { type: Object, default: {} },
    ip: { type: String, default: '' },
    userAgent: { type: String, default: '' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('AdminAuditLog', adminAuditLogSchema);
