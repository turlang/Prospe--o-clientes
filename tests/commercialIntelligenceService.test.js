const test = require('node:test');
const assert = require('node:assert/strict');
const {
  buildCommercialIntelligence,
  buildNextBestAction,
  buildObjectionResponse,
  scoreDynamicPriority
} = require('../src/services/commercialIntelligenceService');

test('V21 prioriza lead interessado sem próximo passo', () => {
  const now = new Date('2026-07-09T12:00:00.000Z');
  const leads = [
    { placeId: 'a', nome: 'Lead Novo', status: 'NOVO', score: 40, coletadoEm: '2026-07-09T10:00:00.000Z' },
    { placeId: 'b', nome: 'Lead Interessado', status: 'INTERESSADO', score: 65, coletadoEm: '2026-07-01T10:00:00.000Z' }
  ];

  const result = buildCommercialIntelligence(leads, [], now);

  assert.equal(result.summary.activeLeads, 2);
  assert.equal(result.nextActions[0].leadName, 'Lead Interessado');
  assert.equal(result.nextActions[0].action, 'Conduzir para proposta ou reunião');
  assert.ok(result.managerAdvice.some((item) => item.includes('interessado')));
});

test('V21 detecta tarefa atrasada como próxima melhor ação', () => {
  const now = new Date('2026-07-09T12:00:00.000Z');
  const lead = { placeId: 'x', nome: 'Lead X', status: 'CONTATADO', score: 70, coletadoEm: '2026-07-05T10:00:00.000Z' };
  const tasks = [{ id: 't1', leadId: 'x', title: 'Ligar', dueAt: '2026-07-08T10:00:00.000Z', automationType: 'LIGAÇÃO' }];

  const action = buildNextBestAction(lead, tasks, now);

  assert.equal(action.action, 'Executar tarefa atrasada');
  assert.equal(action.taskId, 't1');
});

test('V21 reduz prioridade de leads fechados', () => {
  const now = new Date('2026-07-09T12:00:00.000Z');
  const aberto = scoreDynamicPriority({ status: 'PROPOSTA', score: 70 }, [], now);
  const fechado = scoreDynamicPriority({ status: 'FECHADO', score: 90 }, [], now);

  assert.ok(aberto > fechado);
});

test('V21 gera resposta simples para objeção de preço', () => {
  const response = buildObjectionResponse('Achei caro', { nome: 'Barbearia Elite' });

  assert.match(response, /Barbearia Elite/);
  assert.match(response, /diagnóstico/i);
});
