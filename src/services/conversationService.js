/**
 * @fileoverview Casos de uso da central de conversas omnichannel.
 *
 * A camada valida entradas, aplica guardrails de canal, registra atividades no
 * CRM e mantém o modo demonstrativo explicitamente separado de integrações
 * reais ainda não publicadas.
 *
 * @module src/services/conversationService
 */

const crypto = require('node:crypto');
const { normalizePhone } = require('../domain/omnichannel/phone');
const { CONVERSATION_STATUSES } = require('../domain/omnichannel/constants');
const { providerRegistry } = require('../integrations/providerRegistry');
const { hasMongoUri } = require('../infrastructure/database/mongoConnection');
const repository = require('../repositories/omnichannel/conversationRepository');

const SUPPORTED_CHANNELS = Object.freeze(['demo', 'whatsapp', 'email', 'instagram', 'webchat']);
const SUPPORTED_HANDLERS = Object.freeze(['ai', 'human', 'hybrid']);

function createHttpError(message, statusCode = 400, code = 'OMNICHANNEL_VALIDATION_ERROR') {
  return Object.assign(new Error(message), { statusCode, code });
}

function assertMongoAvailable() {
  if (!hasMongoUri()) {
    throw createHttpError(
      'A Central de Conversas requer MongoDB ativo. Configure MONGODB_URI antes de usar este módulo.',
      503,
      'OMNICHANNEL_DATABASE_REQUIRED'
    );
  }
}

function normalizeTags(value) {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.map(String).map((item) => item.trim()).filter(Boolean))].slice(0, 12);
}

function normalizeConversationInput(input = {}) {
  const channel = String(input.channel || 'demo').trim().toLowerCase();
  if (!SUPPORTED_CHANNELS.includes(channel)) {
    throw createHttpError('Canal de conversa não suportado.', 400, 'CHANNEL_UNSUPPORTED');
  }

  const leadId = String(input.leadId || '').trim();
  if (!leadId) throw createHttpError('Selecione um lead para iniciar a conversa.');

  const handledBy = String(input.handledBy || 'hybrid').trim().toLowerCase();
  if (!SUPPORTED_HANDLERS.includes(handledBy)) {
    throw createHttpError('Modo de atendimento inválido.');
  }

  const initialMessage = String(input.initialMessage || '').trim().slice(0, 4000);
  const phone = normalizePhone(input.phone || '');

  return {
    leadId,
    channel,
    handledBy,
    normalizedPhone: phone,
    tags: normalizeTags(input.tags),
    initialMessage,
    externalConversationId: String(input.externalConversationId || '').trim().slice(0, 240),
    correlationId: crypto.randomUUID()
  };
}

function normalizePagination(query = {}) {
  return {
    page: Math.max(1, Number(query.page || 1)),
    limit: Math.min(50, Math.max(1, Number(query.limit || 30))),
    status: CONVERSATION_STATUSES.includes(String(query.status || '')) ? String(query.status) : '',
    channel: SUPPORTED_CHANNELS.includes(String(query.channel || '')) ? String(query.channel) : '',
    query: String(query.q || '').trim().slice(0, 120),
    unreadOnly: String(query.unreadOnly || '') === 'true'
  };
}

function normalizeMessageInput(input = {}) {
  const text = String(input.text || '').trim().slice(0, 4000);
  if (!text) throw createHttpError('Digite uma mensagem antes de enviar.');

  return {
    text,
    providerId: String(input.providerId || 'demo').trim().toLowerCase(),
    correlationId: crypto.randomUUID()
  };
}

function normalizeConversationUpdate(input = {}) {
  const updates = {};

  if (input.status !== undefined) {
    const status = String(input.status || '').trim();
    if (!CONVERSATION_STATUSES.includes(status)) {
      throw createHttpError('Status de conversa inválido.');
    }
    updates.status = status;
  }

  if (input.handledBy !== undefined) {
    const handledBy = String(input.handledBy || '').trim();
    if (!SUPPORTED_HANDLERS.includes(handledBy)) {
      throw createHttpError('Responsável pelo atendimento inválido.');
    }
    updates.handledBy = handledBy;
  }

  if (input.assignedUserId !== undefined) {
    updates.assignedUserId = input.assignedUserId ? String(input.assignedUserId) : null;
  }

  if (input.tags !== undefined) updates.tags = normalizeTags(input.tags);

  if (!Object.keys(updates).length) {
    throw createHttpError('Nenhuma alteração válida foi informada.');
  }

  return updates;
}

