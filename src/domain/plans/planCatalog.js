/**
 * @fileoverview Catálogo central de planos comerciais.
 *
 * O catálogo oferece leitura síncrona para as regras de negócio e persistência
 * assíncrona para o painel administrativo. Em produção, a fonte durável é o
 * MongoDB; o arquivo JSON permanece como configuração inicial e fallback local.
 *
 * @module domain/plans/planCatalog
 */

const fs = require('node:fs');
const path = require('node:path');

const PLANS_PATH = path.join(__dirname, '..', '..', 'data', 'plans.json');
const PLAN_CONFIGURATION_KEY = 'commercial-plans';

const OFFICIAL_TRIAL_RULE = Object.freeze({
  durationDays: 0,
  dailyLeadLimit: 10,
  totalLeadLimit: 10,
  isPaid: false,
  features: [
    '10 leads totais para experimentar',
    'CRM Kanban básico',
    'Abordagens comerciais por templates',
    'Follow-ups manuais',
    'Uso único por usuário/dispositivo'
  ]
});

const DEFAULT_PLANS = Object.freeze({
  trial: {
    id: 'trial',
    name: 'Teste Gratuito',
    description: 'Para conhecer o processo comercial antes de escalar.',
    priceLabel: 'R$ 0',
    billingPeriod: 'sem cobrança',
    ...OFFICIAL_TRIAL_RULE
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    description: 'Para profissionais com uma rotina comercial ativa.',
    priceLabel: 'R$ 59/mês',
    billingPeriod: 'mês',
    durationDays: 30,
    dailyLeadLimit: 500,
    totalLeadLimit: null,
    isPaid: true,
    featured: true,
    features: [
      '500 leads por dia',
      'Dashboard executivo',
      'Histórico completo',
      'Campanhas e follow-ups'
    ]
  },
  agency: {
    id: 'agency',
    name: 'Agência',
    description: 'Para operações com equipe e maior volume de oportunidades.',
    priceLabel: 'R$ 199/mês',
    billingPeriod: 'mês',
    durationDays: 30,
    dailyLeadLimit: 5000,
    totalLeadLimit: null,
    isPaid: true,
    features: [
      'Até 5.000 leads por dia',
      'Uso para times e agências',
      'Pipeline comercial avançado',
      'Preparado para white label'
    ]
  }
});

let planCache = null;
let catalogMetadata = {
  revision: 1,
  updatedAt: null,
  source: 'file'
};

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function normalizeFeatures(value) {
  if (Array.isArray(value)) return value.filter(Boolean).map((item) => String(item).trim()).filter(Boolean);
  return String(value || '')
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizePlanConfig(plan) {
  const totalLeadLimit = plan.totalLeadLimit === '' || plan.totalLeadLimit === undefined
    ? null
    : plan.totalLeadLimit;

  return {
    ...plan,
    id: String(plan.id || '').trim().toLowerCase(),
    name: String(plan.name || '').trim(),
    description: String(plan.description || '').trim(),
    priceLabel: String(plan.priceLabel || '').trim(),
    billingPeriod: String(plan.billingPeriod || '').trim(),
    durationDays: Math.max(0, Number(plan.durationDays || 0)),
    dailyLeadLimit: Math.max(0, Number(plan.dailyLeadLimit || 0)),
    totalLeadLimit: totalLeadLimit === null ? null : Math.max(0, Number(totalLeadLimit || 0)),
    isPaid: Boolean(plan.isPaid),
    featured: Boolean(plan.featured),
    features: normalizeFeatures(plan.features)
  };
}

function enforceOfficialTrial(plan) {
  return {
    ...plan,
    ...OFFICIAL_TRIAL_RULE,
    id: 'trial',
    name: 'Teste Gratuito',
    priceLabel: 'R$ 0',
    billingPeriod: 'sem cobrança',
    featured: false
  };
}

function mergePlans(source = {}) {
  return Object.fromEntries(
    Object.entries(DEFAULT_PLANS).map(([id, defaults]) => {
      const incoming = source[id] && typeof source[id] === 'object' ? source[id] : {};
      const merged = normalizePlanConfig({ ...defaults, ...incoming, id });
      return [id, id === 'trial' ? normalizePlanConfig(enforceOfficialTrial(merged)) : merged];
    })
  );
}

function readPlansFromDisk() {
  try {
    const parsed = JSON.parse(fs.readFileSync(PLANS_PATH, 'utf8'));
    return mergePlans(parsed);
  } catch (error) {
    console.warn(`[plans] Configuração local indisponível; usando padrões (${error.message}).`);
    return mergePlans(DEFAULT_PLANS);
  }
}

function persistPlansToDisk(plans) {
  try {
    fs.mkdirSync(path.dirname(PLANS_PATH), { recursive: true });
    fs.writeFileSync(PLANS_PATH, `${JSON.stringify(plans, null, 2)}\n`, 'utf8');
  } catch (error) {
    // O disco do Render não é a fonte durável. Em produção, o MongoDB continua
    // sendo persistido mesmo quando o filesystem está somente leitura.
    console.warn(`[plans] Não foi possível atualizar o fallback local: ${error.message}`);
  }
}

function replaceCache(plans, metadata = {}) {
  planCache = mergePlans(plans);
  catalogMetadata = {
    revision: Math.max(1, Number(metadata.revision || catalogMetadata.revision || 1)),
    updatedAt: metadata.updatedAt ? new Date(metadata.updatedAt).toISOString() : new Date().toISOString(),
    source: metadata.source || catalogMetadata.source || 'memory'
  };
  return clone(planCache);
}

function ensureCache() {
  if (!planCache) {
    planCache = readPlansFromDisk();
    catalogMetadata.updatedAt = new Date().toISOString();
  }
  return planCache;
}

function normalizePlan(plan) {
  const id = String(plan || '').trim().toLowerCase();
  return ensureCache()[id] ? id : 'trial';
}

function getPlan(plan) {
  return clone(ensureCache()[normalizePlan(plan)]);
}

function getAllPlans() {
  return Object.values(ensureCache()).map(clone);
}

function getCatalogMetadata() {
  return { ...catalogMetadata };
}

function savePlans(plans, metadata = {}) {
  const next = replaceCache(plans, {
    revision: metadata.revision || catalogMetadata.revision + 1,
    updatedAt: metadata.updatedAt || new Date(),
    source: metadata.source || 'file'
  });
  persistPlansToDisk(next);
  return next;
}

function createUpdatedCatalog(id, payload = {}) {
  const planId = String(id || '').trim().toLowerCase();
  if (!Object.prototype.hasOwnProperty.call(DEFAULT_PLANS, planId)) throw new Error('Plano inválido.');

  const cleanPayload = Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== undefined)
  );

  const nextCatalog = clone(ensureCache());
  const nextPlan = normalizePlanConfig({
    ...nextCatalog[planId],
    ...cleanPayload,
    id: planId,
    isPaid: planId !== 'trial'
  });

  nextCatalog[planId] = planId === 'trial'
    ? normalizePlanConfig(enforceOfficialTrial(nextPlan))
    : nextPlan;

  return { planId, nextCatalog };
}

