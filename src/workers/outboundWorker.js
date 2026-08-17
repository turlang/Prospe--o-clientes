/**
 * @fileoverview Worker leve para processar a fila OutboundJob no MongoDB.
 *
 * O worker usa claim atômico, retentativa com backoff e dead-letter lógico.
 * Ele só inicia quando OUTBOUND_WORKER_ENABLED=true e o MongoDB está ativo.
 *
 * @module src/workers/outboundWorker
 */

const OutboundJob = require('../models/OutboundJob');
const { providerRegistry } = require('../integrations/providerRegistry');
const { hasMongoUri } = require('../infrastructure/database/mongoConnection');

function retryDelayMs(attempt) {
  const base = Math.max(1000, Number(process.env.OUTBOUND_RETRY_BASE_MS || 15000));
  return Math.min(15 * 60 * 1000, base * (2 ** Math.max(0, attempt - 1)));
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
  const timer = setInterval(async () => {
    if (running) return;
    running = true;
    try {
      let processed = 0;
      while (processed < 10 && await processOne()) processed += 1;
    } catch (error) {
      console.error('[OUTBOUND] Falha no worker:', error.message);
    } finally {
      running = false;
    }
  }, intervalMs);
  timer.unref?.();

  return { enabled: true, stop() { clearInterval(timer); } };
}

module.exports = { retryDelayMs, claimNextJob, processOne, startOutboundWorker };