function buildMessageRecord({ direction, authorType, text, providerResult = {}, correlationId }) {
  const now = new Date();
  const inbound = direction === 'inbound';
  return {
    direction,
    authorType,
    text,
    status: inbound ? 'received' : String(providerResult.status || 'sent'),
    externalMessageId: String(providerResult.externalMessageId || ''),
    sentAt: inbound ? null : providerResult.sentAt ? new Date(providerResult.sentAt) : now,
    receivedAt: inbound ? now : null,
    metadata: {
      demo: providerResult.demo === true,
      providerId: String(providerResult.providerId || 'demo')
    },
    correlationId
  };
}

function buildActivityRecord({ type, source, description, correlationId, responsibleUserId = null, metadata = {} }) {
  return {
    type,
    source,
    description: String(description || '').slice(0, 2000),
    correlationId,
    responsibleUserId,
    metadata
  };
}

async function listLeadOptions(scope, query = '') {
  assertMongoAvailable();
  return repository.listLeadOptions(scope, query);
}

async function listConversations(scope, query = {}) {
  assertMongoAvailable();
  return repository.listConversations(scope, normalizePagination(query));
}

async function getConversation(scope, conversationId) {
  assertMongoAvailable();
  const conversation = await repository.findConversation(scope, conversationId);
  if (!conversation) throw createHttpError('Conversa não encontrada.', 404, 'CONVERSATION_NOT_FOUND');

  const [messages, activities] = await Promise.all([
    repository.listMessages(scope, conversationId),
    repository.listActivities(scope, conversationId)
  ]);

  return { conversation, messages, activities };
}

async function createConversation(scope, input = {}) {
  assertMongoAvailable();
  const normalized = normalizeConversationInput(input);
  const existing = await repository.findActiveConversation(scope, normalized.leadId, normalized.channel);

  if (existing) {
    return {
      created: false,
      conversation: existing,
      message: 'Já existe uma conversa ativa para este lead e canal.'
    };
  }

  const conversation = await repository.createConversation(scope, normalized);
  if (!conversation) throw createHttpError('Lead não encontrado ou não pertence à conta.', 404, 'LEAD_NOT_FOUND');

  if (normalized.initialMessage) {
    const record = buildMessageRecord({
      direction: 'inbound',
      authorType: 'lead',
      text: normalized.initialMessage,
      providerResult: { demo: normalized.channel === 'demo', providerId: normalized.channel },
      correlationId: normalized.correlationId
    });
    await repository.appendMessage(scope, conversation, record);
    await repository.createActivity(scope, conversation, buildActivityRecord({
      type: 'message_received',
      source: normalized.channel === 'demo' ? 'manual' : 'integration',
      description: `Mensagem recebida na conversa de ${conversation.leadId?.name || 'lead'}.`,
      correlationId: normalized.correlationId,
      metadata: { channel: normalized.channel, demo: normalized.channel === 'demo' }
    }));
  }

  return {
    created: true,
    conversation: await repository.findConversation(scope, conversation._id)
  };
}

async function sendMessage(scope, conversationId, input = {}, actor = {}) {
  assertMongoAvailable();
  const normalized = normalizeMessageInput(input);
  const conversation = await repository.findConversation(scope, conversationId);
  if (!conversation) throw createHttpError('Conversa não encontrada.', 404, 'CONVERSATION_NOT_FOUND');
  if (conversation.status === 'archived') {
    throw createHttpError('Conversa arquivada não aceita novas mensagens.', 409, 'CONVERSATION_ARCHIVED');
  }
  if (!conversation.normalizedPhone && conversation.channel !== 'email' && conversation.channel !== 'webchat') {
    throw createHttpError('O lead não possui telefone válido para este canal.', 400, 'PHONE_REQUIRED');
  }

  const provider = providerRegistry.getMessaging(normalized.providerId);
  const providerResult = await provider.sendMessage({
    to: conversation.normalizedPhone,
    text: normalized.text,
    conversationId: conversation._id,
    correlationId: normalized.correlationId
  });
  providerResult.providerId = normalized.providerId;

  const message = await repository.appendMessage(scope, conversation, buildMessageRecord({
    direction: 'outbound',
    authorType: 'human',
    text: normalized.text,
    providerResult,
    correlationId: normalized.correlationId
  }));

  await repository.createActivity(scope, conversation, buildActivityRecord({
    type: 'message_answered_by_human',
    source: 'manual',
    description: `Mensagem enviada manualmente para ${conversation.leadId?.name || 'lead'}.`,
    correlationId: normalized.correlationId,
    responsibleUserId: actor.userId || null,
    metadata: {
      providerId: normalized.providerId,
      demo: providerResult.demo === true,
      messageId: message._id
    }
  }));

  return {
    message,
    delivery: providerResult,
    conversation: await repository.findConversation(scope, conversationId)
  };
}

