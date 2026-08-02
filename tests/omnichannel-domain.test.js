/**
 * @fileoverview Fundação omnichannel do LeadHunter: módulo tests/omnichannel-domain.test.
 *
 * Responsabilidade isolada para conversas, integrações, agente SDR,
 * segurança ou validação deste domínio.
 * @module tests/omnichannel-domain.test
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const { normalizePhone } = require('../src/domain/omnichannel/phone');
const { normalizeQualification, detectUnsupportedClaims } = require('../src/domain/omnichannel/qualification');
const { compileAgentPrompt } = require('../src/domain/omnichannel/promptCompiler');
const { normalizeSteps, nextExecutionAt, isWithinBusinessHours } = require('../src/domain/omnichannel/followUpPolicy');
const { encryptSecret, decryptSecret, maskSecret } = require('../src/services/credentialVault');
const { webhookFingerprint } = require('../src/services/webhookSecurityService');
const { runPlayground } = require('../src/services/agentSdrService');

test('normaliza telefones brasileiros sem criar números inválidos', () => {
  assert.equal(normalizePhone('(11) 99999-9999'), '+5511999999999');
  assert.equal(normalizePhone('+55 11 99999-9999'), '+5511999999999');
  assert.equal(normalizePhone('123'), '');
});

test('normaliza qualificação e limita o score', () => {
  const result = normalizeQualification({ interestLevel: 'high', qualificationScore: 150, objections: ['Preço'] });
  assert.equal(result.interestLevel, 'high');
  assert.equal(result.qualificationScore, 100);
  assert.deepEqual(result.objections, ['Preço']);
});

test('prompt não incorpora marca Q7 e inclui guardrails', () => {
  const prompt = compileAgentPrompt({ companyName: 'Acme', services: ['Sites'] });
  assert.match(prompt, /Acme/);
  assert.match(prompt, /não pode divulgar ou inventar/i);
  assert.doesNotMatch(prompt, /Q7 Educação/i);
});

test('detecta promessas e preços não autorizados', () => {
  const claims = detectUnsupportedClaims('Garantimos resultado e o preço é R$ 500.');
  assert.ok(claims.length >= 2);
});

test('credenciais usam envelope autenticado e máscara', () => {
  const encrypted = encryptSecret({ token: 'segredo-muito-forte' });
  assert.notEqual(encrypted.ciphertext, 'segredo-muito-forte');
  assert.deepEqual(decryptSecret(encrypted), { token: 'segredo-muito-forte' });
  assert.equal(maskSecret('abcdefghijkl'), 'abc••••••jkl');
});

test('fingerprint do webhook é estável para objetos equivalentes', () => {
  const a = webhookFingerprint({ provider: 'demo', integrationId: '1', payload: { b: 2, a: 1 } });
  const b = webhookFingerprint({ provider: 'demo', integrationId: '1', payload: { a: 1, b: 2 } });
  assert.equal(a, b);
});

test('política de follow-up normaliza passos e horário comercial', () => {
  const steps = normalizeSteps([{ delayMinutes: 120, action: 'suggest_message' }]);
  assert.equal(steps[0].delayMinutes, 120);
  assert.equal(nextExecutionAt('2026-08-03T10:00:00Z', steps[0]).toISOString(), '2026-08-03T12:00:00.000Z');
  assert.equal(isWithinBusinessHours('2026-08-03T12:00:00Z', { startMinutes: 540, endMinutes: 1080 }), true);
});

test('playground demo não altera dados de produção', async () => {
  const result = await runPlayground({
    configuration: { companyName: 'Acme', services: ['Sites'], disclosableInformation: [] },
    message: 'Preciso de uma proposta urgente',
    providerId: 'demo'
  });
  assert.equal(result.productionDataChanged, false);
  assert.equal(result.qualification.shouldRequestProposal, true);
});
