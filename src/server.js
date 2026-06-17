const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(process.cwd(), '.env') });
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { format } = require('@fast-csv/format');
const { searchPlaces, testGoogleConnection } = require('./places');
const { scoreLead, filterActionable } = require('./scorer');
const { auditWebsite } = require('./siteAuditor');
const { readLeads, saveLeads, updateLeadStatus, updateLeadMeta, getLeadStats } = require('./storage');
const SearchHistory = require('./models/SearchHistory');
const { analyzeLeadResponse } = require('./conversationEngine');
const authRoutes = require('./authRoutes');
const { requireAuth } = require('./middleware/auth');
const { connectDatabase, hasMongoUri, getMongoStatus, mustRequireMongo } = require('./db');
const User = require('./models/User');
const Payment = require('./models/Payment');
const TrialGuard = require('./models/TrialGuard');
const PasswordReset = require('./models/PasswordReset');
const { getAllPlans, getPlan, normalizePlan } = require('./planConfig');
const { getDailyUsage, getTotalUsage, addDailyUsage } = require('./localUsageStore');
const { findUserById, updateLocalUserPlan } = require('./localUserStore');
const { buildCampaignSequence, nextFollowUpDate } = require('./campaignEngine');
const { createTask, listTasks, completeTask } = require('./localTaskStore');

const app = express();
app.set('trust proxy', 1);
const PORT = process.env.PORT || 3000;

async function getCurrentUserPlan(userId) {
  let user = hasMongoUri() ? await User.findById(userId) : await findUserById(userId);
  user = await downgradeExpiredUserIfNeeded(user);
  const plan = getPlan(user?.plan || 'trial');
  return {
    user,
    plan,
    dailyLeadLimit: Number(user?.dailyLeadLimit || plan.dailyLeadLimit)
  };
}

const startedAt = new Date();
const requestCounters = {
  total: 0,
  prospectar: 0,
  errors: 0
};

function publicBaseUrl(req) {
  return process.env.PUBLIC_APP_URL || `${req.protocol}://${req.get('host')}`;
}

function getPlanPrice(planId) {
  return planId === 'agency' ? 199 : 59;
}

function getPlanDurationDays() {
  return Number(process.env.PLAN_DURATION_DAYS || 30);
}

function getPlanExpirationDate() {
  const date = new Date();
  date.setDate(date.getDate() + getPlanDurationDays());
  return date;
}

function planRank(planId) {
  return ({ trial: 0, pro: 1, agency: 2 })[planId] ?? 0;
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

  return { ...user, ...update };
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
    planExpiresAt: getPlanExpirationDate()
  };

  if (hasMongoUri()) {
    await User.findByIdAndUpdate(userId, update);
  } else {
    await updateLocalUserPlan(userId, plan.id, plan.dailyLeadLimit, plan.totalLeadLimit ?? null);
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
  }

  return getPlan('trial');
}

