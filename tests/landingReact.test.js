/**
 * @fileoverview Regressão da landing React + Tailwind e do pipeline de build público.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const appSource = fs.readFileSync('frontend/landing/src/App.jsx', 'utf8');
const heroSource = fs.readFileSync('frontend/landing/src/components/Hero.jsx', 'utf8');
const toolsSource = fs.readFileSync('frontend/landing/src/components/Tools.jsx', 'utf8');
const pricingSource = fs.readFileSync('frontend/landing/src/components/Pricing.jsx', 'utf8');
const styles = fs.readFileSync('frontend/landing/src/styles.css', 'utf8');
const viteConfig = fs.readFileSync('frontend/landing/vite.config.mjs', 'utf8');
const systemRoutes = fs.readFileSync('src/routes/systemRoutes.js', 'utf8');
const renderYaml = fs.readFileSync('render.yaml', 'utf8');

test('landing pública usa React, Tailwind e mantém o painel legado separado', () => {
  assert.ok(packageJson.dependencies.react);
  assert.ok(packageJson.dependencies['react-dom']);
  assert.ok(packageJson.devDependencies.tailwindcss);
  assert.ok(packageJson.devDependencies['@tailwindcss/vite']);
  assert.match(packageJson.scripts['build:landing'], /vite build/);
  assert.match(viteConfig, /tailwindcss\(\)/);
  assert.match(viteConfig, /public\/landing-react/);
  assert.match(styles, /@import "tailwindcss"/);
  assert.match(systemRoutes, /landing-react', 'index\.html'/);
  assert.match(systemRoutes, /landing-fallback\.html/);
});

test('landing fala diretamente com o público tech e mantém CTAs para o aplicativo', () => {
  assert.match(appSource, /fetch\('\/api\/plans'/);
  assert.match(heroSource, /Encontre empresas que precisam de sites, sistemas e IA/);
  assert.match(heroSource, /href="\/app"/);
  assert.match(toolsSource, /Ferramentas do sistema/);
  assert.match(pricingSource, /id="planos"/);
});

test('deploy do Render executa o build da landing', () => {
  assert.match(renderYaml, /buildCommand: npm install && npm run build/);
});
