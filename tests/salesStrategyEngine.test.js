/**
 * @fileoverview Testes automatizados de regressão para o componente `salesStrategyEngine.test`.
 *
 * Responsabilidade delimitada conforme a arquitetura descrita em
 * `docs/ARQUITETURA.md`. Alterações neste arquivo devem preservar os contratos
 * documentados e ser acompanhadas por testes quando afetarem regras de negócio.
 *
 * @module tests/salesStrategyEngine.test
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const { buildSalesApproach, inferSegmentGroup, chooseStrategy } = require('../src/services/salesStrategyEngine');

test('motor identifica segmento de beleza', () => {
  const group = inferSegmentGroup({ nome: 'Barbearia Elite', segmentoComercial: 'Barbearia' });
  assert.equal(group, 'beleza');
});

test('lead forte sem site recebe estratégia consultiva', () => {
  const lead = { nome: 'Barbearia Elite', segmentoComercial: 'Barbearia', score: 86, telefone: '(11) 99999-9999' };
  const strategy = chooseStrategy(lead, 'beleza');
  assert.equal(strategy.id, 'consultiva');
});

test('motor gera mensagem, diagnóstico e sequência de follow-up', () => {
  const result = buildSalesApproach({
    nome: 'Clínica Sorriso',
    segmentoComercial: 'Clínica odontológica',
    score: 72,
    site: '',
    telefone: '(11) 98888-7777',
    dores: ['não encontrei um site próprio para captar pacientes vindos do Google']
  });

  assert.ok(result.abordagem.includes('Clínica Sorriso'));
  assert.ok(result.strategy.name);
  assert.equal(result.diagnostics.hasWebsite, false);
  assert.equal(result.diagnostics.hasWhatsapp, true);
  assert.ok(Array.isArray(result.followUps));
  assert.equal(result.followUps.length, 5);
});

test('motor local evita abordagem excessivamente técnica', () => {
  const result = buildSalesApproach({
    nome: 'Barbearia Elite',
    segmentoComercial: 'Barbearia',
    score: 85,
    telefone: '(11) 98888-7777'
  }, { variationSeed: 'tom-v207' });

  assert.ok(result.abordagem.includes('tecnologia de um jeito simples') || result.abordagem.includes('ajustes pequenos') || result.abordagem.includes('chamar vocês'));
  assert.equal(/SEO|landing page|CRM|automação|funil/i.test(result.abordagem), false);
});

test('Motor local adapta abordagem para canais comerciais', () => {
  const { buildSalesApproach } = require('../src/services/salesStrategyEngine');
  const lead = { nome: 'Barbearia Canal', segmentoComercial: 'Barbearia', telefone: '11999999999', score: 72 };

  const email = buildSalesApproach(lead, { channel: 'email', variationSeed: 'canal-email' });
  assert.ok(email.abordagem.includes('Assunto:'));

  const call = buildSalesApproach(lead, { channel: 'call', variationSeed: 'canal-call' });
  assert.ok(call.abordagem.includes('Roteiro de ligação'));

  const objection = buildSalesApproach(lead, { channel: 'objection', variationSeed: 'canal-objection' });
  assert.ok(/Entendo perfeitamente|sem compromisso/i.test(objection.abordagem));
});
