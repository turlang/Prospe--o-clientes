/**
 * @fileoverview Fonte única de configuração, normalização e persistência dos planos comerciais.
 *
 * Responsabilidade delimitada conforme a arquitetura descrita em
 * `docs/ARQUITETURA.md`. Alterações neste arquivo devem preservar os contratos
 * documentados e ser acompanhadas por testes quando afetarem regras de negócio.
 *
 * @module src/domain/plans/planCatalog
 */

/**
 * planConfig.js
 * -----------------------------------------------------------------------------
 * Fonte única dos planos comerciais.
 *
 * A configuração padrão fica neste arquivo, mas pode ser sobrescrita por
 * src/data/plans.json quando o Admin edita os planos pelo painel Master.
 */

const fs = require('fs');
const path = require('path');

const PLANS_PATH = path.join(__dirname, '..', '..', 'data', 'plans.json');

const OFFICIAL_TRIAL_RULE = {
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
};

const DEFAULT_PLANS = {
  trial: {
    id: 'trial',
    name: 'Teste Gratuito',
    priceLabel: 'R$ 0',
    ...OFFICIAL_TRIAL_RULE
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    priceLabel: 'R$ 59/mês',
    durationDays: 30,
    dailyLeadLimit: 500,
    totalLeadLimit: null,
    isPaid: true,
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
    priceLabel: 'R$ 199/mês',
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
};

function readPlansFromDisk() {
  try {
    const parsed = JSON.parse(fs.readFileSync(PLANS_PATH, 'utf8'));
    return mergePlans(parsed);
  } catch {
    return mergePlans(DEFAULT_PLANS);
  }
}

function enforceOfficialTrial(plan) {
  return {
    ...plan,
    ...OFFICIAL_TRIAL_RULE,
    id: 'trial',
    name: 'Teste Gratuito',
    priceLabel: 'R$ 0'
  };
}

function mergePlans(source = {}) {
  return Object.fromEntries(
    Object.entries(DEFAULT_PLANS).map(([id, defaults]) => {
      const incoming = source[id] || {};
      const merged = normalizePlanConfig({ ...defaults, ...incoming, id });
      return [id, id === 'trial' ? normalizePlanConfig(enforceOfficialTrial(merged)) : merged];
    })
  );
}

function normalizePlanConfig(plan) {
  const totalLeadLimit = plan.totalLeadLimit === '' || plan.totalLeadLimit === undefined
    ? null
    : plan.totalLeadLimit;

  return {
    ...plan,
    dailyLeadLimit: Math.max(0, Number(plan.dailyLeadLimit || 0)),
    totalLeadLimit: totalLeadLimit === null ? null : Math.max(0, Number(totalLeadLimit || 0)),
    durationDays: Math.max(0, Number(plan.durationDays || 0)),
    isPaid: Boolean(plan.isPaid),
    features: Array.isArray(plan.features)
      ? plan.features.filter(Boolean).map(String)
      : String(plan.features || '').split('\n').map((item) => item.trim()).filter(Boolean)
  };
}

function savePlans(plans) {
  fs.mkdirSync(path.dirname(PLANS_PATH), { recursive: true });
  fs.writeFileSync(PLANS_PATH, JSON.stringify(mergePlans(plans), null, 2));
}

function normalizePlan(plan) {
  const id = String(plan || '').toLowerCase();
  return readPlansFromDisk()[id] ? id : 'trial';
}

function getPlan(plan) {
  const plans = readPlansFromDisk();
  return plans[normalizePlan(plan)];
}

function getAllPlans() {
  return Object.values(readPlansFromDisk());
}

function updatePlan(id, payload = {}) {
  const planId = normalizePlan(id);
  if (!['trial', 'pro', 'agency'].includes(planId)) throw new Error('Plano inválido.');

  const cleanPayload = Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== undefined)
  );

  const current = readPlansFromDisk();
  const nextPlan = normalizePlanConfig({
    ...current[planId],
    ...cleanPayload,
    id: planId,
    isPaid: planId !== 'trial'
  });

  current[planId] = planId === 'trial' ? normalizePlanConfig(enforceOfficialTrial(nextPlan)) : nextPlan;
  savePlans(current);
  return current[planId];
}

module.exports = { PLANS: DEFAULT_PLANS, normalizePlan, getPlan, getAllPlans, updatePlan, savePlans };
