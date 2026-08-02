/**
 * @fileoverview Fundação omnichannel do LeadHunter: módulo src/domain/omnichannel/qualification.
 *
 * Responsabilidade isolada para conversas, integrações, agente SDR,
 * segurança ou validação deste domínio.
 * @module src/domain/omnichannel/qualification
 */

/** @module domain/omnichannel/qualification */

const LEVELS = new Set(['low', 'medium', 'high']);

function clampScore(value) {
  const score = Number(value);
  if (!Number.isFinite(score)) return 0;
  return Math.max(0, Math.min(100, Math.round(score)));
}

function normalizeQualification(input = {}) {
  const interestLevel = LEVELS.has(input.interestLevel) ? input.interestLevel : 'low';
  const urgency = LEVELS.has(input.urgency) ? input.urgency : undefined;
  return {
    intent: String(input.intent || 'unknown').trim().slice(0, 120),
    interestLevel,
    estimatedBudget: input.estimatedBudget ? String(input.estimatedBudget).trim().slice(0, 120) : undefined,
    urgency,
    needSummary: String(input.needSummary || '').trim().slice(0, 1200),
    objections: Array.isArray(input.objections) ? input.objections.map(String).map((v) => v.trim()).filter(Boolean).slice(0, 12) : [],
    missingInformation: Array.isArray(input.missingInformation) ? input.missingInformation.map(String).map((v) => v.trim()).filter(Boolean).slice(0, 12) : [],
    recommendedNextAction: String(input.recommendedNextAction || '').trim().slice(0, 500),
    shouldTransferToHuman: Boolean(input.shouldTransferToHuman),
    shouldCreateFollowUp: Boolean(input.shouldCreateFollowUp),
    shouldRequestProposal: Boolean(input.shouldRequestProposal),
    suggestedPipelineStage: input.suggestedPipelineStage ? String(input.suggestedPipelineStage).trim().slice(0, 80) : undefined,
    qualificationScore: clampScore(input.qualificationScore)
  };
}

function detectUnsupportedClaims(text, allowedFacts = []) {
  const normalized = String(text || '').toLowerCase();
  const allowed = allowedFacts.map((fact) => String(fact).toLowerCase());
  const patterns = [
    /garant(?:imos|ido|ia)\s+(?:resultado|vendas|lucro)/i,
    /(?:preço|valor)\s+(?:é|de)\s+r?\$?\s*\d/i,
    /desconto\s+(?:de\s+)?\d+%/i,
    /entrega\s+(?:em|dentro de)\s+\d+\s+dias?/i
  ];

  return patterns
    .filter((pattern) => pattern.test(normalized))
    .map((pattern) => pattern.source)
    .filter((match) => !allowed.some((fact) => fact && normalized.includes(fact)));
}

module.exports = { normalizeQualification, detectUnsupportedClaims, clampScore };
