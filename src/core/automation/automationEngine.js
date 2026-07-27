/**
 * @fileoverview Componente do núcleo Sales OS `automationEngine`, independente da camada de apresentação.
 *
 * Responsabilidade delimitada conforme a arquitetura descrita em
 * `docs/ARQUITETURA.md`. Alterações neste arquivo devem preservar os contratos
 * documentados e ser acompanhadas por testes quando afetarem regras de negócio.
 *
 * @module src/core/automation/automationEngine
 */

const { normalizeLeadStatus } = require('../../domain/leadStatus');

function evaluateAutomationRules({ leads = [], tasks = [], now = new Date() } = {}) {
  const actions = [];
  for (const lead of Array.isArray(leads) ? leads : []) {
    const leadId = String(lead.placeId || lead.id || lead.nome || '');
    const status = normalizeLeadStatus(lead.status);
    const hasOpenTask = (Array.isArray(tasks) ? tasks : []).some((task) => String(task.leadId) === leadId && !task.done);
    if (['CONTATADO', 'INTERESSADO', 'REUNIAO', 'PROPOSTA'].includes(status) && !hasOpenTask) {
      actions.push({ leadId, leadName: lead.nome || 'Lead', rule: 'MISSING_NEXT_STEP', action: 'CREATE_FOLLOWUP', priority: status === 'PROPOSTA' ? 'ALTA' : 'MÉDIA', detectedAt: now.toISOString() });
    }
  }
  return actions;
}

module.exports = { evaluateAutomationRules };
