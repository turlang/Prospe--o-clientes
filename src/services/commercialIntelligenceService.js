/**
 * @fileoverview Serviço de domínio `commercialIntelligenceService` responsável por regras comerciais reutilizáveis.
 *
 * Responsabilidade delimitada conforme a arquitetura descrita em
 * `docs/ARQUITETURA.md`. Alterações neste arquivo devem preservar os contratos
 * documentados e ser acompanhadas por testes quando afetarem regras de negócio.
 *
 * @module src/services/commercialIntelligenceService
 */

/**
 * commercialIntelligenceService.js
 * -----------------------------------------------------------------------------
 * V21 - Assistente Comercial Inteligente.
 *
 * Este serviço transforma leads e tarefas em recomendações comerciais simples:
 * - prioridade dinâmica por lead;
 * - próxima melhor ação;
 * - oportunidades em risco;
 * - resumo executivo para o dashboard.
 *
 * Não envia mensagens automaticamente. Ele apenas orienta o vendedor sobre onde
 * concentrar atenção e qual ação executar primeiro.
 */

const { normalizeLeadStatus } = require('../domain/leadStatus');

const ACTIVE_STATUSES = new Set(['NOVO', 'CONTATADO', 'INTERESSADO', 'REUNIAO', 'PROPOSTA']);
const WON_STATUSES = new Set(['FECHADO']);
const LOST_STATUSES = new Set(['SEM_INTERESSE']);

function normalizeStatus(status) {
  return normalizeLeadStatus(status);
}

function parseDate(value) {
  const date = new Date(value || 0);
  return Number.isNaN(date.getTime()) ? null : date;
}

function daysBetween(date, now = new Date()) {
  const parsed = parseDate(date);
  if (!parsed) return null;
  return Math.max(0, Math.floor((now.getTime() - parsed.getTime()) / 86400000));
}

function getLeadId(lead = {}) {
  return String(lead.placeId || lead.id || lead.nome || '').trim();
}

function getLastInteraction(lead = {}) {
  const interactions = Array.isArray(lead.interacoes) ? lead.interacoes : [];
  if (!interactions.length) return null;
  return [...interactions].sort((a, b) => new Date(b.data || 0) - new Date(a.data || 0))[0];
}

function getLeadTasks(lead = {}, tasks = []) {
  const leadId = getLeadId(lead);
  return (Array.isArray(tasks) ? tasks : []).filter((task) => String(task.leadId || '') === leadId);
}

function hasPendingTask(lead = {}, tasks = []) {
  return getLeadTasks(lead, tasks).some((task) => !task.done);
}

function getNextTask(lead = {}, tasks = [], now = new Date()) {
  return getLeadTasks(lead, tasks)
    .filter((task) => !task.done)
    .map((task) => ({ ...task, dueDate: parseDate(task.dueAt) }))
    .sort((a, b) => {
      const aOverdue = a.dueDate && a.dueDate <= now ? 0 : 1;
      const bOverdue = b.dueDate && b.dueDate <= now ? 0 : 1;
      if (aOverdue !== bOverdue) return aOverdue - bOverdue;
      return (a.dueDate?.getTime() || Infinity) - (b.dueDate?.getTime() || Infinity);
    })[0] || null;
}

function inferMainRisk(lead = {}, tasks = [], now = new Date()) {
  const status = normalizeStatus(lead.status);
  const last = getLastInteraction(lead);
  const age = daysBetween(last?.data || lead.coletadoEm, now);
  const pendingTask = getNextTask(lead, tasks, now);

  if (LOST_STATUSES.has(status) || WON_STATUSES.has(status)) return null;
  if (pendingTask?.dueDate && pendingTask.dueDate < now) return 'Tarefa atrasada';
  if (status === 'PROPOSTA' && age !== null && age >= 3) return 'Proposta sem retorno';
  if (status === 'REUNIAO' && !hasPendingTask(lead, tasks)) return 'Reunião sem próximo passo';
  if (status === 'INTERESSADO' && !hasPendingTask(lead, tasks)) return 'Interessado sem próximo passo';
  if (status === 'CONTATADO' && age !== null && age >= 5) return 'Contato esfriando';
  if (status === 'NOVO' && age !== null && age >= 2) return 'Lead novo parado';
  return null;
}

