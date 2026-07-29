/**
 * @fileoverview Valida os artefatos públicos da landing page.
 *
 * O diretório público pode conter o bundle React produzido pelo Vite ou a
 * versão estática pré-compilada da mesma release. O verificador identifica o
 * contrato pelo próprio HTML e impede que uma landing antiga seja publicada.
 *
 * @module scripts/verify-landing-build
 */

const fs = require('node:fs');
const path = require('node:path');
const { LANDING_BUILD_PATH, LANDING_FALLBACK_PATH } = require('../src/config/paths');
const { LANDING_VERSION } = require('../src/config/application');

const COMMON_MARKERS = [`data-landing-version="${LANDING_VERSION}"`];
const REACT_MARKERS = ['id="root"', '<script'];
const STATIC_MARKERS = [
  'id="inicio"',
  'id="como-funciona"',
  'id="ferramentas"',
  'id="publico"',
  'id="planos"',
  'Signal Engine ativo',
  'sistema operacional de prospecção',
  'data-view-target="planos"',
  'landing-bottom-nav'
];

/**
 * Valida marcadores obrigatórios em um documento HTML.
 *
 * @param {string} filePath Caminho absoluto do documento.
 * @param {string} label Nome usado nas mensagens de erro.
 * @param {string[]} markers Marcadores específicos do contrato.
 * @returns {string} Conteúdo validado.
 */
function validateDocument(filePath, label, markers) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`${label} ausente: ${path.relative(process.cwd(), filePath)}`);
  }

  const source = fs.readFileSync(filePath, 'utf8');
  const missing = [...COMMON_MARKERS, ...markers].filter((marker) => !source.includes(marker));
  if (missing.length) {
    throw new Error(`${label} inválida. Marcadores ausentes: ${missing.join(', ')}`);
  }
  return source;
}

// A contingência é obrigatória em todas as releases.
validateDocument(LANDING_FALLBACK_PATH, 'Landing de contingência', STATIC_MARKERS);

// O artefato principal pode ser o bundle Vite ou o prebuild estático equivalente.
if (!fs.existsSync(LANDING_BUILD_PATH)) {
  throw new Error(`Landing pública ausente: ${path.relative(process.cwd(), LANDING_BUILD_PATH)}`);
}

const publicSource = fs.readFileSync(LANDING_BUILD_PATH, 'utf8');
const isReactBundle = publicSource.includes('id="root"');
validateDocument(
  LANDING_BUILD_PATH,
  isReactBundle ? 'Bundle React da landing' : 'Landing estática pré-compilada',
  isReactBundle ? REACT_MARKERS : STATIC_MARKERS
);

console.log(`Landing v${LANDING_VERSION} validada para deploy (${isReactBundle ? 'react-build' : 'static-prebuilt'}).`);
