/**
 * @fileoverview Fundação omnichannel do LeadHunter: módulo src/services/agentSdrService.
 *
 * Responsabilidade isolada para conversas, integrações, agente SDR,
 * segurança ou validação deste domínio.
 * @module src/services/agentSdrService
 */

const crypto = require('node:crypto');
const { providerRegistry } = require('../integrations/providerRegistry');
const { compileAgentPrompt } = require('../domain/omnichannel/promptCompiler');
const { normalizeQualification, detectUnsupportedClaims } = require('../domain/omnichannel/qualification');

async function runPlayground({ configuration, message, customerProfile = {}, providerId = 'demo' }) {
  if (!configuration) throw Object.assign(new Error('Configuração do agente não encontrada.'), { statusCode: 404 });
  const prompt = compileAgentPrompt(configuration);
  const provider = providerRegistry.getAi(providerId);
  const result = await provider.generateResponse({ prompt, message, customerProfile, configuration });
  const qualification = normalizeQualification(result.qualification);
  const unsupportedClaims = detectUnsupportedClaims(result.responseText, configuration.disclosableInformation || []);
  const evaluation = {
    passed: unsupportedClaims.length === 0,
    hallucinationDetected: unsupportedClaims.length > 0,
    inventedPrice: unsupportedClaims.some((item) => item.includes('preço|valor')),
    unauthorizedPromise: unsupportedClaims.some((item) => item.includes('garant')),
    outOfScope: false,
    promptLeakage: /prompt|instruções internas|system message/i.test(String(result.responseText || '')),
    crossTenantLeakage: false,
    reasons: unsupportedClaims
  };

  return {
    sessionId: `playground_${crypto.randomUUID()}`,
    prompt,
    responseText: result.responseText,
    qualification,
    evaluation,
    usage: result.usage || { inputTokens: 0, outputTokens: 0, estimatedCost: 0 },
    simulatedActivities: [
      qualification.shouldTransferToHuman ? 'conversation_transferred' : 'message_answered_by_ai',
      qualification.shouldCreateFollowUp ? 'follow_up_created' : null,
      qualification.shouldRequestProposal ? 'proposal_requested' : null
    ].filter(Boolean),
    productionDataChanged: false
  };
}

module.exports = { runPlayground };
