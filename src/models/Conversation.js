/**
 * @fileoverview Fundação omnichannel do LeadHunter: módulo src/models/Conversation.
 *
 * Responsabilidade isolada para conversas, integrações, agente SDR,
 * segurança ou validação deste domínio.
 * @module src/models/Conversation
 */

const { mongoose, scopedFields } = require('./_omnichannelScope');
const { CONVERSATION_STATUSES } = require('../domain/omnichannel/constants');
const schema = new mongoose.Schema({
  ...scopedFields(),
  leadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead', required: true, index: true },
  integrationId: { type: mongoose.Schema.Types.ObjectId, ref: 'MessagingIntegration', default: null },
  channel: { type: String, required: true, index: true },
  externalConversationId: { type: String, default: '', index: true },
  normalizedPhone: { type: String, default: '', index: true },
  status: { type: String, enum: CONVERSATION_STATUSES, default: 'open', index: true },
  assignedUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null, index: true },
  handledBy: { type: String, enum: ['ai', 'human', 'hybrid'], default: 'hybrid' },
  unreadCount: { type: Number, default: 0, min: 0 },
  tags: { type: [String], default: [] },
  internalNotes: { type: [Object], default: [] },
  lastMessageAt: { type: Date, default: null, index: true },
  lastMessagePreview: { type: String, default: '' },
  correlationId: { type: String, default: '', index: true }
}, { timestamps: true });
schema.index({ userId: 1, channel: 1, externalConversationId: 1 }, { unique: true, sparse: true });
schema.index({ userId: 1, leadId: 1, status: 1 });
module.exports = mongoose.model('Conversation', schema);
