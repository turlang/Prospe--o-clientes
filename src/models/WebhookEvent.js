/**
 * @fileoverview Fundação omnichannel do LeadHunter: módulo src/models/WebhookEvent.
 *
 * Responsabilidade isolada para conversas, integrações, agente SDR,
 * segurança ou validação deste domínio.
 * @module src/models/WebhookEvent
 */

const { mongoose } = require('./_omnichannelScope');
const schema = new mongoose.Schema({
  integrationId: { type: mongoose.Schema.Types.ObjectId, ref: 'MessagingIntegration', required: true, index: true },
  provider: { type: String, required: true, index: true },
  fingerprint: { type: String, required: true, unique: true, index: true },
  externalEventId: { type: String, default: '', index: true },
  signatureValid: { type: Boolean, required: true },
  status: { type: String, enum: ['accepted', 'processed', 'duplicate', 'rejected', 'failed'], required: true },
  correlationId: { type: String, required: true, index: true },
  payloadHash: { type: String, required: true },
  receivedAt: { type: Date, default: Date.now },
  processedAt: { type: Date, default: null },
  expiresAt: { type: Date, required: true, index: { expires: 0 } },
  errorCode: { type: String, default: '' }
}, { timestamps: true });
module.exports = mongoose.model('WebhookEvent', schema);
