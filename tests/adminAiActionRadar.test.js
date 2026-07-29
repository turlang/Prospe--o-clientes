/**
 * @fileoverview Regressões da release 25.7.0: IA no Admin e radar no plano de ação.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

test('painel administrativo inclui monitor seguro da IA Comercial', () => {
  const html = read('public/pages/admin.html');
  const js = read('public/assets/admin/admin.js');
  assert.match(html, /id="ia-comercial"/);
  assert.match(html, /id="adminAiStatus"/);
  assert.match(js, /\/api\/ai\/status/);
  assert.match(js, /nenhum token ou chave é enviado ao navegador/i);
  assert.doesNotMatch(js, /process\.env\.GROQ_API_KEY/);
});

test('radar operacional está incorporado ao Plano de ação e não cria gráfico duplicado', () => {
  const html = read('public/pages/app.html');
  const js = read('public/assets/dashboard/app.js');
  const planHeading = html.indexOf('Plano de ação de hoje');
  const radar = html.indexOf('id="v23ActionRadar"');
  const dailyPlan = html.indexOf('id="v23DailyPlan"');
  assert.ok(planHeading >= 0 && radar > planHeading && dailyPlan > radar);
  assert.match(js, /function renderV23ActionRadar/);
  assert.match(js, /pipelineHealth\?\.bottleneck/);
  assert.match(js, /Próxima ação recomendada/);
  assert.equal((html.match(/id="overviewProspectingChart"/g) || []).length, 1);
});

test('assets críticos usam cache-busting da versão 25.7.0', () => {
  assert.match(read('public/pages/app.html'), /app\.js\?v=25\.7\.0/);
  assert.match(read('public/pages/admin.html'), /admin\.js\?v=25\.7\.0/);
});
