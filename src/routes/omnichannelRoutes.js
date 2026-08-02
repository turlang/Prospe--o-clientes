/**
 * @fileoverview Rotas autenticadas do domínio omnichannel e agente SDR.
 *
 * O roteador aplica rate limit geral e limites específicos para envio de
 * mensagens e simulações, mantendo todos os recursos sob autenticação.
 *
 * @module src/routes/omnichannelRoutes
 */

const express = require('express');
const controller = require('../controllers/omnichannelController');

function asyncHandler(handler) {
  return (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
}

function createOmnichannelRoutes({ requireAuth, simpleRateLimit }) {
  const router = express.Router();
  const mutationLimit = simpleRateLimit({ windowMs: 60_000, max: 30 });
  const messageLimit = simpleRateLimit({ windowMs: 60_000, max: 20 });

  router.use(requireAuth);
  router.use(simpleRateLimit({ windowMs: 60_000, max: 90 }));

  router.get('/providers', asyncHandler(controller.listProviders));

  router.get('/agents', asyncHandler(controller.listAgentConfigurations));
  router.post('/agents', mutationLimit, asyncHandler(controller.createAgentConfiguration));
  router.patch('/agents/:id', mutationLimit, asyncHandler(controller.updateAgentConfiguration));
  router.get('/agents/:id/prompt', asyncHandler(controller.previewAgentPrompt));
  router.post('/agents/:id/playground', messageLimit, asyncHandler(controller.playground));

  router.get('/leads', asyncHandler(controller.listConversationLeads));
  router.get('/summary', asyncHandler(controller.getConversationSummary));
  router.get('/conversations', asyncHandler(controller.listConversations));
  router.post('/conversations', mutationLimit, asyncHandler(controller.createConversation));
  router.get('/conversations/:id', asyncHandler(controller.getConversation));
  router.patch('/conversations/:id', mutationLimit, asyncHandler(controller.updateConversation));
  router.patch('/conversations/:id/read', mutationLimit, asyncHandler(controller.markConversationRead));
  router.post('/conversations/:id/messages', messageLimit, asyncHandler(controller.sendConversationMessage));
  router.post('/conversations/:id/demo-inbound', messageLimit, asyncHandler(controller.simulateInboundMessage));
  router.post('/conversations/:id/notes', mutationLimit, asyncHandler(controller.addConversationNote));

  return router;
}

module.exports = { asyncHandler, createOmnichannelRoutes };