async function fetchMercadoPagoPayment(paymentId) {
  const token = process.env.MERCADO_PAGO_ACCESS_TOKEN;
  if (!token) throw new Error('MERCADO_PAGO_ACCESS_TOKEN não configurado.');

  const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
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

async function reconcileMercadoPagoPayment(paymentId) {
  const payment = await fetchMercadoPagoPayment(paymentId);
  const { externalReference, userId, planId } = extractPaymentContext(payment);

  if (!userId || !['pro', 'agency'].includes(planId)) {
    return { ignored: true, reason: 'metadata inválido', payment };
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

function requestLogger(req, res, next) {
  requestCounters.total += 1;
  const started = Date.now();
  res.on('finish', () => {
    if (res.statusCode >= 500) requestCounters.errors += 1;
    console.log(`[HTTP] ${req.method} ${req.originalUrl} ${res.statusCode} ${Date.now() - started}ms`);
  });
  next();
}

function simpleRateLimit({ windowMs = 60_000, max = 90 } = {}) {
  const bucket = new Map();

  return (req, res, next) => {
    const key = req.ip || req.headers['x-forwarded-for'] || 'local';
    const now = Date.now();
    const current = bucket.get(key) || { count: 0, resetAt: now + windowMs };

    if (now > current.resetAt) {
      current.count = 0;
      current.resetAt = now + windowMs;
    }

    current.count += 1;
    bucket.set(key, current);

    if (current.count > max) {
      return res.status(429).json({
        error: 'Muitas requisições em pouco tempo. Aguarde alguns instantes e tente novamente.'
      });
    }

    next();
  };
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
          description: `${plan.dailyLeadLimit} leads por dia por ${getPlanDurationDays()} dias`,
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

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(express.json());
app.use(requestLogger);
app.use(simpleRateLimit({ windowMs: 60_000, max: 120 }));
app.use(express.static('public', { index: false }));

app.get('/app', (_req, res) => {
  res.sendFile(path.join(process.cwd(), 'public', 'index.html'));
});

app.get('/', (_req, res) => {
  res.sendFile(path.join(process.cwd(), 'public', 'landing.html'));
});

app.get('/landing.html', (_req, res) => {
  res.sendFile(path.join(process.cwd(), 'public', 'landing.html'));
});

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    service: 'prospeccao-leads',
    version: require('../package.json').version,
    uptimeSeconds: Math.round(process.uptime()),
    startedAt,
    mongodbAtivo: hasMongoUri(),
    mongodbStatus: getMongoStatus()
  });
});

app.get('/api/metrics', requireAuth, async (req, res) => {
  const { plan, dailyLeadLimit } = await getCurrentUserPlan(req.user.sub);
  const usedToday = await getDailyUsage(req.user.sub);
  const usedTotal = await getTotalUsage(req.user.sub);

  res.json({
    requests: requestCounters,
    plan,
    usage: {
      usedToday,
      usedTotal,
      dailyLeadLimit,
      totalLeadLimit: plan.totalLeadLimit ?? null,
      remainingToday: Math.max(dailyLeadLimit - usedToday, 0),
      remainingTotal: plan.totalLeadLimit === null ? null : Math.max(plan.totalLeadLimit - usedTotal, 0)
    },
    memory: process.memoryUsage()
  });
});

app.use('/api/auth', authRoutes);

app.get('/api/plans', (_req, res) => {
  res.json(getAllPlans());
});

