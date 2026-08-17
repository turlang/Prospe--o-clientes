/**
 * @fileoverview Controle explícito de Start/Stop da automação outbound.
 *
 * A prospecção pode continuar alimentando a fila enquanto o estado estiver
 * STOPPED. O worker só envia quando o usuário aciona Start e o estado passa
 * para RUNNING.
 *
 * @module src/services/outboundAutomationService
 */

const OutboundAutomationState = require('../models/OutboundAutomationState');
const OutboundJob = require('../models/OutboundJob');

function normalizeMode(value) {
  return String(value || '').trim().toLowerCase() === 'semiautomatic'
    ? 'semiautomatic'
    : 'autonomous';
}

function normalizeChannel(value) {
  return String(value || '').trim().toLowerCase() === 'email' ? 'email' : 'whatsapp';
}

function normalizeMinScore(value) {
  const fallback = Number(process.env.OUTBOUND_MIN_SCORE || 70);
  const number = Number(value);
  const resolved = Number.isFinite(number) ? number : fallback;
  return Math.max(0, Math.min(100, resolved));
}

function defaultState(userId, organizationId = null) {
  return {
    userId,
    organizationId,
    status: 'STOPPED',
    mode: 'autonomous',
    channel: 'whatsapp',
    minScore: normalizeMinScore(),
    startedAt: null,
    stoppedAt: null,
    lastStartedBy: null
  };
}

async function getAutomationState(userId, organizationId = null) {
  return OutboundAutomationState.findOneAndUpdate(
    { userId },
    {
      $setOnInsert: defaultState(userId, organizationId),
      ...(organizationId ? { $set: { organizationId } } : {})
    },
    { upsert: true, new: true, runValidators: true }
  ).lean();
}

async function startAutomation(userId, input = {}, actorUserId = userId, organizationId = null) {
  const current = await getAutomationState(userId, organizationId);
  const mode = normalizeMode(input.mode || current.mode);
  const channel = normalizeChannel(input.channel || current.channel);
  const minScore = normalizeMinScore(input.minScore ?? current.minScore);
  const now = new Date();

  const state = await OutboundAutomationState.findOneAndUpdate(
    { userId },
    {
      $set: {
        organizationId: organizationId || current.organizationId || null,
        status: 'RUNNING',
        mode,
        channel,
        minScore,
        startedAt: now,
        stoppedAt: null,
        lastStartedBy: actorUserId || userId
      }
    },
    { new: true, runValidators: true }
  ).lean();

  const released = await OutboundJob.updateMany(
    {
      userId,
      status: 'PENDING_REVIEW',
      channel,
      blockedReason: '',
      'consent.granted': true
    },
    {
      $set: {
        status: 'PENDING',
        mode,
        scheduledAt: now,
        nextAttemptAt: null
      }
    }
  );

  return {
    state,
    releasedPendingReview: Number(released.modifiedCount || 0)
  };
}

async function stopAutomation(userId, organizationId = null) {
  const current = await getAutomationState(userId, organizationId);
  const state = await OutboundAutomationState.findOneAndUpdate(
    { userId },
    {
      $set: {
        status: 'STOPPED',
        stoppedAt: new Date(),
        organizationId: organizationId || current.organizationId || null
      }
    },
    { new: true, runValidators: true }
  ).lean();

  return { state };
}

async function getRunningUserIds() {
  const items = await OutboundAutomationState.find({ status: 'RUNNING' }).select('userId').lean();
  return items.map((item) => item.userId).filter(Boolean);
}

async function isAutomationRunning(userId) {
  if (!userId) return false;
  const item = await OutboundAutomationState.findOne({ userId, status: 'RUNNING' }).select('_id').lean();
  return Boolean(item);
}

module.exports = {
  normalizeMode,
  normalizeChannel,
  normalizeMinScore,
  defaultState,
  getAutomationState,
  startAutomation,
  stopAutomation,
  getRunningUserIds,
  isAutomationRunning
};
