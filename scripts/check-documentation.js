/**
 * @fileoverview Verifica documentação mínima e cabeçalhos dos módulos mantidos.
 *
 * Comentários são exigidos em nível de módulo e em decisões não óbvias. O
 * projeto não impõe comentários linha a linha, pois isso costuma duplicar o
 * código e degradar a manutenção.
 *
 * @module scripts/check-documentation
 */

const fs = require('node:fs');
const path = require('node:path');

const ROOT = process.cwd();
const SOURCE_ROOTS = ['src', 'public', 'scripts', 'tests', 'frontend'];
const DOCUMENTED_EXTENSIONS = new Set(['.js', '.jsx', '.mjs', '.cjs']);
const IGNORED = new Set(['node_modules', '.git', 'coverage', 'dist']);
const REQUIRED_DOCUMENTS = [
  'README.md',
  'CONTRIBUTING.md',
  'docs/ARQUITETURA.md',
  'docs/API.md',
  'docs/CODING_STANDARDS.md',
  'docs/ESPECIFICACAO_REQUISITOS.md',
  'docs/MATRIZ_RASTREABILIDADE.md',
  'docs/PLANO_DE_TESTES.md',
  'docs/RELEASE_25.1.0.md',
  'docs/DESIGN_SYSTEM.md',
  'docs/RELEASE_26.0.0.md',
  'docs/RELEASE_26.1.0.md',
  'docs/RELEASE_26.2.0.md',
  'docs/VALIDATION_26.2.0.md'
];

function collectModules(entry, output = []) {
  if (!fs.existsSync(entry)) return output;
  const stat = fs.statSync(entry);

  if (stat.isFile()) {
    if (DOCUMENTED_EXTENSIONS.has(path.extname(entry))) output.push(entry);
    return output;
  }

  for (const name of fs.readdirSync(entry)) {
    if (!IGNORED.has(name)) collectModules(path.join(entry, name), output);
  }

  return output;
}

const failures = [];
for (const document of REQUIRED_DOCUMENTS) {
  if (!fs.existsSync(path.join(ROOT, document))) failures.push(`Documento obrigatório ausente: ${document}`);
}

const files = SOURCE_ROOTS.flatMap((folder) => collectModules(path.join(ROOT, folder)));
for (const file of files) {
  const source = fs.readFileSync(file, 'utf8');
  const relative = path.relative(ROOT, file);
  if (!source.slice(0, 1400).includes('@fileoverview')) failures.push(`Módulo sem @fileoverview: ${relative}`);
}

const lineLimits = new Map([
  ['src/server.js', 150],
  ['src/app.js', 450]
]);
for (const [relative, limit] of lineLimits) {
  const source = fs.readFileSync(path.join(ROOT, relative), 'utf8');
  const total = source.split(/\r?\n/).length;
  if (total > limit) failures.push(`${relative} excede ${limit} linhas: ${total}`);
}

if (failures.length) {
  console.error('Falhas no padrão documental:');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`Documentação validada: ${files.length} módulos e ${REQUIRED_DOCUMENTS.length} documentos obrigatórios.`);
