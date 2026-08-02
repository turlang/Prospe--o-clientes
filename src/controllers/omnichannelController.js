/**
 * @fileoverview Controllers HTTP do domínio omnichannel e agente SDR.
 *
 * Os handlers apenas traduzem requisições e respostas. Regras de persistência,
 * mensageria e segurança permanecem nas camadas de serviço e repositório.
 *
 * @module src/controllers/omnichannelController
 */

const AgentConfiguration = require('../models/AgentConfiguration');
const { compileAgentPrompt } = require('../domain/omnichannel/promptCompiler');
const { runPlayground } = require('../services/agentSdrService');
const conversationService = require('../services/conversationService');
const { providerRegistry } = require('../integrations/providerRegistry');

function scope(req) {
  return {
    userId: req.user.sub,
    organizationId: req.currentUser?.organizationId || null
  };
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

async function listConversationLeads(req, res) {
  const items = await conversationService.listLeadOptions(scope(req), req.query.q);
  res.json({ items });
}

async function listConversations(req, res) {
  res.json(await conversationService.listConversations(scope(req), req.query));
}

async function getConversationSummary(req, res) {
  res.json(await conversationService.getSummary(scope(req)));
}

async function createConversation(req, res) {
  const result = await conversationService.createConversation(scope(req), req.body || {});
  res.status(result.created ? 201 : 200).json(result);
}

async function getConversation(req, res) {
  res.json(await conversationService.getConversation(scope(req), req.params.id));
}

async function sendConversationMessage(req, res) {
  const result = await conversationService.sendMessage(
    scope(req),
    req.params.id,
    req.body || {},
    { userId: req.user.sub }
  );
  res.status(201).json(result);
}

async function simulateInboundMessage(req, res) {
  const result = await conversationService.simulateInboundMessage(
    scope(req),
    req.params.id,
    req.body || {}
  );
  res.status(201).json(result);
}

async function updateConversation(req, res) {
  const item = await conversationService.updateConversation(
    scope(req),
    req.params.id,
    req.body || {},
    { userId: req.user.sub }
  );
  res.json({ item });
}

async function markConversationRead(req, res) {
  const item = await conversationService.markConversationRead(scope(req), req.params.id);
  res.json({ item });
}

async function addConversationNote(req, res) {
  const item = await conversationService.addInternalNote(
    scope(req),
    req.params.id,
    req.body || {},
    { userId: req.user.sub }
  );
  res.status(201).json({ item });
}

module.exports = {
  scope,
  listProviders,
  listAgentConfigurations,
  createAgentConfiguration,
  updateAgentConfiguration,
  previewAgentPrompt,
  playground,
  listConversationLeads,
  listConversations,
  getConversationSummary,
  createConversation,
  getConversation,
  sendConversationMessage,
  simulateInboundMessage,
  updateConversation,
  markConversationRead,
  addConversationNote
};
