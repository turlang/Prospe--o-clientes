/**
 * @fileoverview Fundação omnichannel do LeadHunter: módulo src/models/CrmActivity.
 *
 * Responsabilidade isolada para conversas, integrações, agente SDR,
 * segurança ou validação deste domínio.
 * @module src/models/CrmActivity
 */

const { mongoose, scopedFields } = require('./_omnichannelScope');
const { CRM_ACTIVITY_TYPES } = require('../domain/omnichannel/constants');
const schema = new mongoose.Schema({
  ...scopedFields(),
  leadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead', required: true, index: true },
  conversationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', default: null, index: true },
  channel: { type: String, default: 'system' },
  type: { type: String, enum: CRM_ACTIVITY_TYPES, required: true, index: true },
  source: { type: String, enum: ['manual', 'ai', 'automation', 'integration', 'system'], required: true },
  description: { type: String, required: true, maxlength: 2000 },
  responsibleUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  metadata: { type: Object, default: {} },
  correlationId: { type: String, required: true, index: true },
  idempotencyKey: { type: String, default: '', index: true },
  occurredAt: { type: Date, default: Date.now, index: true }
}, { timestamps: true, immutable: true });
schema.index({ userId: 1, idempotencyKey: 1 }, { unique: true, sparse: true });
module.exports = mongoose.model('CrmActivity', schema);
