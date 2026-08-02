/**
 * @fileoverview Fundação omnichannel do LeadHunter: módulo src/integrations/contracts/MessagingProvider.
 *
 * Responsabilidade isolada para conversas, integrações, agente SDR,
 * segurança ou validação deste domínio.
 * @module src/integrations/contracts/MessagingProvider
 */

/** Contrato base para provedores de mensageria. @module integrations/contracts/MessagingProvider */
class MessagingProvider {
  constructor(id) {
    if (!id) throw new TypeError('MessagingProvider exige um identificador.');
    this.id = id;
  }

  async sendMessage() { throw new Error(`sendMessage não implementado por ${this.id}.`); }
  async processWebhook() { throw new Error(`processWebhook não implementado por ${this.id}.`); }
  async validateWebhook() { throw new Error(`validateWebhook não implementado por ${this.id}.`); }
  async testConnection() { throw new Error(`testConnection não implementado por ${this.id}.`); }
}

module.exports = MessagingProvider;
