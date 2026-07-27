/**
 * @fileoverview Testes das etapas canônicas e da compatibilidade do funil.
 * @module tests/leadStatus.test
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  LEAD_STATUS_ORDER,
  normalizeLeadStatus,
  resolveResponseStatus
} = require('../src/domain/leadStatus');

test('funil canônico inclui reunião e não expõe estados internos', () => {
  assert.deepEqual(LEAD_STATUS_ORDER, [
    'NOVO', 'CONTATADO', 'INTERESSADO', 'REUNIAO', 'PROPOSTA', 'FECHADO', 'SEM_INTERESSE'
  ]);
  assert.equal(LEAD_STATUS_ORDER.includes('RESPONDEU'), false);
  assert.equal(LEAD_STATUS_ORDER.includes('QUALIFICANDO'), false);
  assert.equal(LEAD_STATUS_ORDER.includes('PERDIDO'), false);
});

test('status legados são migrados para colunas visíveis', () => {
  assert.equal(normalizeLeadStatus('RESPONDEU'), 'INTERESSADO');
  assert.equal(normalizeLeadStatus('QUALIFICANDO'), 'INTERESSADO');
  assert.equal(normalizeLeadStatus('PERDIDO'), 'SEM_INTERESSE');
  assert.equal(normalizeLeadStatus('REUNIAO_AGENDADA'), 'REUNIAO');
});

test('resposta não regride oportunidade já avançada', () => {
  assert.equal(resolveResponseStatus('PROPOSTA', 'INTERESSADO'), 'PROPOSTA');
  assert.equal(resolveResponseStatus('REUNIAO', 'INTERESSADO'), 'REUNIAO');
  assert.equal(resolveResponseStatus('CONTATADO', 'INTERESSADO'), 'INTERESSADO');
});

test('resposta negativa encerra oportunidade, mas não desfaz cliente fechado', () => {
  assert.equal(resolveResponseStatus('PROPOSTA', 'SEM_INTERESSE'), 'SEM_INTERESSE');
  assert.equal(resolveResponseStatus('FECHADO', 'SEM_INTERESSE'), 'FECHADO');
});
