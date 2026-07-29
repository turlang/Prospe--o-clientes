/**
 * @fileoverview Regressão do processamento de respostas recebidas de leads.
 * @module tests/conversationEngine.test
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const { analyzeLeadResponse } = require('../src/domain/conversations/conversationEngine');

test('resposta positiva move contato para interessado', () => {
  const result = analyzeLeadResponse('Sim, pode me enviar mais detalhes.', { status: 'CONTATADO', nome: 'Empresa A' });
  assert.equal(result.intent, 'POSITIVA');
  assert.equal(result.previousStatus, 'CONTATADO');
  assert.equal(result.status, 'INTERESSADO');
  assert.equal(result.statusChanged, true);
  assert.ok(result.respostaSugerida.length > 20);
});

test('pedido de preço permanece em etapa visível do funil', () => {
  const result = analyzeLeadResponse('Qual é o valor?', { status: 'CONTATADO' });
  assert.equal(result.intent, 'PRECO');
  assert.equal(result.status, 'INTERESSADO');
  assert.notEqual(result.status, 'QUALIFICANDO');
});

test('resposta neutra é registrada como interesse, não como etapa invisível', () => {
  const result = analyzeLeadResponse('Obrigado pelo contato, poderia explicar melhor?', { status: 'CONTATADO' });
  assert.equal(result.status, 'INTERESSADO');
  assert.notEqual(result.status, 'RESPONDEU');
});

test('resposta negativa usa a coluna canônica sem interesse', () => {
  const result = analyzeLeadResponse('Não tenho interesse agora.', { status: 'CONTATADO' });
  assert.equal(result.intent, 'NEGATIVA');
  assert.equal(result.status, 'SEM_INTERESSE');
  assert.notEqual(result.status, 'PERDIDO');
});

test('resposta não faz proposta voltar para interessado', () => {
  const result = analyzeLeadResponse('Sim, podemos conversar.', { status: 'PROPOSTA' });
  assert.equal(result.status, 'PROPOSTA');
  assert.equal(result.statusChanged, false);
});
