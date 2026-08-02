/**
 * @fileoverview Fundação omnichannel do LeadHunter: módulo src/models/AgentSession.
 *
 * Responsabilidade isolada para conversas, integrações, agente SDR,
 * segurança ou validação deste domínio.
 * @module src/models/AgentSession
 */

const { mongoose, scopedFields } = require('./_omnichannelScope');
const schema = new mongoose.Schema({
  ...scopedFields(),
  configurationId: { type: mongoose.Schema.Types.ObjectId, ref: 'AgentConfiguration', required: true, index: true },
  conversationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', default: null, index: true },
  mode: { type: String, enum: ['production', 'playground', 'demo'], required: true, index: true },
  status: { type: String, enum: ['active', 'completed', 'failed', 'transferred'], default: 'active' },
  customerProfile: { type: Object, default: {} },
  turns: { type: [Object], default: [] },
  totalInputTokens: { type: Number, default: 0 },
  totalOutputTokens: { type: Number, default: 0 },
  estimatedCost: { type: Number, default: 0 },
  startedAt: { type: Date, default: Date.now },
  endedAt: { type: Date, default: null },
  correlationId: { type: String, required: true, index: true }
}, { timestamps: true });
module.exports = mongoose.model('AgentSession', schema);
