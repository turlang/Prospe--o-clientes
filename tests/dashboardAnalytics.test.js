/**
 * @fileoverview Regressões da visão executiva comercial simplificada.
 *
 * Protege o dashboard contra o retorno de widgets redundantes e garante que
 * volume, receita, conversão e gargalo permaneçam em uma única leitura.
 *
 * @module tests/dashboardAnalytics.test
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const app = fs.readFileSync('public/assets/dashboard/app.js', 'utf8');
const styles = fs.readFileSync('public/assets/dashboard/styles.css', 'utf8');
const html = fs.readFileSync('public/pages/app.html', 'utf8');

test('visão executiva remove gráficos redundantes e mantém quatro dimensões essenciais', () => {
  assert.match(html, /Desempenho comercial em uma leitura/);
  assert.match(html, /id="overviewKpis"/);
  assert.match(html, /id="overviewRevenueChart"/);
  assert.match(html, /id="overviewDecisionSummary"/);
  assert.match(html, /id="overviewProspectingChart"/);
  assert.match(html, /id="overviewConversionChart"/);
  assert.doesNotMatch(html, /id="overviewContactChart"/);
  assert.doesNotMatch(html, /id="overviewProposalChart"/);
  assert.doesNotMatch(html, /id="overviewPipelineExecutive"/);
});

test('dashboard usa funil executivo profissional em vez do gráfico de colunas', () => {
  assert.match(app, /function renderProspectingPipeline\(/);
  assert.match(app, /prospecting-funnel--compact/);
  assert.match(app, /funnel-layer__shape/);
  assert.match(app, /funnel-rejected/);
  assert.match(app, /renderProspectingPipeline\(overviewProspectingChart, funnel\)/);
  assert.match(styles, /\.funnel-stack/);
  assert.match(styles, /clip-path: polygon/);
  assert.doesNotMatch(app, /pipeline-chart-desktop/);
});

test('receita, decisão e KPIs são calculados por componentes dedicados', () => {
  assert.match(app, /function renderOverviewKpis\(/);
  assert.match(app, /function renderRevenueForecast\(/);
  assert.match(app, /function renderDecisionSummary\(/);
  assert.match(app, /Receita ponderada atual/);
  assert.match(app, /Ação recomendada/);
  assert.match(styles, /\.overview-kpi-strip/);
  assert.match(styles, /\.overview-decision-summary/);
});

test('conversão por etapa permanece compacta e sem métricas duplicadas', () => {
  assert.match(app, /function renderConversionAnalytics\(/);
  assert.match(app, /function buildConversionStages\(/);
  assert.match(app, /conversion-compact-kpis/);
  assert.match(app, /conversion-stage-list/);
  assert.doesNotMatch(app, /conversion-summary-strip/);
  assert.match(styles, /\.conversion-analytics--compact/);
});

test('visualizações preservam sete etapas canônicas do funil', () => {
  for (const status of ['NOVO', 'CONTATADO', 'INTERESSADO', 'REUNIAO', 'PROPOSTA', 'FECHADO', 'SEM_INTERESSE']) {
    assert.match(app, new RegExp(`status: '${status}'`));
  }
});
