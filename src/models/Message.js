/**
 * @fileoverview Fundação omnichannel do LeadHunter: módulo src/models/Message.
 *
 * Responsabilidade isolada para conversas, integrações, agente SDR,
 * segurança ou validação deste domínio.
 * @module src/models/Message
 */

const { mongoose, scopedFields } = require('./_omnichannelScope');
const { MESSAGE_DIRECTIONS, MESSAGE_AUTHORS } = require('../domain/omnichannel/constants');
const schema = new mongoose.Schema({
  ...scopedFields(),
  conversationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true, index: true },
  leadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead', required: true, index: true },
  externalMessageId: { type: String, default: '', index: true },
  direction: { type: String, enum: MESSAGE_DIRECTIONS, required: true },
  authorType: { type: String, enum: MESSAGE_AUTHORS, required: true },
  channel: { type: String, required: true },
  text: { type: String, default: '', maxlength: 12000 },
  media: { type: [Object], default: [] },
  status: { type: String, enum: ['queued', 'sent', 'delivered', 'read', 'failed', 'received'], default: 'received', index: true },
  providerErrorCode: { type: String, default: '' },
  providerErrorMessage: { type: String, default: '' },
  sentAt: { type: Date, default: null },
  deliveredAt: { type: Date, default: null },
  readAt: { type: Date, default: null },
  receivedAt: { type: Date, default: null },
  metadata: { type: Object, default: {} },
  correlationId: { type: String, required: true, index: true }
}, { timestamps: true });
schema.index({ userId: 1, externalMessageId: 1 }, { unique: true, sparse: true });
schema.index({ userId: 1, conversationId: 1, createdAt: -1 });
module.exports = mongoose.model('Message', schema);
