/**
 * @fileoverview Regressão da landing React/Tailwind e do artefato público resiliente.
 *
 * @module tests/landingReact.test
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const landingPackage = JSON.parse(fs.readFileSync('frontend/landing/package.json', 'utf8'));
const appSource = fs.readFileSync('frontend/landing/src/app/App.jsx', 'utf8');
const heroSource = fs.readFileSync('frontend/landing/src/features/hero/HeroSection.jsx', 'utf8');
const toolsSource = fs.readFileSync('frontend/landing/src/features/tools/ToolsSection.jsx', 'utf8');
const pricingSource = fs.readFileSync('frontend/landing/src/features/pricing/PricingSection.jsx', 'utf8');
const styles = fs.readFileSync('frontend/landing/src/styles/index.css', 'utf8');
const viteConfig = fs.readFileSync('frontend/landing/vite.config.mjs', 'utf8');
const systemRoutes = fs.readFileSync('src/routes/systemRoutes.js', 'utf8');
const renderYaml = fs.readFileSync('render.yaml', 'utf8');
const staticLanding = fs.readFileSync('public/landing-react/index.html', 'utf8');

const REQUIRED_SECTIONS = ['inicio', 'como-funciona', 'ferramentas', 'publico', 'planos'];

test('landing pública usa React/Tailwind e mantém artefato pré-compilado versionado', () => {
  assert.equal(landingPackage.dependencies.react, '19.2.8');
  assert.equal(landingPackage.dependencies['react-dom'], '19.2.8');
  assert.equal(landingPackage.devDependencies.tailwindcss, '4.3.3');
  assert.equal(landingPackage.devDependencies['@tailwindcss/vite'], '4.3.3');
  assert.match(packageJson.scripts['build:react'], /frontend\/landing run build/);
  assert.match(packageJson.scripts.build, /scripts\/build\.js/);
  assert.match(viteConfig, /tailwindcss\(\)/);
  assert.match(viteConfig, /public\/landing-react/);
  assert.match(styles, /@import "tailwindcss"/);
  assert.match(systemRoutes, /LANDING_BUILD_PATH/);
  assert.match(systemRoutes, /X-Landing-Version/);
  assert.match(staticLanding, /data-landing-version="25\.0\.0"/);
});

test('landing fala com o público tech e compõe todas as seções comerciais', () => {
  assert.match(appSource, /<HeroSection \/>/);
  assert.match(appSource, /<WorkflowSection \/>/);
  assert.match(appSource, /<ToolsSection \/>/);
  assert.match(appSource, /<AudienceSection \/>/);
  assert.match(appSource, /<PricingSection/);
  assert.match(heroSource, /Encontre empresas que precisam de/);
  assert.match(heroSource, /sites, sistemas e IA/);
  assert.match(heroSource, /href="\/app"/);
  assert.match(toolsSource, /Ferramentas do sistema/);
  assert.match(pricingSource, /id="planos"/);
  for (const id of REQUIRED_SECTIONS) assert.match(staticLanding, new RegExp(`id="${id}"`));
});

test('deploy do Render instala dependências reproduzíveis e valida a landing', () => {
  assert.match(renderYaml, /buildCommand: npm ci --omit=dev --no-audit --no-fund && npm --prefix frontend\/landing install --include=dev --no-audit --no-fund && npm run build/);
  assert.match(packageJson.scripts['verify:landing'], /verify-landing-build/);
});
