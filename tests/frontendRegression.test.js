/**
 * @fileoverview Testes automatizados de regressão para o componente `frontendRegression.test`.
 *
 * Responsabilidade delimitada conforme a arquitetura descrita em
 * `docs/ARQUITETURA.md`. Alterações neste arquivo devem preservar os contratos
 * documentados e ser acompanhadas por testes quando afetarem regras de negócio.
 *
 * @module tests/frontendRegression.test
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const html = fs.readFileSync('public/index.html', 'utf8');
const app = fs.readFileSync('public/app.js', 'utf8');
const admin = fs.readFileSync('public/admin.js', 'utf8');

test('dashboard não quebra quando o bloco legado de estatísticas não existe', () => {
  assert.match(app, /async function refreshStats\(\) \{\s*if \(!statsBox\) return;/);
});

test('recuperação de senha e pipeline do cockpit existem na interface', () => {
  assert.match(html, /id="forgotPasswordLink"/);
  assert.match(html, /id="v23Pipeline"/);
  assert.match(app, /forgotPasswordLink\.addEventListener/);
});

test('dados dinâmicos não são interpolados diretamente em onclick', () => {
  assert.doesNotMatch(app, /onclick=[^\n]*escapeAttr\(/);
  assert.doesNotMatch(admin, /onclick=[^\n]*escapeAttr\(/);
  assert.doesNotMatch(app, /onclick=[^\n]*JSON\.stringify\(/);
  assert.match(app, /function jsArg\(/);
  assert.match(admin, /function jsArg\(/);
});

test('cópia de conteúdo usa o texto renderizado em vez de código inline dinâmico', () => {
  assert.match(app, /function copyNearestText\(/);
  assert.match(app, /copyNearestText\(this, '.strategy-message'\)/);
  assert.match(app, /copyNearestText\(this, '.compact-proposal'\)/);
});


test('ficha do CRM registra resposta e atualiza uma etapa visível', () => {
  assert.match(app, /id="reply-modal-\$\{escapeAttr\(leadId\)\}"/);
  assert.match(app, /Analisar e atualizar funil/);
  assert.match(app, /function applyLeadUpdate\(/);
  assert.match(app, /Lead movido de \$\{transition\.from\} para \$\{transition\.to\}/);
});

test('pipeline apresenta reunião e converte status legados', () => {
  assert.match(app, /key: 'REUNIAO'/);
  assert.match(html, /<option>REUNIAO<\/option>/);
  assert.match(app, /RESPONDEU: 'INTERESSADO'/);
  assert.match(app, /QUALIFICANDO: 'INTERESSADO'/);
  assert.match(app, /PERDIDO: 'SEM_INTERESSE'/);
});
