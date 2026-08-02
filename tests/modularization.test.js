/**
 * @fileoverview Testes estruturais da modularização da camada HTTP.
 *
 * Estes testes impedem que bootstrap, composição e domínios de rota voltem a
 * ser concentrados silenciosamente em um único arquivo.
 *
 * @module tests/modularization.test
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const server = fs.readFileSync('src/server.js', 'utf8');
const app = fs.readFileSync('src/app.js', 'utf8');
const systemRoutes = fs.readFileSync('src/routes/systemRoutes.js', 'utf8');
const billingRoutes = fs.readFileSync('src/routes/billingRoutes.js', 'utf8');
const leadRoutes = fs.readFileSync('src/routes/leadRoutes.js', 'utf8');
const adminRoutes = fs.readFileSync('src/routes/adminRoutes.js', 'utf8');
const commercialRoutes = fs.readFileSync('src/routes/commercialRoutes.js', 'utf8');

test('bootstrap não declara rotas da aplicação', () => {
  assert.match(server, /async function startServer/);
  assert.match(server, /createApp/);
  assert.doesNotMatch(server, /app\.(get|post|patch|delete)\(/);
});

test('aplicação usa factory e registra módulos por domínio', () => {
  assert.match(app, /function createApp\(\)/);
  assert.match(app, /registerSystemRoutes/);
  assert.match(app, /registerBillingRoutes/);
  assert.match(app, /registerLeadRoutes/);
  assert.match(app, /registerAdminRoutes/);
  assert.match(app, /registerCommercialRoutes/);
  assert.doesNotMatch(app, /app\.listen\(/);
});

test('rotas estão distribuídas conforme o domínio', () => {
  assert.match(systemRoutes, /\/api\/health/);
  assert.match(billingRoutes, /\/api\/billing\/checkout/);
  assert.match(leadRoutes, /\/api\/prospectar/);
  assert.match(adminRoutes, /\/api\/admin\/users/);
  assert.match(commercialRoutes, /\/api\/reports\/commercial/);
});

test('serviços transversais continuam modularizados', () => {
  assert.match(app, /require\('\.\/middleware\/admin'\)/);
  assert.match(app, /require\('\.\/services\/billingService'\)/);
  assert.match(app, /require\('\.\/services\/adminAuditService'\)/);
  assert.doesNotMatch(app, /function requireAdmin/);
  assert.doesNotMatch(app, /function fetchMercadoPagoPayment/);
  assert.doesNotMatch(app, /function writeAdminAudit/);
});
