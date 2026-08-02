/**
 * @fileoverview Fundação omnichannel do LeadHunter: módulo src/integrations/messaging/DemoMessagingProvider.
 *
 * Responsabilidade isolada para conversas, integrações, agente SDR,
 * segurança ou validação deste domínio.
 * @module src/integrations/messaging/DemoMessagingProvider
 */

const crypto = require('node:crypto');
const MessagingProvider = require('../contracts/MessagingProvider');
const { normalizePhone } = require('../../domain/omnichannel/phone');

class DemoMessagingProvider extends MessagingProvider {
  constructor() { super('demo'); }

  async testConnection() { return { ok: true, status: 'demo', message: 'Canal demonstrativo ativo; nenhuma mensagem real será enviada.' }; }
  async validateWebhook() { return false; }

  async sendMessage(input = {}) {
    return {
      ok: true,
      demo: true,
      externalMessageId: `demo_${crypto.randomUUID()}`,
      status: 'sent',
      to: normalizePhone(input.to),
      sentAt: new Date().toISOString()
    };
  }

  async processWebhook(payload = {}) {
    return {
      externalMessageId: String(payload.externalMessageId || `demo_${crypto.randomUUID()}`),
      from: normalizePhone(payload.from),
      to: normalizePhone(payload.to),
      text: String(payload.text || ''),
      channel: 'demo',
      timestamp: payload.timestamp ? new Date(payload.timestamp) : new Date(),
      rawMetadata: { demo: true }
    };
  }
}

module.exports = DemoMessagingProvider;
