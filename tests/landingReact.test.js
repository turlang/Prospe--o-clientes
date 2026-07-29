/**
 * @fileoverview Regressão da landing React/Tailwind em viewport única.
 *
 * @module tests/landingReact.test
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const landingPackage = JSON.parse(fs.readFileSync('frontend/landing/package.json', 'utf8'));
const appSource = fs.readFileSync('frontend/landing/src/app/App.jsx', 'utf8');
const experienceSource = fs.readFileSync('frontend/landing/src/features/presentation/LandingExperience.jsx', 'utf8');
const overviewSource = fs.readFileSync('frontend/landing/src/features/presentation/OverviewPanel.jsx', 'utf8');
const toolsSource = fs.readFileSync('frontend/landing/src/features/presentation/ToolsPanel.jsx', 'utf8');
const pricingSource = fs.readFileSync('frontend/landing/src/features/presentation/PricingPanel.jsx', 'utf8');
const navigationHook = fs.readFileSync('frontend/landing/src/hooks/useLandingView.js', 'utf8');
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
  assert.match(staticLanding, /data-landing-version="25\.3\.0"/);
});

test('landing troca informações por botões e não empilha seções verticais', () => {
  assert.match(appSource, /<LandingExperience/);
  assert.match(appSource, /<BottomNavigation/);
  assert.doesNotMatch(appSource, /<HeroSection \/>/);
  assert.match(experienceSource, /hidden=\{activeView !== item\.id\}/);
  assert.match(experienceSource, /PricingPanel/);
  assert.match(navigationHook, /history\[replace \? 'replaceState' : 'pushState'\]/);
  assert.match(navigationHook, /navigateRelative/);
  assert.match(styles, /html, body, #root \{[^}]*overflow: hidden;/);
  assert.match(styles, /height: 100dvh/);
  assert.match(styles, /landing-bottom-nav/);
});

test('copy e recursos permanecem direcionados ao público tech', () => {
  assert.match(overviewSource, /Encontre empresas que precisam de/);
  assert.match(overviewSource, /sites, sistemas e IA/);
  assert.match(overviewSource, /href="\/app"/);
  assert.match(toolsSource, /Sistema operacional de prospecção/i);
  assert.match(pricingSource, /plan\.displayPrice \|\| plan\.priceLabel/);
  assert.match(pricingSource, /Planos publicados pelo Admin/);
  for (const id of REQUIRED_SECTIONS) assert.match(staticLanding, new RegExp(`id="${id}"`));
  assert.match(staticLanding, /data-view-target="ferramentas"/);
});

test('deploy do Render instala dependências reproduzíveis e valida a landing', () => {
  assert.match(renderYaml, /buildCommand: npm ci --omit=dev --no-audit --no-fund && npm --prefix frontend\/landing install --include=dev --no-audit --no-fund && npm run build/);
  assert.match(packageJson.scripts['verify:landing'], /verify-landing-build/);
});
