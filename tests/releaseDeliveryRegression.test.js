/**
 * @fileoverview Regressões de entrega dos assets e estados visuais da release 25.6.0.
 *
 * Estes testes impedem que um deploy volte a servir JavaScript/CSS antigos e
 * também protegem o estado ativo do seletor da tela Fluxo da landing.
 *
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

const VERSION = '25.6.0';

test('documentos públicos apontam para assets da release atual', () => {
  assert.match(appHtml, new RegExp(`/assets/dashboard/styles\\.css\\?v=${VERSION.replaceAll('.', '\\.')}`));
  assert.match(appHtml, new RegExp(`/assets/dashboard/app\\.js\\?v=${VERSION.replaceAll('.', '\\.')}`));
  assert.match(adminHtml, new RegExp(`/assets/dashboard/styles\\.css\\?v=${VERSION.replaceAll('.', '\\.')}`));
  assert.match(adminHtml, new RegExp(`/assets/admin/admin\\.css\\?v=${VERSION.replaceAll('.', '\\.')}`));
  assert.match(resetHtml, new RegExp(`/assets/auth/reset-password\\.js\\?v=${VERSION.replaceAll('.', '\\.')}`));
  assert.match(staticLandingHtml, new RegExp(`landing-static\\.css\\?v=${VERSION.replaceAll('.', '\\.')}`));
  assert.doesNotMatch(appHtml, /v=25\.1\.0/);
});

test('servidor obriga revalidação de JavaScript e CSS após deploy', () => {
  assert.match(appSource, /\/\\\.\(\?:css\|js\)\$\/i\.test\(filePath\)/);
  assert.match(appSource, /no-cache, must-revalidate/);
});

test('estado ativo do fluxo mantém fundo escuro e texto visível', () => {
  for (const css of [reactCss, staticCss]) {
    assert.match(css, /V25\.6\.0 — estado ativo do seletor de fluxo/);
    assert.match(css, /\.workflow-card \.workflow-selector__button\[aria-selected="true"\][\s\S]*?background: linear-gradient\(135deg, #0f172a, #0b1730\)/);
    assert.match(css, /\.workflow-card \.workflow-selector__button\[aria-selected="true"\] > strong[\s\S]*?color: #ffffff/);
  }
});
