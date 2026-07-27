/**
 * @fileoverview Testes automatizados de regressão para o componente `commercialReportService.test`.
 *
 * Responsabilidade delimitada conforme a arquitetura descrita em
 * `docs/ARQUITETURA.md`. Alterações neste arquivo devem preservar os contratos
 * documentados e ser acompanhadas por testes quando afetarem regras de negócio.
 *
 * @module tests/commercialReportService.test
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  buildCommercialReport,
  buildCommercialReportCsv,
  estimateTicketValue,
  buildStalledLeads
} = require('../src/services/commercialReportService');

test('V21.1 gera relatório comercial com funil e métricas principais', () => {
  const now = new Date('2026-07-09T12:00:00.000Z');
  const leads = [
    { placeId: '1', nome: 'A', status: 'NOVO', ticketEstimado: 'R$ 1.000', segmentoComercial: 'Barbearia', coletadoEm: '2026-07-08T12:00:00.000Z' },
    { placeId: '2', nome: 'B', status: 'CONTATADO', ticketEstimado: 'R$ 2.000', segmentoComercial: 'Barbearia', coletadoEm: '2026-07-01T12:00:00.000Z' },
    { placeId: '3', nome: 'C', status: 'PROPOSTA', ticketEstimado: 'R$ 3.000', segmentoComercial: 'Clínica', coletadoEm: '2026-07-06T12:00:00.000Z' },
    { placeId: '4', nome: 'D', status: 'FECHADO', ticketEstimado: 'R$ 4.000', segmentoComercial: 'Clínica', coletadoEm: '2026-07-05T12:00:00.000Z' }
  ];
  const report = buildCommercialReport(leads, [], now);

  assert.equal(report.summary.totalLeads, 4);
  assert.equal(report.summary.contacted, 3);
  assert.equal(report.summary.closed, 1);
  assert.equal(report.summary.contactRate, 75);
  assert.equal(report.funnel.find((item) => item.status === 'PROPOSTA').total, 1);
  assert.ok(report.bySegment.length >= 2);
  assert.ok(report.recommendations.length >= 1);
});

test('V21.1 detecta leads parados sem tarefa pendente', () => {
  const now = new Date('2026-07-09T12:00:00.000Z');
  const stalled = buildStalledLeads([
    { placeId: 'x', nome: 'Lead Parado', status: 'CONTATADO', coletadoEm: '2026-07-01T12:00:00.000Z' }
  ], [], now);

  assert.equal(stalled.length, 1);
  assert.equal(stalled[0].reason, 'Sem próxima tarefa');
});

test('V21.1 estima ticket comercial a partir de texto', () => {
  assert.equal(estimateTicketValue('R$ 2.500'), 2500);
  assert.equal(estimateTicketValue('alto'), 3000);
  assert.equal(estimateTicketValue(''), 1200);
});

test('V21.1 exporta relatório em CSV simples', () => {
  const report = buildCommercialReport([{ nome: 'Lead', status: 'FECHADO', ticketEstimado: 1000 }], [], new Date('2026-07-09T12:00:00.000Z'));
  const csv = buildCommercialReportCsv(report);
  assert.match(csv, /Métrica/);
  assert.match(csv, /FECHADO/);
});
