const test = require('node:test');
const assert = require('node:assert/strict');
const { safeJsonParse, buildPrompt } = require('../src/services/aiApproachService');
const { buildSalesApproach } = require('../src/services/salesStrategyEngine');

test('safeJsonParse extrai JSON válido mesmo com texto ao redor', () => {
  const parsed = safeJsonParse('resposta: {"abordagem":"Olá","followUps":[]} fim');
  assert.equal(parsed.abordagem, 'Olá');
});

test('prompt de IA contém contexto do lead e regra de personalização', () => {
  const local = buildSalesApproach({
    nome: 'Barbearia Elite',
    segmentoComercial: 'Barbearia',
    score: 88,
    telefone: '(11) 99999-9999'
  }, { variationSeed: 'teste' });

  const prompt = buildPrompt({
    leadContext: local.leadContext,
    localRecommendation: local,
    regenerateKey: 'teste-123'
  });

  assert.ok(prompt.includes('Barbearia Elite'));
  assert.ok(prompt.includes('regenerateKey: teste-123'));
  assert.ok(prompt.includes('Retorne SOMENTE JSON válido'));
});
