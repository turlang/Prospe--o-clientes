/**
 * @fileoverview Rotas de automação, agenda, inteligência comercial, propostas, clientes e relatórios.
 *
 * As dependências são recebidas por injeção para manter o módulo testável e
 * evitar acoplamento implícito ao processo de inicialização.
 *
 * @module routes/commercialRoutes
 */

/**
 * Registra o conjunto de rotas deste domínio na aplicação Express.
 *
 * @param {get: Function, post: Function, patch: Function, delete: Function} app Aplicação/roteador Express.
 * @param {} context Dependências e políticas compartilhadas da camada HTTP.
 * @returns {get: Function, post: Function} A mesma instância recebida, para composição encadeada.
 */
function registerCommercialRoutes(app, context) {
  const {
    readLeads,
    updateLeadStatus,
    requireAuth,
    buildCampaignSequence,
    nextFollowUpDate,
    buildAutomationPlan,
    getPriorityFromLead,
    createTask,
    createTaskIfMissing,
    completePendingAutomationTasksForLead,
    listTasks,
    completeTask,
    buildSalesApproach,
    buildNextTaskPlan,
    buildCommercialEngineOutput,
    generateAiEnhancedApproach,
    getAiProviderStatus,
    buildAgendaSummary,
    buildCommercialIntelligence,
    buildObjectionResponse,
    buildCommercialReport,
    buildCommercialReportCsv,
    buildAiProposal,
    buildProposalSummary,
    buildCustomerSuccessSummary,
    buildCloseInteraction,
    buildLostInteraction,
    buildCustomerGrowthSummary,
    buildReferralMessage,
    buildExpansionMessage,
    buildReferralInteraction,
    buildExpansionInteraction,
    buildCampaignSummary,
    buildSmartCampaign,
    buildCampaignInteraction,
    buildCampaignTasks,
    buildAutonomousCommandCenter,
    answerCommercialCopilot,
    simpleRateLimit,
    sendApiError
  } = context;

  async function createStageTask(userId, lead, status, intent = '') {
    if (typeof buildNextTaskPlan !== 'function' || typeof createTaskIfMissing !== 'function') return null;
    const plan = buildNextTaskPlan({ lead: { ...lead, status }, status, intent });
    if (!plan) return null;
    const result = await createTaskIfMissing({
      userId,
      leadId: lead.placeId || lead.nome,
      leadName: lead.nome,
      title: plan.title,
      dueAt: plan.dueAt,
      message: plan.message,
      priority: plan.priority,
      automationType: plan.automationType
    });
    return { ...result.task, created: result.created, targetStatus: plan.targetStatus, actionType: plan.actionType };
  }

  // Automações e recomendação de próximas ações.
  app.post('/api/automations/followup-sequence', requireAuth, async (req, res) => {
    try {
      const { leadId, objective } = req.body;
      if (!leadId) return res.status(400).json({ error: 'Informe o leadId.' });

      const leads = await readLeads(req.user.sub);
      const lead = leads.find((item) => String(item.placeId || item.nome) === String(leadId));
      if (!lead) return res.status(404).json({ error: 'Lead não encontrado.' });

      const plan = buildAutomationPlan(lead, objective || 'vender website personalizado');
      const createdTasks = [];

      for (const step of plan) {
        const task = await createTask({
          userId: req.user.sub,
          leadId,
          leadName: lead.nome,
          title: step.title,
          dueAt: step.dueAt,
          message: step.message,
          priority: step.priority,
          automationType: step.automationType
        });

        createdTasks.push(task);
      }

      await updateLeadStatus(leadId, 'CONTATADO', {
        data: new Date().toISOString(),
        tipo: 'AUTOMACAO_FOLLOWUP_CRIADA',
        quantidade: createdTasks.length,
        prioridade: plan[0]?.priority || 'MÉDIA'
      }, req.user.sub);

      res.status(201).json({
        ok: true,
        leadId,
        leadName: lead.nome,
        priority: plan[0]?.priority || 'MÉDIA',
        tasks: createdTasks
      });
    } catch (error) {
      sendApiError(res, error);
    }
  });

  app.get('/api/automations/next-actions', requireAuth, async (req, res) => {
    try {
      const leads = await readLeads(req.user.sub);
      const tasks = await listTasks(req.user.sub);
      const pendingTasks = tasks.filter((task) => !task.done);
      const today = new Date();

      const hotLeads = leads
        .map((lead) => ({ lead, profile: getPriorityFromLead(lead) }))
        .filter((item) => item.profile.priority === 'ALTA')
        .slice(0, 8)
        .map(({ lead, profile }) => ({
          type: 'HOT_LEAD',
          title: 'Priorizar lead quente',
          leadId: String(lead.placeId || lead.nome),
          leadName: lead.nome,
          priority: profile.priority,
          message: `Lead com alta prioridade. Sugestão: enviar abordagem ainda hoje.`
        }));

      const dueTasks = pendingTasks
        .filter((task) => new Date(task.dueAt) <= today)
        .slice(0, 8)
        .map((task) => ({
          type: 'DUE_TASK',
          title: task.title,
          leadId: task.leadId,
          leadName: task.leadName,
          priority: task.priority || 'MÉDIA',
          dueAt: task.dueAt,
          message: task.message
        }));

      res.json({
        dueTasks,
        hotLeads,
        summary: {
          pendingTasks: pendingTasks.length,
          dueToday: dueTasks.length,
          hotLeads: hotLeads.length
        }
      });
    } catch (error) {
      sendApiError(res, error);
    }
  });

  // Campanhas e geração de sequências com revisão humana.
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
      sendApiError(res, error);
    }
  });

  app.get('/api/campaigns/summary', requireAuth, async (req, res) => {
    try {
      const [leads, tasks] = await Promise.all([
        readLeads(req.user.sub),
        listTasks(req.user.sub)
      ]);
      res.json(buildCampaignSummary(leads, tasks));
    } catch (error) {
      sendApiError(res, error);
    }
  });

  app.post('/api/campaigns/smart-sequence', requireAuth, async (req, res) => {
    try {
      const { leadId, objective, createTasks: shouldCreateTasks = true } = req.body;
      if (!leadId) return res.status(400).json({ error: 'Informe o leadId.' });

      const leads = await readLeads(req.user.sub);
      const lead = leads.find((item) => String(item.placeId || item.nome) === String(leadId));
      if (!lead) return res.status(404).json({ error: 'Lead não encontrado.' });

      const previousMessages = (lead.interacoes || [])
        .map((item) => item.mensagem || item.respostaSugerida || item.abordagem || '')
        .filter(Boolean);

      const campaign = await buildSmartCampaign({ lead, objective, previousMessages });
      const createdTasks = [];

      if (shouldCreateTasks) {
        const taskPayloads = buildCampaignTasks({ userId: req.user.sub, lead, campaign });
        for (const payload of taskPayloads) {
          createdTasks.push(await createTask(payload));
        }
      }

      const updatedLead = await updateLeadStatus(
        leadId,
        'CONTATADO',
        buildCampaignInteraction({ campaign }),
        req.user.sub
      );

      res.status(201).json({
        ok: true,
        lead: updatedLead,
        campaign,
        tasks: createdTasks
      });
    } catch (error) {
      sendApiError(res, error);
    }
  });

  // Agenda e ciclo de vida dos follow-ups.
  app.post('/api/followups', requireAuth, async (req, res) => {
    try {
      const { leadId, title, message, days, priority, automationType } = req.body;
      if (!leadId) return res.status(400).json({ error: 'Informe o leadId.' });

      const leads = await readLeads(req.user.sub);
      const lead = leads.find((item) => String(item.placeId || item.nome) === String(leadId));
      if (!lead) return res.status(404).json({ error: 'Lead não encontrado.' });
      if (String(lead.status || 'NOVO').toUpperCase() === 'NOVO') {
        return res.status(409).json({ error: 'Registre o primeiro contato antes de agendar um retorno.' });
      }

      const task = await createTask({
        userId: req.user.sub,
        leadId,
        leadName: lead.nome,
        title: title || 'Follow-up comercial',
        dueAt: nextFollowUpDate(days || 2),
        message: message || 'Retomar contato com este lead.',
        priority: priority || 'MÉDIA',
        automationType: automationType || 'MANUAL'
      });

      await updateLeadStatus(leadId, lead.status || 'CONTATADO', {
        data: new Date().toISOString(),
        tipo: 'FOLLOWUP_AGENDADO',
        tarefaId: task.id,
        vencimento: task.dueAt
      }, req.user.sub);

      res.status(201).json(task);
    } catch (error) {
      sendApiError(res, error);
    }
  });

  app.get('/api/followups', requireAuth, async (req, res) => {
    try {
      res.json(await listTasks(req.user.sub));
    } catch (error) {
      sendApiError(res, error);
    }
  });

  app.get('/api/agenda/summary', requireAuth, async (req, res) => {
    try {
      const tasks = await listTasks(req.user.sub);
      res.json(buildAgendaSummary(tasks));
    } catch (error) {
      sendApiError(res, error);
    }
  });


  // Inteligência comercial e copiloto.
  app.get('/api/v22/command-center', requireAuth, async (req, res) => {
    try {
      const [leads, tasks] = await Promise.all([readLeads(req.user.sub), listTasks(req.user.sub)]);
      res.json(buildAutonomousCommandCenter(leads, tasks));
    } catch (error) {
      sendApiError(res, error);
    }
  });

  app.post('/api/v22/copilot', requireAuth, simpleRateLimit({ windowMs: 60_000, max: 20 }), async (req, res) => {
    try {
      const question = String(req.body?.question || '').trim();
      if (question.length < 3) return res.status(400).json({ error: 'Digite uma pergunta comercial.' });
      const [leads, tasks] = await Promise.all([readLeads(req.user.sub), listTasks(req.user.sub)]);
      res.json(await answerCommercialCopilot({ question, leads, tasks }));
    } catch (error) {
      sendApiError(res, error);
    }
  });

  app.get('/api/commercial-intelligence/summary', requireAuth, async (req, res) => {
    try {
      const [leads, tasks] = await Promise.all([
        readLeads(req.user.sub),
        listTasks(req.user.sub)
      ]);
      res.json(buildCommercialIntelligence(leads, tasks));
    } catch (error) {
      sendApiError(res, error);
    }
  });



  // Propostas, conversão e relacionamento com clientes.
  app.get('/api/proposals/summary', requireAuth, async (req, res) => {
    try {
      const leads = await readLeads(req.user.sub);
      res.json(buildProposalSummary(leads));
    } catch (error) {
      sendApiError(res, error);
    }
  });

  app.post('/api/proposals/generate', requireAuth, async (req, res) => {
    try {
      const { leadId, objective = '', previousProposal = '' } = req.body;
      if (!leadId) return res.status(400).json({ error: 'Informe o leadId.' });

      const leads = await readLeads(req.user.sub);
      const lead = leads.find((item) => String(item.placeId || item.nome) === String(leadId));
      if (!lead) return res.status(404).json({ error: 'Lead não encontrado.' });

      const localRecommendation = buildSalesApproach(lead, {
        variationSeed: `proposal-${Date.now()}`,
        channel: 'proposal',
        mode: 'new'
      });

      const recommendation = await generateAiEnhancedApproach({
        lead,
        leadContext: localRecommendation.leadContext,
        localRecommendation,
        regenerateKey: `proposal-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        previousApproach: previousProposal,
        mode: 'new',
        channel: 'proposal'
      });

      const proposal = await buildAiProposal({ lead, recommendation, objective, previousProposal });

      const updated = await updateLeadStatus(leadId, 'PROPOSTA', {
        data: new Date().toISOString(),
        tipo: 'PROPOSTA_GERADA',
        status: 'PROPOSTA',
        propostaId: proposal.id,
        titulo: proposal.title,
        proposta: proposal.text,
        valorReferencia: proposal.estimatedRange,
        strategy: proposal.strategy,
        provider: proposal.provider,
        model: proposal.model,
        resumo: 'Proposta comercial inicial gerada e lead movido para PROPOSTA.'
      }, req.user.sub);

      if (typeof completePendingAutomationTasksForLead === 'function') {
        await completePendingAutomationTasksForLead(req.user.sub, leadId);
      }
      const automaticTask = await createStageTask(req.user.sub, updated || lead, 'PROPOSTA');
      const commercialEngine = typeof buildCommercialEngineOutput === 'function'
        ? buildCommercialEngineOutput({ lead: updated || lead, status: 'PROPOSTA', task: automaticTask })
        : null;

      res.status(201).json({
        ok: true,
        leadId,
        lead: updated,
        automaticTask,
        commercialEngine,
        proposal,
        source: recommendation.source || 'local',
        provider: recommendation.provider || 'local',
        providerLabel: proposal.provider || recommendation.providerLabel || 'Motor Local',
        model: proposal.model || recommendation.model || 'local',
        aiStatus: proposal.aiStatus || recommendation.aiStatus || getAiProviderStatus(),
        aiError: proposal.aiError || recommendation.aiError || null
      });
    } catch (error) {
      sendApiError(res, error);
    }
  });


  app.get('/api/customers/summary', requireAuth, async (req, res) => {
    try {
      const leads = await readLeads(req.user.sub);
      res.json(buildCustomerSuccessSummary(leads));
    } catch (error) {
      sendApiError(res, error);
    }
  });

  app.post('/api/customers/close', requireAuth, async (req, res) => {
    try {
      const { leadId, revenue = '', note = '' } = req.body;
      if (!leadId) return res.status(400).json({ error: 'Informe o leadId.' });

      const updated = await updateLeadStatus(leadId, 'FECHADO', buildCloseInteraction({ revenue, note }), req.user.sub);
      if (!updated) return res.status(404).json({ error: 'Lead não encontrado.' });
      if (typeof completePendingAutomationTasksForLead === 'function') {
        await completePendingAutomationTasksForLead(req.user.sub, leadId);
      }
      const commercialEngine = typeof buildCommercialEngineOutput === 'function'
        ? buildCommercialEngineOutput({ lead: updated, status: 'FECHADO' })
        : null;

      res.json({
        ok: true,
        lead: updated,
        movedToActiveCustomers: true,
        commercialEngine,
        summary: buildCustomerSuccessSummary(await readLeads(req.user.sub)).summary
      });
    } catch (error) {
      sendApiError(res, error);
    }
  });

  app.post('/api/customers/lost', requireAuth, async (req, res) => {
    try {
      const { leadId, reason = '' } = req.body;
      if (!leadId) return res.status(400).json({ error: 'Informe o leadId.' });

      const updated = await updateLeadStatus(leadId, 'SEM_INTERESSE', buildLostInteraction({ reason }), req.user.sub);
      if (!updated) return res.status(404).json({ error: 'Lead não encontrado.' });
      if (typeof completePendingAutomationTasksForLead === 'function') {
        await completePendingAutomationTasksForLead(req.user.sub, leadId);
      }
      res.json({ ok: true, lead: updated, commercialEngine: buildCommercialEngineOutput?.({ lead: updated, status: 'SEM_INTERESSE' }) || null });
    } catch (error) {
      sendApiError(res, error);
    }
  });


  app.get('/api/customer-growth/summary', requireAuth, async (req, res) => {
    try {
      const leads = await readLeads(req.user.sub);
      res.json(buildCustomerGrowthSummary(leads));
    } catch (error) {
      sendApiError(res, error);
    }
  });

  app.post('/api/customer-growth/referral', requireAuth, async (req, res) => {
    try {
      const { leadId } = req.body;
      if (!leadId) return res.status(400).json({ error: 'Informe o leadId.' });

      const leads = await readLeads(req.user.sub);
      const lead = leads.find((item) => String(item.placeId || item.nome) === String(leadId));
      if (!lead) return res.status(404).json({ error: 'Cliente não encontrado.' });
      if (String(lead.status || '').toUpperCase() !== 'FECHADO') {
        return res.status(409).json({ error: 'Pedido de indicação só deve ser usado com clientes fechados.' });
      }

      const message = buildReferralMessage(lead);
      const updated = await updateLeadStatus(leadId, 'FECHADO', buildReferralInteraction({ message }), req.user.sub);
      res.json({ ok: true, lead: updated, message });
    } catch (error) {
      sendApiError(res, error);
    }
  });

  app.post('/api/customer-growth/expansion', requireAuth, async (req, res) => {
    try {
      const { leadId } = req.body;
      if (!leadId) return res.status(400).json({ error: 'Informe o leadId.' });

      const leads = await readLeads(req.user.sub);
      const lead = leads.find((item) => String(item.placeId || item.nome) === String(leadId));
      if (!lead) return res.status(404).json({ error: 'Cliente não encontrado.' });
      if (String(lead.status || '').toUpperCase() !== 'FECHADO') {
        return res.status(409).json({ error: 'Expansão só deve ser usada com clientes fechados.' });
      }

      const message = buildExpansionMessage(lead);
      const updated = await updateLeadStatus(leadId, 'FECHADO', buildExpansionInteraction({ message }), req.user.sub);
      res.json({ ok: true, lead: updated, message });
    } catch (error) {
      sendApiError(res, error);
    }
  });

  // Relatórios gerenciais e tratamento de objeções.
  app.get('/api/reports/commercial', requireAuth, async (req, res) => {
    try {
      const [leads, tasks] = await Promise.all([
        readLeads(req.user.sub),
        listTasks(req.user.sub)
      ]);
      res.json(buildCommercialReport(leads, tasks));
    } catch (error) {
      sendApiError(res, error);
    }
  });

  app.get('/api/reports/commercial.csv', requireAuth, async (req, res) => {
    try {
      const [leads, tasks] = await Promise.all([
        readLeads(req.user.sub),
        listTasks(req.user.sub)
      ]);
      const report = buildCommercialReport(leads, tasks);
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="relatorio-comercial.csv"');
      res.send(buildCommercialReportCsv(report));
    } catch (error) {
      sendApiError(res, error);
    }
  });

  app.post('/api/commercial-intelligence/objection', requireAuth, async (req, res) => {
    try {
      const { leadId, objection } = req.body;
      if (!leadId || !objection) return res.status(400).json({ error: 'Informe leadId e objeção.' });

      const leads = await readLeads(req.user.sub);
      const lead = leads.find((item) => String(item.placeId || item.nome) === String(leadId));
      if (!lead) return res.status(404).json({ error: 'Lead não encontrado.' });

      res.json({
        leadId,
        objection,
        respostaSugerida: buildObjectionResponse(objection, lead)
      });
    } catch (error) {
      sendApiError(res, error);
    }
  });

  app.patch('/api/followups/:id/done', requireAuth, async (req, res) => {
    try {
      const task = await completeTask(req.user.sub, req.params.id);
      if (!task) return res.status(404).json({ error: 'Follow-up não encontrado.' });
      res.json(task);
    } catch (error) {
      sendApiError(res, error);
    }
  });


  return app;
}

module.exports = { registerCommercialRoutes };
