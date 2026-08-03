/**
 * @fileoverview Rotas do CRM avançado: configuração, filtros, importação, previsão e reativação.
 * @module routes/crmRoutes
 */

function registerCrmRoutes(app, context) {
  const {
    requireAuth,
    readLeads,
    saveLeads,
    updateLeadStatus,
    updateLeadCommercialData,
    getCrmConfiguration,
    saveCrmConfiguration,
    normalizeLeadCommercialUpdates,
    validateStageRequirements,
    applyLeadFilters,
    buildForecast,
    buildPeriodReport,
    previewCsvImport,
    importCsvLeads,
    buildFullExportCsv,
    findReactivationCandidates,
    sendApiError,
    sanitizeSearchText
  } = context;

  app.get('/api/crm/config', requireAuth, async (req, res) => {
    try {
      res.json(await getCrmConfiguration(req.user.sub));
    } catch (error) { sendApiError(res, error); }
  });

  app.put('/api/crm/config', requireAuth, async (req, res) => {
    try {
      const saved = await saveCrmConfiguration(req.user.sub, req.body || {});
      res.json(saved);
    } catch (error) { sendApiError(res, error); }
  });

  app.get('/api/crm/leads', requireAuth, async (req, res) => {
    try {
      const [leads, config] = await Promise.all([
        readLeads(req.user.sub),
        getCrmConfiguration(req.user.sub)
      ]);
      res.json(applyLeadFilters(leads, req.query, config));
    } catch (error) { sendApiError(res, error); }
  });

  app.patch('/api/crm/leads/:leadId', requireAuth, async (req, res) => {
    try {
      const leadId = sanitizeSearchText(req.params.leadId, 240);
      if (!leadId) return res.status(400).json({ error: 'Informe o leadId.' });
      const [leads, config] = await Promise.all([
        readLeads(req.user.sub),
        getCrmConfiguration(req.user.sub)
      ]);
      const current = leads.find((lead) => String(lead.placeId || lead.nome) === leadId);
      if (!current) return res.status(404).json({ error: 'Lead não encontrado.' });

      const normalizedUpdates = normalizeLeadCommercialUpdates({ ...current, ...req.body }, config);
      const targetStatus = req.body.status ? String(req.body.status).toUpperCase() : String(current.status || 'NOVO');
      const candidate = { ...current, ...normalizedUpdates, status: targetStatus };
      const validation = validateStageRequirements(candidate, targetStatus, config, normalizedUpdates.pipelineId);
      if (!validation.valid) {
        return res.status(422).json({
          error: 'Preencha os campos obrigatórios antes de mover o lead para esta etapa.',
          missingFields: validation.missingFields,
          stage: validation.stage
        });
      }

      let updated = await updateLeadCommercialData(leadId, normalizedUpdates, {
        data: new Date().toISOString(),
        tipo: 'CRM_DADOS_ATUALIZADOS',
        campos: Object.keys(normalizedUpdates)
      }, req.user.sub);

      if (targetStatus !== String(current.status || 'NOVO').toUpperCase()) {
        updated = await updateLeadStatus(leadId, targetStatus, {
          data: new Date().toISOString(),
          tipo: 'STATUS_ATUALIZADO',
          statusAnterior: current.status || 'NOVO',
          status: targetStatus,
          pipelineId: normalizedUpdates.pipelineId
        }, req.user.sub);
      }

      return res.json(updated);
    } catch (error) { return sendApiError(res, error); }
  });

  app.get('/api/crm/forecast', requireAuth, async (req, res) => {
    try {
      const [leads, config] = await Promise.all([
        readLeads(req.user.sub),
        getCrmConfiguration(req.user.sub)
      ]);
      const filtered = applyLeadFilters(leads, req.query, config);
      res.json(buildForecast(filtered, config));
    } catch (error) { sendApiError(res, error); }
  });

  app.get('/api/crm/reports', requireAuth, async (req, res) => {
    try {
      const [leads, config] = await Promise.all([
        readLeads(req.user.sub),
        getCrmConfiguration(req.user.sub)
      ]);
      res.json(buildPeriodReport(leads, config, {
        from: req.query.from,
        to: req.query.to,
        pipelineId: req.query.pipelineId
      }));
    } catch (error) { sendApiError(res, error); }
  });

  app.post('/api/crm/import/preview', requireAuth, async (req, res) => {
    try {
      const csvText = String(req.body.csvText || '');
      if (!csvText.trim()) return res.status(400).json({ error: 'Cole ou envie o conteúdo CSV.' });
      const [leads, config] = await Promise.all([
        readLeads(req.user.sub),
        getCrmConfiguration(req.user.sub)
      ]);
      const preview = previewCsvImport(csvText, req.body.mapping || {}, leads, config);
      res.json({
        headers: preview.headers,
        mapping: preview.mapping,
        valid: preview.valid,
        duplicates: preview.duplicates,
        invalid: preview.invalid,
        errors: preview.errors,
        sample: preview.rows.slice(0, 12).map((row) => ({
          rowNumber: row.rowNumber,
          valid: row.valid,
          duplicate: row.duplicate,
          lead: row.lead
        }))
      });
    } catch (error) { sendApiError(res, error); }
  });

  app.post('/api/crm/import', requireAuth, async (req, res) => {
    try {
      const csvText = String(req.body.csvText || '');
      if (!csvText.trim()) return res.status(400).json({ error: 'Cole ou envie o conteúdo CSV.' });
      const [leads, config] = await Promise.all([
        readLeads(req.user.sub),
        getCrmConfiguration(req.user.sub)
      ]);
      const result = importCsvLeads(csvText, req.body.mapping || {}, leads, config);
      if (result.errors.length) return res.status(400).json({ error: result.errors[0], ...result });
      if (result.leads.length) await saveLeads(result.leads, req.user.sub);
      res.status(201).json({
        imported: result.leads.length,
        duplicates: result.duplicates,
        invalid: result.invalid,
        total: result.rows.length
      });
    } catch (error) { sendApiError(res, error); }
  });

  app.get('/api/crm/export.csv', requireAuth, async (req, res) => {
    try {
      const [leads, config] = await Promise.all([
        readLeads(req.user.sub),
        getCrmConfiguration(req.user.sub)
      ]);
      const filtered = applyLeadFilters(leads, req.query, config);
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="leadhunter-crm-completo.csv"');
      res.send(`\uFEFF${buildFullExportCsv(filtered, config)}`);
    } catch (error) { sendApiError(res, error); }
  });

  app.get('/api/crm/reactivation', requireAuth, async (req, res) => {
    try {
      const minDays = Math.max(7, Math.min(365, Number(req.query.minDays || 30)));
      const leads = await readLeads(req.user.sub);
      res.json(findReactivationCandidates(leads, new Date(), minDays));
    } catch (error) { sendApiError(res, error); }
  });

  app.post('/api/crm/reactivation/:leadId', requireAuth, async (req, res) => {
    try {
      const leadId = sanitizeSearchText(req.params.leadId, 240);
      const updated = await updateLeadStatus(leadId, 'NOVO', {
        data: new Date().toISOString(),
        tipo: 'LEAD_REATIVADO',
        origem: 'CRM_AVANCADO',
        resumo: 'Lead devolvido ao pipeline para uma nova tentativa comercial.'
      }, req.user.sub);
      if (!updated) return res.status(404).json({ error: 'Lead não encontrado.' });
      return res.json(updated);
    } catch (error) { return sendApiError(res, error); }
  });

  return app;
}

module.exports = { registerCrmRoutes };