app.get('/api/billing/usage', requireAuth, async (req, res) => {
  try {
    const { plan, dailyLeadLimit } = await getCurrentUserPlan(req.user.sub);
    const usedToday = await getDailyUsage(req.user.sub);
    const usedTotal = await getTotalUsage(req.user.sub);
    const totalLeadLimit = plan.totalLeadLimit ?? null;
    res.json({
      plan,
      usedToday,
      usedTotal,
      dailyLeadLimit,
      totalLeadLimit,
      remainingToday: Math.max(dailyLeadLimit - usedToday, 0),
      remainingTotal: totalLeadLimit === null ? null : Math.max(totalLeadLimit - usedTotal, 0)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Checkout Mercado Pago.
 *
 * Em produção cria uma preferência real e nunca altera o plano antes da
 * confirmação do pagamento pelo webhook/sincronização.
 */
app.post('/api/billing/checkout', requireAuth, async (req, res) => {
  try {
    const requestedPlan = req.body.plan || req.body.planId || req.body.id;
    const planId = normalizePlan(requestedPlan);
    if (!requestedPlan || planId === 'trial') {
      return res.status(400).json({ error: 'Escolha um plano pago válido: pro ou agency.' });
    }

    const plan = getPlan(planId);
    const { user } = await getCurrentUserPlan(req.user.sub);
    const currentPlan = getPlan(user?.plan || 'trial');

    if (user?.subscriptionStatus === 'active' && planRank(plan.id) <= planRank(currentPlan.id)) {
      return res.status(409).json({
        error: `Você já possui o plano ${currentPlan.name} ativo.`
      });
    }

    const preference = await createMercadoPagoPreference({ req, plan });

    if (preference) {
      return res.json({
        ok: true,
        mode: 'mercado_pago',
        message: `Checkout do plano ${plan.name} criado. Você será redirecionado para pagamento.`,
        plan,
        checkoutUrl: preference.checkoutUrl,
        sandboxCheckoutUrl: preference.sandboxCheckoutUrl,
        preferenceId: preference.preferenceId,
        externalReference: preference.externalReference
      });
    }

    if (hasMongoUri()) {
      await User.findByIdAndUpdate(req.user.sub, {
        plan: plan.id,
        dailyLeadLimit: plan.dailyLeadLimit,
        subscriptionStatus: 'simulated'
      });
    } else {
      await updateLocalUserPlan(req.user.sub, plan.id, plan.dailyLeadLimit, plan.totalLeadLimit ?? null);
    }

    res.json({
      ok: true,
      mode: 'simulated',
      message: `Plano ${plan.name} ativado em modo de teste. Para checkout real, configure MERCADO_PAGO_ACCESS_TOKEN.`,
      plan
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/prospectar', requireAuth, async (req, res) => {
  try {
    const { segmento, regiao, limite } = req.body;
    if (!segmento || !regiao) return res.status(400).json({ error: 'Informe segmento e região/bairro.' });

    const requestedLimit = Math.max(1, Number(limite || 10));
    const { plan, dailyLeadLimit } = await getCurrentUserPlan(req.user.sub);
    const usedToday = await getDailyUsage(req.user.sub);
    const usedTotal = await getTotalUsage(req.user.sub);
    const remainingToday = Math.max(dailyLeadLimit - usedToday, 0);
    const remainingTotal = plan.totalLeadLimit === null || plan.totalLeadLimit === undefined
      ? null
      : Math.max(plan.totalLeadLimit - usedTotal, 0);
    const remainingAllowed = remainingTotal === null ? remainingToday : Math.min(remainingToday, remainingTotal);

    if (remainingAllowed <= 0) {
      return res.status(429).json({
        error: plan.id === 'trial'
          ? 'Seu teste gratuito terminou. Você usou os 10 leads disponíveis.'
          : `Limite diário do plano ${plan.name} atingido.`,
        plan,
        usedToday,
        usedTotal,
        dailyLeadLimit,
        totalLeadLimit: plan.totalLeadLimit ?? null,
        upgradeRequired: true
      });
    }

    const allowedLimit = Math.min(requestedLimit, remainingAllowed);
    requestCounters.prospectar += 1;
    const raw = await searchPlaces({ segmento, regiao, limite: allowedLimit });
    const shouldAuditSites = req.body.auditarSites !== false && process.env.AUDIT_WEBSITES !== 'false';
    const actionable = filterActionable(raw, process.env.ALLOW_INCOMPLETE_CONTACTS === 'true')
      .map((lead) => ({ ...lead, segmentoBuscado: segmento, regiaoBuscada: regiao }));

    const audited = shouldAuditSites
      ? await Promise.all(actionable.map(async (lead) => ({
          ...lead,
          auditoriaSite: await auditWebsite(lead.site)
        })))
      : actionable;

    const leads = audited
      .map(scoreLead)
      .sort((a, b) => b.score - a.score);

    await saveLeads(leads, req.user.sub);
    const usedTodayAfterSearch = await addDailyUsage(req.user.sub, leads.length);

    if (hasMongoUri()) {
      await SearchHistory.create({
        userId: req.user.sub,
        segmento,
        regiao,
        limite: Number(limite || 10),
        total: leads.length,
        auditarSites: shouldAuditSites
      });
    }

    res.json({
      total: leads.length,
      leads,
      usage: {
        usedToday: usedTodayAfterSearch,
        usedTotal: await getTotalUsage(req.user.sub),
        dailyLeadLimit,
        totalLeadLimit: plan.totalLeadLimit ?? null,
        remainingToday: Math.max(dailyLeadLimit - usedTodayAfterSearch, 0)
      }
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
});

app.get('/api/leads', requireAuth, async (req, res) => {
  const { status, favorito, tag, q } = req.query;
  let leads = await readLeads(req.user.sub);

  if (status) leads = leads.filter((lead) => String(lead.status || 'NOVO') === String(status));
  if (favorito === 'true') leads = leads.filter((lead) => Boolean(lead.favorito));
  if (tag) leads = leads.filter((lead) => Array.isArray(lead.tags) && lead.tags.includes(String(tag)));
  if (q) {
    const term = String(q).toLowerCase();
    leads = leads.filter((lead) => [lead.nome, lead.endereco, lead.segmentoComercial, lead.tipo].filter(Boolean).join(' ').toLowerCase().includes(term));
  }

  res.json(leads);
});


app.get('/api/dashboard/stats', requireAuth, async (req, res) => {
  try {
    res.json(await getLeadStats(req.user.sub));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/historico-buscas', requireAuth, async (req, res) => {
  try {
    if (!hasMongoUri()) return res.json([]);
    const items = await SearchHistory.find({ userId: req.user.sub }).sort({ createdAt: -1 }).limit(12).lean();
    res.json(items.map((item) => ({
      id: item._id,
      segmento: item.segmento,
      regiao: item.regiao,
      limite: item.limite,
      total: item.total,
      auditarSites: item.auditarSites,
      criadoEm: item.createdAtIso || item.createdAt
    })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.patch('/api/leads/meta', requireAuth, async (req, res) => {
  try {
    const { leadId, favorito, tags, notas } = req.body;
    if (!leadId) return res.status(400).json({ error: 'Informe leadId.' });

    const updated = await updateLeadMeta(leadId, { favorito, tags, notas }, {
      data: new Date().toISOString(),
      tipo: 'META_ATUALIZADA',
      favorito: Boolean(favorito),
      tags: Array.isArray(tags) ? tags : []
    }, req.user.sub);

    if (!updated) return res.status(404).json({ error: 'Lead não encontrado.' });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


/**
 * Analisa a resposta manual recebida do lead.
 *
 * Observação ética/comercial:
 * O sistema não intercepta conversas privadas do WhatsApp. O usuário cola a
 * resposta recebida, e o agente sugere o próximo passo para manter revisão humana.
 */
app.post('/api/analisar-resposta', requireAuth, async (req, res) => {
  try {
    const { leadId, resposta } = req.body;
    if (!leadId) return res.status(400).json({ error: 'Informe o leadId.' });

    const leads = await readLeads(req.user.sub);
    const lead = leads.find((item) => String(item.placeId || item.nome) === String(leadId));
    if (!lead) return res.status(404).json({ error: 'Lead não encontrado.' });

    const analysis = analyzeLeadResponse(resposta, lead);
    const updated = await updateLeadStatus(leadId, analysis.status, {
      data: new Date().toISOString(),
      tipo: 'RESPOSTA_RECEBIDA',
      mensagem: resposta,
      intencao: analysis.intent,
      proximoPasso: analysis.proximoPasso,
      respostaSugerida: analysis.respostaSugerida
    }, req.user.sub);

    res.json({ lead: updated, analysis });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Atualiza status do funil comercial.
 */
app.post('/api/leads/status', requireAuth, async (req, res) => {
  try {
    const { leadId, status } = req.body;
    if (!leadId || !status) return res.status(400).json({ error: 'Informe leadId e status.' });

    const updated = await updateLeadStatus(leadId, status, {
      data: new Date().toISOString(),
      tipo: 'STATUS_ATUALIZADO',
      status
    }, req.user.sub);

    if (!updated) return res.status(404).json({ error: 'Lead não encontrado.' });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Gera uma abordagem comercial personalizada para o lead.
 *
 * Nesta fase a geração é feita por regras locais para manter o projeto simples,
 * barato e funcional sem depender de uma API externa de automacao. Na Planos esse ponto
 * pode ser conectado a um serviço externo de automacao com controle de custo por plano.
 */
app.post('/api/gerar-abordagem', requireAuth, async (req, res) => {
  try {
    const { leadId } = req.body;
    if (!leadId) return res.status(400).json({ error: 'Informe o leadId.' });

    const leads = await readLeads(req.user.sub);
    const lead = leads.find((item) => String(item.placeId || item.nome) === String(leadId));
    if (!lead) return res.status(404).json({ error: 'Lead não encontrado.' });

    const nome = lead.nome || 'tudo bem';
    const segmento = lead.segmentoComercial || lead.tipo || 'empresa local';
    const dorPrincipal = Array.isArray(lead.dores) && lead.dores.length
      ? lead.dores[0]
      : 'algumas oportunidades de melhoria na presença digital';
    const servico = lead.servico || 'um diagnóstico rápido de presença digital';

    const abordagem = `Olá, ${nome}. Tudo bem?\n\nAnalisei rapidamente a presença digital da sua ${segmento} e identifiquei uma oportunidade: ${dorPrincipal}.\n\nEu trabalho com ${servico} para ajudar negócios locais a receberem mais contatos qualificados pelo Google e pelo WhatsApp.\n\nPosso te enviar 2 ou 3 sugestões objetivas, sem compromisso, para melhorar isso?`;

    res.json({ abordagem });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/billing/webhook', async (req, res) => {
  try {
    console.log('[Mercado Pago Webhook]', JSON.stringify(req.body || {}));

    const paymentId =
      req.body?.data?.id ||
      req.body?.id ||
      req.query?.id ||
      req.query?.['data.id'];

    const topic = req.body?.type || req.body?.topic || req.query?.topic || '';

    if (!paymentId || !String(topic).includes('payment')) {
      return res.status(200).json({ received: true, ignored: true });
    }

    const result = await reconcileMercadoPagoPayment(paymentId);
    return res.json({ received: true, ...result, payment: undefined });
  } catch (error) {
    console.error('[Mercado Pago Webhook Error]', error);
    return res.status(200).json({ received: true, error: error.message });
  }
});

app.post('/api/billing/sync', requireAuth, async (req, res) => {
  try {
    const paymentId =
      req.body?.paymentId ||
      req.body?.payment_id ||
      req.query?.payment_id ||
      req.query?.collection_id;

    if (!paymentId) {
      return res.status(400).json({ error: 'Informe o payment_id para sincronizar.' });
    }

    const result = await reconcileMercadoPagoPayment(paymentId);
    const user = hasMongoUri() ? await User.findById(req.user.sub).lean() : await findUserById(req.user.sub);
    const plan = getPlan(user?.plan || 'trial');

    res.json({
      ok: true,
      ...result,
      payment: undefined,
      user: {
        plan: plan.id,
        planName: plan.name,
        dailyLeadLimit: Number(user?.dailyLeadLimit || plan.dailyLeadLimit),
        totalLeadLimit: user?.totalLeadLimit ?? plan.totalLeadLimit ?? null,
        subscriptionStatus: user?.subscriptionStatus || 'trial',
        planActivatedAt: user?.planActivatedAt || null,
        planExpiresAt: user?.planExpiresAt || null
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/billing/status', requireAuth, async (req, res) => {
  try {
    let user = hasMongoUri() ? await User.findById(req.user.sub).lean() : await findUserById(req.user.sub);
    user = await downgradeExpiredUserIfNeeded(user);
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado.' });

    const plan = getPlan(user.plan || 'trial');
    res.json({
      plan,
      subscriptionStatus: user.subscriptionStatus || 'trial',
      planActivatedAt: user.planActivatedAt || null,
      planExpiresAt: user.planExpiresAt || null,
      mercadoPagoLastPaymentId: user.mercadoPagoLastPaymentId || ''
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


function requireAdmin(req, res, next) {
  const fail = () => res.status(403).json({ error: 'Acesso restrito ao administrador.' });

  if (!req.user?.sub) return fail();

  const run = async () => {
    const user = hasMongoUri() ? await User.findById(req.user.sub).lean() : await findUserById(req.user.sub);
    if (!user || user.role !== 'admin') return fail();
    req.adminUser = user;
    return next();
  };

  run().catch((error) => res.status(500).json({ error: error.message }));
}

app.get('/admin', (_req, res) => {
  res.sendFile(path.join(process.cwd(), 'public', 'admin.html'));
});

app.get('/api/admin/overview', requireAuth, requireAdmin, async (_req, res) => {
  try {
    if (!hasMongoUri()) {
      return res.json({
        users: { total: 0, trial: 0, pro: 0, agency: 0, active: 0, suspended: 0 },
        payments: { total: 0, approved: 0, created: 0, revenue: 0 },
        recentUsers: [],
        recentPayments: []
      });
    }

    const [users, payments] = await Promise.all([
      User.find({}).sort({ createdAt: -1 }).limit(100).lean(),
      Payment.find({}).sort({ createdAt: -1 }).limit(100).lean()
    ]);

    const userStats = {
      total: users.length,
      trial: users.filter((u) => u.plan === 'trial').length,
      pro: users.filter((u) => u.plan === 'pro').length,
      agency: users.filter((u) => u.plan === 'agency').length,
      active: users.filter((u) => u.isActive !== false).length,
      suspended: users.filter((u) => u.isActive === false).length
    };

    const approvedPayments = payments.filter((p) => p.status === 'approved');
    const paymentStats = {
      total: payments.length,
      approved: approvedPayments.length,
      created: payments.filter((p) => p.status === 'created').length,
      revenue: approvedPayments.reduce((sum, p) => sum + Number(p.amount || 0), 0)
    };

    res.json({
      users: userStats,
      payments: paymentStats,
      recentUsers: users.slice(0, 20).map((u) => ({
        id: String(u._id),
        name: u.name,
        email: u.email,
        plan: u.plan,
        role: u.role || 'user',
        isActive: u.isActive !== false,
        subscriptionStatus: u.subscriptionStatus,
        dailyLeadLimit: u.dailyLeadLimit,
        totalLeadLimit: u.totalLeadLimit,
        createdAt: u.createdAt,
        planExpiresAt: u.planExpiresAt
      })),
      recentPayments: payments.slice(0, 20).map((p) => ({
        id: String(p._id),
        userId: String(p.userId || ''),
        plan: p.plan,
        status: p.status,
        amount: p.amount,
        provider: p.provider,
        paymentId: p.paymentId,
        preferenceId: p.preferenceId,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt
      }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/admin/users', requireAuth, requireAdmin, async (req, res) => {
  try {
    const q = String(req.query.q || '').trim();
    const filter = q
      ? { $or: [
          { name: new RegExp(q, 'i') },
          { email: new RegExp(q, 'i') },
          { plan: new RegExp(q, 'i') }
        ] }
      : {};

    const users = hasMongoUri()
      ? await User.find(filter).sort({ createdAt: -1 }).limit(200).lean()
      : [];

    res.json(users.map((u) => ({
      id: String(u._id),
      name: u.name,
      email: u.email,
      plan: u.plan,
      role: u.role || 'user',
      isActive: u.isActive !== false,
      subscriptionStatus: u.subscriptionStatus,
      dailyLeadLimit: u.dailyLeadLimit,
      totalLeadLimit: u.totalLeadLimit,
      createdAt: u.createdAt,
      planActivatedAt: u.planActivatedAt,
      planExpiresAt: u.planExpiresAt
    })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.patch('/api/admin/users/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    if (!hasMongoUri()) return res.status(400).json({ error: 'Admin requer MongoDB ativo.' });

    const { plan, isActive, role, subscriptionStatus } = req.body;
    const update = {};

    if (plan) {
      const safePlan = normalizePlan(plan);
      const planConfig = getPlan(safePlan);
      update.plan = planConfig.id;
      update.dailyLeadLimit = planConfig.dailyLeadLimit;
      update.totalLeadLimit = planConfig.totalLeadLimit ?? null;
      update.subscriptionStatus = subscriptionStatus || (safePlan === 'trial' ? 'trial' : 'active');
      update.planActivatedAt = safePlan === 'trial' ? null : new Date();
      update.planExpiresAt = safePlan === 'trial' ? null : getPlanExpirationDate();
    }

    if (typeof isActive === 'boolean') update.isActive = isActive;
    if (['user', 'admin'].includes(role)) update.role = role;
    if (subscriptionStatus && !plan) update.subscriptionStatus = subscriptionStatus;

    const user = await User.findByIdAndUpdate(req.params.id, update, { new: true }).lean();

    if (user && role === 'admin') {
      await TrialGuard.deleteMany({
        $or: [
          { email: user.email },
          { deviceId: user.deviceId || '__none__' },
          { ip: user.registrationIp || '__none__' }
        ]
      });
    }
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado.' });

    res.json({
      ok: true,
      user: {
        id: String(user._id),
        name: user.name,
        email: user.email,
        plan: user.plan,
        role: user.role || 'user',
        isActive: user.isActive !== false,
        subscriptionStatus: user.subscriptionStatus,
        dailyLeadLimit: user.dailyLeadLimit,
        totalLeadLimit: user.totalLeadLimit
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


app.get('/api/admin/security', requireAuth, requireAdmin, async (_req, res) => {
  try {
    if (!hasMongoUri()) return res.json({ blocked: 0, allowed: 0, recent: [] });

    const [blocked, allowed, passwordResets, recent] = await Promise.all([
      TrialGuard.countDocuments({ status: 'blocked' }),
      TrialGuard.countDocuments({ status: 'allowed' }),
      PasswordReset.countDocuments({}),
      TrialGuard.find({}).sort({ createdAt: -1 }).limit(50).lean()
    ]);

    res.json({
      blocked,
      allowed,
      passwordResets,
      recent: await Promise.all(recent.map(async (item) => {
        const user = item.email ? await User.findOne({ email: item.email }).lean() : null;

        return {
          id: String(item._id),
          email: item.email,
          emailDomain: item.emailDomain,
          ip: item.ip,
          deviceId: item.deviceId,
          status: item.status,
          reason: item.reason,
          userRole: user?.role || 'none',
          createdAt: item.createdAt
        };
      }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


app.delete('/api/admin/security/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    if (!hasMongoUri()) return res.status(400).json({ error: 'Admin requer MongoDB ativo.' });

    const deleted = await TrialGuard.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Registro não encontrado.' });

    res.json({ ok: true, message: 'Registro de segurança removido.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/admin/security/clear', requireAuth, requireAdmin, async (req, res) => {
  try {
    if (!hasMongoUri()) return res.status(400).json({ error: 'Admin requer MongoDB ativo.' });

    const { email, deviceId, ip } = req.body;
    const filters = [];

    if (email) filters.push({ email: String(email).trim().toLowerCase() });
    if (deviceId) filters.push({ deviceId: String(deviceId).trim() });
    if (ip) filters.push({ ip: String(ip).trim() });

    if (!filters.length) return res.status(400).json({ error: 'Informe e-mail, IP ou dispositivo.' });

    const result = await TrialGuard.deleteMany({ $or: filters });
    res.json({ ok: true, deletedCount: result.deletedCount || 0 });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


app.get('/api/admin/payments', requireAuth, requireAdmin, async (_req, res) => {
  try {
    const payments = hasMongoUri()
      ? await Payment.find({}).sort({ createdAt: -1 }).limit(200).lean()
      : [];

    res.json(payments.map((p) => ({
      id: String(p._id),
      userId: String(p.userId || ''),
      plan: p.plan,
      status: p.status,
      amount: p.amount,
      provider: p.provider,
      preferenceId: p.preferenceId,
      paymentId: p.paymentId,
      externalReference: p.externalReference,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt
    })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/campaigns/sequence', requireAuth, async (req, res) => {
  try {
    const { leadId, objective } = req.body;
    if (!leadId) return res.status(400).json({ error: 'Informe o leadId.' });

    const leads = await readLeads(req.user.sub);
    const lead = leads.find((item) => String(item.placeId || item.nome) === String(leadId));
    if (!lead) return res.status(404).json({ error: 'Lead não encontrado.' });

    const sequence = buildCampaignSequence(lead, objective);
    res.json({ leadId, sequence });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/followups', requireAuth, async (req, res) => {
  try {
    const { leadId, title, message, days } = req.body;
    if (!leadId) return res.status(400).json({ error: 'Informe o leadId.' });

    const leads = await readLeads(req.user.sub);
    const lead = leads.find((item) => String(item.placeId || item.nome) === String(leadId));
    if (!lead) return res.status(404).json({ error: 'Lead não encontrado.' });

    const task = await createTask({
      userId: req.user.sub,
      leadId,
      leadName: lead.nome,
      title: title || 'Follow-up comercial',
      dueAt: nextFollowUpDate(days || 2),
      message: message || 'Retomar contato com este lead.'
    });

    await updateLeadStatus(leadId, lead.status || 'CONTATADO', {
      data: new Date().toISOString(),
      tipo: 'FOLLOWUP_AGENDADO',
      tarefaId: task.id,
      vencimento: task.dueAt
    }, req.user.sub);

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/followups', requireAuth, async (req, res) => {
  try {
    res.json(await listTasks(req.user.sub));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.patch('/api/followups/:id/done', requireAuth, async (req, res) => {
  try {
    const task = await completeTask(req.user.sub, req.params.id);
    if (!task) return res.status(404).json({ error: 'Follow-up não encontrado.' });
    res.json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


app.post('/api/auditar-site', requireAuth, async (req, res) => {
  try {
    const { site } = req.body;
    if (!site) return res.status(400).json({ error: 'Informe o site para auditar.' });
    res.json(await auditWebsite(site));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


app.get('/api/diagnostico-env', (_req, res) => {
  const envPath = path.join(process.cwd(), '.env');
  const envTxtPath = path.join(process.cwd(), '.env.txt');
  const key = process.env.GOOGLE_PLACES_API_KEY || '';
  res.json({
    pastaAtual: process.cwd(),
    envExiste: fs.existsSync(envPath),
    envTxtExiste: fs.existsSync(envTxtPath),
    chaveCarregada: Boolean(key && key !== 'cole_sua_chave_aqui'),
    tamanhoChave: key.length,
    provider: process.env.PLACES_PROVIDER || null,
    mongodbAtivo: hasMongoUri(),
    mongodbStatus: getMongoStatus(),
    dica: fs.existsSync(envTxtPath) ? 'Você criou .env.txt. Renomeie para .env sem extensão.' : 'O arquivo .env deve ficar na raiz do projeto, ao lado do package.json.'
  });
});

app.get('/api/testar-google', async (_req, res) => {
  try {
    const resultado = await testGoogleConnection();
    res.json(resultado);
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
});

app.get('/api/export.csv', requireAuth, async (req, res) => {
  const leads = await readLeads(req.user.sub);
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="leads-prospeccao.csv"');
  const csv = format({ headers: true });
  csv.pipe(res);
  leads.forEach((lead) => csv.write({
    nome: lead.nome,
    nivel: lead.nivel,
    score: lead.score,
    telefone: lead.telefone,
    site: lead.site,
    maps: lead.maps,
    endereco: lead.endereco,
    probabilidade: lead.probabilidade,
    ticketEstimado: lead.ticketEstimado,
    segmentoComercial: lead.segmentoComercial,
    servico: lead.servico,
    dores: (lead.dores || []).join(' | '),
    status: lead.status,
    abordagem: lead.abordagem,
    fonte: lead.fonte,
    engajamentoSocial: lead.auditoriaSite?.engajamentoSocial?.nivel || '',
    scoreSocial: lead.auditoriaSite?.engajamentoSocial?.score || 0,
    redesSociais: (lead.auditoriaSite?.redesSociais || []).map((r) => r.plataforma).join(' | '),
    coletadoEm: lead.coletadoEm
  }));
  csv.end();
});


app.use('/api', (_req, res) => {
  res.status(404).json({ error: 'Rota da API não encontrada.' });
});

app.use((error, _req, res, _next) => {
  console.error('Erro interno:', error);
  res.status(500).json({ error: error.message || 'Erro interno do servidor.' });
});

connectDatabase()
  .then(() => {
    app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
  })
  .catch((error) => {
    console.error('[DB] Falha ao iniciar banco:', error.message);

    if (mustRequireMongo()) {
      console.error('[DB] Encerrando aplicação porque REQUIRE_MONGODB=true.');
      process.exit(1);
    }

    app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT} com JSON local`));
  });
