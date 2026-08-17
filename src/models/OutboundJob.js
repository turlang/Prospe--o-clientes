/**
 * @fileoverview Fila persistente de contatos outbound e respostas automáticas.
 *
 * O modelo mantém deduplicação, tentativas, agendamento e trilha de execução.
 * Mensagens reais só podem ser processadas quando a política do canal e os
 * kill-switches de produção permitirem explicitamente.
 *
 * @module src/models/OutboundJob
 */

const mongoose = require('mongoose');

const outboundJobSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', default: null, index: true },
  leadKey: { type: String, required: true, trim: true, maxlength: 280, index: true },
  leadName: { type: String, default: '', trim: true, maxlength: 240 },
  conversationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', default: null, index: true },
  purpose: { type: String, enum: ['initial_contact', 'reply', 'follow_up'], default: 'initial_contact', index: true },
  mode: { type: String, enum: ['assisted', 'semiautomatic', 'autonomous'], default: 'assisted', index: true },
  channel: { type: String, enum: ['whatsapp', 'email'], required: true, index: true },
  providerId: { type: String, required: true, trim: true, maxlength: 80, default: 'meta' },
  destination: { type: String, required: true, trim: true, maxlength: 320 },
  message: { type: String, required: true, trim: true, maxlength: 4000 },
  status: {
    type: String,
    enum: ['PENDING_REVIEW', 'PENDING', 'PROCESSING', 'SENT', 'FAILED', 'DEAD', 'BLOCKED', 'CANCELLED'],
    default: 'PENDING_REVIEW',
    index: true
  },
  scheduledAt: { type: Date, default: Date.now, index: true },
  nextAttemptAt: { type: Date, default: null, index: true },
  attempts: { type: Number, default: 0, min: 0 },
  maxAttempts: { type: Number, default: 3, min: 1, max: 10 },
  lockedAt: { type: Date, default: null },
  sentAt: { type: Date, default: null },
  externalMessageId: { type: String, default: '', maxlength: 500 },
  lastError: { type: String, default: '', maxlength: 1200 },
  blockedReason: { type: String, default: '', maxlength: 500 },
  consent: {
    granted: { type: Boolean, default: false },
    source: { type: String, default: '', maxlength: 120 },
    grantedAt: { type: Date, default: null },
    revokedAt: { type: Date, default: null }
  },
  dedupeKey: { type: String, required: true, unique: true, index: true, maxlength: 700 },
  metadata: { type: Object, default: {} }
}, { timestamps: true });

outboundJobSchema.index({ userId: 1, status: 1, scheduledAt: 1 });
outboundJobSchema.index({ userId: 1, leadKey: 1, createdAt: -1 });

module.exports = mongoose.model('OutboundJob', outboundJobSchema);
