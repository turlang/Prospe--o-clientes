/**
 * @fileoverview Regressões da release 25.9.2: limpeza da sidebar,
 * histórico operacional e composição do resumo de planos.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

test('sidebar remove cartões de IA Comercial, upgrade Pro e plano duplicado', () => {
  const html = read('public/pages/app.html');
  const js = read('public/assets/dashboard/app.js');
  assert.doesNotMatch(html, /id="aiStatusBox"/);
  assert.doesNotMatch(html, /class="upgrade-box"/);
  assert.doesNotMatch(html, /Preparado para Pro/);
  assert.doesNotMatch(html, /id="planInfo"/);
  assert.match(html, /<h2 id="welcome">Sua central<\/h2>[\s\S]*?<div id="usageBox"/);
  assert.doesNotMatch(js, /const aiStatusBox/);
  assert.doesNotMatch(js, /function refreshAiStatus/);
});

test('alertas saem do Plano de ação e são registrados no Histórico', () => {
  const html = read('public/pages/app.html');
  const js = read('public/assets/dashboard/app.js');
  const planHeading = html.indexOf('Plano de ação de hoje');
  const radar = html.indexOf('id="v23ActionRadar"');
  const dailyPlan = html.indexOf('id="v23DailyPlan"');
  const history = html.indexOf('id="historyAlertsList"');

  assert.ok(planHeading >= 0 && radar > planHeading && dailyPlan > radar);
  assert.ok(history > dailyPlan);
  assert.doesNotMatch(html, /id="v23Alerts"/);
  assert.doesNotMatch(html, /Alertas e orientação/);
  assert.match(html, /Histórico de alertas e orientações/);
  assert.match(js, /OPERATIONAL_HISTORY_STORAGE_KEY/);
  assert.match(js, /function recordOperationalHistory/);
  assert.match(js, /function renderOperationalHistory/);
  assert.match(js, /recordOperationalHistory\(data\)/);
});

test('radar e saúde do pipeline continuam únicos', () => {
  const html = read('public/pages/app.html');
  const js = read('public/assets/dashboard/app.js');
  assert.match(js, /function renderV23ActionRadar/);
  assert.match(js, /pipelineHealth\?\.bottleneck/);
  assert.match(js, /Próxima ação recomendada/);
  assert.equal((html.match(/id="overviewProspectingChart"/g) || []).length, 1);
  assert.equal((html.match(/id="v23Pipeline"/g) || []).length, 1);
});

test('resumo de planos do Admin mantém total e planos na mesma linha', () => {
  const js = read('public/assets/admin/admin.js');
  const css = read('public/assets/admin/admin.css');
  assert.match(js, /\{label:'Total',value:total/);
  assert.match(js, /class="plan-summary-row"/);
  assert.match(css, /\.plan-summary-row[\s\S]*grid-template-columns:repeat\(4,minmax\(0,1fr\)\)/);
});

test('assets críticos usam cache-busting da versão 25.9.2', () => {
  assert.match(read('public/pages/app.html'), /app\.js\?v=25\.9\.2/);
  assert.match(read('public/pages/admin.html'), /admin\.js\?v=25\.9\.2/);
});
