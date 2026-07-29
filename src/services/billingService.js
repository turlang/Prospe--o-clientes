/**
 * @fileoverview Serviço de domínio `billingService` responsável por regras comerciais reutilizáveis.
 *
 * Responsabilidade delimitada conforme a arquitetura descrita em
 * `docs/ARQUITETURA.md`. Alterações neste arquivo devem preservar os contratos
 * documentados e ser acompanhadas por testes quando afetarem regras de negócio.
 *
 * @module src/services/billingService
 */

const User = require('../models/User');
const Payment = require('../models/Payment');
const { hasMongoUri } = require('../infrastructure/database/mongoConnection');
const { findUserById, updateLocalUserPlan } = require('../repositories/local/userRepository');
const { getPlan } = require('../domain/plans/planCatalog');
const {
  getPlanDurationDays,
  getPlanExpirationDate,
  getPlanPrice,
  isProduction,
  isSimulatedBillingAllowed,
  parsePlanPrice,
  validatePaymentValue
} = require('../domain/billingPolicy');

function publicBaseUrl(req) {
  const configured = String(process.env.PUBLIC_APP_URL || '').trim();
  if (configured) {
    try { return new URL(configured).origin; }
    catch {
      const error = new Error('PUBLIC_APP_URL está inválida.');
      error.statusCode = 500;
      throw error;
    }
  }

  if (isProduction()) {
    const error = new Error('PUBLIC_APP_URL é obrigatória para checkout em produção.');
    error.statusCode = 500;
    throw error;
  }

  return `${req.protocol}://${req.get('host')}`;
}

async function downgradeExpiredUserIfNeeded(user) {
  if (!user || user.plan === 'trial' || !user.planExpiresAt) return user;

  const expiresAt = new Date(user.planExpiresAt);
  if (Number.isNaN(expiresAt.getTime()) || expiresAt > new Date()) return user;

  const update = {
    plan: 'trial',
    dailyLeadLimit: 10,
    totalLeadLimit: 10,
    subscriptionStatus: 'expired'
  };

  if (hasMongoUri()) {
    return User.findByIdAndUpdate(user._id || user.id, update, { new: true });
  }

  return updateLocalUserPlan(user.id, 'trial', 10, 10, {
    subscriptionStatus: 'expired',
    planActivatedAt: null,
    planExpiresAt: null
  });
}

async function getCurrentUserPlan(userId) {
  let user = hasMongoUri() ? await User.findById(userId) : await findUserById(userId);
  user = await downgradeExpiredUserIfNeeded(user);
  const plan = getPlan(user?.plan || 'trial');

  return {
    user,
    plan,
    dailyLeadLimit: Number(user?.dailyLeadLimit ?? plan.dailyLeadLimit)
  };
}

async function activatePaidPlan({ userId, planId, paymentId = '', externalReference = '', raw = {} }) {
  const plan = getPlan(planId);
  const update = {
    plan: plan.id,
    dailyLeadLimit: plan.dailyLeadLimit,
    totalLeadLimit: plan.totalLeadLimit ?? null,
    subscriptionStatus: 'active',
    mercadoPagoLastPaymentId: String(paymentId || ''),
    planActivatedAt: new Date(),
    planExpiresAt: getPlanExpirationDate(plan.id)
  };

  if (hasMongoUri()) {
    await User.findByIdAndUpdate(userId, update);
  } else {
    await updateLocalUserPlan(userId, plan.id, plan.dailyLeadLimit, plan.totalLeadLimit ?? null, {
      subscriptionStatus: 'active',
      planActivatedAt: update.planActivatedAt.toISOString(),
      planExpiresAt: update.planExpiresAt.toISOString(),
      mercadoPagoLastPaymentId: update.mercadoPagoLastPaymentId
    });
  }

  if (hasMongoUri()) {
    const filters = [];
    if (paymentId) filters.push({ paymentId: String(paymentId) });
    if (externalReference) filters.push({ externalReference: String(externalReference) });

    await Payment.findOneAndUpdate(
      filters.length ? { $or: filters } : { userId, plan: plan.id, status: 'created' },
      {
        $set: {
          userId,
          plan: plan.id,
          status: 'approved',
          paymentId: String(paymentId || ''),
          externalReference: String(externalReference || ''),
          amount: Number(raw.transaction_amount || getPlanPrice(plan.id)),
          raw,
          reconciledAt: new Date()
        }
      },
      { upsert: true, new: true }
    );
  }

  return plan;
}

async function expirePaidPlan({ userId, paymentId = '', externalReference = '', raw = {} }) {
  const update = {
    plan: 'trial',
    dailyLeadLimit: 10,
    totalLeadLimit: 10,
    subscriptionStatus: raw?.status === 'cancelled' ? 'cancelled' : 'expired'
  };

  if (hasMongoUri()) {
    await User.findByIdAndUpdate(userId, update);
    const filters = [];
    if (paymentId) filters.push({ paymentId: String(paymentId) });
    if (externalReference) filters.push({ externalReference: String(externalReference) });

    await Payment.findOneAndUpdate(
      filters.length ? { $or: filters } : { userId },
      {
        $set: {
          status: raw?.status || 'expired',
          paymentId: String(paymentId || ''),
          externalReference: String(externalReference || ''),
          raw,
          reconciledAt: new Date()
        }
      },
      { upsert: true, new: true }
    );
  } else {
    await updateLocalUserPlan(userId, 'trial', 10, 10, {
      subscriptionStatus: update.subscriptionStatus,
      planActivatedAt: null,
      planExpiresAt: null,
      mercadoPagoLastPaymentId: paymentId
    });
  }

  return getPlan('trial');
}

