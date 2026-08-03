/**
 * @fileoverview Regressões visuais estruturais observadas na validação da v27.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const css = fs.readFileSync('public/assets/dashboard/css/90-responsive.css', 'utf8');

test('cabeçalho autenticado não sobrepõe o conteúdo durante a rolagem', () => {
  assert.match(css, /\.session-bar,[\s\S]*position:\s*relative/);
  assert.match(css, /\.session-bar,[\s\S]*top:\s*auto/);
});

test('plano de ação usa somente a rolagem principal da página', () => {
  assert.match(css, /\.cockpit-action-list,[\s\S]*max-height:\s*none/);
  assert.match(css, /\.cockpit-action-list,[\s\S]*overflow:\s*visible/);
});

test('Kanban mantém todas as etapas em uma única faixa horizontal', () => {
  assert.match(css, /\.kanban-board,[\s\S]*display:\s*flex/);
  assert.match(css, /\.kanban-board,[\s\S]*overflow-x:\s*auto/);
  assert.match(css, /\.kanban-column,[\s\S]*flex:\s*0\s+0\s+clamp/);
  assert.match(css, /scroll-snap-align:\s*start/);
});
