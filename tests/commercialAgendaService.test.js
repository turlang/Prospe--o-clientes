/**
 * @fileoverview Testes automatizados de regressão para o componente `commercialAgendaService.test`.
 *
 * Responsabilidade delimitada conforme a arquitetura descrita em
 * `docs/ARQUITETURA.md`. Alterações neste arquivo devem preservar os contratos
 * documentados e ser acompanhadas por testes quando afetarem regras de negócio.
 *
 * @module tests/commercialAgendaService.test
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const { buildAgendaSummary, normalizePriority } = require('../src/services/commercialAgendaService');

test('Agenda comercial agrupa tarefas por urgência', () => {
  const now = new Date('2026-07-09T12:00:00.000Z');
  const result = buildAgendaSummary([
    { id: '1', title: 'Atrasada', dueAt: '2026-07-08T10:00:00.000Z', priority: 'ALTA' },
    { id: '2', title: 'Hoje', dueAt: '2026-07-09T15:00:00.000Z', priority: 'MÉDIA' },
    { id: '3', title: 'Próxima', dueAt: '2026-07-12T15:00:00.000Z', priority: 'BAIXA' },
    { id: '4', title: 'Concluída', dueAt: '2026-07-09T09:00:00.000Z', done: true }
  ], now);

  assert.equal(result.summary.overdue, 1);
  assert.equal(result.summary.today, 1);
  assert.equal(result.summary.upcoming, 1);
  assert.equal(result.summary.completed, 1);
  assert.equal(result.summary.pending, 3);
});

test('Agenda prioriza próxima melhor ação por prioridade e prazo', () => {
  const now = new Date('2026-07-09T12:00:00.000Z');
  const result = buildAgendaSummary([
    { id: '1', title: 'Baixa', leadName: 'Lead A', dueAt: '2026-07-09T13:00:00.000Z', priority: 'BAIXA' },
    { id: '2', title: 'Alta', leadName: 'Lead B', dueAt: '2026-07-09T16:00:00.000Z', priority: 'ALTA' }
  ], now);

  assert.equal(result.summary.nextTask.title, 'Alta');
  assert.equal(result.summary.highPriority, 1);
});

test('normalizePriority mantém fallback seguro', () => {
  assert.equal(normalizePriority('urgente'), 'ALTA');
  assert.equal(normalizePriority('baixa'), 'BAIXA');
  assert.equal(normalizePriority('qualquer'), 'MÉDIA');
});
