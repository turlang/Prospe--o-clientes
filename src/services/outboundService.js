/**
 * @fileoverview Casos de uso do motor de outbound e aprovação de contatos.
 *
 * A fila separa prospecção de mensageria e aplica deduplicação, score mínimo,
 * consentimento, bloqueio de contatos e modos assistido/semiautomático/autônomo.
 *
 * @module src/services/outboundService
 */

const crypto = require('node:crypto');
const mongoose = require('mongoose');
const OutboundJob = require('../models/OutboundJob');
const { hasMongoUri } = require('../infrastructure/database/mongoConnection');
const { normalizePhone } = require('../domain/omnichannel/phone');
const { buildSalesApproach } = require('./salesStrategyEngine');

const MODES = Object.freeze(['assisted', 'semiautomatic', 'autonomous']);

function normalizeMode(value) {
  const normalized = String(value || process.env.OUTBOUND_DEFAULT_MODE || 'assisted').trim().toLowerCase();
  return MODES.includes(normalized) ? normalized : 'assisted';
}

function normalizeChannel(value) {
  return String(value || process.env.OUTBOUND_DEFAULT_CHANNEL || 'whatsapp').trim().toLowerCase() === 'email'
    ? 'email'
    : 'whatsapp';
}

function getLeadKey(lead = {}) {
  return String(lead.placeId || lead.leadKey || lead.nome || lead.name || '').trim();
}

function getDestination(lead = {}, channel = 'whatsapp') {
  if (channel === 'email') return String(lead.email || '').trim().toLowerCase();
  return normalizePhone(lead.whatsapp || lead.telefone || lead.phone || '');
}

function getConsent(lead = {}, channel = 'whatsapp') {
  const direct = channel === 'whatsapp' ? lead.whatsappConsent : lead.emailConsent;
  const nested = lead.contactConsent?.[channel];
  const source = direct || nested || {};
  const granted = source === true || source?.granted === true || source?.status === 'granted';
  const revoked = source?.revokedAt || source?.status === 'revoked';
  return {
    granted: Boolean(granted && !revoked),
    source: String(source?.source || (granted ? 'lead_record' : '')).slice(0, 120),
    grantedAt: source?.grantedAt ? new Date(source.grantedAt) : null,
    revokedAt: source?.revokedAt ? new Date(source.revokedAt) : null
  };
}

function isDoNotContact(lead = {}) {
  if (lead.doNotContact === true) return true;
  const tags = Array.isArray(lead.tags) ? lead.tags.map((tag) => String(tag).toUpperCase()) : [];
  return tags.includes('DO_NOT_CONTACT') || tags.includes('NAO_CONTATAR');
}

function buildInitialMessage(lead, channel) {
  const recommendation = buildSalesApproach(lead, { channel, mode: 'new' });
  return String(recommendation?.abordagem || lead.abordagem || '').trim().slice(0, 4000);
}

function buildDedupeKey({ userId, leadKey, channel, purpose = 'initial_contact', discriminator = '' }) {
  const suffix = discriminator || purpose;
  return `${String(userId)}:${leadKey}:${channel}:${purpose}:${suffix}`.slice(0, 700);
}

function decideJobState({ lead, mode, channel, destination, consent, minScore }) {
  if (isDoNotContact(lead)) return { status: 'BLOCKED', reason: 'Lead marcado como não contatar.' };
  if (!destination) return { status: 'BLOCKED', reason: `Lead sem ${channel === 'email' ? 'e-mail' : 'telefone'} válido.` };
  if (Number(lead.score || 0) < minScore) return { status: 'BLOCKED', reason: `Score abaixo do mínimo (${minScore}).` };
  if (mode === 'assisted') return { status: 'PENDING_REVIEW', reason: '' };
  if (!consent.granted) return { status: 'BLOCKED', reason: 'Contato automático exige consentimento registrado.' };
  return { status: 'PENDING', reason: '' };
}

async function upsertJob(payload) {
  try {
    return await OutboundJob.findOneAndUpdate(
      { dedupeKey: payload.dedupeKey },
      { $setOnInsert: payload },
      { upsert: true, new: true, runValidators: true }
    ).lean();
  } catch (error) {
    if (error?.code === 11000) return OutboundJob.findOne({ dedupeKey: payload.dedupeKey }).lean();
    throw error;
  }
}