function updatePlan(id, payload = {}) {
  const { planId, nextCatalog } = createUpdatedCatalog(id, payload);
  savePlans(nextCatalog, { source: 'file' });
  return getPlan(planId);
}

/**
 * Hidrata o catálogo com a configuração persistida no MongoDB.
 *
 * @param {object} options Dependências de persistência.
 * @param {boolean} options.mongoAvailable Indica conexão ativa.
 * @param {import('mongoose').Model} options.PlanConfigurationModel Modelo Mongoose.
 * @returns {Promise<Array<object>>} Catálogo inicializado.
 */
async function initializePlanCatalog({ mongoAvailable, PlanConfigurationModel } = {}) {
  ensureCache();
  if (!mongoAvailable || !PlanConfigurationModel) return getAllPlans();

  const persisted = await PlanConfigurationModel.findOne({ key: PLAN_CONFIGURATION_KEY }).lean();
  if (persisted?.plans) {
    replaceCache(persisted.plans, {
      revision: persisted.revision,
      updatedAt: persisted.updatedAt,
      source: 'mongodb'
    });
    persistPlansToDisk(planCache);
    return getAllPlans();
  }

  const created = await PlanConfigurationModel.findOneAndUpdate(
    { key: PLAN_CONFIGURATION_KEY },
    {
      $setOnInsert: {
        key: PLAN_CONFIGURATION_KEY,
        plans: clone(ensureCache()),
        revision: catalogMetadata.revision,
        updatedBy: null
      }
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  ).lean();

  replaceCache(created.plans, {
    revision: created.revision,
    updatedAt: created.updatedAt,
    source: 'mongodb'
  });
  return getAllPlans();
}

/**
 * Atualiza o catálogo e grava a mesma revisão no MongoDB.
 *
 * @param {string} id Identificador do plano.
 * @param {object} payload Campos editáveis.
 * @param {object} options Dependências e autor da alteração.
 * @returns {Promise<{plan: object, metadata: object}>} Plano e revisão publicada.
 */
async function updatePlanPersistent(id, payload = {}, {
  mongoAvailable = false,
  PlanConfigurationModel = null,
  updatedBy = null
} = {}) {
  if (!mongoAvailable || !PlanConfigurationModel) {
    const updatedPlan = updatePlan(id, payload);
    return { plan: updatedPlan, metadata: getCatalogMetadata() };
  }

  // A alteração só entra no catálogo ativo depois que a gravação durável é
  // confirmada. Assim, falhas do MongoDB não deixam memória e banco divergentes.
  const { planId, nextCatalog } = createUpdatedCatalog(id, payload);
  const document = await PlanConfigurationModel.findOneAndUpdate(
    { key: PLAN_CONFIGURATION_KEY },
    {
      $set: {
        plans: nextCatalog,
        updatedBy: updatedBy || null
      },
      $inc: { revision: 1 }
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  ).lean();

  replaceCache(document.plans, {
    revision: document.revision,
    updatedAt: document.updatedAt,
    source: 'mongodb'
  });
  persistPlansToDisk(planCache);

  return { plan: getPlan(planId), metadata: getCatalogMetadata() };
}

module.exports = {
  PLANS: DEFAULT_PLANS,
  getAllPlans,
  getCatalogMetadata,
  getPlan,
  initializePlanCatalog,
  mergePlans,
  normalizePlan,
  normalizePlanConfig,
  savePlans,
  updatePlan,
  updatePlanPersistent
};
