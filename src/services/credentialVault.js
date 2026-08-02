/**
 * @fileoverview Fundação omnichannel do LeadHunter: módulo src/services/credentialVault.
 *
 * Responsabilidade isolada para conversas, integrações, agente SDR,
 * segurança ou validação deste domínio.
 * @module src/services/credentialVault
 */

const crypto = require('node:crypto');

const ALGORITHM = 'aes-256-gcm';
const ENVELOPE_VERSION = 1;

function getKey() {
  const raw = String(process.env.INTEGRATION_ENCRYPTION_KEY || '').trim();
  if (!raw) {
    if (String(process.env.NODE_ENV || '').toLowerCase() === 'production') {
      throw new Error('INTEGRATION_ENCRYPTION_KEY é obrigatória em produção.');
    }
    return crypto.createHash('sha256').update('leadhunter-development-integration-key').digest();
  }
  return crypto.createHash('sha256').update(raw).digest();
}

function encryptSecret(value) {
  if (value === undefined || value === null || value === '') return null;
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv);
  const plaintext = Buffer.from(JSON.stringify(value), 'utf8');
  const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  return {
    version: ENVELOPE_VERSION,
    algorithm: ALGORITHM,
    iv: iv.toString('base64'),
    authTag: cipher.getAuthTag().toString('base64'),
    ciphertext: ciphertext.toString('base64')
  };
}

function decryptSecret(envelope) {
  if (!envelope) return null;
  if (Number(envelope.version) !== ENVELOPE_VERSION || envelope.algorithm !== ALGORITHM) {
    throw new Error('Envelope de credencial não suportado.');
  }
  const decipher = crypto.createDecipheriv(ALGORITHM, getKey(), Buffer.from(envelope.iv, 'base64'));
  decipher.setAuthTag(Buffer.from(envelope.authTag, 'base64'));
  const plaintext = Buffer.concat([
    decipher.update(Buffer.from(envelope.ciphertext, 'base64')),
    decipher.final()
  ]);
  return JSON.parse(plaintext.toString('utf8'));
}

function maskSecret(value) {
  const text = String(value || '');
  if (!text) return '';
  if (text.length <= 8) return '••••••••';
  return `${text.slice(0, 3)}••••••${text.slice(-3)}`;
}

module.exports = { encryptSecret, decryptSecret, maskSecret };
