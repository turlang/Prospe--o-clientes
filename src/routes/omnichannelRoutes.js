/**
 * @fileoverview Fundação omnichannel do LeadHunter: módulo src/routes/omnichannelRoutes.
 *
 * Responsabilidade isolada para conversas, integrações, agente SDR,
 * segurança ou validação deste domínio.
 * @module src/routes/omnichannelRoutes
 */

const express = require('express');
const controller = require('../controllers/omnichannelController');

function createOmnichannelRoutes({ requireAuth, simpleRateLimit }) {
  const router = express.Router();
  router.use(requireAuth);
  router.use(simpleRateLimit({ windowMs: 60_000, max: 90 }));

  router.get('/providers', controller.listProviders);
  router.get('/agents', controller.listAgentConfigurations);
  router.post('/agents', controller.createAgentConfiguration);
  router.patch('/agents/:id', controller.updateAgentConfiguration);
  router.get('/agents/:id/prompt', controller.previewAgentPrompt);
  router.post('/agents/:id/playground', simpleRateLimit({ windowMs: 60_000, max: 20 }), controller.playground);

  return router;
}

module.exports = { createOmnichannelRoutes };
