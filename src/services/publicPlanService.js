/**
 * @fileoverview Contrato público dos planos exibidos na landing page.
 *
 * A configuração administrativa usa `priceLabel` por permitir valores como
 * "R$ 59/mês". A landing precisa de uma representação estável e não deve
 * conhecer detalhes internos do catálogo. Este serviço normaliza os campos e
 * mantém compatibilidade com clientes que esperam preço numérico.
 *
 * @module services/publicPlanService
 */

const { getAllPlans, getCatalogMetadata } = require('../domain/plans/planCatalog');

/**
 * Converte um preço brasileiro textual em valor numérico.
 *
 * @param {string|number|null|undefined} value Preço recebido do catálogo.
 * @returns {number} Valor monetário normalizado, sem conversão de moeda.
 */
function parseBrazilianPrice(value) {
  if (typeof value === 'number' && Number.isFinite(value)) return Math.max(0, value);

  let normalized = String(value || '').replace(/[^0-9.,-]/g, '');
  if (!normalized) return 0;

  const lastComma = normalized.lastIndexOf(',');
  const lastDot = normalized.lastIndexOf('.');

  if (lastComma >= 0 && lastDot >= 0) {
    if (lastComma > lastDot) {
      normalized = normalized.replace(/\./g, '').replace(',', '.');
    } else {
      normalized = normalized.replace(/,/g, '');
    }
  } else if (lastComma >= 0) {
    normalized = normalized.replace(/\./g, '').replace(',', '.');
  } else if (lastDot >= 0) {
    const decimalLength = normalized.length - lastDot - 1;
    if (decimalLength === 3) normalized = normalized.replace(/\./g, '');
  }

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? Math.max(0, parsed) : 0;
}

/**
 * Separa a parte monetária e o período de um rótulo como `R$ 59/mês`.
 *
 * @param {object} plan Plano interno.
 * @returns {{displayPrice: string, billingPeriod: string}}
 */
function resolvePricePresentation(plan) {
  const rawLabel = String(plan.priceLabel || '').trim();
  const separatorIndex = rawLabel.indexOf('/');
  const displayPrice = (separatorIndex >= 0 ? rawLabel.slice(0, separatorIndex) : rawLabel).trim()
    || new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 2
    }).format(parseBrazilianPrice(plan.price));

  const billingPeriod = (separatorIndex >= 0 ? rawLabel.slice(separatorIndex + 1) : plan.billingPeriod)
    || (plan.isPaid ? 'mês' : 'sem cobrança');

  return { displayPrice, billingPeriod: String(billingPeriod).trim() };
}

/**
 * Converte um plano interno no contrato público consumido pela landing.
 *
 * @param {object} plan Plano do catálogo de domínio.
 * @returns {object} DTO público sem campos sensíveis.
 */
function serializePublicPlan(plan) {
  const price = parseBrazilianPrice(plan.price ?? plan.priceLabel);
  const presentation = resolvePricePresentation({ ...plan, price });

  return {
    id: plan.id,
    name: plan.name,
    description: plan.description || 'Plano comercial do LeadHunter Pro.',
    price,
    priceCents: Math.round(price * 100),
    priceLabel: String(plan.priceLabel || presentation.displayPrice),
    displayPrice: presentation.displayPrice,
    billingPeriod: presentation.billingPeriod,
    durationDays: Number(plan.durationDays || 0),
    dailyLeadLimit: Number(plan.dailyLeadLimit || 0),
    totalLeadLimit: plan.totalLeadLimit === null ? null : Number(plan.totalLeadLimit || 0),
    isPaid: Boolean(plan.isPaid),
    featured: Boolean(plan.featured || plan.id === 'pro'),
    features: Array.isArray(plan.features) ? [...plan.features] : []
  };
}

/** @returns {Array<object>} Planos públicos na ordem comercial oficial. */
function getPublicPlans() {
  return getAllPlans().map(serializePublicPlan);
}

module.exports = {
  getPublicPlans,
  getPublicPlanMetadata: getCatalogMetadata,
  parseBrazilianPrice,
  serializePublicPlan
};
