const { CommercialIntelligenceEngine } = require('../intelligence/commercialIntelligenceEngine');
const { buildAutonomousCommandCenter } = require('../../services/autonomousCommercialService');
const { getProviderSnapshot } = require('../ai/providerManager');
const { listTemplates } = require('../prompts/promptManager');

class SalesOsCore {
  constructor() {
    this.intelligence = new CommercialIntelligenceEngine();
  }

  buildSnapshot({ leads = [], tasks = [], now = new Date() } = {}) {
    return {
      version: '23.1.0',
      generatedAt: now.toISOString(),
      commandCenter: buildAutonomousCommandCenter(leads, tasks, now),
      intelligence: this.intelligence.buildPortfolio(leads, tasks, now),
      ai: getProviderSnapshot(),
      prompts: listTemplates()
    };
  }
}

module.exports = { SalesOsCore };
