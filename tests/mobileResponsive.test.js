/**
 * @fileoverview Testes de regressão para responsividade do painel autenticado.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const cssRoot = path.join(root, 'public', 'assets', 'dashboard');
const css = [
  'styles.css',
  'css/99-legacy.css',
  'css/00-tokens.css',
  'css/10-base.css',
  'css/20-layout.css',
  'css/30-components.css',
  'css/40-views.css',
  'css/45-operational-polish.css',
  'css/50-depth.css',
  'css/90-responsive.css'
].map((file) => fs.readFileSync(path.join(cssRoot, file), 'utf8')).join('\n');
const html = fs.readFileSync(path.join(root, 'public', 'pages', 'app.html'), 'utf8');
const app = fs.readFileSync(path.join(root, 'public', 'assets', 'dashboard', 'app.js'), 'utf8');

test('painel limita a largura do documento em telas pequenas', () => {
  assert.match(css, /html,\s*\nbody\s*\{[\s\S]*?overflow-x:\s*clip;/);
  assert.match(css, /body\.is-authenticated \.app-shell[\s\S]*?grid-template-columns:\s*minmax\(0, 1fr\)/);
  assert.match(css, /container-name:\s*dashboard-chart;/);
  assert.match(css, /@container dashboard-chart \(max-width:\s*720px\)/);
});

test('visão executiva reorganiza KPIs, funil e conversão no mobile', () => {
  assert.match(css, /@media \(max-width: 900px\)[\s\S]*?\.overview-kpi-strip[\s\S]*?grid-template-columns:\s*repeat\(2,/);
  assert.match(css, /@media \(max-width: 900px\)[\s\S]*?\.overview-side-stack,[\s\S]*?\.conversion-analytics--compact[\s\S]*?grid-template-columns:\s*minmax\(0, 1fr\)/);
  assert.match(css, /@media \(max-width: 900px\)[\s\S]*?\.prospecting-funnel--compact[\s\S]*?grid-template-columns:\s*minmax\(0, 1fr\)/);
  assert.match(app, /conversion-compact-kpis/);
});

test('kanban preserva rolagem interna sem estourar o documento', () => {
  assert.match(css, /\.crm-pipeline-only \.kanban-board[\s\S]*?overflow-x:\s*auto;/);
  assert.match(css, /body\.is-authenticated \.sidebar nav[\s\S]*?overflow-x:\s*auto;/);
});

test('estado hidden, cache e efeitos 3D estão protegidos', () => {
  assert.match(css, /\[hidden\]\s*\{\s*display:\s*none\s*!important;/);
  assert.match(html, /\/assets\/dashboard\/styles\.css\?v=27\.0\.0/);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
  assert.match(css, /pointer:\s*coarse/);
});
