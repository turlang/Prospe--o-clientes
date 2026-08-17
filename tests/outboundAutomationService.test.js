/**
 * @fileoverview Testes unitários do controle Start/Stop do motor outbound.
 *
 * @module tests/outboundAutomationService
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  normalizeMode,
  normalizeChannel,
  normalizeMinScore,
  defaultState
} = require('../src/services/outboundAutomationService');

test('automação nasce parada e preparada para WhatsApp autônomo', () => {
  const state = defaultState('user-1');

  assert.equal(state.status, 'STOPPED');
  assert.equal(state.mode, 'autonomous');
  assert.equal(state.channel, 'whatsapp');
  assert.equal(state.startedAt, null);
});

test('normalização impede modos e canais não suportados no Start', () => {
  assert.equal(normalizeMode('semiautomatic'), 'semiautomatic');
  assert.equal(normalizeMode('qualquer-coisa'), 'autonomous');
  assert.equal(normalizeChannel('email'), 'email');
  assert.equal(normalizeChannel('instagram'), 'whatsapp');
});

test('score mínimo sempre permanece entre zero e cem', () => {
  assert.equal(normalizeMinScore(-10), 0);
  assert.equal(normalizeMinScore(72), 72);
  assert.equal(normalizeMinScore(999), 100);
});
