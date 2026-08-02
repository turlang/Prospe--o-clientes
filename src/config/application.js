/**
 * @fileoverview Metadados e políticas globais da aplicação.
 *
 * Valores usados por múltiplas camadas ficam centralizados para impedir que
 * versão, nome e comportamento de cache se tornem divergentes entre rotas.
 *
 * @module config/application
 */

const packageMetadata = require('../../package.json');

const APPLICATION_NAME = 'LeadHunter Pro';
const APPLICATION_VERSION = packageMetadata.version;
const LANDING_VERSION = '26.2.0';

/** @returns {boolean} Indica se o processo está executando em produção. */
function isProduction() {
  return String(process.env.NODE_ENV || '').toLowerCase() === 'production';
}

module.exports = {
  APPLICATION_NAME,
  APPLICATION_VERSION,
  LANDING_VERSION,
  isProduction
};
