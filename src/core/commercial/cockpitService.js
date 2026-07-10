const { buildAutonomousCommandCenter } = require('../../services/autonomousCommercialService');

function normalizeStatus(status) {
  const value = String(status || 'NOVO').toUpperCase();
  return value === 'REUNIAO' ? 'PROPOSTA' : value;
}

function parseMoney(value) {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
  const raw = String(value || '').replace(/[^\d,.-]/g, '').replace(/\.(?=\d{3}(?:\D|$))/g, '').replace(',', '.');
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : 0;
}

function asDate(value) {
  const date = new Date(value || 0);
  return Number.isNaN(date.getTime()) ? null : date;
}

function leadId(lead = {}) {
  return String(lead.placeId || lead._id || lead.id || lead.nome || '');
}

function buildGlobalTimeline(leads = [], tasks = [], limit = 30) {
  const leadEvents = (Array.isArray(leads) ? leads : []).flatMap((lead) => {
    const interactions = Array.isArray(lead.interacoes) ? lead.interacoes : [];
    const events = interactions.map((interaction) => ({
      id: `${leadId(lead)}:${interaction.data || interaction.createdAt || Math.random()}`,
      kind: 'lead',
      leadId: leadId(lead),
      leadName: lead.nome || 'Lead',
      title: interaction.tipo || interaction.intencao || 'Atividade comercial',
      description: interaction.proximoPasso || interaction.status || interaction.mensagem || interaction.respostaSugerida || '',
      status: normalizeStatus(interaction.status || lead.status),
      occurredAt: interaction.data || interaction.createdAt || lead.updatedAt || lead.coletadoEm || null
    }));

    if (!events.length && lead.coletadoEm) {
      events.push({
        id: `${leadId(lead)}:created`,
        kind: 'lead-created',
        leadId: leadId(lead),
        leadName: lead.nome || 'Lead',
        title: 'Lead prospectado',
        description: `${lead.segmentoComercial || lead.tipo || 'Empresa'} adicionada ao CRM.`,
        status: normalizeStatus(lead.status),
        occurredAt: lead.coletadoEm
      });
    }
    return events;
  });

  const taskEvents = (Array.isArray(tasks) ? tasks : []).map((task) => ({
    id: `task:${task.id || task._id || task.title}:${task.updatedAt || task.dueAt}`,
    kind: task.done ? 'task-completed' : 'task-scheduled',
    leadId: String(task.leadId || ''),
    leadName: task.leadName || 'Lead',
    title: task.done ? 'Tarefa concluída' : 'Follow-up agendado',
    description: task.title || task.message || 'Atividade comercial',
    status: task.done ? 'CONCLUÍDA' : 'PENDENTE',
    occurredAt: task.updatedAt || task.createdAt || task.dueAt || null
  }));

  return [...leadEvents, ...taskEvents]
    .filter((event) => asDate(event.occurredAt))
    .sort((a, b) => asDate(b.occurredAt) - asDate(a.occurredAt))
    .slice(0, Math.max(1, Number(limit) || 30));
}

function buildStageMetrics(leads = []) {
  const stages = ['NOVO', 'CONTATADO', 'INTERESSADO', 'PROPOSTA', 'FECHADO'];
  const rows = Array.isArray(leads) ? leads : [];
  return stages.map((status, index) => {
    const stageLeads = rows.filter((lead) => normalizeStatus(lead.status) === status);
    const previous = index === 0 ? rows.length : rows.filter((lead) => stages.indexOf(normalizeStatus(lead.status)) >= index - 1).length;
    const conversion = previous ? Math.round((stageLeads.length / previous) * 100) : 0;
    return {
      status,
      count: stageLeads.length,
      value: Math.round(stageLeads.reduce((sum, lead) => sum + parseMoney(lead.ticketEstimado), 0)),
      conversion
    };
  });
}

function buildCockpit({ leads = [], tasks = [], now = new Date(), userName = '' } = {}) {
  const commandCenter = buildAutonomousCommandCenter(leads, tasks, now);
  const rows = Array.isArray(leads) ? leads : [];
  const active = rows.filter((lead) => !['FECHADO', 'SEM_INTERESSE', 'PERDIDO'].includes(normalizeStatus(lead.status)));
  const closed = rows.filter((lead) => normalizeStatus(lead.status) === 'FECHADO');
  const proposals = rows.filter((lead) => normalizeStatus(lead.status) === 'PROPOSTA');
  const completedTasks = (Array.isArray(tasks) ? tasks : []).filter((task) => task.done);
  const pendingTasks = (Array.isArray(tasks) ? tasks : []).filter((task) => !task.done);
  const closedRevenue = closed.reduce((sum, lead) => sum + parseMoney(lead.ticketEstimado), 0);

  return {
    version: '23.3.0',
    generatedAt: now.toISOString(),
    greeting: `Olá${userName ? `, ${userName}` : ''}. ${commandCenter.greeting}`,
    focus: commandCenter.dailyPlan?.[0] || null,
    metrics: {
      activeOpportunities: active.length,
      highPriority: commandCenter.summary?.highPriority || 0,
      atRisk: commandCenter.summary?.atRisk || 0,
      proposals: proposals.length,
      overdueTasks: commandCenter.summary?.overdueTasks || 0,
      dueToday: commandCenter.summary?.dueToday || 0,
      weightedRevenue: commandCenter.summary?.weightedRevenue || 0,
      closedRevenue: Math.round(closedRevenue),
      completedTasks: completedTasks.length,
      pendingTasks: pendingTasks.length
    },
    dailyPlan: commandCenter.dailyPlan || [],
    alerts: commandCenter.alerts || [],
    managerAdvice: commandCenter.managerAdvice || [],
    pipeline: buildStageMetrics(rows),
    pipelineHealth: commandCenter.pipelineHealth,
    forecast: commandCenter.forecast,
    timeline: buildGlobalTimeline(rows, tasks, 30),
    aiStatus: commandCenter.aiStatus
  };
}

module.exports = { buildCockpit, buildGlobalTimeline, buildStageMetrics };
