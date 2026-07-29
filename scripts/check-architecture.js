/**
 * @fileoverview Verifica limites arquiteturais e organização de diretórios.
 *
 * O verificador complementa testes de negócio com regras simples de estrutura:
 * bootstrap enxuto, persistência isolada, páginas públicas separadas de assets
 * e ausência de arquivos legados que reintroduzam caminhos antigos.
 *
 * @module scripts/check-architecture
 */

const fs = require('node:fs');
const path = require('node:path');

const ROOT = process.cwd();
const failures = [];

const requiredDirectories = [
  'src/config',
  'src/domain',
  'src/infrastructure',
  'src/integrations',
  'src/repositories',
  'src/routes',
  'src/services',
  'public/pages',
  'public/assets/dashboard',
  'frontend/landing/src/features',
  'frontend/landing/src/shared'
];

const forbiddenLegacyFiles = [
  'src/db.js',
  'src/storage.js',
  'src/planConfig.js',
  'src/localUserStore.js',
  'src/localTaskStore.js',
  'src/localUsageStore.js',
  'src/authRoutes.js',
  'public/index.html',
  'public/app.js',
  'public/style.css',
  'public/admin.html',
  'public/admin.js'
];

for (const directory of requiredDirectories) {
  if (!fs.existsSync(path.join(ROOT, directory))) failures.push(`Diretório obrigatório ausente: ${directory}`);
}

for (const file of forbiddenLegacyFiles) {
  if (fs.existsSync(path.join(ROOT, file))) failures.push(`Arquivo legado deve permanecer removido: ${file}`);
}

const rootSourceFiles = fs.readdirSync(path.join(ROOT, 'src'))
  .filter((name) => name.endsWith('.js'))
  .sort();
if (rootSourceFiles.join(',') !== 'app.js,server.js') {
  failures.push(`A raiz de src/ deve conter apenas app.js e server.js; encontrados: ${rootSourceFiles.join(', ')}`);
}

const appSource = fs.readFileSync(path.join(ROOT, 'src', 'app.js'), 'utf8');
if (appSource.includes("require('./db')") || appSource.includes("require('./storage')")) {
  failures.push('src/app.js ainda referencia módulos legados de infraestrutura.');
}

if (failures.length) {
  console.error('Falhas arquiteturais:');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log('Arquitetura validada: camadas e diretórios públicos estão organizados.');
