/**
 * campaignAutomationService.js
 * -----------------------------------------------------------------------------
 * V21.6 — Campanhas comerciais inteligentes.
 *
 * Este serviço transforma leads do pipeline em cadências comerciais revisáveis.
 * A regra principal continua a mesma do produto: nada é disparado sozinho. O
 * sistema cria mensagens, tarefas e orientações para o vendedor revisar, copiar
 * e enviar no canal adequado.
 */

const { buildCampaignSequence } = require('../campaignEngine');
const { generateAiJsonContent } = require('./aiApproachService');
const { estimateTicketValue } = require('./customerSuccessService');

const CAMPAIGNABLE_STATUSES = new Set(['NOVO', 'CONTATADO', 'INTERESSADO', 'PROPOSTA']);

function normalizeStatus(status = '') {
  return String(status || 'NOVO').trim().toUpperCase();
}

function getLeadId(lead = {}) {
  return String(lead.placeId || lead.nome || '').trim();
}

function getLeadSegment(lead = {}) {
  return lead.segmentoComercial || lead.tipo || lead.segmentoBuscado || 'negócio local';
}

function daysSince(value) {
  const date = new Date(value || 0);
  if (Number.isNaN(date.getTime())) return null;
  return Math.max(0, Math.floor((Date.now() - date.getTime()) / 86_400_000));
}

function getLastInteractionAt(lead = {}) {
  const interactions = Array.isArray(lead.interacoes) ? lead.interacoes : [];
  const latest = interactions
    .map((item) => item.data || item.createdAt)
    .filter(Boolean)
    .sort()
    .pop();

  return latest || lead.atualizadoEm || lead.coletadoEm || '';
}

function inferCampaignObjective(lead = {}) {
  const status = normalizeStatus(lead.status);
  const segment = getLeadSegment(lead).toLowerCase();

  if (status === 'PROPOSTA') return 'reativar proposta e levar para decisão sem pressionar';
  if (status === 'INTERESSADO') return 'transformar interesse em conversa objetiva ou proposta';
  if (status === 'CONTATADO') return 'gerar resposta com valor e retomar a conversa';

  if (segment.includes('barbear') || segment.includes('salão') || segment.includes('salao')) {
    return 'abrir conversa mostrando como presença digital pode gerar mais agendamentos';
  }

  if (segment.includes('restaurante') || segment.includes('pizz') || segment.includes('hamburg')) {
    return 'abrir conversa sobre pedidos, cardápio e facilidade para contato';
  }

  if (segment.includes('clínica') || segment.includes('clinica') || segment.includes('odont') || segment.includes('estética') || segment.includes('estetica')) {
    return 'abrir conversa sobre confiança, agendamentos e clareza dos serviços';
  }

  return 'abrir conversa consultiva sobre presença digital e geração de contatos';
}

function classifyCampaignLead(lead = {}) {
  const status = normalizeStatus(lead.status);
  const score = Number(lead.score || lead.pontuacao || 0);
  const lastInteractionAt = getLastInteractionAt(lead);
  const idleDays = daysSince(lastInteractionAt);
  const hasPhone = Boolean(lead.telefone);
  const hasSite = Boolean(lead.site);
  const ticket = estimateTicketValue(lead.ticketEstimado);

  let priority = 'BAIXA';
  let reason = 'Lead pode ser nutrido com uma abordagem leve.';

  if (status === 'INTERESSADO' || status === 'PROPOSTA' || score >= 80) {
    priority = 'ALTA';
    reason = 'Lead tem sinais comerciais fortes ou já avançou no pipeline.';
  } else if (score >= 60 || hasPhone || !hasSite) {
    priority = 'MÉDIA';
    reason = 'Lead possui boa oportunidade para contato consultivo.';
  }

  if (idleDays !== null && idleDays >= 10 && status !== 'NOVO') {
    priority = priority === 'BAIXA' ? 'MÉDIA' : priority;
    reason = 'Lead está parado e precisa de retomada antes de esfriar.';
  }

  return {
    id: getLeadId(lead),
    name: lead.nome || 'Lead',
    segment: getLeadSegment(lead),
    status,
    score,
    ticket,
    priority,
    reason,
    objective: inferCampaignObjective(lead),
    idleDays,
    hasPhone,
    hasSite,
    recommendedChannel: hasPhone ? 'WhatsApp' : 'E-mail ou ligação manual'
  };
}

