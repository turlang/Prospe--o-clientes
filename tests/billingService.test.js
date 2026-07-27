const test = require('node:test');
const assert = require('node:assert/strict');
const {
  getPlanPrice,
  getPlanDurationDays,
  getPlanExpirationDate,
  parsePlanPrice
} = require('../src/services/billingService');

test('billing service calcula preço dos planos pagos', () => {
  assert.equal(getPlanPrice('pro'), 59);
  assert.equal(getPlanPrice('agency'), 199);
});

test('billing service usa duração configurada do plano', () => {
  assert.equal(getPlanDurationDays('pro'), 30);
  assert.equal(getPlanDurationDays('agency'), 30);
});

test('billing service calcula expiração futura para plano pago', () => {
  const expiresAt = getPlanExpirationDate('pro');
  assert.ok(expiresAt instanceof Date);
  assert.ok(expiresAt.getTime() > Date.now());
});

test('billing service converte preço em formato brasileiro', () => {
  assert.equal(parsePlanPrice('R$ 1.999,90'), 1999.9);
  assert.equal(parsePlanPrice('R$ 59,00'), 59);
});
