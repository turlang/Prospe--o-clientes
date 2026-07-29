/**
 * @fileoverview Testes de regressão para responsividade do painel autenticado.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const css = fs.readFileSync(path.join(root, 'public', 'assets', 'dashboard', 'styles.css'), 'utf8');
const html = fs.readFileSync(path.join(root, 'public', 'pages', 'app.html'), 'utf8');
const app = fs.readFileSync(path.join(root, 'public', 'assets', 'dashboard', 'app.js'), 'utf8');

test('painel limita a largura do documento em telas pequenas', () => {
  assert.match(css, /html,\s*\nbody\s*\{[\s\S]*?overflow-x:\s*clip;/);
  assert.match(css, /body\.is-authenticated \.app-shell[\s\S]*?grid-template-columns:\s*minmax\(0, 1fr\)/);
  assert.match(css, /body\.is-authenticated \.overview-chart-grid[\s\S]*?min-width:\s*0;/);
  assert.match(css, /container-name:\s*dashboard-chart;/);
  assert.match(css, /@container dashboard-chart \(max-width:\s*720px\)/);
});

test('gráficos executivos viram listas compactas no mobile', () => {
  assert.match(css, /body\.is-authenticated \.column-chart-item[\s\S]*?grid-template-areas:/);
  assert.match(css, /body\.is-authenticated \.overview-pipeline-cards[\s\S]*?grid-template-columns:\s*repeat\(2,/);
  assert.match(app, /--mobile-bar:\$\{height\}%/);
});

test('kanban preserva rolagem interna sem estourar o documento', () => {
  assert.match(css, /\.crm-pipeline-only \.kanban-board[\s\S]*?overflow-x:\s*auto;/);
  assert.match(css, /body\.is-authenticated \.sidebar nav[\s\S]*?overflow-x:\s*auto;/);
});

test('estado hidden e cache da folha comercial estão protegidos', () => {
  assert.match(css, /\[hidden\]\s*\{\s*display:\s*none\s*!important;/);
  assert.match(html, /\/assets\/dashboard\/styles\.css\?v=25\.7\.1/);
});
