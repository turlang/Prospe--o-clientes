const express = require('express');
const { SalesOsCore } = require('../commercial/salesOsCore');
const { readLeads } = require('../../storage');
const { listTasks } = require('../../localTaskStore');
const { getProviderSnapshot } = require('../ai/providerManager');
const { listTemplates } = require('../prompts/promptManager');
const { buildCommercialContext } = require('../intelligence/copilotContextBuilder');
const { answerCommercialQuestion, localCopilotAnswer } = require('../ai/commercialCopilot');
const { addCopilotMessage, listCopilotMessages, clearCopilotMessages } = require('../memory/copilotMemoryStore');

function createSalesOsRoutes({ requireAuth }) {
  const router = express.Router();
  const core = new SalesOsCore();

  router.get('/status', requireAuth, (_req, res) => {
    res.json({ version: '23.3.0', architecture: 'sales-os-core', ai: getProviderSnapshot(), prompts: listTemplates() });
  });


  router.get('/cockpit', requireAuth, async (req, res) => {
    try {
      const [leads, tasks] = await Promise.all([readLeads(req.user.sub), listTasks(req.user.sub)]);
      res.json(core.buildCockpit({ leads, tasks, userName: req.user.name || req.user.email || '' }));
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });


  router.get('/copilot/history', requireAuth, async (req, res) => {
    try {
      res.json({ messages: await listCopilotMessages(req.user.sub, req.query.limit || 50) });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  router.delete('/copilot/history', requireAuth, async (req, res) => {
    try {
      const deletedCount = await clearCopilotMessages(req.user.sub);
      res.json({ ok: true, deletedCount });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  router.get('/copilot/briefing', requireAuth, async (req, res) => {
    try {
      const [leads, tasks] = await Promise.all([readLeads(req.user.sub), listTasks(req.user.sub)]);
      const context = buildCommercialContext({ leads, tasks, userName: req.user.name || req.user.email || '' });
      const briefing = localCopilotAnswer('Faça meu planejamento diário e atue como coach comercial.', context);
      res.json({ ...briefing, context: { metrics: context.metrics, dailyPlan: context.dailyPlan.slice(0, 5), alerts: context.alerts.slice(0, 5) } });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  router.post('/copilot/chat', requireAuth, async (req, res) => {
    try {
      const question = String(req.body?.question || '').trim();
      if (question.length < 3) return res.status(400).json({ error: 'Digite uma pergunta com pelo menos 3 caracteres.' });
      if (question.length > 1200) return res.status(400).json({ error: 'A pergunta é muito longa.' });

      const [leads, tasks, history] = await Promise.all([
        readLeads(req.user.sub),
        listTasks(req.user.sub),
        listCopilotMessages(req.user.sub, 20)
      ]);
      const context = buildCommercialContext({ leads, tasks, userName: req.user.name || req.user.email || '' });
      await addCopilotMessage({ userId: req.user.sub, role: 'user', content: question });
      const answer = await answerCommercialQuestion({ question, context, history });
      const saved = await addCopilotMessage({
        userId: req.user.sub,
        role: 'assistant',
        content: answer.answer,
        provider: answer.provider,
        model: answer.model,
        recommendedActions: answer.recommendedActions,
        metadata: { source: answer.source, aiError: answer.aiError || null }
      });
      res.json({ ...answer, message: saved, contextUpdatedAt: context.generatedAt });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  router.get('/snapshot', requireAuth, async (req, res) => {
    try {
      const [leads, tasks] = await Promise.all([readLeads(req.user.sub), listTasks(req.user.sub)]);
      res.json(core.buildSnapshot({ leads, tasks }));
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  return router;
}

module.exports = { createSalesOsRoutes };
