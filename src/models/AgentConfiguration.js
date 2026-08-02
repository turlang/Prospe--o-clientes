/**
 * @fileoverview Fundação omnichannel do LeadHunter: módulo src/models/AgentConfiguration.
 *
 * Responsabilidade isolada para conversas, integrações, agente SDR,
 * segurança ou validação deste domínio.
 * @module src/models/AgentConfiguration
 */

const { mongoose, scopedFields } = require('./_omnichannelScope');
const { AGENT_MODES } = require('../domain/omnichannel/constants');
const schema = new mongoose.Schema({
  ...scopedFields(),
  name: { type: String, required: true, trim: true, maxlength: 120 },
  status: { type: String, enum: ['draft', 'published', 'archived'], default: 'draft', index: true },
  active: { type: Boolean, default: false, index: true },
  mode: { type: String, enum: AGENT_MODES, default: 'assistido' },
  version: { type: Number, default: 1, min: 1 },
  provider: { type: String, enum: ['demo', 'gemini', 'openai', 'groq'], default: 'demo' },
  model: { type: String, default: 'deterministic-demo-v1' },
  agentName: { type: String, default: 'Assistente comercial' },
  agentRole: { type: String, default: 'SDR' },
  companyName: { type: String, default: '' },
  companyDescription: { type: String, default: '' },
  products: { type: [String], default: [] },
  services: { type: [String], default: [] },
  targetAudience: { type: String, default: '' },
  idealCustomerProfile: { type: String, default: '' },
  servedRegions: { type: [String], default: [] },
  communicationTone: { type: String, default: 'consultivo' },
  formalityLevel: { type: String, default: 'equilibrada' },
  recommendedExpressions: { type: [String], default: [] },
  prohibitedExpressions: { type: [String], default: [] },
  differentiators: { type: [String], default: [] },
  priceRanges: { type: [Object], default: [] },
  disclosableInformation: { type: [String], default: [] },
  restrictedInformation: { type: [String], default: [] },
  qualificationCriteria: { type: [Object], default: [] },
  requiredQuestions: { type: [String], default: [] },
  objections: { type: [Object], default: [] },
  handoffCriteria: { type: [String], default: [] },
  businessHours: { type: Object, default: {} },
  outsideHoursMessage: { type: String, default: '' },
  openingMessage: { type: String, default: '' },
  closingMessage: { type: String, default: '' },
  followUpRules: { type: Object, default: {} },
  compiledPrompt: { type: String, default: '', select: false },
  publishedAt: { type: Date, default: null },
  publishedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }
}, { timestamps: true });
schema.index({ userId: 1, active: 1 });
module.exports = mongoose.model('AgentConfiguration', schema);
