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
