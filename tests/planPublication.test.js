/**
 * @fileoverview Regressão da publicação dinâmica dos planos na landing page.
 *
 * @module tests/planPublication.test
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const {
  parseBrazilianPrice,
  serializePublicPlan
} = require('../src/services/publicPlanService');

test('preço administrativo em pt-BR é convertido sem virar zero', () => {
  assert.equal(parseBrazilianPrice('R$ 59/mês'), 59);
  assert.equal(parseBrazilianPrice('R$ 199,90/mês'), 199.9);
  assert.equal(parseBrazilianPrice('R$ 1.299,00/mês'), 1299);
});

test('DTO público preserva preço, período, descrição e benefícios', () => {
  const plan = serializePublicPlan({
    id: 'pro',
    name: 'Pro Plus',
    description: 'Plano atualizado pelo administrador.',
    priceLabel: 'R$ 89,90/mês',
    durationDays: 30,
    dailyLeadLimit: 750,
    totalLeadLimit: null,
    isPaid: true,
    features: ['750 leads por dia']
  });

  assert.equal(plan.price, 89.9);
  assert.equal(plan.displayPrice, 'R$ 89,90');
  assert.equal(plan.billingPeriod, 'mês');
  assert.equal(plan.description, 'Plano atualizado pelo administrador.');
  assert.deepEqual(plan.features, ['750 leads por dia']);
});

test('landing e API desativam cache e revalidam alterações administrativas', () => {
  const systemRoutes = fs.readFileSync('src/routes/systemRoutes.js', 'utf8');
  const plansApi = fs.readFileSync('frontend/landing/src/services/plansApi.js', 'utf8');
  const plansHook = fs.readFileSync('frontend/landing/src/hooks/usePlans.js', 'utf8');
  const pricing = fs.readFileSync('frontend/landing/src/features/pricing/PricingSection.jsx', 'utf8');
  const admin = fs.readFileSync('public/assets/admin/admin.js', 'utf8');
  const staticLanding = fs.readFileSync('public/landing-static.js', 'utf8');

  assert.match(systemRoutes, /Cache-Control', 'no-store, no-cache/);
  assert.match(systemRoutes, /X-Plans-Revision/);
  assert.match(plansApi, /cache: 'no-store'/);
  assert.match(plansHook, /BroadcastChannel/);
  assert.match(plansHook, /visibilitychange/);
  assert.match(pricing, /plan\.displayPrice \|\| plan\.priceLabel/);
  assert.match(admin, /notifyPublicPlansUpdated/);
  assert.match(staticLanding, /plan\.displayPrice \|\| plan\.priceLabel/);
});

test('configuração administrativa possui persistência MongoDB', () => {
  const catalog = fs.readFileSync('src/domain/plans/planCatalog.js', 'utf8');
  const server = fs.readFileSync('src/server.js', 'utf8');
  const model = fs.readFileSync('src/models/PlanConfiguration.js', 'utf8');

  assert.match(catalog, /initializePlanCatalog/);
  assert.match(catalog, /updatePlanPersistent/);
  assert.match(catalog, /findOneAndUpdate/);
  assert.match(server, /initializePlanCatalog/);
  assert.match(model, /plan_configurations/);
});
