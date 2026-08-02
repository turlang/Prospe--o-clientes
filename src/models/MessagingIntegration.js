/**
 * @fileoverview Fundação omnichannel do LeadHunter: módulo src/models/MessagingIntegration.
 *
 * Responsabilidade isolada para conversas, integrações, agente SDR,
 * segurança ou validação deste domínio.
 * @module src/models/MessagingIntegration
 */

const { mongoose, scopedFields } = require('./_omnichannelScope');
const { INTEGRATION_STATUSES } = require('../domain/omnichannel/constants');
const schema = new mongoose.Schema({
  ...scopedFields(),
  provider: { type: String, enum: ['demo', 'uaizapi', 'evolution', 'meta'], required: true, index: true },
  name: { type: String, required: true, trim: true, maxlength: 120 },
  status: { type: String, enum: INTEGRATION_STATUSES, default: 'not_configured', index: true },
  externalInstanceId: { type: String, default: '' },
  phone: { type: String, default: '' },
  baseUrl: { type: String, default: '' },
  credentialsEncrypted: { type: Object, default: null, select: false },
  credentialPreview: { type: String, default: '' },
  settings: { type: Object, default: {} },
  lastConnectionTestAt: { type: Date, default: null },
  lastSynchronizationAt: { type: Date, default: null },
  lastErrorCode: { type: String, default: '' },
  lastErrorMessage: { type: String, default: '' },
  enabled: { type: Boolean, default: true }
}, { timestamps: true });
schema.index({ userId: 1, provider: 1, name: 1 }, { unique: true });
module.exports = mongoose.model('MessagingIntegration', schema);
