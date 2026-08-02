/**
 * @fileoverview Serviço de domínio `commercialReportService` responsável por regras comerciais reutilizáveis.
 *
 * Responsabilidade delimitada conforme a arquitetura descrita em
 * `docs/ARQUITETURA.md`. Alterações neste arquivo devem preservar os contratos
 * documentados e ser acompanhadas por testes quando afetarem regras de negócio.
 *
 * @module src/services/commercialReportService
 */

/**
 * commercialReportService.js
 * -----------------------------------------------------------------------------
 * V21.1 - Relatórios Comerciais.
 *
 * Este serviço transforma leads e tarefas em um relatório gerencial simples:
 * - funil por etapa;
 * - taxa de conversão;
 * - ranking de segmentos e regiões;
 * - oportunidades paradas;
 * - previsão conservadora de receita.
 */

const { normalizeLeadStatus } = require('../domain/leadStatus');

const PIPELINE_ORDER = ['NOVO', 'CONTATADO', 'INTERESSADO', 'REUNIAO', 'PROPOSTA', 'FECHADO', 'SEM_INTERESSE'];
const ACTIVE_STATUSES = new Set(['NOVO', 'CONTATADO', 'INTERESSADO', 'REUNIAO', 'PROPOSTA']);

function normalizeStatus(status) {
  return normalizeLeadStatus(status);
}

function getLeadId(lead = {}) {
  return String(lead.placeId || lead.id || lead.nome || '').trim();
}

function parseDate(value) {
  const date = new Date(value || 0);
  return Number.isNaN(date.getTime()) ? null : date;
}

function getLastInteractionDate(lead = {}) {
  const interactions = Array.isArray(lead.interacoes) ? lead.interacoes : [];
  const dates = interactions.map((item) => parseDate(item.data)).filter(Boolean);
  if (!dates.length) return parseDate(lead.coletadoEm || lead.createdAt);
  return new Date(Math.max(...dates.map((date) => date.getTime())));
}

function daysSince(date, now = new Date()) {
  if (!date) return null;
  return Math.max(0, Math.floor((now.getTime() - date.getTime()) / 86400000));
}

function estimateTicketValue(value) {
  if (typeof value === 'number') return value;
  const text = String(value || '').toLowerCase();
  const numbers = text.match(/\d+[\d.,]*/g) || [];
  if (numbers.length) {
    const parsed = Number(numbers[numbers.length - 1].replace(/\./g, '').replace(',', '.'));
    if (Number.isFinite(parsed) && parsed > 0) return parsed;
  }

  if (text.includes('alto')) return 3000;
  if (text.includes('médio') || text.includes('medio')) return 1500;
  if (text.includes('baixo')) return 700;
  return 1200;
}

function conversionWeight(status) {
  return ({
    NOVO: 0.08,
    CONTATADO: 0.16,
    INTERESSADO: 0.34,
    REUNIAO: 0.46,
    PROPOSTA: 0.58,
    FECHADO: 1,
    SEM_INTERESSE: 0
  })[normalizeStatus(status)] ?? 0.08;
}

function groupBy(items, keyGetter) {
  const map = new Map();
  for (const item of items) {
    const key = String(keyGetter(item) || 'Não informado').trim() || 'Não informado';
    const current = map.get(key) || { name: key, total: 0, contacted: 0, interested: 0, proposals: 0, closed: 0, estimatedRevenue: 0 };
    const status = normalizeStatus(item.status);
    current.total += 1;
    if (status !== 'NOVO') current.contacted += 1;
    if (['INTERESSADO', 'REUNIAO'].includes(status)) current.interested += 1;
    if (status === 'PROPOSTA') current.proposals += 1;
    if (status === 'FECHADO') current.closed += 1;
    current.estimatedRevenue += estimateTicketValue(item.ticketEstimado) * conversionWeight(status);
    map.set(key, current);
  }

  return [...map.values()]
    .map((item) => ({ ...item, conversionRate: item.total ? Math.round((item.closed / item.total) * 100) : 0 }))
    .sort((a, b) => b.estimatedRevenue - a.estimatedRevenue || b.total - a.total)
    .slice(0, 8);
}

function buildFunnel(leads = []) {
  const counts = Object.fromEntries(PIPELINE_ORDER.map((status) => [status, 0]));
  for (const lead of leads) counts[normalizeStatus(lead.status)] += 1;
  const total = leads.length || 1;
  return PIPELINE_ORDER.map((status) => ({
    status,
    total: counts[status],
    percentage: Math.round((counts[status] / total) * 100)
  }));
}

