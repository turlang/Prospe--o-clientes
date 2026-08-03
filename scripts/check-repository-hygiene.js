/**
 * @fileoverview Impede que resíduos, dados locais e segredos óbvios entrem no repositório.
 *
 * O verificador complementa o `.gitignore`: arquivos já rastreados continuam
 * existindo mesmo depois de serem ignorados, portanto o pipeline precisa
 * inspecionar a árvore presente no checkout. As regras são conservadoras para
 * evitar falsos positivos em documentação e artefatos gerados da landing.
 *
 * @module scripts/check-repository-hygiene
 */

const fs = require('node:fs');
const path = require('node:path');

const ROOT = process.cwd();
const IGNORED_DIRECTORIES = new Set([
  '.git',
  'node_modules',
  'coverage',
  'dist',
  'build',
  '.cache',
  '.npm',
  '.vite',
  '.turbo'
]);
const GENERATED_PREFIXES = [
  'public/landing-react/',
  'frontend/landing/dist/'
];
const TEXT_EXTENSIONS = new Set([
  '.cjs', '.css', '.env', '.example', '.gitignore', '.gitattributes',
  '.html', '.js', '.json', '.jsx', '.md', '.mjs', '.ps1', '.txt',
  '.yaml', '.yml'
]);
const FORBIDDEN_BASENAMES = new Set([
  '.DS_Store',
  'Thumbs.db',
  'Desktop.ini'
]);
const FORBIDDEN_FILE_PATTERNS = [
  /\.log$/i,
  /\.tmp$/i,
  /\.temp$/i,
  /\.bak$/i,
  /\.backup$/i,
  /\.old$/i,
  /\.orig$/i,
  /\.rej$/i,
  /\.sw[op]$/i,
  /~$/,
  /\.zip$/i,
  /\.tar$/i,
  /\.tar\.gz$/i,
  /\.tgz$/i,
  /\.sqlite3?$/i,
  /\.rdb$/i
];
const SECRET_PATTERNS = [
  { label: 'token GitHub', expression: /\bgh[pousr]_[A-Za-z0-9]{30,}\b/g },
  { label: 'chave OpenAI', expression: /\bsk-[A-Za-z0-9_-]{24,}\b/g },
  { label: 'chave Resend', expression: /\bre_[A-Za-z0-9]{24,}\b/g },
  { label: 'token Mercado Pago', expression: /\bAPP_USR-[A-Za-z0-9-]{24,}\b/g },
  { label: 'MongoDB com credencial embutida', expression: /mongodb(?:\+srv)?:\/\/[^\s/:]+:[^\s/@]+@[^\s]+/gi }
];

/**
 * Converte caminhos do sistema operacional para o formato estável usado nas
 * mensagens e comparações do verificador.
 *
 * @param {string} filePath Caminho absoluto ou relativo.
 * @returns {string} Caminho relativo com barras normais.
 */
function relativePath(filePath) {
  return path.relative(ROOT, filePath).split(path.sep).join('/');
}

/**
 * Indica se o arquivo pertence a uma saída gerada que não deve ser reformatada
 * manualmente. O nome ainda é verificado contra resíduos proibidos.
 *
 * @param {string} relative Caminho relativo normalizado.
 * @returns {boolean} Verdadeiro quando o conteúdo é gerado pelo build.
 */
function isGenerated(relative) {
  return GENERATED_PREFIXES.some((prefix) => relative.startsWith(prefix));
}

/**
 * Percorre a árvore sem entrar em dependências, caches ou builds locais.
 *
 * @param {string} entry Caminho inicial.
 * @param {string[]} output Acumulador de arquivos.
 * @returns {string[]} Arquivos encontrados.
 */
function collectFiles(entry, output = []) {
  if (!fs.existsSync(entry)) return output;
  const stat = fs.statSync(entry);

  if (stat.isFile()) {
    output.push(entry);
    return output;
  }

  for (const name of fs.readdirSync(entry)) {
    if (IGNORED_DIRECTORIES.has(name)) continue;
    collectFiles(path.join(entry, name), output);
  }

  return output;
}

/**
 * Decide se um arquivo deve ser tratado como texto mantido pelo time.
 *
 * @param {string} filePath Caminho absoluto.
 * @returns {boolean} Verdadeiro para extensões textuais conhecidas.
 */
function isTextFile(filePath) {
  const basename = path.basename(filePath);
  if (basename === '.gitignore' || basename === '.gitattributes' || basename === '.editorconfig') return true;
  return TEXT_EXTENSIONS.has(path.extname(filePath).toLowerCase());
}

/**
 * Evita procurar chaves reais dentro de exemplos e documentação, onde nomes de
 * variáveis e credenciais fictícias são necessários para orientar o usuário.
 *
 * @param {string} relative Caminho relativo normalizado.
 * @returns {boolean} Verdadeiro quando a busca de segredos deve ser executada.
 */
function shouldScanSecrets(relative) {
  if (relative === '.env.example') return false;
  if (relative.startsWith('docs/')) return false;
  if (relative.startsWith('tests/')) return false;
  if (relative === 'scripts/check-repository-hygiene.js') return false;
  return !isGenerated(relative);
}

const failures = [];
const files = collectFiles(ROOT);
let inspectedTextFiles = 0;

for (const file of files) {
  const relative = relativePath(file);
  const basename = path.basename(file);

  if (FORBIDDEN_BASENAMES.has(basename)) failures.push(`Arquivo de sistema operacional rastreado: ${relative}`);
  if (FORBIDDEN_FILE_PATTERNS.some((pattern) => pattern.test(relative))) failures.push(`Arquivo temporário ou pacote local rastreado: ${relative}`);
  if (/^\.env(?:\.|$)/.test(relative) && relative !== '.env.example') failures.push(`Arquivo de ambiente rastreado: ${relative}`);
  if (/^data\/.*\.json$/i.test(relative) && !/\.example\.json$/i.test(relative)) failures.push(`Dados locais rastreados: ${relative}`);
  if (isGenerated(relative) || !isTextFile(file)) continue;

  const buffer = fs.readFileSync(file);
  if (buffer.length > 2 * 1024 * 1024) continue;
  inspectedTextFiles += 1;

  if (buffer.length >= 3 && buffer[0] === 0xef && buffer[1] === 0xbb && buffer[2] === 0xbf) {
    failures.push(`Arquivo UTF-8 com BOM: ${relative}`);
  }

  const source = buffer.toString('utf8');
  if (source.includes('\u0000')) failures.push(`Arquivo textual contém byte nulo: ${relative}`);
  if (source.includes('\uFFFD')) failures.push(`Arquivo textual possui caracteres UTF-8 inválidos: ${relative}`);
  if (source.length && !source.endsWith('\n')) failures.push(`Arquivo sem quebra de linha final: ${relative}`);

  if (path.extname(relative).toLowerCase() !== '.md') {
    const line = source.split(/\r?\n/).findIndex((value) => /[ \t]+$/.test(value));
    if (line >= 0) failures.push(`Espaço em branco no fim da linha ${line + 1}: ${relative}`);
  }

  if (shouldScanSecrets(relative)) {
    for (const pattern of SECRET_PATTERNS) {
      pattern.expression.lastIndex = 0;
      if (pattern.expression.test(source)) failures.push(`Possível ${pattern.label} exposto em ${relative}`);
    }
  }
}

if (failures.length) {
  console.error('Falhas de higiene do repositório:');
  [...new Set(failures)].forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`Higiene validada: ${files.length} arquivos encontrados e ${inspectedTextFiles} arquivos textuais inspecionados.`);
