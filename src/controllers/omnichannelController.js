/**
 * @fileoverview Fundação omnichannel do LeadHunter: módulo src/controllers/omnichannelController.
 *
 * Responsabilidade isolada para conversas, integrações, agente SDR,
 * segurança ou validação deste domínio.
 * @module src/controllers/omnichannelController
 */

const AgentConfiguration = require('../models/AgentConfiguration');
const { compileAgentPrompt } = require('../domain/omnichannel/promptCompiler');
const { runPlayground } = require('../services/agentSdrService');
const { providerRegistry } = require('../integrations/providerRegistry');

function scope(req) {
  return { userId: req.user.sub, organizationId: req.currentUser?.organizationId || null };
}

async function listProviders(_req, res) {
  res.json({ providers: providerRegistry.list() });
}

async function listAgentConfigurations(req, res) {
  const items = await AgentConfiguration.find(scope(req)).select('-compiledPrompt').sort({ updatedAt: -1 }).lean();
  res.json({ items });
}

async function createAgentConfiguration(req, res) {
  const input = req.body || {};
  const config = await AgentConfiguration.create({
    ...scope(req),
    ...input,
    status: 'draft',
    active: false,
    compiledPrompt: compileAgentPrompt(input)
  });
  res.status(201).json({ item: config.toObject() });
}

async function updateAgentConfiguration(req, res) {
  const input = req.body || {};
  const item = await AgentConfiguration.findOneAndUpdate(
    { _id: req.params.id, ...scope(req), status: { $ne: 'archived' } },
    { $set: { ...input, compiledPrompt: compileAgentPrompt(input) } },
    { new: true, runValidators: true }
  ).select('-compiledPrompt').lean();
  if (!item) return res.status(404).json({ error: 'Configuração do agente não encontrada.' });
  return res.json({ item });
}

async function previewAgentPrompt(req, res) {
  const item = await AgentConfiguration.findOne({ _id: req.params.id, ...scope(req) }).lean();
  if (!item) return res.status(404).json({ error: 'Configuração do agente não encontrada.' });
  return res.json({ prompt: compileAgentPrompt(item) });
}

async function playground(req, res) {
  const item = await AgentConfiguration.findOne({ _id: req.params.id, ...scope(req) }).lean();
  if (!item) return res.status(404).json({ error: 'Configuração do agente não encontrada.' });
  const result = await runPlayground({
    configuration: item,
    message: String(req.body?.message || '').slice(0, 4000),
    customerProfile: req.body?.customerProfile || {},
    providerId: req.body?.useExternalProvider === true ? item.provider : 'demo'
  });
  return res.json(result);
}

module.exports = {
  listProviders,
  listAgentConfigurations,
  createAgentConfiguration,
  updateAgentConfiguration,
  previewAgentPrompt,
  playground
};
