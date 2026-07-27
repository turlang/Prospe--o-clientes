/**
 * @fileoverview Verifica o padrão documental e limites estruturais do projeto.
 *
 * O script não avalia a qualidade literária dos comentários. Ele garante que
 * cada módulo seja identificável e que artefatos acadêmicos essenciais não
 * desapareçam em alterações futuras.
 *
 * @module scripts/check-documentation
 */

const fs = require('node:fs');
const path = require('node:path');

const ROOT = process.cwd();
const JS_ROOTS = ['src', 'public', 'scripts', 'tests'];
const IGNORED = new Set(['node_modules', '.git', 'coverage']);
const REQUIRED_DOCUMENTS = [
  'README.md',
  'CONTRIBUTING.md',
  'docs/ARQUITETURA.md',
  'docs/API.md',
  'docs/ESPECIFICACAO_REQUISITOS.md',
  'docs/GUIA_DE_CODIGO.md',
  'docs/MATRIZ_RASTREABILIDADE.md',
  'docs/PLANO_DE_TESTES.md',
  'docs/RELATORIO_ACADEMICO.md'
];

function collectJavaScript(entry, output = []) {
  if (!fs.existsSync(entry)) return output;
  const stat = fs.statSync(entry);

  if (stat.isFile()) {
    if (path.extname(entry) === '.js') output.push(entry);
    return output;
  }

  for (const name of fs.readdirSync(entry)) {
    if (IGNORED.has(name)) continue;
    collectJavaScript(path.join(entry, name), output);
  }

  return output;
}

const failures = [];
for (const document of REQUIRED_DOCUMENTS) {
  if (!fs.existsSync(path.join(ROOT, document))) {
    failures.push(`Documento obrigatório ausente: ${document}`);
  }
}

const files = JS_ROOTS.flatMap((folder) => collectJavaScript(path.join(ROOT, folder)));
for (const file of files) {
  const source = fs.readFileSync(file, 'utf8');
  const relative = path.relative(ROOT, file);
  if (!source.slice(0, 1000).includes('@fileoverview')) {
    failures.push(`Módulo sem @fileoverview: ${relative}`);
  }
}

const lineLimits = new Map([
  ['src/server.js', 150],
  ['src/app.js', 400]
]);
for (const [relative, limit] of lineLimits) {
  const source = fs.readFileSync(path.join(ROOT, relative), 'utf8');
  const lines = source.split(/\r?\n/).length;
  if (lines > limit) failures.push(`${relative} excede ${limit} linhas: ${lines}`);
}

if (failures.length) {
  console.error('Falhas no padrão documental:');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`Documentação validada: ${files.length} módulos e ${REQUIRED_DOCUMENTS.length} documentos obrigatórios.`);
