const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const server = fs.readFileSync('src/server.js', 'utf8');
const auth = fs.readFileSync('src/middleware/auth.js', 'utf8');

test('rotas de diagnóstico exigem autenticação admin', () => {
  assert.match(server, /app\.get\('\/api\/diagnostico-env', requireAuth, requireAdmin/);
  assert.match(server, /app\.get\('\/api\/testar-google', requireAuth, requireAdmin/);
});

test('Helmet não está com CSP desativada', () => {
  assert.doesNotMatch(server, /helmet\(\{\s*contentSecurityPolicy:\s*false\s*\}\)/);
});

test('JWT_SECRET padrão é bloqueado em produção', () => {
  assert.match(auth, /JWT_SECRET obrigatório em produção/);
  assert.match(auth, /NODE_ENV/);
});


test('frontend legado com onclick permanece funcional sob CSP', () => {
  assert.match(server, /scriptSrc:\s*\["'self'",\s*"'unsafe-inline'"\]/);
});
