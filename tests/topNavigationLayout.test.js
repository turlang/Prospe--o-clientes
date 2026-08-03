/**
 * @fileoverview Regressões da barra superior e da Visão Geral.
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

test('mantém somente uma superfície superior e remove a coluna lateral', () => {
  assert.match(css, /body\.is-authenticated \.app-shell,[\s\S]*body\.is-authenticated \.sidebar[\s\S]*display:\s*contents\s*!important/);
  assert.match(css, /body\.is-authenticated \.session-bar[\s\S]*min-height:\s*126px/);
  assert.match(css, /body\.is-authenticated \.sidebar nav[\s\S]*background:\s*transparent\s*!important/);
  assert.match(css, /body\.is-authenticated \.sidebar nav[\s\S]*box-shadow:\s*none\s*!important/);
  assert.match(css, /body\.is-authenticated \.workspace[\s\S]*grid-row:\s*2/);
});

test('uso diário possui área própria e não invade o botão de saída', () => {
  assert.match(css, /body\.is-authenticated \.sidebar-account[\s\S]*top:\s*50px/);
  assert.match(css, /body\.is-authenticated \.sidebar-account[\s\S]*right:\s*140px/);
  assert.match(css, /body\.is-authenticated \.sidebar-account[\s\S]*width:\s*164px/);
  assert.match(css, /body\.is-authenticated \.session-logout[\s\S]*margin-left:\s*12px/);
  assert.match(css, /body\.is-authenticated \.session-user[\s\S]*padding:\s*0/);
});

test('menu não mostra scrollbar em desktop e continua responsivo em telas menores', () => {
  assert.match(css, /body\.is-authenticated \.sidebar nav[\s\S]*overflow-x:\s*hidden\s*!important/);
  assert.match(css, /@media \(max-width: 1320px\)[\s\S]*overflow-x:\s*auto\s*!important/);
  assert.match(css, /body\.is-authenticated \.nav-list[\s\S]*justify-content:\s*space-between/);
  assert.match(css, /body\.is-authenticated \.nav-btn[\s\S]*white-space:\s*nowrap/);
});

test('Visão Geral não cria rolagem interna', () => {
  assert.match(css, /#view-dashboard\.active-view,[\s\S]*overflow:\s*visible\s*!important/);
  assert.match(css, /#view-dashboard \*::-webkit-scrollbar[\s\S]*width:\s*0/);
  assert.match(css, /#view-dashboard \*::-webkit-scrollbar[\s\S]*height:\s*0/);
});

test('link Abrir Sales OS possui aparência real de botão', () => {
  assert.match(css, /\.admin-dashboard-link[\s\S]*display:\s*inline-flex/);
  assert.match(css, /\.admin-dashboard-link[\s\S]*border-radius:\s*10px/);
  assert.match(css, /\.admin-dashboard-link[\s\S]*text-decoration:\s*none/);
});
