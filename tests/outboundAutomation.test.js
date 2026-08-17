/**
 * @fileoverview Testes de regressão do motor de outbound e WhatsApp Cloud API.
 *
 * Garante que automação sem consentimento permaneça bloqueada, que o modo
 * assistido exija revisão e que o kill-switch impeça qualquer envio real.
 *
 * @module tests/outboundAutomation.test
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  normalizeMode,
  getConsent,
  isDoNotContact,
  buildDedupeKey,
  decideJobState
} = require('../src/services/outboundService');
const MetaWhatsAppProvider = require('../src/integrations/messaging/MetaWhatsAppProvider');
const { liveSendEnabled } = require('../src/workers/outboundWorker');

test('modo assistido cria revisão mesmo sem consentimento de envio automático', () => {
  const state = decideJobState({
    lead: { score: 85 },
    mode: 'assisted',
    channel: 'whatsapp',
    destination: '+5511999999999',
    consent: { granted: false },
    minScore: 70
  });
  assert.equal(state.status, 'PENDING_REVIEW');
});

test('modo semiautomático bloqueia lead sem consentimento registrado', () => {
  const state = decideJobState({
    lead: { score: 90 },
    mode: 'semiautomatic',
    channel: 'whatsapp',
    destination: '+5511999999999',
    consent: { granted: false },
    minScore: 70
  });
  assert.equal(state.status, 'BLOCKED');
  assert.match(state.reason, /consentimento/i);
});

test('modo automático libera somente contato elegível com consentimento', () => {
  const state = decideJobState({
    lead: { score: 92 },
    mode: 'autonomous',
    channel: 'whatsapp',
    destination: '+5511999999999',
    consent: { granted: true },
    minScore: 70
  });
  assert.equal(state.status, 'PENDING');
});

test('lead com DO_NOT_CONTACT sempre permanece bloqueado', () => {
  const lead = { score: 99, tags: ['VIP', 'DO_NOT_CONTACT'] };
  assert.equal(isDoNotContact(lead), true);
  const state = decideJobState({
    lead,
    mode: 'assisted',
    channel: 'whatsapp',
    destination: '+5511999999999',
    consent: { granted: true },
    minScore: 70
  });
  assert.equal(state.status, 'BLOCKED');
});

test('consentimento revogado não é considerado válido', () => {
  assert.equal(getConsent({ whatsappConsent: { granted: true } }, 'whatsapp').granted, true);
  assert.equal(getConsent({ whatsappConsent: { granted: true, revokedAt: new Date() } }, 'whatsapp').granted, false);
});

test('dedupe key é estável para a mesma primeira abordagem', () => {
  const input = { userId: 'user-1', leadKey: 'lead-1', channel: 'whatsapp' };
  assert.equal(buildDedupeKey(input), buildDedupeKey(input));
  assert.notEqual(buildDedupeKey(input), buildDedupeKey({ ...input, leadKey: 'lead-2' }));
});

test('modo desconhecido recua para assistido', () => {
  assert.equal(normalizeMode('qualquer-coisa'), 'assisted');
});

test('kill-switch mantém envio real desligado por padrão', async () => {
  const previous = process.env.OUTBOUND_LIVE_SEND;
  process.env.OUTBOUND_LIVE_SEND = 'false';
  try {
    assert.equal(liveSendEnabled(), false);
    const provider = new MetaWhatsAppProvider();
    await assert.rejects(
      provider.sendMessage({ to: '+5511999999999', text: 'teste' }),
      (error) => error?.code === 'OUTBOUND_LIVE_SEND_DISABLED'
    );
  } finally {
    if (previous === undefined) delete process.env.OUTBOUND_LIVE_SEND;
    else process.env.OUTBOUND_LIVE_SEND = previous;
  }
});

test('webhook Meta é normalizado para evento de conversa', async () => {
  const provider = new MetaWhatsAppProvider();
  const events = await provider.processWebhook({
    entry: [{
      changes: [{
        value: {
          metadata: { phone_number_id: '123456' },
          contacts: [{ wa_id: '5511999999999', profile: { name: 'Cliente Teste' } }],
          messages: [{
            id: 'wamid.123',
            from: '5511999999999',
            timestamp: '1786996800',
            type: 'text',
            text: { body: 'Tenho interesse' }
          }]
        }
      }]
    }]
  });

  assert.equal(events.length, 1);
  assert.equal(events[0].externalMessageId, 'wamid.123');
  assert.equal(events[0].phoneNumberId, '123456');
  assert.equal(events[0].text, 'Tenho interesse');
  assert.equal(events[0].contactName, 'Cliente Teste');
  assert.match(events[0].from, /5511999999999$/);
});

test('verificação inicial do webhook exige token configurado correto', () => {
  const previous = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN;
  process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN = 'segredo-de-verificacao';
  try {
    const provider = new MetaWhatsAppProvider();
    assert.equal(provider.validateWebhook({ mode: 'subscribe', verifyToken: 'segredo-de-verificacao' }), true);
    assert.equal(provider.validateWebhook({ mode: 'subscribe', verifyToken: 'errado' }), false);
  } finally {
    if (previous === undefined) delete process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN;
    else process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN = previous;
  }
});