async function enqueueProspectedLeads({ userId, leads = [], mode, channel, minScore } = {}) {
  if (!hasMongoUri()) {
    return { enabled: false, reason: 'mongodb_required', queued: 0, review: 0, blocked: 0, jobs: [] };
  }

  const resolvedMode = normalizeMode(mode);
  const resolvedChannel = normalizeChannel(channel);
  const threshold = Math.max(0, Math.min(100, Number(minScore ?? process.env.OUTBOUND_MIN_SCORE ?? 70)));
  const jobs = [];

  for (const lead of Array.isArray(leads) ? leads : []) {
    const leadKey = getLeadKey(lead);
    if (!leadKey) continue;
    const destination = getDestination(lead, resolvedChannel);
    const consent = getConsent(lead, resolvedChannel);
    const state = decideJobState({ lead, mode: resolvedMode, channel: resolvedChannel, destination, consent, minScore: threshold });
    const message = buildInitialMessage(lead, resolvedChannel);
    if (!message) continue;

    const item = await upsertJob({
      userId,
      organizationId: null,
      leadKey,
      leadName: String(lead.nome || lead.name || '').slice(0, 240),
      purpose: 'initial_contact',
      mode: resolvedMode,
      channel: resolvedChannel,
      providerId: resolvedChannel === 'whatsapp' ? 'meta' : 'demo',
      destination: destination || 'blocked',
      message,
      status: state.status,
      blockedReason: state.reason,
      scheduledAt: new Date(),
      maxAttempts: Math.max(1, Math.min(10, Number(process.env.OUTBOUND_MAX_ATTEMPTS || 3))),
      consent,
      dedupeKey: buildDedupeKey({ userId, leadKey, channel: resolvedChannel }),
      metadata: { score: Number(lead.score || 0), source: 'prospecting' }
    });
    jobs.push(item);
  }

  return {
    enabled: true,
    mode: resolvedMode,
    channel: resolvedChannel,
    queued: jobs.filter((job) => job.status === 'PENDING').length,
    review: jobs.filter((job) => job.status === 'PENDING_REVIEW').length,
    blocked: jobs.filter((job) => job.status === 'BLOCKED').length,
    jobs: jobs.map((job) => ({ id: String(job._id), leadKey: job.leadKey, status: job.status, blockedReason: job.blockedReason || '' }))
  };
}

async function enqueueReply({ userId, organizationId = null, leadKey, leadName = '', conversationId = null, destination, message, externalInboundId = '' } = {}) {
  if (!hasMongoUri()) return null;
  const normalizedDestination = normalizePhone(destination);
  const text = String(message || '').trim().slice(0, 4000);
  if (!userId || !leadKey || !normalizedDestination || !text) return null;

  const discriminator = externalInboundId || crypto.createHash('sha256').update(text).digest('hex').slice(0, 20);
  return upsertJob({
    userId,
    organizationId,
    leadKey: String(leadKey),
    leadName: String(leadName || '').slice(0, 240),
    conversationId,
    purpose: 'reply',
    mode: 'autonomous',
    channel: 'whatsapp',
    providerId: 'meta',
    destination: normalizedDestination,
    message: text,
    status: String(process.env.OUTBOUND_AUTO_REPLY_ENABLED || '').toLowerCase() === 'true' ? 'PENDING' : 'PENDING_REVIEW',
    scheduledAt: new Date(),
    maxAttempts: Math.max(1, Math.min(10, Number(process.env.OUTBOUND_MAX_ATTEMPTS || 3))),
    consent: { granted: true, source: 'inbound_conversation', grantedAt: new Date(), revokedAt: null },
    dedupeKey: buildDedupeKey({ userId, leadKey: String(leadKey), channel: 'whatsapp', purpose: 'reply', discriminator }),
    metadata: { source: 'whatsapp_inbound', externalInboundId }
  });
}

async function listJobs(userId, query = {}) {
  const filter = { userId };
  if (query.status) filter.status = String(query.status).toUpperCase();
  if (query.channel) filter.channel = normalizeChannel(query.channel);
  const limit = Math.min(100, Math.max(1, Number(query.limit || 50)));
  return OutboundJob.find(filter).sort({ createdAt: -1 }).limit(limit).lean();
}

async function getSummary(userId) {
  let objectId = userId;
  if (typeof userId === 'string' && mongoose.Types.ObjectId.isValid(userId)) objectId = new mongoose.Types.ObjectId(userId);
  const grouped = await OutboundJob.aggregate([
    { $match: { userId: objectId } },
    { $group: { _id: '$status', total: { $sum: 1 } } }
  ]);
  return Object.fromEntries(grouped.map((item) => [item._id, item.total]));
}

async function approveJob(userId, id) {
  return OutboundJob.findOneAndUpdate(
    { _id: id, userId, status: 'PENDING_REVIEW' },
    { $set: { status: 'PENDING', scheduledAt: new Date(), blockedReason: '' } },
    { new: true, runValidators: true }
  ).lean();
}

async function cancelJob(userId, id) {
  return OutboundJob.findOneAndUpdate(
    { _id: id, userId, status: { $in: ['PENDING_REVIEW', 'PENDING', 'FAILED', 'BLOCKED'] } },
    { $set: { status: 'CANCELLED' } },
    { new: true }
  ).lean();
}

module.exports = {
  MODES,
  normalizeMode,
  normalizeChannel,
  getLeadKey,
  getDestination,
  getConsent,
  isDoNotContact,
  buildDedupeKey,
  decideJobState,
  enqueueProspectedLeads,
  enqueueReply,
  listJobs,
  getSummary,
  approveJob,
  cancelJob
};
