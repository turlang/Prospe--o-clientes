/**
 * @fileoverview Configuração normalizada do CRM avançado.
 *
 * Mantém múltiplos pipelines, etapas personalizadas, campos adicionais,
 * filtros salvos, metas e catálogo comercial em um contrato único por usuário.
 *
 * @module domain/crm/crmConfiguration
 */

const { LEAD_STATUS_ORDER } = require('../leadStatus');

const MAX_PIPELINES = 8;
const MAX_CUSTOM_FIELDS = 24;
const MAX_SAVED_FILTERS = 20;
const MAX_CATALOG_ITEMS = 80;
const FIELD_TYPES = new Set(['text', 'number', 'date', 'select', 'boolean']);

const DEFAULT_STAGE_LABELS = Object.freeze({
  NOVO: 'Novo lead',
  CONTATADO: 'Contato realizado',
  INTERESSADO: 'Interesse confirmado',
  REUNIAO: 'Reunião',
  PROPOSTA: 'Proposta enviada',
  FECHADO: 'Fechado',
  SEM_INTERESSE: 'Perdido'
});

const DEFAULT_STAGE_HINTS = Object.freeze({
  NOVO: 'Encontrado, ainda sem contato',
  CONTATADO: 'Primeira abordagem registrada',
  INTERESSADO: 'Respondeu ou pediu mais detalhes',
  REUNIAO: 'Diagnóstico ou conversa agendada',
  PROPOSTA: 'Proposta ou orçamento enviado',
  FECHADO: 'Virou cliente',
  SEM_INTERESSE: 'Sem interesse ou descartado'
});

function slugify(value, fallback = 'item') {
  const normalized = String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);
  return normalized || fallback;
}

function uniqueStrings(values, limit = 20) {
  return [...new Set((Array.isArray(values) ? values : [])
    .map((item) => String(item || '').trim())
    .filter(Boolean))].slice(0, limit);
}

function createDefaultPipeline() {
  return {
    id: 'sales',
    name: 'Pipeline comercial',
    description: 'Fluxo principal de prospecção e fechamento.',
    stages: LEAD_STATUS_ORDER.map((key) => ({
      key,
      label: DEFAULT_STAGE_LABELS[key],
      hint: DEFAULT_STAGE_HINTS[key],
      probability: ({ NOVO: 8, CONTATADO: 16, INTERESSADO: 34, REUNIAO: 46, PROPOSTA: 58, FECHADO: 100, SEM_INTERESSE: 0 })[key],
      requiredFields: key === 'PROPOSTA'
        ? ['ticketEstimado']
        : key === 'FECHADO'
          ? ['valorFechado', 'servicoPrincipal']
          : key === 'SEM_INTERESSE'
            ? ['motivoPerda']
            : []
    }))
  };
}

function createDefaultCrmConfiguration() {
  return {
    schemaVersion: 1,
    activePipelineId: 'sales',
    pipelines: [createDefaultPipeline()],
    customFields: [],
    savedFilters: [],
    goals: {
      period: 'monthly',
      leads: 40,
      contacts: 24,
      proposals: 8,
      closed: 3,
      revenue: 6000
    },
    catalog: [
      { id: 'site-institucional', name: 'Site institucional', type: 'service', unitPrice: 1800, recurring: false, active: true },
      { id: 'landing-page', name: 'Landing page', type: 'service', unitPrice: 900, recurring: false, active: true },
      { id: 'manutencao', name: 'Manutenção mensal', type: 'service', unitPrice: 250, recurring: true, active: true },
      { id: 'automacao', name: 'Automação comercial', type: 'service', unitPrice: 1500, recurring: false, active: true }
    ],
    updatedAt: new Date().toISOString()
  };
}

function normalizeStage(stage = {}, index = 0) {
  const key = String(stage.key || LEAD_STATUS_ORDER[index] || '').trim().toUpperCase();
  if (!LEAD_STATUS_ORDER.includes(key)) return null;
  const probability = Math.max(0, Math.min(100, Number(stage.probability ?? 0)));
  return {
    key,
    label: String(stage.label || DEFAULT_STAGE_LABELS[key]).trim().slice(0, 60),
    hint: String(stage.hint || DEFAULT_STAGE_HINTS[key]).trim().slice(0, 140),
    probability: Number.isFinite(probability) ? probability : 0,
    requiredFields: uniqueStrings(stage.requiredFields, 16)
  };
}

function normalizePipeline(pipeline = {}, index = 0) {
  const fallback = createDefaultPipeline();
  const name = String(pipeline.name || `Pipeline ${index + 1}`).trim().slice(0, 80);
  const id = slugify(pipeline.id || name, `pipeline-${index + 1}`);
  const stages = (Array.isArray(pipeline.stages) ? pipeline.stages : fallback.stages)
    .map(normalizeStage)
    .filter(Boolean);
  const uniqueStages = [];
  const seen = new Set();
  for (const stage of stages) {
    if (seen.has(stage.key)) continue;
    seen.add(stage.key);
    uniqueStages.push(stage);
  }
  if (!uniqueStages.length) uniqueStages.push(...fallback.stages);
  return {
    id,
    name: name || fallback.name,
    description: String(pipeline.description || '').trim().slice(0, 180),
    stages: uniqueStages
  };
}

