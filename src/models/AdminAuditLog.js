/**
 * @fileoverview Esquema Mongoose e modelo de persistência `AdminAuditLog`.
 *
 * Responsabilidade delimitada conforme a arquitetura descrita em
 * `docs/ARQUITETURA.md`. Alterações neste arquivo devem preservar os contratos
 * documentados e ser acompanhadas por testes quando afetarem regras de negócio.
 *
 * @module src/models/AdminAuditLog
 */

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
