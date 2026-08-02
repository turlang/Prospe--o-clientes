/**
 * @fileoverview Fundação omnichannel do LeadHunter: módulo src/models/FollowUpPolicy.
 *
 * Responsabilidade isolada para conversas, integrações, agente SDR,
 * segurança ou validação deste domínio.
 * @module src/models/FollowUpPolicy
 */

const { mongoose, scopedFields } = require('./_omnichannelScope');
const schema = new mongoose.Schema({
  ...scopedFields(),
  name: { type: String, required: true, trim: true },
  pipelineId: { type: String, default: '' },
  pipelineStage: { type: String, required: true, index: true },
  enabled: { type: Boolean, default: true },
  mode: { type: String, enum: ['suggest', 'approval_required', 'automatic'], default: 'suggest' },
  maxAttempts: { type: Number, min: 1, max: 20, default: 3 },
  stopOnResponse: { type: Boolean, default: true },
  stopOnClosedLead: { type: Boolean, default: true },
  businessHours: { type: Object, default: {} },
  steps: { type: [Object], default: [] }
}, { timestamps: true });
schema.index({ userId: 1, pipelineId: 1, pipelineStage: 1, name: 1 }, { unique: true });
module.exports = mongoose.model('FollowUpPolicy', schema);
