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
