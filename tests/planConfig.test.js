/**
 * @fileoverview Testes automatizados de regressão para o componente `planConfig.test`.
 *
 * Responsabilidade delimitada conforme a arquitetura descrita em
 * `docs/ARQUITETURA.md`. Alterações neste arquivo devem preservar os contratos
 * documentados e ser acompanhadas por testes quando afetarem regras de negócio.
 *
 * @module tests/planConfig.test
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const { getPlan, getAllPlans, normalizePlan } = require('../src/planConfig');

test('trial possui regra oficial de 10 leads totais', () => {
  const trial = getPlan('trial');
  assert.equal(trial.id, 'trial');
  assert.equal(trial.dailyLeadLimit, 10);
  assert.equal(trial.totalLeadLimit, 10);
  assert.equal(trial.isPaid, false);
  assert.ok(trial.features.some((feature) => feature.includes('10 leads totais')));
});

test('planos pagos continuam sem limite total por padrão', () => {
  const pro = getPlan('pro');
  const agency = getPlan('agency');
  assert.equal(pro.totalLeadLimit, null);
  assert.equal(agency.totalLeadLimit, null);
  assert.equal(pro.isPaid, true);
  assert.equal(agency.isPaid, true);
});

test('normalizePlan retorna trial para entradas inválidas', () => {
  assert.equal(normalizePlan('inexistente'), 'trial');
  assert.equal(normalizePlan(''), 'trial');
  assert.equal(normalizePlan(null), 'trial');
});

test('getAllPlans retorna trial, pro e agency', () => {
  const ids = getAllPlans().map((plan) => plan.id).sort();
  assert.deepEqual(ids, ['agency', 'pro', 'trial']);
});


test('trial oficial prevalece mesmo se o arquivo editável estiver antigo', () => {
  const { updatePlan, getPlan } = require('../src/planConfig');
  const updated = updatePlan('trial', {
    dailyLeadLimit: 20,
    totalLeadLimit: null,
    durationDays: 30,
    features: ['regra antiga de teste', 'limite antigo por dia']
  });

  assert.equal(updated.dailyLeadLimit, 10);
  assert.equal(updated.totalLeadLimit, 10);
  assert.equal(updated.durationDays, 0);
  assert.ok(updated.features.includes('10 leads totais para experimentar'));
  assert.ok(!updated.features.includes('limite antigo por dia'));

  const trial = getPlan('trial');
  assert.equal(trial.dailyLeadLimit, 10);
  assert.equal(trial.totalLeadLimit, 10);
});
