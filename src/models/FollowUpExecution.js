/**
 * @fileoverview Fundação omnichannel do LeadHunter: módulo src/models/FollowUpExecution.
 *
 * Responsabilidade isolada para conversas, integrações, agente SDR,
 * segurança ou validação deste domínio.
 * @module src/models/FollowUpExecution
 */

const { mongoose, scopedFields } = require('./_omnichannelScope');
const schema = new mongoose.Schema({
  ...scopedFields(),
  policyId: { type: mongoose.Schema.Types.ObjectId, ref: 'FollowUpPolicy', required: true, index: true },
  leadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead', required: true, index: true },
  conversationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', default: null },
  status: { type: String, enum: ['scheduled', 'waiting_approval', 'executed', 'cancelled', 'failed'], default: 'scheduled', index: true },
  attempt: { type: Number, min: 1, required: true },
  scheduledAt: { type: Date, required: true, index: true },
  executedAt: { type: Date, default: null },
  cancelledAt: { type: Date, default: null },
  cancelReason: { type: String, default: '' },
  suggestedMessage: { type: String, default: '' },
  messageId: { type: mongoose.Schema.Types.ObjectId, ref: 'Message', default: null },
  correlationId: { type: String, required: true, index: true },
  idempotencyKey: { type: String, required: true }
}, { timestamps: true });
schema.index({ userId: 1, idempotencyKey: 1 }, { unique: true });
module.exports = mongoose.model('FollowUpExecution', schema);