function buildStalledLeads(leads = [], tasks = [], now = new Date()) {
  const pendingTaskIds = new Set((Array.isArray(tasks) ? tasks : []).filter((task) => !task.done).map((task) => String(task.leadId || '')));

  return (Array.isArray(leads) ? leads : [])
    .map((lead) => {
      const lastDate = getLastInteractionDate(lead);
      const days = daysSince(lastDate, now);
      const status = normalizeStatus(lead.status);
      return {
        leadId: getLeadId(lead),
        leadName: lead.nome || 'Lead sem nome',
        status,
        daysWithoutInteraction: days,
        hasPendingTask: pendingTaskIds.has(getLeadId(lead)),
        reason: !pendingTaskIds.has(getLeadId(lead)) ? 'Sem próxima tarefa' : 'Sem interação recente'
      };
    })
    .filter((item) => ACTIVE_STATUSES.has(item.status) && (item.daysWithoutInteraction >= 7 || !item.hasPendingTask))
    .sort((a, b) => Number(b.daysWithoutInteraction || 0) - Number(a.daysWithoutInteraction || 0))
    .slice(0, 12);
}

function buildCommercialReport(leads = [], tasks = [], now = new Date()) {
  const safeLeads = Array.isArray(leads) ? leads : [];
  const active = safeLeads.filter((lead) => ACTIVE_STATUSES.has(normalizeStatus(lead.status)));
  const contacted = safeLeads.filter((lead) => normalizeStatus(lead.status) !== 'NOVO');
  const closed = safeLeads.filter((lead) => normalizeStatus(lead.status) === 'FECHADO');
  const proposals = safeLeads.filter((lead) => normalizeStatus(lead.status) === 'PROPOSTA');
  const estimatedPipelineRevenue = active.reduce((sum, lead) => sum + estimateTicketValue(lead.ticketEstimado) * conversionWeight(lead.status), 0);
  const closedRevenue = closed.reduce((sum, lead) => sum + estimateTicketValue(lead.ticketEstimado), 0);
  const pendingTasks = (Array.isArray(tasks) ? tasks : []).filter((task) => !task.done).length;
  const overdueTasks = (Array.isArray(tasks) ? tasks : []).filter((task) => !task.done && parseDate(task.dueAt) && parseDate(task.dueAt) < now).length;
  const stalledLeads = buildStalledLeads(safeLeads, tasks, now);

  return {
    summary: {
      totalLeads: safeLeads.length,
      activeLeads: active.length,
      contacted: contacted.length,
      proposals: proposals.length,
      closed: closed.length,
      contactRate: safeLeads.length ? Math.round((contacted.length / safeLeads.length) * 100) : 0,
      closeRate: safeLeads.length ? Math.round((closed.length / safeLeads.length) * 100) : 0,
      estimatedPipelineRevenue: Math.round(estimatedPipelineRevenue),
      closedRevenue: Math.round(closedRevenue),
      pendingTasks,
      overdueTasks,
      stalledLeads: stalledLeads.length,
      generatedAt: now.toISOString()
    },
    funnel: buildFunnel(safeLeads),
    bySegment: groupBy(safeLeads, (lead) => lead.segmentoComercial || lead.tipo || lead.segmentoBuscado),
    byRegion: groupBy(safeLeads, (lead) => lead.regiaoBuscada || lead.endereco),
    stalledLeads,
    recommendations: buildReportRecommendations({ safeLeads, active, contacted, closed, proposals, stalledLeads, overdueTasks })
  };
}

function buildReportRecommendations({ safeLeads, active, contacted, closed, proposals, stalledLeads, overdueTasks }) {
  const recommendations = [];
  if (!safeLeads.length) recommendations.push('Comece prospectando um segmento e região específicos para alimentar o funil.');
  if (safeLeads.length && contacted.length / safeLeads.length < 0.35) recommendations.push('A taxa de contato ainda está baixa. Priorize fazer a primeira abordagem nos leads novos antes de buscar muitos contatos adicionais.');
  if (active.length && stalledLeads.length) recommendations.push(`${stalledLeads.length} lead(s) ativos estão parados. Agende follow-up ou descarte oportunidades sem potencial.`);
  if (overdueTasks) recommendations.push(`${overdueTasks} tarefa(s) estão atrasadas. Resolva a agenda antes de iniciar novas campanhas.`);
  if (proposals.length && !closed.length) recommendations.push('Há propostas em andamento, mas nenhum fechamento registrado. Crie uma rotina de retorno para propostas enviadas.');
  if (!recommendations.length) recommendations.push('O funil está saudável. Continue priorizando leads com próxima ação clara e mantenha a cadência de follow-up.');
  return recommendations;
}

function buildCommercialReportCsv(report = {}) {
  const rows = [];
  rows.push(['Métrica', 'Valor']);
  const summary = report.summary || {};
  for (const [key, value] of Object.entries(summary)) rows.push([key, value]);
  rows.push([]);
  rows.push(['Funil', 'Total', 'Percentual']);
  for (const item of report.funnel || []) rows.push([item.status, item.total, `${item.percentage}%`]);
  rows.push([]);
  rows.push(['Segmento', 'Total', 'Contatados', 'Propostas', 'Fechados', 'Receita estimada']);
  for (const item of report.bySegment || []) rows.push([item.name, item.total, item.contacted, item.proposals, item.closed, Math.round(item.estimatedRevenue)]);
  return rows.map((row) => row.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
}

module.exports = {
  buildCommercialReport,
  buildCommercialReportCsv,
  estimateTicketValue,
  normalizeStatus,
  buildFunnel,
  buildStalledLeads
};
