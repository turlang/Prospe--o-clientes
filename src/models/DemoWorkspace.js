/**
 * @fileoverview Fundação omnichannel do LeadHunter: módulo src/models/DemoWorkspace.
 *
 * Responsabilidade isolada para conversas, integrações, agente SDR,
 * segurança ou validação deste domínio.
 * @module src/models/DemoWorkspace
 */

const { mongoose, scopedFields } = require('./_omnichannelScope');
const schema = new mongoose.Schema({
  ...scopedFields(),
  status: { type: String, enum: ['active', 'resetting', 'expired'], default: 'active' },
  seedVersion: { type: String, default: '1' },
  seedMetadata: { type: Object, default: {} },
  resetCount: { type: Number, default: 0 },
  lastResetAt: { type: Date, default: null },
  expiresAt: { type: Date, required: true, index: { expires: 0 } }
}, { timestamps: true });
schema.index({ userId: 1, status: 1 });
module.exports = mongoose.model('DemoWorkspace', schema);
