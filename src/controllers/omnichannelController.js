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
const outboundService = require('../services/outboundService');
const { ingestMetaWebhook } = require('../services/whatsappWebhookService');
const { providerRegistry } = require('../integrations/providerRegistry');

const AGENT_MUTABLE_FIELDS = Object.freeze([
  'name',
  'tone',
  'businessName',
  'products',
  'targetAudience',
  'qualificationCriteria',
  'frequentObjections',
  'transferRules',
  'mode',
  'provider',
  'model',
  'temperature',
  'maxTokens',
  'status',
  'active'
]);

function scope(req) {
  return {
    userId: req.user.sub,
    organizationId: req.currentUser?.organizationId || null
  };
}

function pickAgentInput(input = {}) {
  return AGENT_MUTABLE_FIELDS.reduce((result, field) => {
    if (Object.prototype.hasOwnProperty.call(input, field)) result[field] = input[field];
    return result;
  }, {});
}

async function verifyWhatsAppWebhook(req, res) {
  const provider = providerRegistry.getMessaging('meta');
  const valid = provider.validateWebhook({
    mode: req.query['hub.mode'],
    verifyToken: req.query['hub.verify_token']
  });
  if (!valid) return res.status(403).send('forbidden');
  return res.status(200).send(String(req.query['hub.challenge'] || ''));
}

async function receiveWhatsAppWebhook(req, res) {
  const provider = providerRegistry.getMessaging('meta');
  const appSecretConfigured = Boolean(String(process.env.WHATSAPP_APP_SECRET || '').trim());
  const signatureValid = appSecretConfigured
    ? provider.validateWebhook({ rawBody: req.rawBody, signature: req.get('x-hub-signature-256') })
    : false;

  if (appSecretConfigured && !signatureValid) {
    return res.status(401).json({ error: 'Assinatura do webhook inválida.' });
  }

  const result = await ingestMetaWebhook(req.body || {}, { signatureValid });
  return res.status(200).json({ received: true, ...result });
}

async function listProviders(_req, res) {
  const providers = providerRegistry.list();
  const messagingStatus = {};
  for (const id of providers.messaging) {
    messagingStatus[id] = await providerRegistry.getMessaging(id).testConnection().catch(() => ({ ok: false, status: 'error' }));
  }
  res.json({ providers, messagingStatus });
}

async function listAgentConfigurations(req, res) {
  const items = await AgentConfiguration.find(scope(req)).select('-compiledPrompt').sort({ updatedAt: -1 }).lean();
  res.json({ items });
}

async function createAgentConfiguration(req, res) {
  const input = pickAgentInput(req.body || {});
  const config = await AgentConfiguration.create({
    ...input,
    ...scope(req),
    status: 'draft',
    active: false,
    compiledPrompt: compileAgentPrompt(input)
  });
  res.status(201).json({ item: config.toObject() });
}

async function updateAgentConfiguration(req, res) {
  const input = pickAgentInput(req.body || {});
  const existing = await AgentConfiguration.findOne({
    _id: req.params.id,
    ...scope(req),
    status: { $ne: 'archived' }
  }).lean();

  if (!existing) return res.status(404).json({ error: 'Configuração do agente não encontrada.' });

  const item = await AgentConfiguration.findOneAndUpdate(
    { _id: existing._id, ...scope(req), status: { $ne: 'archived' } },
    {
      $set: {
        ...input,
        compiledPrompt: compileAgentPrompt({ ...existing, ...input })
      }
    },
    { new: true, runValidators: true }
  ).select('-compiledPrompt').lean();

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

async function listOutboundJobs(req, res) {
  const items = await outboundService.listJobs(req.user.sub, req.query || {});
  res.json({ items });
}

async function getOutboundSummary(req, res) {
  res.json({ summary: await outboundService.getSummary(req.user.sub) });
}

async function approveOutboundJob(req, res) {
  const item = await outboundService.approveJob(req.user.sub, req.params.id);
  if (!item) return res.status(404).json({ error: 'Job pendente de revisão não encontrado.' });
  return res.json({ item });
}

async function cancelOutboundJob(req, res) {
  const item = await outboundService.cancelJob(req.user.sub, req.params.id);
  if (!item) return res.status(404).json({ error: 'Job outbound não encontrado ou não cancelável.' });
  return res.json({ item });
}

module.exports = {
  AGENT_MUTABLE_FIELDS,
  scope,
  pickAgentInput,
  verifyWhatsAppWebhook,
  receiveWhatsAppWebhook,
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
  addConversationNote,
  listOutboundJobs,
  getOutboundSummary,
  approveOutboundJob,
  cancelOutboundJob
};
