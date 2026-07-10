const { buildCockpit } = require('../commercial/cockpitService');

function normalizeStatus(status) {
  const value = String(status || 'NOVO').toUpperCase();
  return value === 'REUNIAO' ? 'PROPOSTA' : value;
}

function compactLead(lead = {}) {
  const interactions = Array.isArray(lead.interacoes) ? lead.interacoes : [];
  const last = interactions.slice(-1)[0] || {};
  return {
    id: String(lead.placeId || lead._id || lead.id || lead.nome || ''),
    nome: lead.nome || 'Lead',
    segmento: lead.segmentoComercial || lead.tipo || '',
    status: normalizeStatus(lead.status),
    score: Number(lead.score || 0),
    probabilidade: lead.probabilidade || '',
    ticketEstimado: lead.ticketEstimado || '',
    telefone: Boolean(lead.telefone),
    site: Boolean(lead.site),
    favorito: Boolean(lead.favorito),
    ultimaInteracao: last.data || last.createdAt || lead.atualizadoEm || lead.coletadoEm || null,
    ultimoEvento: last.tipo || last.intencao || '',
    notas: String(lead.notas || '').slice(0, 240)
  };
}

function buildCommercialContext({ leads = [], tasks = [], userName = '', now = new Date() } = {}) {
  const cockpit = buildCockpit({ leads, tasks, userName, now });
  const rows = Array.isArray(leads) ? leads : [];
  const topLeads = rows.map(compactLead)
    .sort((a, b) => Number(b.score) - Number(a.score))
    .slice(0, 20);

  const stages = rows.reduce((acc, lead) => {
    const status = normalizeStatus(lead.status);
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  return {
    generatedAt: now.toISOString(),
    userName,
    metrics: cockpit.metrics,
    pipeline: cockpit.pipeline,
    pipelineHealth: cockpit.pipelineHealth,
    forecast: cockpit.forecast,
    stages,
    dailyPlan: (cockpit.dailyPlan || []).slice(0, 12),
    alerts: (cockpit.alerts || []).slice(0, 10),
    managerAdvice: (cockpit.managerAdvice || []).slice(0, 8),
    recentTimeline: (cockpit.timeline || []).slice(0, 15),
    topLeads,
    pendingTasks: (Array.isArray(tasks) ? tasks : []).filter((task) => !task.done).slice(0, 20).map((task) => ({
      id: String(task.id || task._id || ''),
      leadId: String(task.leadId || ''),
      leadName: task.leadName || '',
      title: task.title || '',
      dueAt: task.dueAt || null,
      priority: task.priority || 'MÉDIA'
    }))
  };
}

module.exports = { buildCommercialContext, compactLead };
