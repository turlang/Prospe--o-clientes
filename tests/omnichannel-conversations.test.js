/**
 * @fileoverview Testes unitários e contratuais da Central de Conversas.
 *
 * Os cenários validam entradas puras, estados permitidos, normalização de
 * mensagens e a presença dos contratos HTTP e visuais da fatia vertical.
 *
 * @module tests/omnichannel-conversations.test
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {
  normalizeTags,
  normalizeConversationInput,
  normalizePagination,
  normalizeMessageInput,
  normalizeConversationUpdate,
  buildMessageRecord,
  buildActivityRecord
} = require('../src/services/conversationService');

const ROOT = path.resolve(__dirname, '..');

function read(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath), 'utf8');
}

test('normaliza criação de conversa e preserva isolamento demonstrativo', () => {
  const result = normalizeConversationInput({
    leadId: '507f1f77bcf86cd799439011',
    channel: 'DEMO',
    handledBy: 'hybrid',
    phone: '(11) 99999-0000',
    tags: [' urgente ', 'urgente', ' inbound '],
    initialMessage: '  Olá, quero saber mais.  '
  });

  assert.equal(result.channel, 'demo');
  assert.equal(result.normalizedPhone, '+5511999990000');
  assert.deepEqual(result.tags, ['urgente', 'inbound']);
  assert.equal(result.initialMessage, 'Olá, quero saber mais.');
  assert.match(result.correlationId, /^[0-9a-f-]{36}$/i);
});

test('rejeita canal e modo de atendimento desconhecidos', () => {
  assert.throws(
    () => normalizeConversationInput({ leadId: 'abc', channel: 'telegram' }),
    /Canal de conversa não suportado/
  );
  assert.throws(
    () => normalizeConversationInput({ leadId: 'abc', channel: 'demo', handledBy: 'robô-total' }),
    /Modo de atendimento inválido/
  );
});

test('normaliza paginação e ignora filtros não suportados', () => {
  const result = normalizePagination({
    page: '-4',
    limit: '999',
    status: 'desconhecido',
    channel: 'telegram',
    q: `  ${'a'.repeat(160)}  `,
    unreadOnly: 'true'
  });

  assert.equal(result.page, 1);
  assert.equal(result.limit, 50);
  assert.equal(result.status, '');
  assert.equal(result.channel, '');
  assert.equal(result.query.length, 120);
  assert.equal(result.unreadOnly, true);
});

test('valida e limita mensagem de saída', () => {
  assert.throws(() => normalizeMessageInput({ text: '   ' }), /Digite uma mensagem/);

  const result = normalizeMessageInput({ text: `  ${'x'.repeat(5000)}  ` });
  assert.equal(result.providerId, 'demo');
  assert.equal(result.text.length, 4000);
  assert.match(result.correlationId, /^[0-9a-f-]{36}$/i);
});

test('aceita somente alterações válidas no atendimento', () => {
  assert.deepEqual(
    normalizeConversationUpdate({ status: 'waiting_human', handledBy: 'human', tags: ['vip', 'vip'] }),
    { status: 'waiting_human', handledBy: 'human', tags: ['vip'] }
  );

  assert.throws(() => normalizeConversationUpdate({ status: 'inventado' }), /Status de conversa inválido/);
  assert.throws(() => normalizeConversationUpdate({}), /Nenhuma alteração válida/);
});

test('monta registros de mensagens recebidas e enviadas com estados coerentes', () => {
  const inbound = buildMessageRecord({
    direction: 'inbound',
    authorType: 'lead',
    text: 'Olá',
    providerResult: { demo: true, providerId: 'demo' },
    correlationId: 'corr-in'
  });
  const outbound = buildMessageRecord({
    direction: 'outbound',
    authorType: 'human',
    text: 'Olá, como posso ajudar?',
    providerResult: {
      demo: true,
      providerId: 'demo',
      status: 'sent',
      externalMessageId: 'demo_1',
      sentAt: '2026-08-02T20:00:00.000Z'
    },
    correlationId: 'corr-out'
  });

  assert.equal(inbound.status, 'received');
  assert.ok(inbound.receivedAt instanceof Date);
  assert.equal(inbound.sentAt, null);
  assert.equal(outbound.status, 'sent');
  assert.equal(outbound.externalMessageId, 'demo_1');
  assert.ok(outbound.sentAt instanceof Date);
});

test('atividade comercial mantém tipo, origem, correlação e metadados', () => {
  const activity = buildActivityRecord({
    type: 'message_received',
    source: 'manual',
    description: 'Mensagem demonstrativa recebida.',
    correlationId: 'corr-activity',
    metadata: { demo: true }
  });

  assert.equal(activity.type, 'message_received');
  assert.equal(activity.source, 'manual');
  assert.equal(activity.correlationId, 'corr-activity');
  assert.deepEqual(activity.metadata, { demo: true });
});

test('rotas expõem caixa de entrada, mensagens, leitura, notas e simulação demo', () => {
  const source = read('src/routes/omnichannelRoutes.js');
  for (const contract of [
    "router.get('/conversations'",
    "router.post('/conversations'",
    "router.get('/conversations/:id'",
    "router.patch('/conversations/:id'",
    "router.patch('/conversations/:id/read'",
    "router.post('/conversations/:id/messages'",
    "router.post('/conversations/:id/demo-inbound'",
    "router.post('/conversations/:id/notes'"
  ]) {
    assert.ok(source.includes(contract), `Contrato ausente: ${contract}`);
  }
  assert.ok(source.includes('asyncHandler'));
  assert.ok(source.includes('messageLimit'));
});

test('frontend apresenta Central de Conversas e identifica claramente o modo demo', () => {
  const source = read('public/assets/dashboard/omnichannel.js');
  const css = read('public/assets/dashboard/omnichannel.css');

  assert.ok(source.includes('data-view="conversas"'));
  assert.ok(source.includes('/api/omnichannel/conversations'));
  assert.ok(source.includes('/demo-inbound'));
  assert.ok(source.includes('nenhuma mensagem sai do LeadHunter'));
  assert.ok(source.includes('escapeHtml'));
  assert.ok(css.includes('.omni-layout'));
  assert.ok(css.includes('@media (max-width: 840px)'));
});
