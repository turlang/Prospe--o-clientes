const {
  buildCommercialIntelligence,
  normalizeLeadIntelligence,
  buildNextBestAction,
  scoreDynamicPriority
} = require('../../services/commercialIntelligenceService');

class CommercialIntelligenceEngine {
  buildPortfolio(leads = [], tasks = [], now = new Date()) {
    return buildCommercialIntelligence(leads, tasks, now);
  }

  analyzeLead(lead = {}, tasks = [], now = new Date()) {
    return normalizeLeadIntelligence(lead, tasks, now);
  }

  nextBestAction(lead = {}, tasks = [], now = new Date()) {
    return buildNextBestAction(lead, tasks, now);
  }

  scoreLead(lead = {}, tasks = [], now = new Date()) {
    return scoreDynamicPriority(lead, tasks, now);
  }
}

module.exports = { CommercialIntelligenceEngine };
