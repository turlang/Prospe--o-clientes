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
const { getAllPlans, getPlan, normalizePlan } = require('./planConfig');
const { getDailyUsage, getTotalUsage, addDailyUsage } = require('./localUsageStore');
const { findUserById, updateLocalUserPlan } = require('./localUserStore');
const { buildCampaignSequence, nextFollowUpDate } = require('./campaignEngine');
const { createTask, listTasks, completeTask } = require('./localTaskStore');

const app = express();
app.set('trust proxy', 1);
const PORT = process.env.PORT || 3000;

async function getCurrentUserPlan(userId) {
  const user = hasMongoUri() ? await User.findById(userId) : await findUserById(userId);
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

  const monthlyPrice = plan.id === 'agency' ? 199 : 59;
  const baseUrl = publicBaseUrl(req);

  const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      items: [
        {
          title: `Assinatura ${plan.name} - Prospecção Leads`,
          quantity: 1,
          currency_id: 'BRL',
          unit_price: monthlyPrice
        }
      ],
      back_urls: {
        success: process.env.MERCADO_PAGO_SUCCESS_URL || `${baseUrl}/?pagamento=sucesso`,
        failure: process.env.MERCADO_PAGO_FAILURE_URL || `${baseUrl}/?pagamento=falha`,
        pending: process.env.MERCADO_PAGO_PENDING_URL || `${baseUrl}/?pagamento=pendente`
      },
      auto_return: 'approved',
      external_reference: `${req.user.sub}:${plan.id}`,
      notification_url: process.env.MERCADO_PAGO_WEBHOOK_URL || undefined
    })
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Não foi possível criar checkout no Mercado Pago.');
  }

  return {
    checkoutUrl: data.init_point,
    sandboxCheckoutUrl: data.sandbox_init_point,
    preferenceId: data.id
  };
}


app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(express.json());
app.use(requestLogger);
app.use(simpleRateLimit({ windowMs: 60_000, max: 120 }));
app.use(express.static('public'));

app.get('/app', (_req, res) => {
  res.sendFile(path.join(process.cwd(), 'public', 'index.html'));
});

app.get('/', (_req, res) => {
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
 * Checkout simulado para a Planos.
 *
 * Em produção, esta rota deve criar uma preferência/assinatura no Mercado Pago.
 * Para validação local, o endpoint atualiza o plano do usuário e deixa a UI
 * pronta para monetização sem depender de credenciais reais.
 */
app.post('/api/billing/checkout', requireAuth, async (req, res) => {
  try {
    const requestedPlan = req.body.plan || req.body.planId || req.body.id;
    const planId = normalizePlan(requestedPlan);
    if (!requestedPlan || planId === 'trial') {
      return res.status(400).json({ error: 'Escolha um plano pago válido: pro ou agency.' });
    }

    const plan = getPlan(planId);
    const preference = await createMercadoPagoPreference({ req, plan });

    if (preference) {
      return res.json({
        ok: true,
        mode: 'mercado_pago',
        message: `Checkout do plano ${plan.name} criado.`,
        plan,
        checkoutUrl: preference.checkoutUrl,
        sandboxCheckoutUrl: preference.sandboxCheckoutUrl,
        preferenceId: preference.preferenceId
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
  console.log('[Mercado Pago Webhook]', JSON.stringify(req.body || {}));
  res.json({ received: true });
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
