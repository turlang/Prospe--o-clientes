const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const ROOTS = ['src', 'public', 'scripts', 'tests'];
const EXTENSIONS = new Set(['.js', '.cjs', '.mjs']);
const IGNORED_DIRECTORIES = new Set(['node_modules', '.git', 'coverage']);

function collectFiles(entry, output = []) {
  if (!fs.existsSync(entry)) return output;
  const stat = fs.statSync(entry);
  if (stat.isFile()) {
    if (EXTENSIONS.has(path.extname(entry))) output.push(entry);
    return output;
  }

  for (const name of fs.readdirSync(entry)) {
    if (IGNORED_DIRECTORIES.has(name)) continue;
    collectFiles(path.join(entry, name), output);
  }
  return output;
}

const files = ROOTS.flatMap((root) => collectFiles(path.join(process.cwd(), root))).sort();
let failed = false;

for (const file of files) {
  const result = spawnSync(process.execPath, ['--check', file], { encoding: 'utf8' });
  if (result.status !== 0) {
    failed = true;
    process.stderr.write(`\nFalha de sintaxe em ${path.relative(process.cwd(), file)}\n`);
    process.stderr.write(result.stderr || result.stdout || 'Erro desconhecido.\n');
  }
}

if (failed) process.exit(1);
console.log(`Sintaxe validada em ${files.length} arquivos JavaScript.`);
