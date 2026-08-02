/**
 * @fileoverview Fundação omnichannel do LeadHunter: módulo src/domain/omnichannel/constants.
 *
 * Responsabilidade isolada para conversas, integrações, agente SDR,
 * segurança ou validação deste domínio.
 * @module src/domain/omnichannel/constants
 */

/** @module domain/omnichannel/constants */

const INTEGRATION_STATUSES = Object.freeze([
  'not_configured',
  'connecting',
  'waiting_authentication',
  'connected',
  'disconnected',
  'invalid_credentials',
  'webhook_error',
  'provider_unavailable',
  'demo'
]);

const CONVERSATION_STATUSES = Object.freeze([
  'open',
  'waiting_lead',
  'waiting_human',
  'resolved',
  'archived'
]);

const MESSAGE_DIRECTIONS = Object.freeze(['inbound', 'outbound', 'internal']);
const MESSAGE_AUTHORS = Object.freeze(['lead', 'agent', 'human', 'system']);
const AGENT_MODES = Object.freeze(['assistido', 'semiautonomo', 'autonomo_controlado']);

const CRM_ACTIVITY_TYPES = Object.freeze([
  'message_received',
  'message_sent',
  'message_answered_by_ai',
  'message_answered_by_human',
  'lead_created',
  'lead_qualified',
  'lead_disqualified',
  'follow_up_created',
  'follow_up_completed',
  'conversation_transferred',
  'proposal_requested',
  'proposal_sent',
  'opportunity_stalled',
  'pipeline_stage_changed',
  'score_changed',
  'integration_error',
  'message_failed',
  'conversation_resumed'
]);

module.exports = {
  INTEGRATION_STATUSES,
  CONVERSATION_STATUSES,
  MESSAGE_DIRECTIONS,
  MESSAGE_AUTHORS,
  AGENT_MODES,
  CRM_ACTIVITY_TYPES
};
