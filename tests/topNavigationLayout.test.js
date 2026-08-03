/**
 * @fileoverview Regressões da navegação superior do dashboard autenticado.
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
  assert.match(css, /body\.is-authenticated \.app-shell[\s\S]*display:\s*contents\s*!important/);
  assert.match(css, /body\.is-authenticated \.sidebar[\s\S]*display:\s*contents\s*!important/);
  assert.match(css, /body\.is-authenticated \.workspace[\s\S]*grid-column:\s*1/);
  assert.match(css, /body\.is-authenticated \.workspace[\s\S]*width:\s*100%/);
});

test('menu principal permanece horizontal e rolável sem atropelar itens', () => {
  assert.match(css, /body\.is-authenticated \.sidebar nav[\s\S]*display:\s*flex\s*!important/);
  assert.match(css, /body\.is-authenticated \.sidebar nav[\s\S]*overflow-x:\s*auto\s*!important/);
  assert.match(css, /body\.is-authenticated \.nav-list[\s\S]*display:\s*flex\s*!important/);
  assert.match(css, /body\.is-authenticated \.nav-btn[\s\S]*white-space:\s*nowrap/);
});

test('remove saudação e badge do dashboard e posiciona uso abaixo do plano', () => {
  assert.match(css, /\.sidebar-account__content > \.tag,[\s\S]*#welcome[\s\S]*display:\s*none\s*!important/);
  assert.match(css, /body\.is-authenticated \.sidebar-account[\s\S]*grid-row:\s*1/);
  assert.match(css, /body\.is-authenticated \.sidebar-account[\s\S]*justify-self:\s*end/);
  assert.match(css, /margin:\s*53px\s+126px\s+0\s+0/);
});

test('Painel Master participa da barra superior sem ocupar a largura inteira', () => {
  assert.match(css, /#adminShortcut[\s\S]*width:\s*auto\s*!important/);
  assert.match(css, /#adminShortcut[\s\S]*white-space:\s*nowrap/);
});
