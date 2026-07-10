const express = require('express');
const { SalesOsCore } = require('../commercial/salesOsCore');
const { readLeads } = require('../../storage');
const { listTasks } = require('../../localTaskStore');
const { getProviderSnapshot } = require('../ai/providerManager');
const { listTemplates } = require('../prompts/promptManager');

function createSalesOsRoutes({ requireAuth }) {
  const router = express.Router();
  const core = new SalesOsCore();

  router.get('/status', requireAuth, (_req, res) => {
    res.json({ version: '23.2.0', architecture: 'sales-os-core', ai: getProviderSnapshot(), prompts: listTemplates() });
  });


  router.get('/cockpit', requireAuth, async (req, res) => {
    try {
      const [leads, tasks] = await Promise.all([readLeads(req.user.sub), listTasks(req.user.sub)]);
      res.json(core.buildCockpit({ leads, tasks, userName: req.user.name || req.user.email || '' }));
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
