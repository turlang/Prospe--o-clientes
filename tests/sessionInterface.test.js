/**
 * @fileoverview Regressão da experiência de autenticação e logout do painel.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const html = fs.readFileSync('public/index.html', 'utf8');
const app = fs.readFileSync('public/app.js', 'utf8');
const css = fs.readFileSync('public/style.css', 'utf8');

test('sessão autenticada usa barra compacta com único botão de logout', () => {
  assert.match(html, /id="sessionBar"/);
  assert.match(html, /id="logout"/);
  assert.equal((html.match(/id="logout"/g) || []).length, 1);
  assert.match(css, /\.session-bar/);
});

test('login esconde apresentação e logout reabre o painel de acesso', () => {
  assert.match(app, /document\.body\.classList\.add\('is-authenticated'\)/);
  assert.match(app, /if \(publicIntro\) publicIntro\.hidden = true/);
  assert.match(app, /showAuth\(\);\s*window\.history\.replaceState/);
  assert.doesNotMatch(app, /logoutButton[\s\S]{0,900}window\.location\.replace\('\/'\)/);
});
