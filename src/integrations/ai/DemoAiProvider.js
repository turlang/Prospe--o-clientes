/**
 * @fileoverview Fundação omnichannel do LeadHunter: módulo src/integrations/ai/DemoAiProvider.
 *
 * Responsabilidade isolada para conversas, integrações, agente SDR,
 * segurança ou validação deste domínio.
 * @module src/integrations/ai/DemoAiProvider
 */

const AiProvider = require('../contracts/AiProvider');
const { normalizeQualification } = require('../../domain/omnichannel/qualification');

class DemoAiProvider extends AiProvider {
  constructor() { super('demo'); }

  async validateCredentials() { return { ok: true, status: 'demo' }; }
  async testConnection() { return { ok: true, status: 'demo', message: 'Provedor demonstrativo ativo.' }; }

  async generateResponse(input = {}) {
    const message = String(input.message || '').trim();
    const lower = message.toLowerCase();
    const transfer = /humano|pessoa|atendente|reclama|cancelar/.test(lower);
    const highInterest = /urgente|proposta|orçamento|contratar|fechar/.test(lower);
    const budget = message.match(/r\$\s*[\d.,]+/i)?.[0];

    const responseText = transfer
      ? 'Entendi. Vou encaminhar seu atendimento para uma pessoa da equipe com o contexto desta conversa.'
      : 'Obrigado pelas informações. Para orientar o próximo passo, preciso entender melhor seu objetivo, prazo e faixa de investimento.';

    return {
      provider: this.id,
      model: 'deterministic-demo-v1',
      responseText,
      usage: { inputTokens: 0, outputTokens: 0, estimatedCost: 0 },
      qualification: normalizeQualification({
        intent: highInterest ? 'commercial_opportunity' : 'initial_contact',
        interestLevel: highInterest ? 'high' : 'medium',
        estimatedBudget: budget,
        urgency: /urgente|hoje|rápido/.test(lower) ? 'high' : 'medium',
        needSummary: message.slice(0, 500),
        objections: /caro|preço|valor/.test(lower) ? ['Sensibilidade a preço'] : [],
        missingInformation: ['Prazo desejado', 'Autoridade de decisão'],
        recommendedNextAction: transfer ? 'Transferir para atendimento humano' : 'Coletar prazo e orçamento',
        shouldTransferToHuman: transfer,
        shouldCreateFollowUp: !transfer,
        shouldRequestProposal: highInterest,
        qualificationScore: highInterest ? 82 : 55
      })
    };
  }
}

module.exports = DemoAiProvider;
