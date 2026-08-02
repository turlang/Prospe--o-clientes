/**
 * @fileoverview Orquestra o build resiliente da landing pública.
 *
 * A fonte estática validada é sincronizada antes do Vite. Quando o bundle React
 * não pode ser produzido por indisponibilidade do ambiente, o deploy mantém a
 * mesma identidade visual em HTML/CSS estático. Em CI, `STRICT_REACT_BUILD=true`
 * transforma qualquer falha do Vite em erro bloqueante.
 *
 * @module scripts/build
 */

const path = require('node:path');
const { spawnSync } = require('node:child_process');

const ROOT = process.cwd();
const strictReactBuild = String(process.env.STRICT_REACT_BUILD || '').toLowerCase() === 'true';

function runNodeScript(relativePath) {
  const result = spawnSync(process.execPath, [path.join(ROOT, relativePath)], {
    cwd: ROOT,
    stdio: 'inherit'
  });
  if (result.status !== 0) process.exit(result.status || 1);
}

runNodeScript('scripts/sync-static-landing.js');

const viteExecutable = path.join(
  ROOT,
  'frontend',
  'landing',
  'node_modules',
  '.bin',
  process.platform === 'win32' ? 'vite.cmd' : 'vite'
);

const viteResult = spawnSync(
  viteExecutable,
  ['build', '--config', 'vite.config.mjs'],
  { cwd: path.join(ROOT, 'frontend', 'landing'), stdio: 'inherit' }
);

if (viteResult.status !== 0) {
  if (strictReactBuild) {
    console.error('[build] O bundle React falhou e STRICT_REACT_BUILD=true bloqueia o deploy.');
    process.exit(viteResult.status || 1);
  }

  console.warn('[build] Bundle React indisponível. Mantendo a landing estática validada da mesma versão.');
  runNodeScript('scripts/sync-static-landing.js');
}

runNodeScript('scripts/verify-landing-build.js');
