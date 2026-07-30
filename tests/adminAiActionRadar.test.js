/**
 * @fileoverview Regressões de limpeza visual, histórico operacional e planos.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

test('sidebar e Admin removem cartões redundantes', () => {
  const html = read('public/pages/app.html');
  const adminHtml = read('public/pages/admin.html');
  const js = read('public/assets/dashboard/app.js');
  const adminJs = read('public/assets/admin/admin.js');
  assert.doesNotMatch(html, /id="aiStatusBox"/);
  assert.doesNotMatch(html, /class="upgrade-box"/);
  assert.doesNotMatch(html, /Preparado para Pro/);
  assert.doesNotMatch(html, /id="planInfo"/);
  assert.match(html, /<h2 id="welcome">Sua central<\/h2>[\s\S]*?<div id="usageBox"/);
  assert.doesNotMatch(js, /function refreshAiStatus/);
  assert.doesNotMatch(adminHtml, /adminAiStatus|IA Comercial/);
  assert.doesNotMatch(adminJs, /loadAdminAiStatus|adminAiStatus/);
});

test('alertas e timeline ficam centralizados no Histórico', () => {
  const html = read('public/pages/app.html');
  const js = read('public/assets/dashboard/app.js');
  const history = html.indexOf('id="view-historico"');
  const alerts = html.indexOf('id="historyAlertsList"');
  const timeline = html.indexOf('id="v23Timeline"');
  assert.ok(history >= 0 && alerts > history && timeline > history);
  assert.doesNotMatch(html, /id="v23Alerts"/);
  assert.doesNotMatch(html, /Alertas e orientação/);
  assert.match(html, /Histórico de alertas e orientações/);
  assert.match(html, /Timeline global/);
  assert.match(js, /OPERATIONAL_HISTORY_STORAGE_KEY/);
  assert.match(js, /function recordOperationalHistory/);
});

test('radar e saúde do pipeline continuam únicos', () => {
  const html = read('public/pages/app.html');
  const js = read('public/assets/dashboard/app.js');
  assert.match(js, /function renderV23ActionRadar/);
  assert.match(js, /pipelineHealth\?\.bottleneck/);
  assert.equal((html.match(/id="overviewProspectingChart"/g) || []).length, 1);
  assert.equal((html.match(/id="v23Pipeline"/g) || []).length, 1);
  assert.equal((html.match(/id="v23Timeline"/g) || []).length, 1);
});

test('resumo de planos do Admin mantém total e planos na mesma linha', () => {
  const js = read('public/assets/admin/admin.js');
  const css = read('public/assets/admin/admin.css');
  assert.match(js, /\{label:'Total',value:total/);
  assert.match(js, /class="plan-summary-row"/);
  assert.match(css, /\.plan-summary-row[\s\S]*grid-template-columns:\s*repeat\(4, minmax\(0, 1fr\)\)/);
});

test('assets críticos usam cache-busting da versão 26.1.0', () => {
  assert.match(read('public/pages/app.html'), /app\.js\?v=26\.1\.0/);
  assert.match(read('public/pages/admin.html'), /admin\.js\?v=26\.1\.0/);
});
