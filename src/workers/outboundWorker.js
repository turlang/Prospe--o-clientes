/**
 * @fileoverview Worker leve para processar a fila OutboundJob no MongoDB.
 *
 * O worker usa claim atômico, retentativa com backoff e dead-letter lógico.
 * Também detecta leads recém-criados/atualizados e os encaminha para o motor
 * outbound, mantendo a prospecção desacoplada da mensageria.
 *
 * @module src/workers/outboundWorker
 */

const Lead = require('../models/Lead');
const OutboundJob = require('../models/OutboundJob');
const { providerRegistry } = require('../integrations/providerRegistry');
const { hasMongoUri } = require('../infrastructure/database/mongoConnection');
const { enqueueProspectedLeads } = require('../services/outboundService');

let lastLeadScanAt = null;

function retryDelayMs(attempt) {
  const base = Math.max(1000, Number(process.env.OUTBOUND_RETRY_BASE_MS || 15000));
  return Math.min(15 * 60 * 1000, base * (2 ** Math.max(0, attempt - 1)));
}

function liveSendEnabled() {
  return String(process.env.OUTBOUND_LIVE_SEND || '').toLowerCase() === 'true';
}

async function scanProspectedLeads() {
  if (String(process.env.OUTBOUND_AFTER_PROSPECTING || 'true').toLowerCase() === 'false') {
    return { scanned: 0, queued: 0 };
  }

  const now = new Date();
  const lookbackMinutes = Math.max(1, Number(process.env.OUTBOUND_DISCOVERY_LOOKBACK_MINUTES || 1440));
  const since = lastLeadScanAt || new Date(now.getTime() - lookbackMinutes * 60_000);
  const batchSize = Math.max(10, Math.min(500, Number(process.env.OUTBOUND_DISCOVERY_BATCH || 100)));

  const leads = await Lead.find({ updatedAt: { $gt: since, $lte: now } })
    .select('userId data updatedAt')
    .sort({ updatedAt: 1, _id: 1 })
    .limit(batchSize)
    .lean();

  let queued = 0;
  for (const document of leads) {
    const lead = document.data || {};
    if (lead.fonte === 'whatsapp_inbound') continue;
    const result = await enqueueProspectedLeads({ userId: document.userId, leads: [lead] });
    queued += Number(result.queued || 0) + Number(result.review || 0) + Number(result.blocked || 0);
  }

  if (leads.length) {
    lastLeadScanAt = new Date(leads[leads.length - 1].updatedAt);
  } else {
    lastLeadScanAt = now;
  }

  return { scanned: leads.length, queued };
}

async function claimNextJob() {
  const now = new Date();
  return OutboundJob.findOneAndUpdate(
    {
      status: 'PENDING',
      scheduledAt: { $lte: now },
      $or: [{ nextAttemptAt: null }, { nextAttemptAt: { $lte: now } }]
    },
    {
      $set: { status: 'PROCESSING', lockedAt: now },
      $inc: { attempts: 1 }
    },
    { new: true, sort: { scheduledAt: 1, createdAt: 1 } }
  );
}

async function processOne() {
  if (!liveSendEnabled()) return false;
  const job = await claimNextJob();
  if (!job) return false;

  try {
    const provider = providerRegistry.getMessaging(job.providerId);
    const result = await provider.sendMessage({
      to: job.destination,
      text: job.message,
      conversationId: job.conversationId,
      correlationId: String(job._id)
    });

    job.status = 'SENT';
    job.sentAt = result.sentAt ? new Date(result.sentAt) : new Date();
    job.externalMessageId = String(result.externalMessageId || '');
    job.lastError = '';
    job.lockedAt = null;
    job.nextAttemptAt = null;
    await job.save();
    return true;
  } catch (error) {
    const exhausted = Number(job.attempts || 0) >= Number(job.maxAttempts || 3);
    job.status = exhausted ? 'DEAD' : 'PENDING';
    job.lastError = String(error?.code || error?.message || 'OUTBOUND_SEND_FAILED').slice(0, 1200);
    job.lockedAt = null;
    job.nextAttemptAt = exhausted ? null : new Date(Date.now() + retryDelayMs(job.attempts));
    await job.save();
    return true;
  }
}

function startOutboundWorker() {
  if (!hasMongoUri() || String(process.env.OUTBOUND_WORKER_ENABLED || '').toLowerCase() !== 'true') {
    return { enabled: false, stop() {} };
  }

  const intervalMs = Math.max(1000, Number(process.env.OUTBOUND_WORKER_INTERVAL_MS || 5000));
  let running = false;
  const tick = async () => {
    if (running) return;
    running = true;
    try {
      await scanProspectedLeads();
      if (liveSendEnabled()) {
        let processed = 0;
        while (processed < 10 && await processOne()) processed += 1;
      }
    } catch (error) {
      console.error('[OUTBOUND] Falha no worker:', error.message);
    } finally {
      running = false;
    }
  };

  const timer = setInterval(tick, intervalMs);
  timer.unref?.();
  setImmediate(tick);

  return { enabled: true, stop() { clearInterval(timer); } };
}

module.exports = {
  retryDelayMs,
  liveSendEnabled,
  scanProspectedLeads,
  claimNextJob,
  processOne,
  startOutboundWorker
};
