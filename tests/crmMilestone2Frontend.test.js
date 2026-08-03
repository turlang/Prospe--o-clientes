/**
 * @fileoverview Contratos de interface do CRM 360.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'public/pages/app.html'), 'utf8');
const js = fs.readFileSync(path.join(root, 'public/assets/dashboard/app.js'), 'utf8');
const css = fs.readFileSync(path.join(root, 'public/assets/dashboard/css/40-views.css'), 'utf8');

test('CRM 360 oferece pipelines, lista, filtros salvos e importação', () => {
  for (const id of ['crmPipelineSelect', 'crmViewMode', 'crmSavedFilterSelect', 'crmImportDialog', 'crmSettingsDialog', 'crmListView']) {
    assert.match(html, new RegExp(`id="${id}"`));
  }
  assert.match(js, /loadCrmConfiguration/);
  assert.match(js, /previewCrmImport/);
  assert.match(js, /saveCrmLeadAdvanced/);
});

test('CRM 360 apresenta previsão, metas e reativação', () => {
  assert.match(html, /id="crmForecastSummary"/);
  assert.match(html, /id="crmGoalsPanel"/);
  assert.match(html, /id="crmReactivationPanel"/);
  assert.match(js, /\/api\/crm\/forecast/);
  assert.match(js, /\/api\/crm\/reactivation/);
});

test('estilos do CRM avançado incluem tabela e dialogs responsivos', () => {
  assert.match(css, /\.crm-table/);
  assert.match(css, /\.crm-dialog/);
  assert.match(css, /\.crm-forecast-grid/);
});