function buildCampaignSummary(leads = [], tasks = []) {
  const campaignable = leads
    .filter((lead) => CAMPAIGNABLE_STATUSES.has(normalizeStatus(lead.status)))
    .map(classifyCampaignLead)
    .sort((a, b) => {
      const rank = { ALTA: 3, MÉDIA: 2, BAIXA: 1 };
      return (rank[b.priority] - rank[a.priority]) || (Number(b.score) - Number(a.score));
    });

  const pendingCampaignTasks = tasks.filter((task) => !task.done && String(task.automationType || '').includes('CAMPAIGN'));
  const hot = campaignable.filter((lead) => lead.priority === 'ALTA');
  const stuck = campaignable.filter((lead) => Number(lead.idleDays || 0) >= 10);

  return {
    summary: {
      campaignable: campaignable.length,
      highPriority: hot.length,
      stuck: stuck.length,
      pendingCampaignTasks: pendingCampaignTasks.length,
      estimatedPipeline: campaignable.reduce((sum, lead) => sum + Number(lead.ticket || 0), 0)
    },
    leads: campaignable.slice(0, 25),
    recommendations: buildCampaignRecommendations({ campaignable, hot, stuck, pendingCampaignTasks })
  };
}

function buildCampaignRecommendations({ campaignable = [], hot = [], stuck = [], pendingCampaignTasks = [] } = {}) {
  const recommendations = [];

  if (!campaignable.length) {
    recommendations.push('Nenhum lead pronto para campanha agora. Prospecção e CRM precisam alimentar o pipeline primeiro.');
    return recommendations;
  }

  if (hot.length) recommendations.push(`${hot.length} lead(s) devem receber campanha ou retomada ainda hoje.`);
  if (stuck.length) recommendations.push(`${stuck.length} lead(s) estão parados há 10 dias ou mais e precisam de reativação.`);
  if (pendingCampaignTasks.length) recommendations.push(`${pendingCampaignTasks.length} tarefa(s) de campanha ainda estão pendentes.`);

  recommendations.push('Use campanhas como roteiro de venda assistida: revise a mensagem, personalize se necessário e envie manualmente.');
  return recommendations;
}

function buildLocalSmartSequence(lead = {}, objective = inferCampaignObjective(lead)) {
  const base = buildCampaignSequence(lead, objective);
  const profile = classifyCampaignLead(lead);

  const channel = profile.hasPhone ? 'WhatsApp' : 'Contato manual';
  const finalStep = {
    day: 12,
    title: 'Fechamento elegante da cadência',
    channel,
    message: `Olá, ${lead.nome || 'tudo bem'}! Vou encerrar minha sequência para não ser insistente.\n\nA ideia era apenas mostrar uma oportunidade simples para ${getLeadSegment(lead)} melhorar a forma como novos clientes encontram e entram em contato.\n\nSe fizer sentido conversar em outro momento, fico à disposição.`
  };

  return [...base, finalStep].map((step, index) => ({
    ...step,
    id: `step-${index + 1}`,
    day: Number(step.day ?? index * 3),
    channel: step.channel || channel,
    priority: profile.priority,
    objective,
    statusSuggestion: index === 0 ? 'CONTATADO' : 'INTERESSADO'
  }));
}

function buildCampaignPrompt({ lead = {}, objective = '', previousMessages = [] } = {}) {
  const profile = classifyCampaignLead(lead);
  const local = buildLocalSmartSequence(lead, objective || profile.objective);

  return `Você é um vendedor extremamente experiente de serviços tecnológicos para negócios locais.\n\nCrie uma cadência comercial completa, simples e humana para este lead.\n\nRegras obrigatórias:\n- Fale como vendedor consultivo, não como técnico.\n- Não use jargões como SEO, tráfego, conversão, funil ou landing page sem explicar em linguagem simples.\n- Não invente informações que não estão nos dados.\n- A primeira mensagem deve se aproximar do cliente e demonstrar observação real.\n- Cada etapa deve ter objetivo diferente e não repetir frases.\n- Não prometa resultado garantido.\n- Não pressione.\n- Retorne somente JSON válido.\n\nFormato do JSON:\n{\n  "campaignName": "nome curto",\n  "strategy": "estratégia usada",\n  "reason": "por que essa campanha faz sentido",\n  "steps": [\n    { "day": 0, "title": "...", "channel": "WhatsApp", "message": "...", "goal": "..." }\n  ],\n  "warnings": ["cuidados comerciais"]\n}\n\nLead:\n${JSON.stringify({
    nome: lead.nome,
    segmento: getLeadSegment(lead),
    endereco: lead.endereco,
    telefoneDisponivel: Boolean(lead.telefone),
    site: lead.site ? 'possui site' : 'não identificado',
    status: normalizeStatus(lead.status),
    score: lead.score,
    dores: lead.dores,
    ticketEstimado: lead.ticketEstimado,
    perfil: profile,
    objetivo: objective || profile.objective,
    mensagensAnteriores: previousMessages.slice(-3),
    exemploLocalDeReferencia: local.slice(0, 2)
  }, null, 2)}`;
}

