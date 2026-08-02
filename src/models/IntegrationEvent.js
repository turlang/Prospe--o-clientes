/**
 * @fileoverview Fundação omnichannel do LeadHunter: módulo src/models/IntegrationEvent.
 *
 * Responsabilidade isolada para conversas, integrações, agente SDR,
 * segurança ou validação deste domínio.
 * @module src/models/IntegrationEvent
 */

const { mongoose, scopedFields } = require('./_omnichannelScope');
const schema = new mongoose.Schema({
  ...scopedFields(),
  integrationId: { type: mongoose.Schema.Types.ObjectId, ref: 'MessagingIntegration', required: true, index: true },
  provider: { type: String, required: true, index: true },
  type: { type: String, required: true, index: true },
  status: { type: String, enum: ['received', 'processed', 'ignored', 'failed'], default: 'received' },
  correlationId: { type: String, required: true, index: true },
  externalEventId: { type: String, default: '', index: true },
  metadata: { type: Object, default: {} },
  errorCode: { type: String, default: '' },
  errorMessage: { type: String, default: '' },
  occurredAt: { type: Date, default: Date.now }
}, { timestamps: true });
module.exports = mongoose.model('IntegrationEvent', schema);
