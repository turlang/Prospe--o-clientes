/**
 * @fileoverview Testes automatizados de regressão para o componente `autonomousCommercialService.test`.
 *
 * Responsabilidade delimitada conforme a arquitetura descrita em
 * `docs/ARQUITETURA.md`. Alterações neste arquivo devem preservar os contratos
 * documentados e ser acompanhadas por testes quando afetarem regras de negócio.
 *
 * @module tests/autonomousCommercialService.test
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const { buildAutonomousCommandCenter, buildPipelineHealth, buildLocalCopilotAnswer } = require('../src/services/autonomousCommercialService');

test('V22 cria central autônoma com prioridades, previsão e saúde do pipeline', () => {
  const now = new Date('2026-07-10T12:00:00Z');
  const leads = [
    { placeId: '1', nome: 'Lead A', status: 'PROPOSTA', score: 80, ticketEstimado: 'R$ 2.000', coletadoEm: '2026-07-01T10:00:00Z', interacoes: [] },
    { placeId: '2', nome: 'Lead B', status: 'NOVO', score: 65, coletadoEm: '2026-07-09T10:00:00Z', interacoes: [] }
  ];
  const tasks = [{ id: 't1', leadId: '1', title: 'Retomar proposta', dueAt: '2026-07-09T10:00:00Z', done: false }];
  const center = buildAutonomousCommandCenter(leads, tasks, now);
  assert.equal(center.version, '22.0.0');
  assert.equal(center.summary.overdueTasks, 1);
  assert.equal(center.forecast.proposals, 1);
  assert.ok(center.dailyPlan.length >= 1);
  assert.equal(center.pipelineHealth.stages.length, 5);
});

test('copiloto local responde perguntas sobre receita sem inventar fonte externa', () => {
  const answer = buildLocalCopilotAnswer('qual a previsão de receita?', { summary: { weightedRevenue: 1500, openOpportunities: 2 } });
  assert.match(answer, /1\.500/);
  assert.match(answer, /2 oportunidade/);
});

test('saúde do pipeline calcula taxas de avanço', () => {
  const leads = [
    { status: 'NOVO' }, { status: 'CONTATADO' }, { status: 'INTERESSADO' }, { status: 'PROPOSTA' }
  ];
  const health = buildPipelineHealth(leads, new Date('2026-07-10T12:00:00Z'));
  assert.equal(health.rates.contactRate, 75);
  assert.equal(health.rates.interestRate, 67);
  assert.equal(health.rates.proposalRate, 50);
});