function scoreDynamicPriority(lead = {}, tasks = [], now = new Date()) {
  const status = normalizeStatus(lead.status);
  const baseScore = Math.max(0, Math.min(100, Number(lead.score || 0)));
  const last = getLastInteraction(lead);
  const age = daysBetween(last?.data || lead.coletadoEm, now);
  const nextTask = getNextTask(lead, tasks, now);
  let score = baseScore;

  if (status === 'NOVO') score += 8;
  if (status === 'CONTATADO') score += 14;
  if (status === 'INTERESSADO') score += 25;
  if (status === 'REUNIAO') score += 28;
  if (status === 'PROPOSTA') score += 30;
  if (WON_STATUSES.has(status) || LOST_STATUSES.has(status)) score -= 60;

  if (nextTask?.dueDate && nextTask.dueDate <= now) score += 28;
  if (!hasPendingTask(lead, tasks) && ACTIVE_STATUSES.has(status)) score += 10;
  if (age !== null && age >= 7 && ACTIVE_STATUSES.has(status)) score += 18;
  if (age !== null && age >= 14 && ACTIVE_STATUSES.has(status)) score += 12;
  if (lead.telefone) score += 5;
  if (lead.site) score += 3;

  return Math.max(0, Math.min(100, Math.round(score)));
}

function priorityLabel(score) {
  if (score >= 80) return 'ALTA';
  if (score >= 55) return 'MÉDIA';
  return 'BAIXA';
}

function buildNextBestAction(lead = {}, tasks = [], now = new Date()) {
  const status = normalizeStatus(lead.status);
  const nextTask = getNextTask(lead, tasks, now);
  const last = getLastInteraction(lead);
  const age = daysBetween(last?.data || lead.coletadoEm, now);

  if (WON_STATUSES.has(status)) {
    return {
      action: 'Registrar pós-venda',
      channel: 'CRM',
      reason: 'Lead fechado. O próximo passo é manter relacionamento e buscar indicação.'
    };
  }

  if (LOST_STATUSES.has(status)) {
    return {
      action: 'Arquivar ou reavaliar no futuro',
      channel: 'CRM',
      reason: 'Lead marcado como perdido ou sem interesse.'
    };
  }

  if (nextTask) {
    const overdue = nextTask.dueDate && nextTask.dueDate <= now;
    return {
      action: overdue ? 'Executar tarefa atrasada' : 'Executar próxima tarefa agendada',
      channel: nextTask.automationType || 'MANUAL',
      taskId: nextTask.id,
      dueAt: nextTask.dueAt,
      reason: `${nextTask.title || 'Follow-up'} com ${lead.nome || 'lead'}${overdue ? ' está atrasado' : ' já está agendado'}.`
    };
  }

  if (status === 'NOVO') {
    return {
      action: 'Fazer primeiro contato',
      channel: lead.telefone ? 'WhatsApp ou ligação' : 'Pesquisa manual',
      reason: 'Lead ainda não recebeu uma tentativa real de contato.'
    };
  }

  if (status === 'CONTATADO') {
    return {
      action: age !== null && age >= 5 ? 'Enviar follow-up curto' : 'Aguardar ou agendar retorno',
      channel: 'WhatsApp',
      reason: age !== null && age >= 5
        ? 'Já passou tempo suficiente desde o último contato.'
        : 'Contato recente. Mantenha o lead organizado com uma próxima data.'
    };
  }

  if (status === 'INTERESSADO') {
    return {
      action: 'Conduzir para proposta ou reunião',
      channel: 'Ligação ou WhatsApp',
      reason: 'O lead demonstrou interesse e precisa de avanço claro no funil.'
    };
  }

  if (status === 'REUNIAO') {
    return {
      action: 'Confirmar reunião e preparar diagnóstico',
      channel: 'WhatsApp ou ligação',
      reason: 'A reunião precisa de confirmação e de um objetivo claro para avançar a oportunidade.'
    };
  }

  if (status === 'PROPOSTA') {
    return {
      action: 'Retomar proposta',
      channel: 'WhatsApp ou ligação',
      reason: 'Propostas precisam de acompanhamento próximo para não esfriar.'
    };
  }

  return {
    action: 'Revisar oportunidade',
    channel: 'CRM',
    reason: 'Status não reconhecido. Revise a ficha do lead.'
  };
}

function normalizeLeadIntelligence(lead = {}, tasks = [], now = new Date()) {
  const leadId = getLeadId(lead);
  const dynamicScore = scoreDynamicPriority(lead, tasks, now);
  const status = normalizeStatus(lead.status);
  const last = getLastInteraction(lead);
  const risk = inferMainRisk(lead, tasks, now);

  return {
    leadId,
    leadName: lead.nome || 'Lead sem nome',
    status,
    originalScore: Number(lead.score || 0),
    dynamicScore,
    priority: priorityLabel(dynamicScore),
    lastInteractionAt: last?.data || lead.coletadoEm || null,
    daysWithoutInteraction: daysBetween(last?.data || lead.coletadoEm, now),
    risk,
    nextBestAction: buildNextBestAction(lead, tasks, now),
    segment: lead.segmentoComercial || lead.tipo || lead.segmentoBuscado || '',
    ticketEstimado: lead.ticketEstimado || '',
    probability: lead.probabilidade || ''
  };
}

