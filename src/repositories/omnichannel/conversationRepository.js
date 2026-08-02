/**
 * @fileoverview Repositório MongoDB da central de conversas omnichannel.
 *
 * Todas as consultas aplicam o escopo do proprietário e nunca aceitam apenas
 * o identificador do recurso. A camada também normaliza leads populados para
 * impedir que detalhes internos do documento sejam enviados ao frontend.
 *
 * @module src/repositories/omnichannel/conversationRepository
 */

const crypto = require('node:crypto');
const Conversation = require('../../models/Conversation');
const Message = require('../../models/Message');
const CrmActivity = require('../../models/CrmActivity');
const Lead = require('../../models/Lead');

function buildScopeFilter(scope = {}) {
  return {
    userId: scope.userId,
    organizationId: scope.organizationId || null
  };
}

function escapeRegExp(value) {
  return String(value || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function mapLead(lead) {
  if (!lead) return null;
  const data = lead.data || {};
  return {
    id: String(lead._id || ''),
    leadKey: String(lead.leadKey || data.placeId || data.nome || ''),
    name: String(data.nome || data.name || 'Lead sem nome'),
    phone: String(data.whatsapp || data.telefone || data.phone || ''),
    email: String(data.email || ''),
    segment: String(data.segmentoComercial || data.segmentoBuscado || data.tipo || ''),
    status: String(data.status || 'NOVO'),
    score: Number(data.score || 0),
    address: String(data.endereco || data.address || ''),
    tags: Array.isArray(data.tags) ? data.tags.map(String) : []
  };
}

function mapConversation(document) {
  if (!document) return null;
  const item = typeof document.toObject === 'function' ? document.toObject() : document;
  return {
    ...item,
    _id: String(item._id),
    leadId: item.leadId && typeof item.leadId === 'object'
      ? mapLead(item.leadId)
      : String(item.leadId || ''),
    assignedUserId: item.assignedUserId ? String(item.assignedUserId) : null,
    integrationId: item.integrationId ? String(item.integrationId) : null
  };
}

async function listLeadOptions(scope, query = '') {
  const filter = { userId: scope.userId };
  const term = String(query || '').trim();

  if (term) {
    const expression = new RegExp(escapeRegExp(term), 'i');
    filter.$or = [
      { leadKey: expression },
      { 'data.nome': expression },
      { 'data.telefone': expression },
      { 'data.whatsapp': expression },
      { 'data.email': expression },
      { 'data.segmentoComercial': expression }
    ];
  }

  const leads = await Lead.find(filter)
    .select('leadKey data updatedAt')
    .sort({ 'data.score': -1, updatedAt: -1 })
    .limit(60)
    .lean();

  return leads.map(mapLead);
}

async function listConversations(scope, options = {}) {
  const page = Math.max(1, Number(options.page || 1));
  const limit = Math.min(50, Math.max(1, Number(options.limit || 30)));
  const filter = buildScopeFilter(scope);

  if (options.status) filter.status = String(options.status);
  if (options.channel) filter.channel = String(options.channel);
  if (options.unreadOnly === true) filter.unreadCount = { $gt: 0 };

  const term = String(options.query || '').trim();
  if (term) {
    const expression = new RegExp(escapeRegExp(term), 'i');
    const leadIds = await Lead.find({
      userId: scope.userId,
      $or: [
        { leadKey: expression },
        { 'data.nome': expression },
        { 'data.telefone': expression },
        { 'data.whatsapp': expression },
        { 'data.email': expression }
      ]
    }).distinct('_id');

    filter.$or = [
      { normalizedPhone: expression },
      { lastMessagePreview: expression },
      { tags: expression },
      { leadId: { $in: leadIds } }
    ];
  }

  const [items, total] = await Promise.all([
    Conversation.find(filter)
      .populate('leadId', 'leadKey data updatedAt')
      .sort({ lastMessageAt: -1, updatedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Conversation.countDocuments(filter)
  ]);

  return {
    items: items.map(mapConversation),
    pagination: {
      page,
      limit,
      total,
      pages: Math.max(1, Math.ceil(total / limit))
    }
  };
}

async function findConversation(scope, conversationId) {
  const item = await Conversation.findOne({
    _id: conversationId,
    ...buildScopeFilter(scope)
  }).populate('leadId', 'leadKey data updatedAt').lean();

  return mapConversation(item);
}

async function findActiveConversation(scope, leadId, channel) {
  const item = await Conversation.findOne({
    ...buildScopeFilter(scope),
    leadId,
    channel,
    status: { $in: ['open', 'waiting_lead', 'waiting_human'] }
  }).populate('leadId', 'leadKey data updatedAt').lean();

  return mapConversation(item);
}

async function createConversation(scope, input) {
  const lead = await Lead.findOne({ _id: input.leadId, userId: scope.userId }).lean();
  if (!lead) return null;

  const payload = {
    ...buildScopeFilter(scope),
    leadId: lead._id,
    integrationId: input.integrationId || null,
    channel: input.channel,
    normalizedPhone: input.normalizedPhone || '',
    status: input.status || 'open',
    assignedUserId: input.assignedUserId || null,
    handledBy: input.handledBy || 'hybrid',
    unreadCount: 0,
    tags: input.tags || [],
    correlationId: input.correlationId || crypto.randomUUID()
  };

  if (input.externalConversationId) {
    payload.externalConversationId = input.externalConversationId;
  }

  const created = await Conversation.create(payload);
  await created.populate('leadId', 'leadKey data updatedAt');
  return mapConversation(created);
}

async function listMessages(scope, conversationId, options = {}) {
  const limit = Math.min(250, Math.max(1, Number(options.limit || 120)));
  const items = await Message.find({
    ...buildScopeFilter(scope),
    conversationId
  })
    .sort({ createdAt: 1 })
    .limit(limit)
    .lean();

  return items.map((item) => ({
    ...item,
    _id: String(item._id),
    conversationId: String(item.conversationId),
    leadId: String(item.leadId)
  }));
}

async function listActivities(scope, conversationId, limit = 80) {
  const items = await CrmActivity.find({
    ...buildScopeFilter(scope),
    conversationId
  })
    .sort({ occurredAt: -1 })
    .limit(Math.min(150, Math.max(1, Number(limit || 80))))
    .lean();

  return items.map((item) => ({
    ...item,
    _id: String(item._id),
    conversationId: item.conversationId ? String(item.conversationId) : null,
    leadId: String(item.leadId)
  }));
}

async function appendMessage(scope, conversation, input) {
  const payload = {
    ...buildScopeFilter(scope),
    conversationId: conversation._id,
    leadId: conversation.leadId?.id || conversation.leadId,
    direction: input.direction,
    authorType: input.authorType,
    channel: conversation.channel,
    text: input.text,
    media: input.media || [],
    status: input.status,
    providerErrorCode: input.providerErrorCode || '',
    providerErrorMessage: input.providerErrorMessage || '',
    sentAt: input.sentAt || null,
    deliveredAt: input.deliveredAt || null,
    readAt: input.readAt || null,
    receivedAt: input.receivedAt || null,
    metadata: input.metadata || {},
    correlationId: input.correlationId
  };

  if (input.externalMessageId) payload.externalMessageId = input.externalMessageId;

  const message = await Message.create(payload);
  const timestamp = input.sentAt || input.receivedAt || new Date();
  const update = {
    $set: {
      lastMessageAt: timestamp,
      lastMessagePreview: String(input.text || '').slice(0, 180),
      correlationId: input.correlationId
    }
  };

  if (input.direction === 'inbound') update.$inc = { unreadCount: 1 };
  if (input.direction === 'outbound') {
    update.$set.handledBy = input.authorType === 'agent' ? 'ai' : 'human';
    update.$set.status = 'waiting_lead';
  }

  await Conversation.updateOne({
    _id: conversation._id,
    ...buildScopeFilter(scope)
  }, update);

  return {
    ...message.toObject(),
    _id: String(message._id),
    conversationId: String(message.conversationId),
    leadId: String(message.leadId)
  };
}

async function createActivity(scope, conversation, input) {
  const payload = {
    ...buildScopeFilter(scope),
    leadId: conversation.leadId?.id || conversation.leadId,
    conversationId: conversation._id,
    channel: conversation.channel,
    type: input.type,
    source: input.source,
    description: input.description,
    responsibleUserId: input.responsibleUserId || null,
    metadata: input.metadata || {},
    correlationId: input.correlationId,
    occurredAt: input.occurredAt || new Date()
  };

  if (input.idempotencyKey) payload.idempotencyKey = input.idempotencyKey;
  return CrmActivity.create(payload);
}

async function updateConversation(scope, conversationId, updates) {
  const item = await Conversation.findOneAndUpdate(
    { _id: conversationId, ...buildScopeFilter(scope) },
    { $set: updates },
    { new: true, runValidators: true }
  ).populate('leadId', 'leadKey data updatedAt').lean();

  return mapConversation(item);
}

async function markConversationRead(scope, conversationId) {
  const now = new Date();
  const conversation = await Conversation.findOneAndUpdate(
    { _id: conversationId, ...buildScopeFilter(scope) },
    { $set: { unreadCount: 0 } },
    { new: true }
  ).populate('leadId', 'leadKey data updatedAt').lean();

  if (!conversation) return null;

  await Message.updateMany({
    ...buildScopeFilter(scope),
    conversationId,
    direction: 'inbound',
    status: { $in: ['received', 'delivered'] },
    readAt: null
  }, {
    $set: { status: 'read', readAt: now }
  });

  return mapConversation(conversation);
}

async function addInternalNote(scope, conversationId, note) {
  const item = await Conversation.findOneAndUpdate(
    { _id: conversationId, ...buildScopeFilter(scope) },
    {
      $push: {
        internalNotes: {
          id: crypto.randomUUID(),
          text: note.text,
          authorUserId: String(note.authorUserId || ''),
          createdAt: new Date()
        }
      }
    },
    { new: true, runValidators: true }
  ).populate('leadId', 'leadKey data updatedAt').lean();

  return mapConversation(item);
}

async function summarizeConversations(scope) {
  const filter = buildScopeFilter(scope);
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const [total, open, waitingHuman, unread, resolvedToday] = await Promise.all([
    Conversation.countDocuments(filter),
    Conversation.countDocuments({ ...filter, status: { $in: ['open', 'waiting_lead'] } }),
    Conversation.countDocuments({ ...filter, status: 'waiting_human' }),
    Conversation.countDocuments({ ...filter, unreadCount: { $gt: 0 } }),
    Conversation.countDocuments({ ...filter, status: 'resolved', updatedAt: { $gte: startOfDay } })
  ]);

  return { total, open, waitingHuman, unread, resolvedToday };
}

module.exports = {
  buildScopeFilter,
  mapLead,
  mapConversation,
  listLeadOptions,
  listConversations,
  findConversation,
  findActiveConversation,
  createConversation,
  listMessages,
  listActivities,
  appendMessage,
  createActivity,
  updateConversation,
  markConversationRead,
  addInternalNote,
  summarizeConversations
};
