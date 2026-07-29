/**
 * @fileoverview Regressões estruturais da ferramenta administrativa de limpeza.
 *
 * @module tests/adminDatabaseResetRegression.test
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const routes = fs.readFileSync('src/routes/adminRoutes.js', 'utf8');
const app = fs.readFileSync('src/app.js', 'utf8');
const html = fs.readFileSync('public/pages/admin.html', 'utf8');
const frontend = fs.readFileSync('public/assets/admin/admin.js', 'utf8');

test('rotas de limpeza exigem autenticação e papel administrativo', () => {
  assert.match(routes, /\/api\/admin\/database-reset\/preview', requireAuth, requireAdmin/);
  assert.match(routes, /\/api\/admin\/database-reset', requireAuth, requireAdmin/);
  assert.match(routes, /executeDatabaseReset/);
});

test('aplicação injeta serviço e bloqueia mutações durante a reinicialização', () => {
  assert.match(app, /createDatabaseResetService/);
  assert.match(app, /CopilotConversation/);
  assert.match(app, /verifyPassword: bcrypt\.compare/);
  assert.match(app, /databaseResetService\.isResetInProgress\(\)/);
  assert.match(app, /status\(503\)/);
});

test('painel apresenta zona de perigo e confirmação reforçada', () => {
  assert.match(html, /Zona de perigo — reinicializar banco/);
  assert.match(html, /databaseResetPassword/);
  assert.match(html, /REINICIAR LEADHUNTER/);
  assert.match(frontend, /loadDatabaseResetPreview/);
  assert.match(frontend, /window\.confirm/);
});