function normalizeAiCampaignResult(parsed = {}, lead = {}, objective = '') {
  const local = buildLocalSmartSequence(lead, objective);
  const steps = Array.isArray(parsed.steps) && parsed.steps.length ? parsed.steps : local;

  return {
    source: parsed.steps ? 'ai' : 'local',
    campaignName: parsed.campaignName || `Campanha para ${lead.nome || 'lead'}`,
    strategy: parsed.strategy || classifyCampaignLead(lead).objective,
    reason: parsed.reason || 'Campanha criada com base no estágio atual do lead e no perfil comercial.',
    warnings: Array.isArray(parsed.warnings) ? parsed.warnings : ['Revise a mensagem antes de enviar manualmente.'],
    steps: steps.slice(0, 6).map((step, index) => ({
      id: step.id || `step-${index + 1}`,
      day: Number(step.day ?? index * 3),
      title: String(step.title || `Etapa ${index + 1}`).trim(),
      channel: String(step.channel || 'WhatsApp').trim(),
      message: String(step.message || '').trim(),
      goal: String(step.goal || step.objective || 'Avançar a conversa com cuidado.').trim(),
      priority: classifyCampaignLead(lead).priority,
      statusSuggestion: index === 0 ? 'CONTATADO' : 'INTERESSADO'
    }))
  };
}

async function buildSmartCampaign({ lead = {}, objective = '', previousMessages = [] } = {}) {
  const prompt = buildCampaignPrompt({ lead, objective, previousMessages });
  const ai = await generateAiJsonContent({
    prompt,
    systemContent: 'Você cria cadências comerciais B2B simples, humanas e éticas. Retorne somente JSON válido.',
    maxTokens: 2200
  });

  const campaign = normalizeAiCampaignResult(ai.parsed || {}, lead, objective || inferCampaignObjective(lead));

  return {
    ...campaign,
    source: ai.source === 'ai' ? 'ai' : campaign.source,
    provider: ai.provider,
    providerLabel: ai.providerLabel,
    model: ai.model,
    aiStatus: ai.aiStatus,
    aiError: ai.aiError || null
  };
}

function buildCampaignInteraction({ campaign = {} } = {}) {
  return {
    data: new Date().toISOString(),
    tipo: 'CAMPANHA_INTELIGENTE_CRIADA',
    status: 'CONTATADO',
    campanha: campaign.campaignName,
    estrategia: campaign.strategy,
    quantidadeEtapas: Array.isArray(campaign.steps) ? campaign.steps.length : 0,
    resumo: campaign.reason || 'Campanha comercial criada para revisão manual.'
  };
}

function buildCampaignTasks({ userId, lead = {}, campaign = {} } = {}) {
  const leadId = getLeadId(lead);
  const leadName = lead.nome || 'Lead';
  const now = new Date();

  return (campaign.steps || []).map((step, index) => {
    const due = new Date(now);
    due.setDate(due.getDate() + Number(step.day ?? index * 3));

    return {
      userId,
      leadId,
      leadName,
      title: `${step.title} — ${campaign.campaignName || 'Campanha'}`,
      dueAt: due.toISOString(),
      message: step.message,
      priority: step.priority || classifyCampaignLead(lead).priority,
      automationType: 'SMART_CAMPAIGN',
      channel: step.channel,
      goal: step.goal
    };
  });
}

module.exports = {
  CAMPAIGNABLE_STATUSES,
  classifyCampaignLead,
  buildCampaignSummary,
  buildLocalSmartSequence,
  buildCampaignPrompt,
  normalizeAiCampaignResult,
  buildSmartCampaign,
  buildCampaignInteraction,
  buildCampaignTasks,
  inferCampaignObjective
};
