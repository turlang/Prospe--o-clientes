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
