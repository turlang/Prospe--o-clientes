/**
 * @fileoverview Fundação omnichannel do LeadHunter: módulo src/models/AgentConfigurationVersion.
 *
 * Responsabilidade isolada para conversas, integrações, agente SDR,
 * segurança ou validação deste domínio.
 * @module src/models/AgentConfigurationVersion
 */

const { mongoose, scopedFields } = require('./_omnichannelScope');
const schema = new mongoose.Schema({
  ...scopedFields(),
  configurationId: { type: mongoose.Schema.Types.ObjectId, ref: 'AgentConfiguration', required: true, index: true },
  version: { type: Number, required: true },
  snapshot: { type: Object, required: true },
  changeReason: { type: String, default: '' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });
schema.index({ userId: 1, configurationId: 1, version: 1 }, { unique: true });
module.exports = mongoose.model('AgentConfigurationVersion', schema);
