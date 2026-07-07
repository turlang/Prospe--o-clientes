const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const server = fs.readFileSync('src/server.js', 'utf8');

test('server usa middleware admin modularizado', () => {
  assert.match(server, /require\('\.\/middleware\/admin'\)/);
  assert.doesNotMatch(server, /function requireAdmin/);
});

test('server usa serviço de billing modularizado', () => {
  assert.match(server, /require\('\.\/services\/billingService'\)/);
  assert.doesNotMatch(server, /function fetchMercadoPagoPayment/);
});

test('server usa serviço de auditoria administrativa modularizado', () => {
  assert.match(server, /require\('\.\/services\/adminAuditService'\)/);
  assert.doesNotMatch(server, /function writeAdminAudit/);
});
