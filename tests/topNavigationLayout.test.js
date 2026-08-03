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

test('carrega a navegação superior depois das regras responsivas', () => {
  const responsive = entry.indexOf('./css/90-responsive.css');
  const topNavigation = entry.indexOf('./css/95-top-navigation.css');
  assert.ok(responsive >= 0);
  assert.ok(topNavigation > responsive);
  assert.match(entry, /95-top-navigation\.css\?v=27\.0\.2/);
});

test('mantém somente uma superfície superior e remove a coluna lateral', () => {
  assert.match(css, /body\.is-authenticated \.app-shell,[\s\S]*body\.is-authenticated \.sidebar[\s\S]*display:\s*contents\s*!important/);
  assert.match(css, /body\.is-authenticated \.session-bar[\s\S]*min-height:\s*82px/);
  assert.match(css, /body\.is-authenticated \.session-bar[\s\S]*grid-template-columns:\s*150px minmax\(0, 1fr\) 176px 112px/);
  assert.match(css, /body\.is-authenticated \.sidebar nav[\s\S]*background:\s*transparent\s*!important/);
  assert.match(css, /body\.is-authenticated \.workspace[\s\S]*grid-row:\s*2/);
});

test('barra desktop não mantém o grande espaço vazio anterior', () => {
  assert.doesNotMatch(css, /min-height:\s*126px/);
  assert.doesNotMatch(css, /min-height:\s*160px/);
  assert.doesNotMatch(css, /padding:\s*14px 16px 62px/);
  assert.match(css, /@media \(max-width: 1400px\)[\s\S]*min-height:\s*82px/);
});

test('uso diário fica abaixo do plano e separado do botão de saída', () => {
  assert.match(css, /body\.is-authenticated \.sidebar-account[\s\S]*top:\s*39px/);
  assert.match(css, /body\.is-authenticated \.sidebar-account[\s\S]*right:\s*134px/);
  assert.match(css, /body\.is-authenticated \.sidebar-account[\s\S]*width:\s*176px/);
  assert.match(css, /body\.is-authenticated \.session-user[\s\S]*grid-column:\s*3/);
  assert.match(css, /body\.is-authenticated \.session-logout[\s\S]*grid-column:\s*4/);
});

test('menu ocupa a faixa central sem criar segunda barra ou scrollbar visível', () => {
  assert.match(css, /body\.is-authenticated \.sidebar nav[\s\S]*top:\s*18px/);
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
