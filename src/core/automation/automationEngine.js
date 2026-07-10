function evaluateAutomationRules({ leads = [], tasks = [], now = new Date() } = {}) {
  const actions = [];
  for (const lead of Array.isArray(leads) ? leads : []) {
    const leadId = String(lead.placeId || lead.id || lead.nome || '');
    const status = String(lead.status || 'NOVO').toUpperCase();
    const hasOpenTask = (Array.isArray(tasks) ? tasks : []).some((task) => String(task.leadId) === leadId && !task.done);
    if (['CONTATADO', 'INTERESSADO', 'PROPOSTA'].includes(status) && !hasOpenTask) {
      actions.push({ leadId, leadName: lead.nome || 'Lead', rule: 'MISSING_NEXT_STEP', action: 'CREATE_FOLLOWUP', priority: status === 'PROPOSTA' ? 'ALTA' : 'MÉDIA', detectedAt: now.toISOString() });
    }
  }
  return actions;
}

module.exports = { evaluateAutomationRules };
