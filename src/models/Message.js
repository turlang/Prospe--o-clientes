/**
 * @fileoverview Modelo MongoDB de mensagens omnichannel.
 *
 * Mensagens são imutáveis no conteúdo principal e armazenam direção, autoria,
 * estado de entrega, correlação e metadados do provedor. Identificadores
 * externos vazios não participam do índice único esparso.
 *
 * @module src/models/Message
 */

const { mongoose, scopedFields } = require('./_omnichannelScope');
const { MESSAGE_DIRECTIONS, MESSAGE_AUTHORS } = require('../domain/omnichannel/constants');

const schema = new mongoose.Schema({
  ...scopedFields(),
  conversationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true, index: true },
  leadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead', required: true, index: true },
  externalMessageId: { type: String, index: true },
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
schema.index({ userId: 1, correlationId: 1 });

module.exports = mongoose.model('Message', schema);
