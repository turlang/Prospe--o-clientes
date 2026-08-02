/**
 * @fileoverview Regressões da composição da aplicação HTTP.
 *
 * Estes testes não dependem de pacotes externos. Eles validam o contrato de
 * injeção entre `app.js` e os módulos de rota, cobrindo a falha que encerrou o
 * processo no Render antes da versão 23.9.1.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { registerCommercialRoutes } = require('../src/routes/commercialRoutes');

const projectRoot = path.join(__dirname, '..');

test('Application Factory injeta simpleRateLimit no contexto das rotas', () => {
  const appSource = fs.readFileSync(path.join(projectRoot, 'src', 'app.js'), 'utf8');
  const routeContext = appSource.match(/const routeContext\s*=\s*\{([\s\S]*?)\n\s*\};/);

  assert.ok(routeContext, 'O objeto routeContext deve existir em app.js.');
  assert.match(routeContext[1], /\bsimpleRateLimit\b/, 'simpleRateLimit deve ser injetado no routeContext.');
});

test('commercialRoutes registra o copiloto com o limitador injetado', () => {
  const registered = [];
  const app = {};

  for (const method of ['get', 'post', 'patch', 'delete']) {
    app[method] = (route, ...handlers) => {
      registered.push({ method, route, handlers });
      return app;
    };
  }

  const middleware = (_req, _res, next) => next?.();
  const context = new Proxy({
    requireAuth: middleware,
    simpleRateLimit: (options) => {
      assert.deepEqual(options, { windowMs: 60_000, max: 20 });
      return middleware;
    }
  }, {
    get(target, property) {
      if (property in target) return target[property];
      return () => undefined;
    }
  });

  assert.doesNotThrow(() => registerCommercialRoutes(app, context));
  assert.ok(
    registered.some((item) => item.method === 'post' && item.route === '/api/v22/copilot'),
    'A rota do copiloto deve ser registrada durante o bootstrap.'
  );
});

test('PasswordReset possui apenas o índice TTL de expiresAt', () => {
  const modelSource = fs.readFileSync(path.join(projectRoot, 'src', 'models', 'PasswordReset.js'), 'utf8');

  assert.doesNotMatch(
    modelSource,
    /expiresAt\s*:\s*\{[^}]*index\s*:\s*true/,
    'expiresAt não deve declarar index: true junto com schema.index().'
  );
  assert.match(
    modelSource,
    /passwordResetSchema\.index\(\{\s*expiresAt\s*:\s*1\s*\},\s*\{\s*expireAfterSeconds\s*:\s*0\s*\}\)/,
    'O índice TTL de expiresAt deve ser preservado.'
  );
});
