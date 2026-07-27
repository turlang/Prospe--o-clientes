/**
 * @fileoverview Testes automatizados de regressão para o componente `customerSuccessService.test`.
 *
 * Responsabilidade delimitada conforme a arquitetura descrita em
 * `docs/ARQUITETURA.md`. Alterações neste arquivo devem preservar os contratos
 * documentados e ser acompanhadas por testes quando afetarem regras de negócio.
 *
 * @module tests/customerSuccessService.test
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  estimateTicketValue,
  buildCustomerSuccessSummary,
  buildCloseInteraction,
  buildLostInteraction
} = require('../src/services/customerSuccessService');

test('estimateTicketValue normaliza moeda brasileira e tickets textuais', () => {
  assert.equal(estimateTicketValue('R$ 2.500,00'), 2500);
  assert.equal(estimateTicketValue('alto'), 3000);
  assert.equal(estimateTicketValue('baixo'), 900);
});

test('buildCustomerSuccessSummary resume clientes fechados e pipeline aberto', () => {
  const data = buildCustomerSuccessSummary([
    { nome: 'Cliente A', status: 'FECHADO', ticketEstimado: 'R$ 2.000,00', interacoes: [{ tipo: 'CLIENTE_FECHADO', data: '2026-01-01T00:00:00.000Z' }] },
    { nome: 'Lead B', status: 'PROPOSTA', ticketEstimado: 'R$ 1.000,00' },
    { nome: 'Lead C', status: 'INTERESSADO', ticketEstimado: 'baixo' }
  ]);

  assert.equal(data.summary.customers, 1);
  assert.equal(data.summary.totalRevenue, 2000);
  assert.equal(data.summary.openPipeline, 1900);
  assert.equal(data.customers[0].name, 'Cliente A');
  assert.ok(data.recommendations.length >= 1);
});

test('buildCloseInteraction e buildLostInteraction registram eventos comerciais', () => {
  const close = buildCloseInteraction({ revenue: 'R$ 1.500,00', note: 'Fechou no WhatsApp' });
  assert.equal(close.tipo, 'CLIENTE_FECHADO');
  assert.equal(close.status, 'FECHADO');
  assert.equal(close.receita, 1500);

  const lost = buildLostInteraction({ reason: 'Já tem fornecedor' });
  assert.equal(lost.tipo, 'OPORTUNIDADE_PERDIDA');
  assert.equal(lost.status, 'SEM_INTERESSE');
  assert.equal(lost.motivo, 'Já tem fornecedor');
});
