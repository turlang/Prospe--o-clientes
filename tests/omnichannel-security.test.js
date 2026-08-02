/**
 * @fileoverview Testes de isolamento e mass assignment do domínio omnichannel.
 *
 * Garante que campos de propriedade, identificadores internos e prompts
 * compilados não possam ser definidos diretamente pelo corpo HTTP.
 *
 * @module tests/omnichannel-security.test
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  AGENT_MUTABLE_FIELDS,
  pickAgentInput
} = require('../src/controllers/omnichannelController');

test('configuração do agente aceita somente campos comerciais autorizados', () => {
  const result = pickAgentInput({
    name: 'Agente Comercial',
    tone: 'consultivo',
    products: ['Sites'],
    userId: 'outro-usuario',
    organizationId: 'outra-organizacao',
    compiledPrompt: 'prompt injetado',
    createdAt: '2000-01-01T00:00:00.000Z',
    unknownField: true
  });

  assert.deepEqual(result, {
    name: 'Agente Comercial',
    tone: 'consultivo',
    products: ['Sites']
  });
  assert.equal(Object.hasOwn(result, 'userId'), false);
  assert.equal(Object.hasOwn(result, 'organizationId'), false);
  assert.equal(Object.hasOwn(result, 'compiledPrompt'), false);
});

test('lista de campos mutáveis não contém identidade nem dados gerados', () => {
  for (const forbidden of [
    '_id',
    'userId',
    'organizationId',
    'compiledPrompt',
    'createdAt',
    'updatedAt'
  ]) {
    assert.equal(AGENT_MUTABLE_FIELDS.includes(forbidden), false, `Campo proibido exposto: ${forbidden}`);
  }
});
