/**
 * @fileoverview Regressões da barra superior compacta e da Visão Geral.
 *
 * Este contrato permanece no gate global porque a navegação reúne marca, conta,
 * uso diário, atalhos e menu dentro da mesma superfície responsiva.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const entry = fs.readFileSync('public/assets/dashboard/styles.css', 'utf8');
const css = fs.readFileSync('public/assets/dashboard/css/95-top-navigation.css', 'utf8');
const page = fs.readFileSync('public/pages/app.html', 'utf8');

test('carrega a navegação superior depois das regras responsivas', () => {
  const responsive = entry.indexOf('./css/90-responsive.css');
  const topNavigation = entry.indexOf('./css/95-top-navigation.css');
  assert.ok(responsive >= 0);
  assert.ok(topNavigation > responsive);
  assert.match(entry, /95-top-navigation\.css\?v=27\.0\.3/);
});

test('mantém somente uma superfície superior e remove a coluna lateral', () => {
  assert.match(css, /body\.is-authenticated \.app-shell,[\s\S]*body\.is-authenticated \.sidebar[\s\S]*display:\s*contents\s*!important/);
  assert.match(css, /body\.is-authenticated \.session-bar[\s\S]*min-height:\s*88px/);
  assert.match(css, /body\.is-authenticated \.session-bar[\s\S]*grid-template-columns:\s*150px minmax\(0, 1fr\) 184px 112px/);
  assert.match(css, /body\.is-authenticated \.sidebar nav[\s\S]*background:\s*transparent\s*!important/);
  assert.match(css, /body\.is-authenticated \.workspace[\s\S]*grid-row:\s*2/);
});

test('uso diário pertence ao bloco da conta e não usa posição absoluta', () => {
  assert.match(page, /class="session-user"[\s\S]*id="sessionPlanName"[\s\S]*id="usageBox"/);
  assert.doesNotMatch(page, /class="sidebar-account"[\s\S]*id="usageBox"/);
  assert.match(css, /body\.is-authenticated \.session-user \.usage-box[\s\S]*width:\s*176px/);
  assert.match(css, /body\.is-authenticated \.sidebar-account[\s\S]*display:\s*none\s*!important/);
  assert.doesNotMatch(css, /body\.is-authenticated \.sidebar-account[\s\S]*position:\s*absolute/);
});

test('conta e saída possuem colunas independentes', () => {
  assert.match(css, /body\.is-authenticated \.session-user[\s\S]*grid-column:\s*3/);
  assert.match(css, /body\.is-authenticated \.session-user[\s\S]*flex-direction:\s*column/);
  assert.match(css, /body\.is-authenticated \.session-logout[\s\S]*grid-column:\s*4/);
});

test('menu ocupa a faixa central sem criar segunda barra ou scrollbar visível', () => {
  assert.match(css, /body\.is-authenticated \.sidebar nav[\s\S]*top:\s*21px/);
  assert.match(css, /body\.is-authenticated \.sidebar nav[\s\S]*left:\s*174px/);
  assert.match(css, /body\.is-authenticated \.sidebar nav[\s\S]*right:\s*326px/);
  assert.match(css, /body\.is-authenticated \.sidebar nav[\s\S]*overflow-x:\s*auto\s*!important/);
  assert.match(css, /body\.is-authenticated \.sidebar nav::-webkit-scrollbar[\s\S]*display:\s*none/);
  assert.match(css, /body\.is-authenticated \.nav-list[\s\S]*min-width:\s*max-content/);
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
