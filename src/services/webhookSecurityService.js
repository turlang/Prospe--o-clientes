/**
 * @fileoverview Fundação omnichannel do LeadHunter: módulo src/services/webhookSecurityService.
 *
 * Responsabilidade isolada para conversas, integrações, agente SDR,
 * segurança ou validação deste domínio.
 * @module src/services/webhookSecurityService
 */

const crypto = require('node:crypto');

function stableStringify(value) {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`;
  return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`).join(',')}}`;
}

function payloadHash(payload) {
  return crypto.createHash('sha256').update(stableStringify(payload)).digest('hex');
}

function webhookFingerprint({ provider, integrationId, externalEventId, payload }) {
  const source = [provider, integrationId, externalEventId || '', payloadHash(payload)].join(':');
  return crypto.createHash('sha256').update(source).digest('hex');
}

function correlationId(requested) {
  const value = String(requested || '').trim();
  return /^[a-zA-Z0-9._:-]{8,120}$/.test(value) ? value : crypto.randomUUID();
}

module.exports = { stableStringify, payloadHash, webhookFingerprint, correlationId };
