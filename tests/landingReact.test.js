/**
 * @fileoverview Regressão da landing React e do pipeline de build público.
 *
 * @module tests/landingReact.test
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const appSource = fs.readFileSync('frontend/landing/src/App.jsx', 'utf8');
const viteConfig = fs.readFileSync('frontend/landing/vite.config.mjs', 'utf8');
const systemRoutes = fs.readFileSync('src/routes/systemRoutes.js', 'utf8');
const renderYaml = fs.readFileSync('render.yaml', 'utf8');

test('landing pública usa React e mantém o painel legado separado', () => {
  assert.ok(packageJson.dependencies.react);
  assert.ok(packageJson.dependencies['react-dom']);
  assert.match(packageJson.scripts['build:landing'], /vite build/);
  assert.match(viteConfig, /public\/landing-react/);
  assert.match(systemRoutes, /landing-react', 'index\.html'/);
  assert.match(systemRoutes, /landing-fallback\.html/);
});

test('landing consulta planos públicos e mantém CTA para o aplicativo', () => {
  assert.match(appSource, /fetch\('\/api\/plans'/);
  assert.match(appSource, /href="\/app"/);
  assert.match(appSource, /function Pricing\(/);
  assert.match(appSource, /function Faq\(/);
});

test('deploy do Render executa o build da landing', () => {
  assert.match(renderYaml, /buildCommand: npm install && npm run build/);
});
