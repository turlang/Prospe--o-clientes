/**
 * @fileoverview Valida o artefato público da landing antes do deploy.
 *
 * O teste impede a regressão que manteve a landing antiga em produção: uma
 * versão só é considerada válida quando o documento público contém a marca da
 * release e todas as seções comerciais obrigatórias.
 *
 * @module scripts/verify-landing-build
 */

const fs = require('node:fs');
const path = require('node:path');
const { LANDING_BUILD_PATH, LANDING_FALLBACK_PATH } = require('../src/config/paths');
const { LANDING_VERSION } = require('../src/config/application');

const REQUIRED_MARKERS = [
  `data-landing-version="${LANDING_VERSION}"`,
  'id="inicio"',
  'id="como-funciona"',
  'id="ferramentas"',
  'id="publico"',
  'id="planos"',
  'Feche mais contratos de tecnologia'
];

function validateDocument(filePath, label) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`${label} ausente: ${path.relative(process.cwd(), filePath)}`);
  }

  const source = fs.readFileSync(filePath, 'utf8');
  const missing = REQUIRED_MARKERS.filter((marker) => !source.includes(marker));
  if (missing.length) {
    throw new Error(`${label} inválida. Marcadores ausentes: ${missing.join(', ')}`);
  }
}

validateDocument(LANDING_BUILD_PATH, 'Landing pública');
validateDocument(LANDING_FALLBACK_PATH, 'Landing de contingência');

console.log(`Landing v${LANDING_VERSION} validada para deploy.`);
