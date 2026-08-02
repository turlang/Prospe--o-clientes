/**
 * @fileoverview Valida a arquitetura CSS modular e os contratos de profundidade.
 * @module scripts/check-style-architecture
 */
const fs = require('node:fs');
const path = require('node:path');

const ROOT = process.cwd();
const entry = path.join(ROOT, 'public', 'assets', 'dashboard', 'styles.css');
const modules = [
  '99-legacy.css',
  '00-tokens.css',
  '10-base.css',
  '20-layout.css',
  '30-components.css',
  '40-views.css',
  '45-operational-polish.css',
  '50-depth.css',
  '90-responsive.css'
];
const failures = [];
const source = fs.readFileSync(entry, 'utf8');

let previousIndex = -1;
for (const moduleName of modules) {
  const relative = `./css/${moduleName}`;
  const index = source.indexOf(relative);
  if (index < 0) failures.push(`Import ausente em styles.css: ${moduleName}`);
  if (index >= 0 && index < previousIndex) failures.push(`Ordem incorreta de imports: ${moduleName}`);
  previousIndex = Math.max(previousIndex, index);

  const file = path.join(ROOT, 'public', 'assets', 'dashboard', 'css', moduleName);
  if (!fs.existsSync(file)) {
    failures.push(`Módulo CSS ausente: ${moduleName}`);
    continue;
  }
  const css = fs.readFileSync(file, 'utf8');
  if (!css.slice(0, 900).includes('@fileoverview')) failures.push(`Módulo CSS sem @fileoverview: ${moduleName}`);
}

const depth = fs.readFileSync(path.join(ROOT, 'public', 'assets', 'dashboard', 'css', '50-depth.css'), 'utf8');
if (!depth.includes('prefers-reduced-motion: reduce')) failures.push('Profundidade 3D não respeita movimento reduzido.');
if (!depth.includes('(pointer: coarse)')) failures.push('Profundidade 3D não é desativada em toque.');

const depthScript = fs.readFileSync(path.join(ROOT, 'public', 'assets', 'shared', 'depth-effects.js'), 'utf8');
if (!depthScript.includes('MutationObserver')) failures.push('Cards dinâmicos não recebem profundidade progressiva.');
if (!depthScript.includes("prefers-reduced-motion: reduce")) failures.push('Script de profundidade ignora movimento reduzido.');

for (const landing of [
  'frontend/landing/src/styles/index.css',
  'frontend/landing/static/landing.css',
  'public/landing-static.css'
]) {
  const css = fs.readFileSync(path.join(ROOT, landing), 'utf8');
  if (!css.includes('V26.0.0 — identidade 3D editorial')) failures.push(`Landing sem refinamento 3D: ${landing}`);
}

if (failures.length) {
  console.error('Falhas na arquitetura visual:');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`Arquitetura visual validada: ${modules.length} módulos CSS, landing e profundidade acessível.`);
