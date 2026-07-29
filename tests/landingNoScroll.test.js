/**
 * @fileoverview Contratos da experiência sem rolagem da landing pública.
 *
 * @module tests/landingNoScroll.test
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const reactCss = fs.readFileSync('frontend/landing/src/styles/index.css', 'utf8');
const staticCss = fs.readFileSync('frontend/landing/static/landing.css', 'utf8');
const staticHtml = fs.readFileSync('frontend/landing/static/index.html', 'utf8');
const staticJs = fs.readFileSync('frontend/landing/static/landing.js', 'utf8');

test('documento e palco permanecem presos à viewport', () => {
  for (const css of [reactCss, staticCss]) {
    assert.match(css, /html, body, #root \{[^}]*height: 100%;[^}]*overflow: hidden;/);
    assert.match(css, /height: 100dvh/);
    assert.match(css, /\.landing-stage \{[^}]*overflow: hidden;/);
    assert.match(css, /\.landing-view,[\s\S]*?overflow: hidden;/);
  }
});

test('todos os conteúdos possuem botão correspondente', () => {
  const targets = ['inicio', 'como-funciona', 'ferramentas', 'publico', 'planos'];
  targets.forEach((target) => {
    assert.match(staticHtml, new RegExp(`data-view-target="${target}"`));
    assert.match(staticHtml, new RegExp(`data-view="${target}"`));
  });
  assert.match(staticJs, /function setView\(/);
  assert.match(staticJs, /panel\.hidden = panel\.dataset\.view !== state\.activeView/);
});

test('fluxo, ferramentas, público e planos usam seletores internos', () => {
  assert.match(staticHtml, /data-workflow-index="0"/);
  assert.match(staticHtml, /id="toolSelector"/);
  assert.match(staticHtml, /id="audienceSelector"/);
  assert.match(staticHtml, /id="planSelector"/);
  assert.match(staticJs, /renderWorkflow/);
  assert.match(staticJs, /renderTools/);
  assert.match(staticJs, /renderAudiences/);
  assert.match(staticJs, /renderPlans/);
});