function normalizeCustomField(field = {}, index = 0) {
  const label = String(field.label || `Campo ${index + 1}`).trim().slice(0, 60);
  const type = FIELD_TYPES.has(String(field.type || '').toLowerCase()) ? String(field.type).toLowerCase() : 'text';
  return {
    id: slugify(field.id || label, `campo-${index + 1}`),
    label,
    type,
    options: type === 'select' ? uniqueStrings(field.options, 20) : [],
    requiredAtStages: uniqueStrings(field.requiredAtStages, 8).map((item) => item.toUpperCase()).filter((item) => LEAD_STATUS_ORDER.includes(item)),
    active: field.active !== false
  };
}

function normalizeSavedFilter(filter = {}, index = 0) {
  const name = String(filter.name || `Filtro ${index + 1}`).trim().slice(0, 60);
  const criteria = filter.criteria && typeof filter.criteria === 'object' && !Array.isArray(filter.criteria)
    ? structuredClone(filter.criteria)
    : {};
  return {
    id: slugify(filter.id || name, `filtro-${index + 1}`),
    name,
    criteria
  };
}

function normalizeGoals(goals = {}) {
  function nonNegative(value, fallback) {
    const number = Number(value);
    return Number.isFinite(number) && number >= 0 ? Math.round(number) : fallback;
  }
  return {
    period: ['monthly', 'quarterly'].includes(String(goals.period)) ? String(goals.period) : 'monthly',
    leads: nonNegative(goals.leads, 40),
    contacts: nonNegative(goals.contacts, 24),
    proposals: nonNegative(goals.proposals, 8),
    closed: nonNegative(goals.closed, 3),
    revenue: nonNegative(goals.revenue, 6000)
  };
}

function normalizeCatalogItem(item = {}, index = 0) {
  const name = String(item.name || `Item ${index + 1}`).trim().slice(0, 80);
  const price = Number(item.unitPrice ?? item.price ?? 0);
  return {
    id: slugify(item.id || name, `catalogo-${index + 1}`),
    name,
    type: String(item.type || '').toLowerCase() === 'product' ? 'product' : 'service',
    unitPrice: Number.isFinite(price) && price >= 0 ? Math.round(price * 100) / 100 : 0,
    recurring: Boolean(item.recurring),
    active: item.active !== false
  };
}

function dedupeById(items) {
  const map = new Map();
  for (const item of items) map.set(item.id, item);
  return [...map.values()];
}

function normalizeCrmConfiguration(input = {}) {
  const fallback = createDefaultCrmConfiguration();
  const pipelines = dedupeById((Array.isArray(input.pipelines) ? input.pipelines : fallback.pipelines)
    .slice(0, MAX_PIPELINES)
    .map(normalizePipeline));
  if (!pipelines.length) pipelines.push(createDefaultPipeline());

  const activePipelineId = pipelines.some((item) => item.id === input.activePipelineId)
    ? input.activePipelineId
    : pipelines[0].id;

  return {
    schemaVersion: 1,
    activePipelineId,
    pipelines,
    customFields: dedupeById((Array.isArray(input.customFields) ? input.customFields : [])
      .slice(0, MAX_CUSTOM_FIELDS)
      .map(normalizeCustomField)),
    savedFilters: dedupeById((Array.isArray(input.savedFilters) ? input.savedFilters : [])
      .slice(0, MAX_SAVED_FILTERS)
      .map(normalizeSavedFilter)),
    goals: normalizeGoals(input.goals),
    catalog: dedupeById((Array.isArray(input.catalog) ? input.catalog : fallback.catalog)
      .slice(0, MAX_CATALOG_ITEMS)
      .map(normalizeCatalogItem)),
    updatedAt: new Date().toISOString()
  };
}

function getPipeline(config, pipelineId) {
  const normalized = normalizeCrmConfiguration(config);
  return normalized.pipelines.find((item) => item.id === pipelineId)
    || normalized.pipelines.find((item) => item.id === normalized.activePipelineId)
    || normalized.pipelines[0];
}

function getStage(config, pipelineId, status) {
  const pipeline = getPipeline(config, pipelineId);
  return pipeline.stages.find((item) => item.key === String(status || '').toUpperCase()) || null;
}

module.exports = {
  FIELD_TYPES,
  DEFAULT_STAGE_LABELS,
  DEFAULT_STAGE_HINTS,
  createDefaultPipeline,
  createDefaultCrmConfiguration,
  normalizeCrmConfiguration,
  getPipeline,
  getStage,
  slugify
};
