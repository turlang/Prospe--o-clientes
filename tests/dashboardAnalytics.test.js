/**
 * @fileoverview Regressões da visualização executiva de prospecção e conversão.
 *
 * Garante que o painel use componentes profissionais, responsivos e alimentados
 * pelos dados reais do relatório comercial, sem retornar aos gráficos de
 * cápsulas verticais que causavam sobreposição e rolagem horizontal.
 *
 * @module tests/dashboardAnalytics.test
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const app = fs.readFileSync('public/assets/dashboard/app.js', 'utf8');
const styles = fs.readFileSync('public/assets/dashboard/styles.css', 'utf8');
const html = fs.readFileSync('public/pages/app.html', 'utf8');

test('dashboard usa funil executivo profissional em vez do gráfico de colunas', () => {
  assert.match(app, /function renderProspectingPipeline\(/);
  assert.match(app, /prospecting-funnel/);
  assert.match(app, /funnel-layer__shape/);
  assert.match(app, /funnel-rejected/);
  assert.match(app, /renderProspectingPipeline\(overviewProspectingChart, funnel\)/);
  assert.match(styles, /\.funnel-stack/);
  assert.match(styles, /clip-path: polygon/);
  assert.match(styles, /@container dashboard-chart \(max-width: 900px\)/);
  assert.doesNotMatch(app, /pipeline-chart-desktop/);
});

test('indicadores combinam KPIs e conversão por etapa', () => {
  assert.match(app, /function renderConversionAnalytics\(/);
  assert.match(app, /function buildConversionStages\(/);
  assert.match(app, /conversion-kpi-grid/);
  assert.match(app, /conversion-stage-list/);
  assert.match(styles, /\.conversion-summary-strip/);
  assert.match(html, /analytics-card--conversion/);
});

test('visualizações preservam sete etapas canônicas do funil', () => {
  for (const status of ['NOVO', 'CONTATADO', 'INTERESSADO', 'REUNIAO', 'PROPOSTA', 'FECHADO', 'SEM_INTERESSE']) {
    assert.match(app, new RegExp(`status: '${status}'`));
  }
});
