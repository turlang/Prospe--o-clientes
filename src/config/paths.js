/**
 * @fileoverview Catálogo de caminhos absolutos utilizados pela aplicação.
 *
 * Resolver caminhos a partir da raiz elimina dependência acidental de
 * `process.cwd()` em repositórios e evita erros quando arquivos são movidos.
 *
 * @module config/paths
 */

const path = require('node:path');

const PROJECT_ROOT = path.resolve(__dirname, '..', '..');
const DATA_DIRECTORY = path.join(PROJECT_ROOT, 'data');
const PUBLIC_DIRECTORY = path.join(PROJECT_ROOT, 'public');
const PUBLIC_PAGES_DIRECTORY = path.join(PUBLIC_DIRECTORY, 'pages');
const LANDING_BUILD_DIRECTORY = path.join(PUBLIC_DIRECTORY, 'landing-react');

const APP_PAGE_PATH = path.join(PUBLIC_PAGES_DIRECTORY, 'app.html');
const ADMIN_PAGE_PATH = path.join(PUBLIC_PAGES_DIRECTORY, 'admin.html');
const RESET_PASSWORD_PAGE_PATH = path.join(PUBLIC_PAGES_DIRECTORY, 'reset-password.html');
const LANDING_BUILD_PATH = path.join(LANDING_BUILD_DIRECTORY, 'index.html');
const LANDING_FALLBACK_PATH = path.join(PUBLIC_DIRECTORY, 'landing-fallback.html');

/**
 * Retorna o caminho de um arquivo de persistência local.
 *
 * @param {string} filename Nome simples do arquivo JSON.
 * @returns {string} Caminho absoluto dentro de `data/`.
 */
function resolveDataPath(filename) {
  const safeName = path.basename(String(filename || ''));
  if (!safeName) throw new Error('Nome de arquivo de dados inválido.');
  return path.join(DATA_DIRECTORY, safeName);
}

module.exports = {
  PROJECT_ROOT,
  DATA_DIRECTORY,
  PUBLIC_DIRECTORY,
  PUBLIC_PAGES_DIRECTORY,
  LANDING_BUILD_DIRECTORY,
  APP_PAGE_PATH,
  ADMIN_PAGE_PATH,
  RESET_PASSWORD_PAGE_PATH,
  LANDING_BUILD_PATH,
  LANDING_FALLBACK_PATH,
  resolveDataPath
};
