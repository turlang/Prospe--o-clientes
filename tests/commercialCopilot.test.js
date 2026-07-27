/**
 * @fileoverview Testes automatizados de regressão para o componente `commercialCopilot.test`.
 *
 * Responsabilidade delimitada conforme a arquitetura descrita em
 * `docs/ARQUITETURA.md`. Alterações neste arquivo devem preservar os contratos
 * documentados e ser acompanhadas por testes quando afetarem regras de negócio.
 *
 * @module tests/commercialCopilot.test
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const { buildCommercialContext } = require('../src/core/intelligence/copilotContextBuilder');
const { localCopilotAnswer, buildCopilotPrompt } = require('../src/core/ai/commercialCopilot');

const leads = [
  { placeId: 'a', nome: 'Barbearia Elite', status: 'PROPOSTA', score: 92, ticketEstimado: 'R$ 2.500', interacoes: [{ tipo: 'PROPOSTA_GERADA', data: '2026-07-01T10:00:00Z' }] },
  { placeId: 'b', nome: 'Clínica Vida', status: 'CONTATADO', score: 75, ticketEstimado: 'R$ 4.000' }
];
const tasks = [{ id: 't1', leadId: 'a', leadName: 'Barbearia Elite', title: 'Retomar proposta', dueAt: '2026-07-08T10:00:00Z', priority: 'ALTA', done: false }];

test('contexto do copiloto integra métricas, leads e tarefas', () => {
  const context = buildCommercialContext({ leads, tasks, now: new Date('2026-07-09T12:00:00Z') });
  assert.equal(context.topLeads[0].nome, 'Barbearia Elite');
  assert.equal(context.pendingTasks.length, 1);
  assert.ok(context.metrics);
  assert.ok(Array.isArray(context.pipeline));
});

test('copiloto local prioriza lead com proposta', () => {
  const context = buildCommercialContext({ leads, tasks, now: new Date('2026-07-09T12:00:00Z') });
  const result = localCopilotAnswer('Quais propostas estão paradas?', context);
  assert.match(result.answer, /proposta/i);
  assert.ok(result.recommendedActions.some((item) => item.includes('Barbearia Elite')));
});

test('prompt do copiloto inclui pergunta, contexto e histórico', () => {
  const prompt = buildCopilotPrompt({ question: 'Quem devo ligar?', context: { metrics: { atRisk: 2 } }, history: [{ role: 'user', content: 'Olá' }] });
  assert.match(prompt, /Quem devo ligar/);
  assert.match(prompt, /atRisk/);
  assert.match(prompt, /HISTÓRICO RECENTE/);
});
