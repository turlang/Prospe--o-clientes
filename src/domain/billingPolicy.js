/**
 * @fileoverview Políticas puras de preço, duração e validação de pagamentos.
 *
 * O módulo não acessa banco de dados nem rede. Essa separação permite testar
 * regras financeiras sem carregar Mongoose ou credenciais externas.
 *
 * @module domain/billingPolicy
 */

const { getPlan } = require('../planConfig');

/**
 * Converte uma representação monetária brasileira para número.
 *
 * @param {string|number} value Valor como `R$ 1.999,90` ou número.
 * @returns {number} Valor decimal; `NaN` quando a entrada não contém número.
 */
function parsePlanPrice(value) {
  const normalized = String(value || '').replace(/[^\d,.-]/g, '');
  if (!normalized) return NaN;

  const decimal = normalized.includes(',')
    ? normalized.replace(/\./g, '').replace(',', '.')
    : normalized;

  return Number(decimal);
}

/**
 * Obtém o preço numérico de um plano pago.
 *
 * @param {string} planId Identificador do plano.
 * @returns {number} Preço esperado em reais.
 */
function getPlanPrice(planId) {
  const plan = getPlan(planId);
  const price = parsePlanPrice(plan.priceLabel);
  if (Number.isFinite(price) && price > 0) return price;
  return planId === 'agency' ? 199 : 59;
}

/**
 * Resolve a duração contratual com limite defensivo de 1 a 365 dias.
 *
 * @param {string} [planId='pro'] Identificador do plano.
 * @returns {number} Duração em dias.
 */
function getPlanDurationDays(planId = 'pro') {
  const plan = getPlan(planId);
  const duration = Number(process.env.PLAN_DURATION_DAYS || plan.durationDays || 30);
  return Number.isInteger(duration) && duration >= 1 && duration <= 365 ? duration : 30;
}

/**
 * Calcula a data de expiração a partir do instante atual.
 *
 * @param {string} [planId='pro'] Identificador do plano.
 * @returns {Date} Data futura de expiração.
 */
function getPlanExpirationDate(planId = 'pro') {
  const date = new Date();
  date.setDate(date.getDate() + getPlanDurationDays(planId));
  return date;
}

/** @returns {boolean} `true` somente no ambiente de produção. */
function isProduction() {
  return String(process.env.NODE_ENV || '').toLowerCase() === 'production';
}

/**
 * Define se o checkout simulado pode ser usado no ambiente atual.
 *
 * @returns {boolean} Permissão explícita para simulação fora de produção.
 */
function isSimulatedBillingAllowed() {
  return !isProduction()
    && String(process.env.ALLOW_SIMULATED_BILLING || 'true').toLowerCase() === 'true';
}

/**
 * Confirma que valor e moeda correspondem ao plano pretendido.
 *
 * @param {object} payment Pagamento obtido diretamente do provedor.
 * @param {string} planId Plano indicado pela referência externa.
 * @returns {boolean} Resultado da validação financeira mínima.
 */
function validatePaymentValue(payment, planId) {
  const expected = getPlanPrice(planId);
  const paid = Number(payment?.transaction_amount || 0);
  const currency = String(payment?.currency_id || 'BRL').toUpperCase();
  return Number.isFinite(paid) && paid >= expected && currency === 'BRL';
}

module.exports = {
  getPlanDurationDays,
  getPlanExpirationDate,
  getPlanPrice,
  isProduction,
  isSimulatedBillingAllowed,
  parsePlanPrice,
  validatePaymentValue
};
