/**
 * @fileoverview Impede o retorno de arquivos estrangeiros e implementações legadas.
 * @module tests/repositoryHygiene.test
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const forbiddenPaths = [
  'apps',
  'docker-compose.yml',
  'VALIDACAO.md',
  'CORRECAO-REACT-RUNTIME.md',
  'LEIA-ME-FIX-V2.md',
  'FIX-REACT.ps1',
  'FIX-REACT-V2.ps1',
  'docs/ESPECIFICACAO-TECNICA.md',
  'frontend/landing/src/App.jsx',
  'frontend/landing/src/components',
  'frontend/landing/src/content.js',
  'public/app.js',
  'public/index.html',
  'public/style.css',
  'public/admin.html',
  'public/admin.js',
  'public/reset-password.html',
  'public/reset-password.js'
];

test('pacote não contém artefatos estrangeiros ou legados', () => {
  for (const relativePath of forbiddenPaths) {
    assert.equal(fs.existsSync(relativePath), false, `${relativePath} deve permanecer removido`);
  }
});

test('raiz do backend contém somente bootstrap e application factory', () => {
  const files = fs.readdirSync('src')
    .filter((name) => path.extname(name) === '.js')
    .sort();
  assert.deepEqual(files, ['app.js', 'server.js']);
});

test('metadados principais identificam a release 26.2.0', () => {
  const packageMetadata = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const landingMetadata = JSON.parse(fs.readFileSync('frontend/landing/package.json', 'utf8'));
  assert.equal(packageMetadata.version, '26.2.0');
  assert.equal(landingMetadata.version, '26.2.0');
});
