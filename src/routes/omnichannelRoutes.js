/**
 * @fileoverview Rotas autenticadas do domínio omnichannel e agente SDR.
 *
 * O roteador aplica rate limit geral e limites específicos para envio de
 * mensagens e simulações. O webhook do WhatsApp é público, mas validado pelo
 * provedor antes de encaminhar eventos para o domínio.
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
  const webhookLimit = simpleRateLimit({ windowMs: 60_000, max: 120 });

  router.get('/webhooks/whatsapp', webhookLimit, asyncHandler(controller.verifyWhatsAppWebhook));
  router.post('/webhooks/whatsapp', webhookLimit, asyncHandler(controller.receiveWhatsAppWebhook));

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

  router.get('/outbound/jobs', asyncHandler(controller.listOutboundJobs));
  router.get('/outbound/summary', asyncHandler(controller.getOutboundSummary));
  router.post('/outbound/jobs/:id/approve', mutationLimit, asyncHandler(controller.approveOutboundJob));
  router.post('/outbound/jobs/:id/cancel', mutationLimit, asyncHandler(controller.cancelOutboundJob));

  return router;
}

module.exports = { asyncHandler, createOmnichannelRoutes };
