/**
 * @fileoverview Fundação omnichannel do LeadHunter: módulo src/models/AgentEvaluation.
 *
 * Responsabilidade isolada para conversas, integrações, agente SDR,
 * segurança ou validação deste domínio.
 * @module src/models/AgentEvaluation
 */

const { mongoose, scopedFields } = require('./_omnichannelScope');
const schema = new mongoose.Schema({
  ...scopedFields(),
  sessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'AgentSession', required: true, index: true },
  turnIndex: { type: Number, required: true },
  passed: { type: Boolean, required: true },
  hallucinationDetected: { type: Boolean, default: false },
  inventedPrice: { type: Boolean, default: false },
  unauthorizedPromise: { type: Boolean, default: false },
  outOfScope: { type: Boolean, default: false },
  promptLeakage: { type: Boolean, default: false },
  crossTenantLeakage: { type: Boolean, default: false },
  reasons: { type: [String], default: [] },
  metadata: { type: Object, default: {} }
}, { timestamps: true });
module.exports = mongoose.model('AgentEvaluation', schema);
