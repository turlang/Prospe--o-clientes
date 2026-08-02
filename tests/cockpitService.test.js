/**
 * @fileoverview Testes automatizados de regressão para o componente `cockpitService.test`.
 *
 * Responsabilidade delimitada conforme a arquitetura descrita em
 * `docs/ARQUITETURA.md`. Alterações neste arquivo devem preservar os contratos
 * documentados e ser acompanhadas por testes quando afetarem regras de negócio.
 *
 * @module tests/cockpitService.test
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const { buildCockpit, buildGlobalTimeline, buildStageMetrics } = require('../src/core/commercial/cockpitService');

test('buildGlobalTimeline ordena interações e tarefas por data', () => {
  const leads = [{ placeId: '1', nome: 'Empresa A', status: 'CONTATADO', interacoes: [{ tipo: 'CONTATO', data: '2026-07-09T10:00:00Z' }] }];
  const tasks = [{ id: 't1', leadId: '1', leadName: 'Empresa A', title: 'Retornar', done: true, updatedAt: '2026-07-09T12:00:00Z' }];
  const timeline = buildGlobalTimeline(leads, tasks);
  assert.equal(timeline.length, 2);
  assert.equal(timeline[0].kind, 'task-completed');
});

test('buildStageMetrics agrega quantidade e valor por etapa', () => {
  const metrics = buildStageMetrics([
    { status: 'PROPOSTA', ticketEstimado: 'R$ 2.000' },
    { status: 'FECHADO', ticketEstimado: 'R$ 3.000' }
  ]);
  assert.equal(metrics.find((item) => item.status === 'PROPOSTA').value, 2000);
  assert.equal(metrics.find((item) => item.status === 'FECHADO').count, 1);
});

test('buildCockpit cria foco, métricas e timeline', () => {
  const cockpit = buildCockpit({
    userName: 'Evandro',
    now: new Date('2026-07-10T12:00:00Z'),
    leads: [{ placeId: '1', nome: 'Empresa A', status: 'PROPOSTA', ticketEstimado: 'R$ 5.000', coletadoEm: '2026-07-08T10:00:00Z', interacoes: [] }],
    tasks: [{ id: 't1', leadId: '1', leadName: 'Empresa A', title: 'Ligar', dueAt: '2026-07-09T12:00:00Z', done: false }]
  });
  assert.equal(cockpit.version, '23.3.0');
  assert.match(cockpit.greeting, /Evandro/);
  assert.equal(cockpit.metrics.proposals, 1);
  assert.ok(Array.isArray(cockpit.timeline));
});
