const AdminAuditLog = require('../models/AdminAuditLog');
const { hasMongoUri } = require('../db');

function getClientIp(req) {
  return String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() || req.ip || req.socket?.remoteAddress || '';
}

async function writeAdminAudit(req, action, { targetUserId = null, before = {}, after = {} } = {}) {
  if (!hasMongoUri()) return null;

  try {
    return await AdminAuditLog.create({
      adminId: req.adminUser?._id || req.user?.sub,
      targetUserId,
      action,
      before,
      after,
      ip: getClientIp(req),
      userAgent: String(req.headers['user-agent'] || '')
    });
  } catch (error) {
    console.warn('[ADMIN_AUDIT_FAILED]', action, error.message);
    return null;
  }
}

module.exports = { getClientIp, writeAdminAudit };
