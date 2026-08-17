/**
 * @fileoverview Estado operacional por usuário para o motor outbound.
 *
 * A fila pode ser preparada após a prospecção, mas o worker só está autorizado
 * a consumir jobs de usuários cujo estado esteja explicitamente RUNNING.
 *
 * @module src/models/OutboundAutomationState
 */

const mongoose = require('mongoose');

const outboundAutomationStateSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', default: null, index: true },
  status: { type: String, enum: ['STOPPED', 'RUNNING'], default: 'STOPPED', index: true },
  mode: { type: String, enum: ['semiautomatic', 'autonomous'], default: 'autonomous' },
  channel: { type: String, enum: ['whatsapp', 'email'], default: 'whatsapp' },
  minScore: { type: Number, default: 70, min: 0, max: 100 },
  startedAt: { type: Date, default: null },
  stoppedAt: { type: Date, default: null },
  lastStartedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }
}, { timestamps: true });

outboundAutomationStateSchema.index({ status: 1, userId: 1 });

module.exports = mongoose.model('OutboundAutomationState', outboundAutomationStateSchema);
