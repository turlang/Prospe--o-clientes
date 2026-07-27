/**
 * @fileoverview Rotas de prospecção, CRM, auditoria de sites e exportação de leads.
 *
 * As dependências são recebidas por injeção para manter o módulo testável e
 * evitar acoplamento implícito ao processo de inicialização.
 *
 * @module routes/leadRoutes
 */

/**
 * Registra o conjunto de rotas deste domínio na aplicação Express.
 *
 * @param {get: Function, post: Function, patch: Function, delete: Function} app Aplicação/roteador Express.
 * @param {} context Dependências e políticas compartilhadas da camada HTTP.
 * @returns {get: Function, post: Function} A mesma instância recebida, para composição encadeada.
 */
function registerLeadRoutes(app, context) {
  const {
    format,
    searchPlaces,
    scoreLead,
    filterActionable,
    auditWebsite,
    readLeads,
    saveLeads,
    updateLeadStatus,
    updateLeadMeta,
    getLeadStats,
    SearchHistory,
    analyzeLeadResponse,
    requireAuth,
    requestCounters,
    hasMongoUri,
    getDailyUsage,
    getTotalUsage,
    addDailyUsage,
    getCurrentUserPlan,
    buildSalesApproach,
    generateAiEnhancedApproach,
    getAiProviderStatus,
    sendApiError,
    ALLOWED_LEAD_STATUSES,
    parseProspectingLimit,
    sanitizeSearchText
  } = context;

  // Prospecção e enriquecimento de leads.
  app.post('/api/prospectar', requireAuth, async (req, res) => {
    try {
      const segmento = sanitizeSearchText(req.body.segmento);
      const regiao = sanitizeSearchText(req.body.regiao);
      const requestedLimit = parseProspectingLimit(req.body.limite);

      if (!segmento || !regiao) return res.status(400).json({ error: 'Informe segmento e região/bairro.' });
      if (!requestedLimit) return res.status(400).json({ error: 'A quantidade deve ser um número inteiro entre 1 e 20.' });
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
          limite: requestedLimit,
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
      sendApiError(res, error);
    }
  });

  // Leitura, histórico e atualização do CRM.
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
      sendApiError(res, error);
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
      sendApiError(res, error);
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
      sendApiError(res, error);
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
      const leadId = sanitizeSearchText(req.body.leadId, 240);
      const resposta = String(req.body.resposta || '').trim().slice(0, 4000);
      if (!leadId) return res.status(400).json({ error: 'Informe o leadId.' });
      if (!resposta) return res.status(400).json({ error: 'Cole a resposta recebida antes de analisar.' });

      const leads = await readLeads(req.user.sub);
      const lead = leads.find((item) => String(item.placeId || item.nome) === String(leadId));
      if (!lead) return res.status(404).json({ error: 'Lead não encontrado.' });

      const analysis = analyzeLeadResponse(resposta, lead);
      const updated = await updateLeadStatus(leadId, analysis.status, {
        data: new Date().toISOString(),
        tipo: 'RESPOSTA_RECEBIDA',
        mensagem: resposta,
        intencao: analysis.intent,
        statusAnterior: analysis.previousStatus,
        status: analysis.status,
        proximoPasso: analysis.proximoPasso,
        respostaSugerida: analysis.respostaSugerida
      }, req.user.sub);

      if (!updated) return res.status(404).json({ error: 'Lead não encontrado durante a atualização do funil.' });

      res.json({
        lead: updated,
        analysis,
        transition: {
          from: analysis.previousStatus,
          to: analysis.status,
          changed: analysis.statusChanged
        }
      });
    } catch (error) {
      sendApiError(res, error);
    }
  });

  /**
   * Atualiza status do funil comercial.
   */
  app.post('/api/leads/status', requireAuth, async (req, res) => {
    try {
      const leadId = sanitizeSearchText(req.body.leadId, 240);
      const status = String(req.body.status || '').trim().toUpperCase();
      if (!leadId || !ALLOWED_LEAD_STATUSES.has(status)) {
        return res.status(400).json({ error: 'Informe um leadId e um status comercial válido.' });
      }

      const updated = await updateLeadStatus(leadId, status, {
        data: new Date().toISOString(),
        tipo: 'STATUS_ATUALIZADO',
        status
      }, req.user.sub);

      if (!updated) return res.status(404).json({ error: 'Lead não encontrado.' });
      res.json(updated);
    } catch (error) {
      sendApiError(res, error);
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
      const { leadId, regenerateKey, previousApproach, mode = 'new', channel = 'generic' } = req.body;
      if (!leadId) return res.status(400).json({ error: 'Informe o leadId.' });

      const leads = await readLeads(req.user.sub);
      const lead = leads.find((item) => String(item.placeId || item.nome) === String(leadId));
      if (!lead) return res.status(404).json({ error: 'Lead não encontrado.' });

      const localRecommendation = buildSalesApproach(lead, { variationSeed: regenerateKey, channel, mode });
      const recommendation = await generateAiEnhancedApproach({
        lead,
        leadContext: localRecommendation.leadContext,
        localRecommendation,
        regenerateKey,
        previousApproach,
        mode,
        channel
      });

      await updateLeadStatus(leadId, lead.status || 'NOVO', {
        data: new Date().toISOString(),
        tipo: recommendation.source === 'ai' ? 'ABORDAGEM_IA_GERADA' : 'ABORDAGEM_GERADA',
        status: lead.status || 'NOVO',
        strategy: recommendation.strategy?.name || recommendation.strategy?.id || 'comercial',
        provider: recommendation.providerLabel || recommendation.provider || 'Motor Local',
        model: recommendation.model || 'local',
        modo: mode,
        canal: channel,
        abordagem: recommendation.abordagem,
        resumo: `Abordagem gerada em modo ${mode} para canal ${channel}.`
      }, req.user.sub);

      res.json({
        source: recommendation.source || 'local',
        provider: recommendation.provider || 'local',
        providerLabel: recommendation.providerLabel || 'Motor Local',
        model: recommendation.model || null,
        aiStatus: recommendation.aiStatus || getAiProviderStatus(),
        aiError: recommendation.aiError || null,
        resolvedModelInfo: recommendation.resolvedModelInfo || null,
        abordagem: recommendation.abordagem,
        strategy: recommendation.strategy,
        diagnostics: recommendation.diagnostics,
        followUps: recommendation.followUps,
        explanation: recommendation.explanation,
        qualityChecklist: recommendation.qualityChecklist || [],
        mode,
        channel
      });
    } catch (error) {
      sendApiError(res, error);
    }
  });


  // Auditoria sob demanda e exportação segura.
  app.post('/api/auditar-site', requireAuth, async (req, res) => {
    try {
      const site = String(req.body.site || '').trim().slice(0, 2048);
      if (!site) return res.status(400).json({ error: 'Informe o site para auditar.' });
      res.json(await auditWebsite(site));
    } catch (error) {
      sendApiError(res, error, 'Não foi possível auditar o site informado.');
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

  return app;
}

module.exports = { registerLeadRoutes };
