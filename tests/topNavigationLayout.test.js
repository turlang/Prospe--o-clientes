/**
 * @fileoverview Regressões da barra superior única do dashboard autenticado.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const entry = fs.readFileSync('public/assets/dashboard/styles.css', 'utf8');
const css = fs.readFileSync('public/assets/dashboard/css/95-top-navigation.css', 'utf8');

test('carrega a navegação superior depois das regras responsivas', () => {
  const responsive = entry.indexOf('./css/90-responsive.css');
  const topNavigation = entry.indexOf('./css/95-top-navigation.css');
  assert.ok(responsive >= 0);
  assert.ok(topNavigation > responsive);
});

test('remove a coluna lateral e entrega largura total ao workspace', () => {
  assert.match(css, /body\.is-authenticated \.app-shell,[\s\S]*body\.is-authenticated \.sidebar[\s\S]*display:\s*contents\s*!important/);
  assert.match(css, /body\.is-authenticated \.workspace[\s\S]*grid-row:\s*2/);
  assert.match(css, /body\.is-authenticated \.workspace[\s\S]*width:\s*100%/);
});

test('menu e cabeçalho ocupam a mesma barra visual', () => {
  assert.match(css, /body\.is-authenticated \.session-bar[\s\S]*grid-row:\s*1/);
  assert.match(css, /body\.is-authenticated \.sidebar nav[\s\S]*grid-row:\s*1/);
  assert.match(css, /body\.is-authenticated \.sidebar nav[\s\S]*border:\s*0\s*!important/);
  assert.match(css, /body\.is-authenticated \.sidebar nav[\s\S]*background:\s*transparent\s*!important/);
  assert.match(css, /body\.is-authenticated \.sidebar nav[\s\S]*box-shadow:\s*none\s*!important/);
});

test('menu principal permanece horizontal e rolável sem atropelar itens', () => {
  assert.match(css, /body\.is-authenticated \.sidebar nav[\s\S]*display:\s*flex\s*!important/);
  assert.match(css, /body\.is-authenticated \.sidebar nav[\s\S]*overflow-x:\s*auto\s*!important/);
  assert.match(css, /body\.is-authenticated \.nav-list[\s\S]*display:\s*flex\s*!important/);
  assert.match(css, /body\.is-authenticated \.nav-btn[\s\S]*white-space:\s*nowrap/);
});

test('remove saudação e badge e mantém uso diário abaixo do plano', () => {
  assert.match(css, /\.sidebar-account__content > \.tag,[\s\S]*#welcome[\s\S]*display:\s*none\s*!important/);
  assert.match(css, /body\.is-authenticated \.sidebar-account[\s\S]*grid-row:\s*1/);
  assert.match(css, /body\.is-authenticated \.sidebar-account[\s\S]*justify-self:\s*end/);
  assert.match(css, /margin:\s*43px\s+126px\s+0\s+0/);
});

test('Painel Master participa da barra única sem ocupar a largura inteira', () => {
  assert.match(css, /#adminShortcut[\s\S]*width:\s*auto\s*!important/);
  assert.match(css, /#adminShortcut[\s\S]*white-space:\s*nowrap/);
});

test('responsividade mantém um único cartão mesmo quando o menu muda de linha', () => {
  assert.match(css, /@media \(max-width:\s*1180px\)[\s\S]*body\.is-authenticated \.session-bar[\s\S]*min-height:\s*142px/);
  assert.match(css, /@media \(max-width:\s*1180px\)[\s\S]*body\.is-authenticated \.sidebar nav[\s\S]*align-self:\s*end/);
  assert.doesNotMatch(css, /body\.is-authenticated \.sidebar nav[\s\S]*background:\s*rgba\(255,\s*255,\s*255/);
});
