/**
 * @fileoverview Regressões do polimento operacional 26.1.0.
 * @module tests/operationalPolish.test
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const app = fs.readFileSync('public/assets/dashboard/app.js', 'utf8');
const css = fs.readFileSync('public/assets/dashboard/css/45-operational-polish.css', 'utf8');
const entry = fs.readFileSync('public/assets/dashboard/styles.css', 'utf8');

test('funil usa largura proporcional e mantém rótulos fora do recorte', () => {
  assert.match(app, /Math\.round\(\(stage\.total \/ maxVolume\) \* 100\)/);
  assert.match(app, /class="funnel-stage-label"/);
  assert.match(app, /class="funnel-stage-visual"/);
  assert.match(css, /grid-template-columns:\s*minmax\(145px, 190px\)/);
  assert.match(css, /width:\s*var\(--stage-width, 100%\)/);
});

test('cockpit não repete valores financeiros na saúde do pipeline', () => {
  assert.doesNotMatch(app, /pipeline-stage-value"><strong>\$\{formatMoney\(stage\.value/);
  assert.match(app, /pipeline-stage-value"><strong>\$\{count\}/);
});

test('copiloto possui contraste explícito para mensagens do assistente', () => {
  assert.match(css, /\.copilot-message\.assistant > div[\s\S]*?color:\s*#eaf5ff/);
  assert.match(css, /\.copilot-message\.assistant p[\s\S]*?color:\s*#dcecff/);
});

test('módulo de polimento é carregado após as views', () => {
  assert.ok(entry.indexOf('40-views.css') < entry.indexOf('45-operational-polish.css'));
  assert.ok(entry.indexOf('45-operational-polish.css') < entry.indexOf('50-depth.css'));
});