async function simulateInboundMessage(scope, conversationId, input = {}) {
  assertMongoAvailable();
  const text = String(input.text || '').trim().slice(0, 4000);
  if (!text) throw createHttpError('Digite a mensagem simulada.');

  const conversation = await repository.findConversation(scope, conversationId);
  if (!conversation) throw createHttpError('Conversa não encontrada.', 404, 'CONVERSATION_NOT_FOUND');
  if (conversation.channel !== 'demo') {
    throw createHttpError('A simulação de entrada está disponível somente no canal demonstrativo.', 409, 'DEMO_CHANNEL_REQUIRED');
  }

  const correlationId = crypto.randomUUID();
  const message = await repository.appendMessage(scope, conversation, buildMessageRecord({
    direction: 'inbound',
    authorType: 'lead',
    text,
    providerResult: { demo: true, providerId: 'demo' },
    correlationId
  }));

  await repository.createActivity(scope, conversation, buildActivityRecord({
    type: 'message_received',
    source: 'manual',
    description: `Mensagem demonstrativa recebida de ${conversation.leadId?.name || 'lead'}.`,
    correlationId,
    metadata: { demo: true, messageId: message._id }
  }));

  return {
    message,
    conversation: await repository.findConversation(scope, conversationId)
  };
}

async function updateConversation(scope, conversationId, input = {}, actor = {}) {
  assertMongoAvailable();
  const previous = await repository.findConversation(scope, conversationId);
  if (!previous) throw createHttpError('Conversa não encontrada.', 404, 'CONVERSATION_NOT_FOUND');

  const updates = normalizeConversationUpdate(input);
  const updated = await repository.updateConversation(scope, conversationId, updates);
  if (!updated) throw createHttpError('Conversa não encontrada.', 404, 'CONVERSATION_NOT_FOUND');

  if (updates.handledBy === 'human' && previous.handledBy !== 'human') {
    const correlationId = crypto.randomUUID();
    await repository.createActivity(scope, previous, buildActivityRecord({
      type: 'conversation_transferred',
      source: 'manual',
      description: `Conversa transferida para atendimento humano.`,
      correlationId,
      responsibleUserId: actor.userId || null,
      metadata: { previousHandler: previous.handledBy, handler: 'human' }
    }));
  }

  return updated;
}

async function markConversationRead(scope, conversationId) {
  assertMongoAvailable();
  const conversation = await repository.markConversationRead(scope, conversationId);
  if (!conversation) throw createHttpError('Conversa não encontrada.', 404, 'CONVERSATION_NOT_FOUND');
  return conversation;
}

async function addInternalNote(scope, conversationId, input = {}, actor = {}) {
  assertMongoAvailable();
  const text = String(input.text || '').trim().slice(0, 1200);
  if (!text) throw createHttpError('Escreva uma nota interna antes de salvar.');

  const conversation = await repository.addInternalNote(scope, conversationId, {
    text,
    authorUserId: actor.userId || ''
  });
  if (!conversation) throw createHttpError('Conversa não encontrada.', 404, 'CONVERSATION_NOT_FOUND');
  return conversation;
}

async function getSummary(scope) {
  assertMongoAvailable();
  return repository.summarizeConversations(scope);
}

module.exports = {
  SUPPORTED_CHANNELS,
  createHttpError,
  normalizeTags,
  normalizeConversationInput,
  normalizePagination,
  normalizeMessageInput,
  normalizeConversationUpdate,
  buildMessageRecord,
  buildActivityRecord,
  listLeadOptions,
  listConversations,
  getConversation,
  createConversation,
  sendMessage,
  simulateInboundMessage,
  updateConversation,
  markConversationRead,
  addInternalNote,
  getSummary
};
