/**
 * @fileoverview Testes de regressão para responsividade do painel autenticado.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const css = fs.readFileSync(path.join(root, 'public', 'style.css'), 'utf8');
const html = fs.readFileSync(path.join(root, 'public', 'index.html'), 'utf8');

test('painel limita a largura do documento em telas pequenas', () => {
  assert.match(css, /html,\s*\nbody\s*\{[\s\S]*?overflow-x:\s*clip;/);
  assert.match(css, /\.workspace[\s\S]*?\.active-view[\s\S]*?min-width:\s*0;/);
  assert.match(css, /\.overview-pipeline-cards[\s\S]*?max-width:\s*100%;/);
});

test('componentes largos usam rolagem interna no mobile', () => {
  assert.match(css, /@media \(max-width:\s*720px\)[\s\S]*?\.overview-pipeline-cards[\s\S]*?overflow-x:\s*auto;/);
  assert.match(css, /@media \(max-width:\s*720px\)[\s\S]*?\.sidebar nav[\s\S]*?overflow-x:\s*auto;/);
  assert.match(css, /\.crm-pipeline-only \.kanban-board[\s\S]*?overflow-x:\s*auto;/);
});

test('estado hidden e cache da folha responsiva estão protegidos', () => {
  assert.match(css, /\[hidden\]\s*\{\s*display:\s*none\s*!important;/);
  assert.match(html, /style\.css\?v=v24-0-1-mobile/);
});