async function fetchMercadoPagoPayment(paymentId) {
  const token = process.env.MERCADO_PAGO_ACCESS_TOKEN;
  if (!token) throw new Error('MERCADO_PAGO_ACCESS_TOKEN não configurado.');

  const normalizedPaymentId = String(paymentId || '').trim();
  if (!/^[A-Za-z0-9_-]{1,80}$/.test(normalizedPaymentId)) {
    const error = new Error('Identificador de pagamento inválido.');
    error.statusCode = 400;
    throw error;
  }

  const response = await fetch(`https://api.mercadopago.com/v1/payments/${encodeURIComponent(normalizedPaymentId)}`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Não foi possível consultar pagamento no Mercado Pago.');
  }

  return data;
}

function extractPaymentContext(payment) {
  const externalReference = String(payment.external_reference || '');
  const [userIdFromRef, planFromRef] = externalReference.split(':');

  return {
    externalReference,
    userId: payment.metadata?.user_id || userIdFromRef,
    planId: payment.metadata?.plan_id || planFromRef
  };
}

async function reconcileMercadoPagoPayment(paymentId, { expectedUserId = null } = {}) {
  const payment = await fetchMercadoPagoPayment(paymentId);
  const { externalReference, userId, planId } = extractPaymentContext(payment);

  if (!userId || !['pro', 'agency'].includes(planId)) {
    return { ignored: true, reason: 'metadata inválido', payment };
  }

  if (expectedUserId && String(userId) !== String(expectedUserId)) {
    const error = new Error('O pagamento informado não pertence ao usuário autenticado.');
    error.statusCode = 403;
    throw error;
  }

  if (payment.status === 'approved' && !validatePaymentValue(payment, planId)) {
    return { ignored: true, reason: 'valor ou moeda do pagamento não confere com o plano', status: payment.status, payment };
  }

  if (hasMongoUri()) {
    await Payment.findOneAndUpdate(
      {
        $or: [
          { paymentId: String(payment.id) },
          { externalReference: String(externalReference) }
        ]
      },
      {
        $set: {
          userId,
          plan: planId,
          status: payment.status,
          paymentId: String(payment.id),
          externalReference,
          amount: Number(payment.transaction_amount || getPlanPrice(planId)),
          raw: payment,
          reconciledAt: new Date()
        }
      },
      { upsert: true, new: true }
    );
  }

  if (payment.status === 'approved') {
    const plan = await activatePaidPlan({
      userId,
      planId,
      paymentId: payment.id,
      externalReference,
      raw: payment
    });

    return { upgraded: true, status: payment.status, plan, payment };
  }

  if (['cancelled', 'refunded', 'charged_back', 'rejected'].includes(payment.status)) {
    const plan = await expirePaidPlan({
      userId,
      paymentId: payment.id,
      externalReference,
      raw: payment
    });

    return { downgraded: true, status: payment.status, plan, payment };
  }

  return { received: true, status: payment.status, payment };
}

async function createMercadoPagoPreference({ req, plan }) {
  const token = process.env.MERCADO_PAGO_ACCESS_TOKEN;
  if (!token) return null;

  const monthlyPrice = getPlanPrice(plan.id);
  const baseUrl = publicBaseUrl(req);
  const externalReference = `${req.user.sub}:${plan.id}:${Date.now()}`;

  const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      items: [
        {
          id: `plan_${plan.id}`,
          title: `Plano ${plan.name} - LeadHunter Pro`,
          description: `${plan.dailyLeadLimit} leads por dia por ${getPlanDurationDays(plan.id)} dias`,
          quantity: 1,
          currency_id: 'BRL',
          unit_price: monthlyPrice
        }
      ],
      payer: {
        email: req.user.email
      },
      back_urls: {
        success: process.env.MERCADO_PAGO_SUCCESS_URL || `${baseUrl}/app?pagamento=sucesso`,
        failure: process.env.MERCADO_PAGO_FAILURE_URL || `${baseUrl}/app?pagamento=falha`,
        pending: process.env.MERCADO_PAGO_PENDING_URL || `${baseUrl}/app?pagamento=pendente`
      },
      auto_return: 'approved',
      external_reference: externalReference,
      notification_url: process.env.MERCADO_PAGO_WEBHOOK_URL || `${baseUrl}/api/billing/webhook`,
      metadata: {
        user_id: req.user.sub,
        plan_id: plan.id
      }
    })
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Não foi possível criar checkout no Mercado Pago.');
  }

  if (hasMongoUri()) {
    await Payment.create({
      userId: req.user.sub,
      plan: plan.id,
      status: 'created',
      provider: 'mercado_pago',
      preferenceId: data.id,
      externalReference,
      checkoutUrl: data.init_point,
      amount: monthlyPrice,
      raw: data
    });
  }

  return {
    checkoutUrl: data.init_point,
    sandboxCheckoutUrl: data.sandbox_init_point,
    preferenceId: data.id,
    externalReference
  };
}

module.exports = {
  activatePaidPlan,
  createMercadoPagoPreference,
  downgradeExpiredUserIfNeeded,
  expirePaidPlan,
  getCurrentUserPlan,
  getPlanDurationDays,
  getPlanExpirationDate,
  getPlanPrice,
  isSimulatedBillingAllowed,
  parsePlanPrice,
  reconcileMercadoPagoPayment,
  validatePaymentValue
};
