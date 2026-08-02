/**
 * @fileoverview Fundação omnichannel do LeadHunter: módulo src/integrations/providerRegistry.
 *
 * Responsabilidade isolada para conversas, integrações, agente SDR,
 * segurança ou validação deste domínio.
 * @module src/integrations/providerRegistry
 */

const DemoAiProvider = require('./ai/DemoAiProvider');
const DemoMessagingProvider = require('./messaging/DemoMessagingProvider');

class ProviderRegistry {
  constructor() {
    this.ai = new Map();
    this.messaging = new Map();
  }

  registerAi(provider) { this.ai.set(provider.id, provider); return this; }
  registerMessaging(provider) { this.messaging.set(provider.id, provider); return this; }

  getAi(id) {
    const provider = this.ai.get(String(id || ''));
    if (!provider) throw Object.assign(new Error('Provedor de IA não suportado.'), { statusCode: 400, code: 'AI_PROVIDER_UNSUPPORTED' });
    return provider;
  }

  getMessaging(id) {
    const provider = this.messaging.get(String(id || ''));
    if (!provider) throw Object.assign(new Error('Provedor de mensageria não suportado.'), { statusCode: 400, code: 'MESSAGING_PROVIDER_UNSUPPORTED' });
    return provider;
  }

  list() {
    return { ai: [...this.ai.keys()], messaging: [...this.messaging.keys()] };
  }
}

const providerRegistry = new ProviderRegistry()
  .registerAi(new DemoAiProvider())
  .registerMessaging(new DemoMessagingProvider());

module.exports = { ProviderRegistry, providerRegistry };
