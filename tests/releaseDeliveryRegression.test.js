/**
 * @fileoverview Regressões de entrega dos assets e do design system 26.0.0.
 * @module tests/releaseDeliveryRegression.test
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const appHtml = fs.readFileSync('public/pages/app.html', 'utf8');
const adminHtml = fs.readFileSync('public/pages/admin.html', 'utf8');
const resetHtml = fs.readFileSync('public/pages/reset-password.html', 'utf8');
const staticLandingHtml = fs.readFileSync('frontend/landing/static/index.html', 'utf8');
const reactCss = fs.readFileSync('frontend/landing/src/styles/index.css', 'utf8');
const staticCss = fs.readFileSync('frontend/landing/static/landing.css', 'utf8');
const appSource = fs.readFileSync('src/app.js', 'utf8');
const dashboardEntry = fs.readFileSync('public/assets/dashboard/styles.css', 'utf8');

const VERSION = '26.0.0';

test('documentos públicos apontam para assets da release atual', () => {
  assert.match(appHtml, new RegExp(`/assets/dashboard/styles\\.css\\?v=${VERSION.replaceAll('.', '\\.')}`));
  assert.match(appHtml, new RegExp(`/assets/dashboard/app\\.js\\?v=${VERSION.replaceAll('.', '\\.')}`));
  assert.match(appHtml, new RegExp(`/assets/shared/depth-effects\\.js\\?v=${VERSION.replaceAll('.', '\\.')}`));
  assert.match(adminHtml, new RegExp(`/assets/admin/admin\\.css\\?v=${VERSION.replaceAll('.', '\\.')}`));
  assert.match(resetHtml, new RegExp(`/assets/auth/reset-password\\.js\\?v=${VERSION.replaceAll('.', '\\.')}`));
  assert.match(staticLandingHtml, new RegExp(`landing-static\\.css\\?v=${VERSION.replaceAll('.', '\\.')}`));
  assert.doesNotMatch(appHtml, /v=25\.9\.2/);
});

test('servidor obriga revalidação de JavaScript e CSS após deploy', () => {
  assert.match(appSource, /\/\\\.\(\?:css\|js\)\$\/i\.test\(filePath\)/);
  assert.match(appSource, /no-cache, must-revalidate/);
});

test('design system está modularizado e landing mantém profundidade acessível', () => {
  for (const marker of ['00-tokens.css', '10-base.css', '20-layout.css', '30-components.css', '40-views.css', '50-depth.css', '90-responsive.css']) {
    assert.match(dashboardEntry, new RegExp(marker.replace('.', '\\.')));
  }
  for (const css of [reactCss, staticCss]) {
    assert.match(css, /V26\.0\.0 — identidade 3D editorial/);
    assert.match(css, /prefers-reduced-motion:\s*reduce/);
  }
});
