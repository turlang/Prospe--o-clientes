const {
  AI_PROVIDERS,
  getAiProviderStatus,
  generateAiJsonContent
} = require('../../services/aiApproachService');

function listProviders() {
  const status = getAiProviderStatus();
  return [
    ...Object.values(AI_PROVIDERS).map((provider) => ({
      id: provider.id,
      label: provider.label,
      configured: Boolean(process.env[provider.keyEnv]),
      active: status.provider === provider.id,
      model: process.env[provider.modelEnv] || provider.defaultModel
    })),
    {
      id: 'local',
      label: 'Motor Local',
      configured: true,
      active: status.provider === 'local',
      model: 'local'
    }
  ];
}

async function generateStructured({ systemContent, prompt, maxTokens = 900 } = {}) {
  if (!prompt) throw new Error('Prompt obrigatório.');
  return generateAiJsonContent({ systemContent, prompt, maxTokens });
}

function getProviderSnapshot() {
  return {
    status: getAiProviderStatus(),
    providers: listProviders()
  };
}

module.exports = { listProviders, generateStructured, getProviderSnapshot };
