/**
 * @fileoverview Testes automatizados de regressão para o componente `customerGrowthService.test`.
 *
 * Responsabilidade delimitada conforme a arquitetura descrita em
 * `docs/ARQUITETURA.md`. Alterações neste arquivo devem preservar os contratos
 * documentados e ser acompanhadas por testes quando afetarem regras de negócio.
 *
 * @module tests/customerGrowthService.test
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  buildCustomerGrowthSummary,
  buildReferralMessage,
  buildExpansionMessage,
  inferExpansionOpportunities,
  buildReferralInteraction
} = require('../src/services/customerGrowthService');

test('buildCustomerGrowthSummary cria visão de indicação e expansão para clientes fechados', () => {
  const oldDate = new Date(Date.now() - 25 * 86_400_000).toISOString();
  const data = buildCustomerGrowthSummary([
    { nome: 'Cliente A', status: 'FECHADO', ticketEstimado: 'R$ 2.000,00', interacoes: [{ tipo: 'CLIENTE_FECHADO', data: oldDate }] },
    { nome: 'Lead B', status: 'PROPOSTA', ticketEstimado: 'R$ 1.000,00' }
  ]);

  assert.equal(data.summary.customers, 1);
  assert.equal(data.summary.referralReady, 1);
  assert.equal(data.summary.expansionReady, 1);
  assert.ok(data.summary.estimatedExpansionRevenue > 0);
  assert.equal(data.customers[0].stage, 'EXPANSAO');
  assert.ok(data.recommendations.length >= 1);
});

test('mensagens de indicação e expansão usam linguagem simples', () => {
  const lead = { nome: 'Barbearia Elite', status: 'FECHADO', segmentoComercial: 'barbearia' };
  const referral = buildReferralMessage(lead);
  const expansion = buildExpansionMessage(lead);

  assert.match(referral, /indicação/i);
  assert.match(referral, /Barbearia Elite/);
  assert.match(expansion, /próxima melhoria/i);
});

test('inferExpansionOpportunities identifica oportunidades de pós-venda', () => {
  const opportunities = inferExpansionOpportunities({ nome: 'Clínica Alfa', segmentoComercial: 'clínica odontológica', site: '' });
  assert.ok(opportunities.some((item) => item.type === 'INDICACAO'));
  assert.ok(opportunities.some((item) => item.type === 'EXPANSAO'));
  assert.ok(opportunities.some((item) => item.type === 'RECORRENCIA'));
});

test('buildReferralInteraction registra evento de indicação', () => {
  const interaction = buildReferralInteraction({ message: 'Mensagem de teste' });
  assert.equal(interaction.tipo, 'PEDIDO_INDICACAO_GERADO');
  assert.equal(interaction.status, 'FECHADO');
  assert.equal(interaction.mensagem, 'Mensagem de teste');
});
