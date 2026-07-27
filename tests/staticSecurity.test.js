/**
 * @fileoverview Testes estáticos para preservar configurações essenciais de segurança.
 *
 * A inspeção textual complementa testes unitários ao impedir a remoção acidental
 * de proteções durante refatorações estruturais.
 *
 * @module tests/staticSecurity.test
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const app = fs.readFileSync('src/app.js', 'utf8');
const systemRoutes = fs.readFileSync('src/routes/systemRoutes.js', 'utf8');
const auth = fs.readFileSync('src/middleware/auth.js', 'utf8');

test('rotas de diagnóstico exigem autenticação administrativa', () => {
  assert.match(systemRoutes, /app\.get\('\/api\/diagnostico-env', requireAuth, requireAdmin/);
  assert.match(systemRoutes, /app\.get\('\/api\/testar-google', requireAuth, requireAdmin/);
});

test('Helmet mantém CSP habilitada', () => {
  assert.match(app, /app\.use\(helmet\(/);
  assert.doesNotMatch(app, /helmet\(\{\s*contentSecurityPolicy:\s*false\s*\}\)/);
});

test('JWT_SECRET padrão é bloqueado em produção', () => {
  assert.match(auth, /JWT_SECRET obrigatório em produção/);
  assert.match(auth, /NODE_ENV/);
});

test('frontend legado permanece funcional sob a CSP temporária', () => {
  assert.match(app, /scriptSrc:\s*\["'self'",\s*"'unsafe-inline'"\]/);
  assert.match(app, /scriptSrcAttr:\s*\["'unsafe-inline'"\]/);
});
