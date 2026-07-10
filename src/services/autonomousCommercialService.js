/**
 * autonomousCommercialService.js
 * -----------------------------------------------------------------------------
 * V22 - CRM Autônomo.
 * Consolida dados do CRM em uma central diária e oferece um copiloto comercial
 * que responde com base apenas nos leads e tarefas do usuário.
 */

const { buildCommercialIntelligence, normalizeStatus } = require('./commercialIntelligenceService');
const { generateAiJsonContent, getAiProviderStatus } = require('./aiApproachService');

function parseMoney(value) {
  const text = String(value || '').replace(/[^0-9,.-]/g, '').replace(/\./g, '').replace(',', '.');
  const number = Number(text);
  return Number.isFinite(number) ? number : 0;
}

function getLastInteractionAt(lead = {}) {
  const interactions = Array.isArray(lead.interacoes) ? lead.interacoes : [];
  const dates = interactions.map((item) => new Date(item.data || 0)).filter((date) => !Number.isNaN(date.getTime()));
  if (!dates.length) return lead.coletadoEm || null;
  return new Date(Math.max(...dates.map((date) => date.getTime()))).toISOString();
}

function daysSince(value, now = new Date()) {
  const date = new Date(value || 0);
  if (Number.isNaN(date.getTime())) return null;
  return Math.max(0, Math.floor((now.getTime() - date.getTime()) / 86400000));
}

function buildPipelineHealth(leads = [], now = new Date()) {
  const active = (Array.isArray(leads) ? leads : []).filter((lead) => !['FECHADO', 'SEM_INTERESSE', 'PERDIDO'].includes(normalizeStatus(lead.status)));
  const byStatus = ['NOVO', 'CONTATADO', 'INTERESSADO', 'PROPOSTA'].map((status) => {
    const rows = active.filter((lead) => normalizeStatus(lead.status) === status);
    const ages = rows.map((lead) => daysSince(getLastInteractionAt(lead), now)).filter((value) => value !== null);
    const averageAge = ages.length ? Math.round(ages.reduce((sum, value) => sum + value, 0) / ages.length) : 0;
    const stalled = ages.filter((value) => value >= (status === 'PROPOSTA' ? 3 : 7)).length;
    return { status, count: rows.length, averageAge, stalled };
  });

  const total = active.length || 1;
  const contacted = active.filter((lead) => ['CONTATADO', 'INTERESSADO', 'PROPOSTA'].includes(normalizeStatus(lead.status))).length;
  const interested = active.filter((lead) => ['INTERESSADO', 'PROPOSTA'].includes(normalizeStatus(lead.status))).length;
  const proposals = active.filter((lead) => normalizeStatus(lead.status) === 'PROPOSTA').length;

  return {
    stages: byStatus,
    rates: {
      contactRate: Math.round((contacted / total) * 100),
      interestRate: contacted ? Math.round((interested / contacted) * 100) : 0,
      proposalRate: interested ? Math.round((proposals / interested) * 100) : 0
    },
    bottleneck: [...byStatus].sort((a, b) => b.stalled - a.stalled || b.averageAge - a.averageAge)[0] || null
  };
}

function buildForecast(leads = []) {
  const open = (Array.isArray(leads) ? leads : []).filter((lead) => ['INTERESSADO', 'PROPOSTA'].includes(normalizeStatus(lead.status)));
  const weighted = open.reduce((sum, lead) => {
    const amount = parseMoney(lead.ticketEstimado);
    const factor = normalizeStatus(lead.status) === 'PROPOSTA' ? 0.65 : 0.35;
    return sum + amount * factor;
  }, 0);
  return {
    openOpportunities: open.length,
    weightedRevenue: Math.round(weighted),
    proposals: open.filter((lead) => normalizeStatus(lead.status) === 'PROPOSTA').length
  };
}

