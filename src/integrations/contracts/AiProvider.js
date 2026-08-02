/**
 * @fileoverview Fundação omnichannel do LeadHunter: módulo src/integrations/contracts/AiProvider.
 *
 * Responsabilidade isolada para conversas, integrações, agente SDR,
 * segurança ou validação deste domínio.
 * @module src/integrations/contracts/AiProvider
 */

/** Contrato base para provedores de IA. @module integrations/contracts/AiProvider */
class AiProvider {
  constructor(id) {
    if (!id) throw new TypeError('AiProvider exige um identificador.');
    this.id = id;
  }

  async generateResponse() { throw new Error(`generateResponse não implementado por ${this.id}.`); }
  async validateCredentials() { throw new Error(`validateCredentials não implementado por ${this.id}.`); }
  async testConnection() { throw new Error(`testConnection não implementado por ${this.id}.`); }
}

module.exports = AiProvider;