function buildCommercialIntelligence(leads = [], tasks = [], now = new Date()) {
  const activeLeads = (Array.isArray(leads) ? leads : []).filter((lead) => {
    const status = normalizeStatus(lead.status);
    return !WON_STATUSES.has(status) && !LOST_STATUSES.has(status);
  });

  const ranked = activeLeads
    .map((lead) => normalizeLeadIntelligence(lead, tasks, now))
    .sort((a, b) => b.dynamicScore - a.dynamicScore || String(a.leadName).localeCompare(String(b.leadName)));

  const highPriority = ranked.filter((item) => item.priority === 'ALTA');
  const mediumPriority = ranked.filter((item) => item.priority === 'MÉDIA');
  const atRisk = ranked.filter((item) => item.risk);
  const proposals = ranked.filter((item) => item.status === 'PROPOSTA');
  const interested = ranked.filter((item) => ['INTERESSADO', 'REUNIAO'].includes(item.status));
  const noNextStep = ranked.filter((item) => !item.nextBestAction.taskId && ['CONTATADO', 'INTERESSADO', 'REUNIAO', 'PROPOSTA'].includes(item.status));

  const nextActions = ranked.slice(0, 8).map((item) => ({
    leadId: item.leadId,
    leadName: item.leadName,
    priority: item.priority,
    dynamicScore: item.dynamicScore,
    action: item.nextBestAction.action,
    channel: item.nextBestAction.channel,
    reason: item.nextBestAction.reason,
    risk: item.risk,
    status: item.status
  }));

  return {
    summary: {
      activeLeads: activeLeads.length,
      highPriority: highPriority.length,
      mediumPriority: mediumPriority.length,
      atRisk: atRisk.length,
      proposals: proposals.length,
      interested: interested.length,
      noNextStep: noNextStep.length,
      generatedAt: now.toISOString()
    },
    nextActions,
    priorityLeads: ranked.slice(0, 12),
    atRisk: atRisk.slice(0, 12),
    managerAdvice: buildManagerAdvice({ highPriority, atRisk, proposals, interested, noNextStep })
  };
}

function buildManagerAdvice({ highPriority = [], atRisk = [], proposals = [], interested = [], noNextStep = [] }) {
  const advice = [];
  if (highPriority.length) advice.push(`Comece pelos ${highPriority.length} lead(s) de alta prioridade antes de prospectar novos contatos.`);
  if (atRisk.length) advice.push(`${atRisk.length} oportunidade(s) estão em risco de esfriar. Agende ou execute follow-up hoje.`);
  if (proposals.length) advice.push(`${proposals.length} proposta(s) precisam de acompanhamento próximo para avançar para fechamento.`);
  if (interested.length) advice.push(`${interested.length} lead(s) interessado(s) devem ser conduzidos para proposta, reunião ou diagnóstico.`);
  if (noNextStep.length) advice.push(`${noNextStep.length} lead(s) avançados estão sem próxima tarefa. Crie um retorno para não perder controle.`);
  if (!advice.length) advice.push('Nenhuma urgência crítica agora. Mantenha o ritmo de prospecção e organize os próximos follow-ups.');
  return advice;
}

function buildObjectionResponse(objection = '', lead = {}) {
  const text = String(objection || '').toLowerCase();
  const leadName = lead.nome || 'sua empresa';

  if (text.includes('caro') || text.includes('preço') || text.includes('preco')) {
    return `Entendo perfeitamente. A ideia não é gerar mais um custo para a ${leadName}, e sim mostrar onde pequenos ajustes podem trazer mais contatos e oportunidades. Podemos começar com um diagnóstico simples para você avaliar se faz sentido antes de qualquer investimento.`;
  }

  if (text.includes('fornecedor') || text.includes('já tenho') || text.includes('ja tenho')) {
    return `Perfeito, isso é positivo. Minha proposta não é substituir o que já funciona, mas mostrar uma visão externa sobre pontos que talvez ainda possam melhorar a chegada de novos clientes para a ${leadName}. Posso te enviar essa análise de forma objetiva?`;
  }

  if (text.includes('tempo') || text.includes('ocupado') || text.includes('correria')) {
    return `Claro, sei que a rotina é corrida. Posso te mandar só um resumo com 2 ou 3 pontos principais, sem reunião agora. Assim você olha quando puder e decide se vale conversarmos depois.`;
  }

  return `Entendo seu ponto. Minha ideia é começar sem pressão: mostrar uma observação prática sobre como a ${leadName} pode facilitar a chegada de novos clientes. Se fizer sentido, avançamos; se não fizer, tudo bem.`;
}

module.exports = {
  buildCommercialIntelligence,
  normalizeLeadIntelligence,
  buildNextBestAction,
  buildObjectionResponse,
  scoreDynamicPriority,
  normalizeStatus,
  daysBetween
};