function buildAutonomousCommandCenter(leads = [], tasks = [], now = new Date()) {
  const intelligence = buildCommercialIntelligence(leads, tasks, now);
  const pipelineHealth = buildPipelineHealth(leads, now);
  const forecast = buildForecast(leads);
  const overdueTasks = (Array.isArray(tasks) ? tasks : []).filter((task) => !task.done && new Date(task.dueAt || 0) < now).length;
  const dueToday = (Array.isArray(tasks) ? tasks : []).filter((task) => {
    if (task.done) return false;
    const due = new Date(task.dueAt || 0);
    return !Number.isNaN(due.getTime()) && due.toDateString() === now.toDateString();
  }).length;

  const headline = intelligence.summary.highPriority
    ? `${intelligence.summary.highPriority} lead(s) de alta prioridade precisam de ação.`
    : intelligence.summary.atRisk
      ? `${intelligence.summary.atRisk} oportunidade(s) precisam de recuperação.`
      : 'Operação comercial sob controle. Continue prospectando e acompanhando retornos.';

  return {
    version: '22.0.0',
    generatedAt: now.toISOString(),
    greeting: headline,
    summary: {
      ...intelligence.summary,
      overdueTasks,
      dueToday,
      weightedRevenue: forecast.weightedRevenue,
      openOpportunities: forecast.openOpportunities
    },
    dailyPlan: intelligence.nextActions.slice(0, 6),
    alerts: intelligence.atRisk.slice(0, 8),
    managerAdvice: intelligence.managerAdvice,
    pipelineHealth,
    forecast,
    aiStatus: getAiProviderStatus()
  };
}

function buildLocalCopilotAnswer(question = '', center = {}) {
  const text = String(question || '').toLowerCase();
  const actions = center.dailyPlan || [];
  if (text.includes('ligar') || text.includes('contatar') || text.includes('agora')) {
    const top = actions.slice(0, 3);
    return top.length
      ? `Priorize agora: ${top.map((item, index) => `${index + 1}. ${item.leadName} — ${item.action}`).join(' | ')}`
      : 'Não há uma ação urgente registrada. Prospete novos leads ou organize follow-ups.';
  }
  if (text.includes('risco') || text.includes('parado') || text.includes('esfri')) {
    return center.summary?.atRisk
      ? `Existem ${center.summary.atRisk} oportunidade(s) em risco. Comece pelos alertas da Central de Inteligência e agende um próximo passo para cada uma.`
      : 'Não identifiquei oportunidades críticas em risco neste momento.';
  }
  if (text.includes('fatur') || text.includes('receita') || text.includes('previs')) {
    return `A previsão ponderada do pipeline é de R$ ${Number(center.summary?.weightedRevenue || 0).toLocaleString('pt-BR')}, distribuída em ${center.summary?.openOpportunities || 0} oportunidade(s) abertas.`;
  }
  return `${center.greeting || 'Sua operação comercial está disponível na central.'} ${center.managerAdvice?.[0] || 'Use o plano diário para definir a próxima ação.'}`;
}

async function answerCommercialCopilot({ question = '', leads = [], tasks = [] } = {}) {
  const center = buildAutonomousCommandCenter(leads, tasks);
  const localAnswer = buildLocalCopilotAnswer(question, center);
  const compactContext = {
    summary: center.summary,
    dailyPlan: center.dailyPlan,
    alerts: center.alerts,
    pipelineHealth: center.pipelineHealth,
    forecast: center.forecast
  };

  const ai = await generateAiJsonContent({
    systemContent: 'Você é um diretor comercial experiente. Responda em português simples, de forma prática, sem inventar dados e usando somente o contexto fornecido. Retorne JSON válido.',
    prompt: `Pergunta do usuário: ${question}\n\nContexto do CRM:\n${JSON.stringify(compactContext)}\n\nRetorne {"answer":"resposta objetiva","recommendedActions":["ação 1","ação 2"]}.`,
    maxTokens: 700
  });

  if (ai.parsed?.answer) {
    return {
      answer: String(ai.parsed.answer),
      recommendedActions: Array.isArray(ai.parsed.recommendedActions) ? ai.parsed.recommendedActions.slice(0, 5) : [],
      provider: ai.provider,
      providerLabel: ai.providerLabel,
      model: ai.model,
      source: ai.source,
      aiStatus: ai.aiStatus
    };
  }

  return {
    answer: localAnswer,
    recommendedActions: center.dailyPlan.slice(0, 3).map((item) => `${item.leadName}: ${item.action}`),
    provider: 'local',
    providerLabel: 'Motor Local',
    model: 'local',
    source: ai.source || 'local',
    aiStatus: ai.aiStatus,
    aiError: ai.aiError || null
  };
}

module.exports = {
  buildAutonomousCommandCenter,
  buildPipelineHealth,
  buildForecast,
  buildLocalCopilotAnswer,
  answerCommercialCopilot
};
