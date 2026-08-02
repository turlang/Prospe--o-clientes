/**
 * @fileoverview Fundação omnichannel do LeadHunter: módulo src/models/LeadQualification.
 *
 * Responsabilidade isolada para conversas, integrações, agente SDR,
 * segurança ou validação deste domínio.
 * @module src/models/LeadQualification
 */

const { mongoose, scopedFields } = require('./_omnichannelScope');
const schema = new mongoose.Schema({
  ...scopedFields(),
  leadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead', required: true, index: true },
  conversationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', default: null, index: true },
  sessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'AgentSession', default: null },
  intent: { type: String, default: 'unknown' },
  interestLevel: { type: String, enum: ['low', 'medium', 'high'], default: 'low' },
  estimatedBudget: { type: String, default: '' },
  urgency: { type: String, enum: ['low', 'medium', 'high'], default: 'low' },
  needSummary: { type: String, default: '' },
  objections: { type: [String], default: [] },
  missingInformation: { type: [String], default: [] },
  recommendedNextAction: { type: String, default: '' },
  shouldTransferToHuman: { type: Boolean, default: false },
  shouldCreateFollowUp: { type: Boolean, default: false },
  shouldRequestProposal: { type: Boolean, default: false },
  suggestedPipelineStage: { type: String, default: '' },
  qualificationScore: { type: Number, min: 0, max: 100, default: 0 },
  validated: { type: Boolean, default: false },
  validatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  validatedAt: { type: Date, default: null }
}, { timestamps: true });
schema.index({ userId: 1, leadId: 1, createdAt: -1 });
module.exports = mongoose.model('LeadQualification', schema);
