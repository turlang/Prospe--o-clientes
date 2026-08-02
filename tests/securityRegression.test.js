/**
 * @fileoverview Testes automatizados de regressão para o componente `securityRegression.test`.
 *
 * Responsabilidade delimitada conforme a arquitetura descrita em
 * `docs/ARQUITETURA.md`. Alterações neste arquivo devem preservar os contratos
 * documentados e ser acompanhadas por testes quando afetarem regras de negócio.
 *
 * @module tests/securityRegression.test
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const app = fs.readFileSync('src/app.js', 'utf8');
const billingRoutes = fs.readFileSync('src/routes/billingRoutes.js', 'utf8');
const leadRoutes = fs.readFileSync('src/routes/leadRoutes.js', 'utf8');
const billing = fs.readFileSync('src/services/billingService.js', 'utf8');
const auth = fs.readFileSync('src/middleware/auth.js', 'utf8');
const authRoutes = fs.readFileSync('src/routes/authRoutes.js', 'utf8');
const database = fs.readFileSync('src/infrastructure/database/mongoConnection.js', 'utf8');
const scorer = fs.readFileSync('src/domain/leads/leadScoring.js', 'utf8');

test('checkout simulado é explicitamente bloqueável e sincronização valida proprietário', () => {
  assert.match(billingRoutes, /if \(!isSimulatedBillingAllowed\(\)\)/);
  assert.match(billingRoutes, /expectedUserId: req\.user\.sub/);
  assert.match(billing, /pagamento informado não pertence ao usuário autenticado/);
  assert.match(billing, /encodeURIComponent\(normalizedPaymentId\)/);
});

test('sessão consulta usuário atual e é invalidada após troca de senha', () => {
  assert.match(auth, /loadActiveUser\(payload\.sub\)/);
  assert.match(auth, /passwordChangedAtSeconds/);
  assert.match(authRoutes, /passwordChangedAt/);
  assert.match(authRoutes, /PasswordReset\.findOneAndUpdate/);
});

test('produção exige MongoDB e não aceita fallback local', () => {
  assert.match(database, /NODE_ENV[^\n]*production[^\n]*return true/);
});

test('auditoria de site usa status de validação e limite de entrada', () => {
  assert.match(leadRoutes, /String\(req\.body\.site \|\| ''\)\.trim\(\)\.slice\(0, 2048\)/);
  assert.match(app, /res\.status\(error\.statusCode \|\| 500\)/);
});

test('probabilidade comercial média não contém texto corrompido', () => {
  assert.match(scorer, /'MÉDIA'/);
  assert.doesNotMatch(scorer, /MÉDautomacao/);
});
