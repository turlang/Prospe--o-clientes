/**
 * @fileoverview Componente do núcleo Sales OS `promptManager`, independente da camada de apresentação.
 *
 * Responsabilidade delimitada conforme a arquitetura descrita em
 * `docs/ARQUITETURA.md`. Alterações neste arquivo devem preservar os contratos
 * documentados e ser acompanhadas por testes quando afetarem regras de negócio.
 *
 * @module src/core/prompts/promptManager
 */

const fs = require('fs');
const path = require('path');

const TEMPLATE_DIR = path.join(__dirname, 'templates');
const cache = new Map();

function normalizeTemplateName(name) {
  return String(name || '').trim().replace(/[^a-z0-9_-]/gi, '').toLowerCase();
}

function getTemplate(name, { fresh = false } = {}) {
  const normalized = normalizeTemplateName(name);
  if (!normalized) throw new Error('Nome de prompt inválido.');
  if (!fresh && cache.has(normalized)) return cache.get(normalized);
  const filePath = path.join(TEMPLATE_DIR, `${normalized}.md`);
  if (!fs.existsSync(filePath)) throw new Error(`Prompt não encontrado: ${normalized}`);
  const content = fs.readFileSync(filePath, 'utf8').trim();
  cache.set(normalized, content);
  return content;
}

function renderTemplate(name, variables = {}) {
  return getTemplate(name).replace(/\{\{\s*([\w.-]+)\s*\}\}/g, (_match, key) => {
    const value = key.split('.').reduce((current, part) => current?.[part], variables);
    return value === undefined || value === null ? '' : String(value);
  });
}

function listTemplates() {
  return fs.readdirSync(TEMPLATE_DIR)
    .filter((file) => file.endsWith('.md'))
    .map((file) => file.replace(/\.md$/, ''))
    .sort();
}

function clearPromptCache() {
  cache.clear();
}

module.exports = { getTemplate, renderTemplate, listTemplates, clearPromptCache };
