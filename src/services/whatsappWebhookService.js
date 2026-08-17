/**
 * @fileoverview Ingestão de webhooks do WhatsApp com vínculo ao CRM e SDR.
 *
 * Mensagens recebidas são roteadas pela integração configurada, deduplicadas,
 * vinculadas a um lead/conversa e analisadas pelo motor comercial. Respostas
 * automáticas entram novamente na fila outbound em vez de serem enviadas inline.
 *
 * @module src/services/whatsappWebhookService
 */

const crypto = require('node:crypto');
const MessagingIntegration = require('../models/MessagingIntegration');
const WebhookEvent = require('../models/WebhookEvent');
const Lead = require('../models/Lead');
const Conversation = require('../models/Conversation');
const { providerRegistry } = require('../integrations/providerRegistry');
const { normalizePhone } = require('../domain/omnichannel/phone');
const { analyzeLeadResponse } = require('../domain/conversations/conversationEngine');
const { updateLeadStatus } = require('../repositories/leadRepository');
const conversationRepository = require('../repositories/omnichannel/conversationRepository');
const { enqueueReply } = require('./outboundService');

async function findLeadByPhone(userId, phone) {
  const normalized = normalizePhone(phone);
  if (!normalized) return null;
  const candidates = await Lead.find({ userId }).select('leadKey data').sort({ updatedAt: -1 }).limit(1000).lean();
  return candidates.find((lead) => {
    const data = lead.data || {};
    return [data.whatsapp, data.telefone, data.phone].some((value) => normalizePhone(value) === normalized);
  }) || null;
}

async function findOrCreateLead(integration, event) {
  const existing = await findLeadByPhone(integration.userId, event.from);
  if (existing) return existing;

  const leadKey = `whatsapp:${event.from}`;
  const data = {
    placeId: leadKey,
    nome: event.contactName || event.from,
    telefone: event.from,
    whatsapp: event.from,
    fonte: 'whatsapp_inbound',
    status: 'NOVO',
    score: 0,
    interacoes: [],
    coletadoEm: new Date().toISOString(),
    atualizadoEm: new Date().toISOString()
  };
  await Lead.updateOne(
    { userId: integration.userId, leadKey },
    { $setOnInsert: { userId: integration.userId, leadKey, data } },
    { upsert: true }
  );
  return Lead.findOne({ userId: integration.userId, leadKey }).lean();
}

async function findOrCreateConversation(scope, lead, event, integration) {
  const existing = await Conversation.findOne({
    userId: scope.userId,
    organizationId: scope.organizationId || null,
    leadId: lead._id,
    channel: 'whatsapp',
    status: { $in: ['open', 'waiting_lead', 'waiting_human'] }
  }).populate('leadId', 'leadKey data updatedAt').lean();

  if (existing) return conversationRepository.mapConversation(existing);

  return conversationRepository.createConversation(scope, {
    leadId: lead._id,
    integrationId: integration._id,
    channel: 'whatsapp',
    normalizedPhone: event.from,
    handledBy: 'hybrid',
    externalConversationId: event.from,
    correlationId: crypto.randomUUID()
  });
}

async function recordWebhookEvent(integration, event, signatureValid) {
  const externalEventId = event.externalMessageId || `meta_${crypto.randomUUID()}`;
  const payloadHash = crypto.createHash('sha256').update(JSON.stringify(event)).digest('hex');
  const fingerprint = crypto
    .createHash('sha256')
    .update(`${String(integration._id)}:${externalEventId}:${payloadHash}`)
    .digest('hex');
  const correlationId = crypto.randomUUID();
  const retentionDays = Math.max(1, Math.min(365, Number(process.env.WEBHOOK_EVENT_RETENTION_DAYS || 30)));

  try {
    await WebhookEvent.create({
      integrationId: integration._id,
      provider: 'meta',
      fingerprint,
      externalEventId,
      signatureValid: Boolean(signatureValid),
      status: 'processed',
      correlationId,
      payloadHash,
      receivedAt: new Date(),
      processedAt: new Date(),
      expiresAt: new Date(Date.now() + retentionDays * 24 * 60 * 60 * 1000),
      errorCode: ''
    });
    return true;
  } catch (error) {
    if (error?.code === 11000) return false;
    throw error;
  }
}

async function ingestMetaWebhook(payload = {}, options = {}) {
  const provider = providerRegistry.getMessaging('meta');
  const events = await provider.processWebhook(payload);
  const result = { received: events.length, processed: 0, duplicates: 0, ignored: 0, repliesQueued: 0 };

  for (const event of events) {
    const integration = await MessagingIntegration.findOne({
      provider: 'meta',
      externalInstanceId: event.phoneNumberId,
      enabled: true
    }).lean();
    if (!integration) { result.ignored += 1; continue; }

    const isNew = await recordWebhookEvent(integration, event, options.signatureValid === true);
    if (!isNew) { result.duplicates += 1; continue; }

    const scope = { userId: integration.userId, organizationId: integration.organizationId || null };
    const lead = await findOrCreateLead(integration, event);
    const conversation = await findOrCreateConversation(scope, lead, event, integration);
    const correlationId = crypto.randomUUID();

    await conversationRepository.appendMessage(scope, conversation, {
      direction: 'inbound',
      authorType: 'lead',
      text: event.text || `[${event.rawMetadata?.type || 'mensagem'}]`,
      status: 'received',
      externalMessageId: event.externalMessageId,
      receivedAt: event.timestamp || new Date(),
      metadata: { providerId: 'meta', demo: false },
      correlationId
    });

    await conversationRepository.createActivity(scope, conversation, {
      type: 'message_received',
      source: 'integration',
      description: `Mensagem recebida via WhatsApp de ${lead.data?.nome || event.from}.`,
      correlationId,
      metadata: { providerId: 'meta', externalMessageId: event.externalMessageId }
    });

    if (event.text) {
      const analysis = analyzeLeadResponse(event.text, lead.data || {});
      const updated = await updateLeadStatus(lead.leadKey, analysis.status, {
        data: new Date().toISOString(),
        tipo: 'RESPOSTA_RECEBIDA_WHATSAPP',
        mensagem: event.text,
        intencao: analysis.intent,
        status: analysis.status,
        proximoPasso: analysis.proximoPasso,
        respostaSugerida: analysis.respostaSugerida
      }, integration.userId);

      if (analysis.respostaSugerida && conversation.handledBy !== 'human') {
        const queued = await enqueueReply({
          userId: integration.userId,
          organizationId: integration.organizationId || null,
          leadKey: lead.leadKey,
          leadName: updated?.nome || lead.data?.nome || event.contactName,
          conversationId: conversation._id,
          destination: event.from,
          message: analysis.respostaSugerida,
          externalInboundId: event.externalMessageId
        });
        if (queued) result.repliesQueued += 1;
      }
    }

    result.processed += 1;
  }

  return result;
}

module.exports = { findLeadByPhone, findOrCreateLead, recordWebhookEvent, ingestMetaWebhook };
