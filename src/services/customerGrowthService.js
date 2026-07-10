/**
 * customerGrowthService.js
 * -----------------------------------------------------------------------------
 * V21.5 — Crescimento pós-venda: indicação, recompra e expansão.
 *
 * Depois que o lead vira cliente, o sistema passa a sugerir ações para manter
 * o relacionamento vivo e gerar novas oportunidades sem depender só de novas
 * prospecções.
 */

const { estimateTicketValue } = require('./customerSuccessService');

function normalizeStatus(status = '') {
  return String(status || 'NOVO').trim().toUpperCase();
}

function getLeadId(lead = {}) {
  return String(lead.placeId || lead.nome || '').trim();
}

function getClosedAt(lead = {}) {
  const interactions = Array.isArray(lead.interacoes) ? lead.interacoes : [];
  return interactions
    .filter((item) => item.tipo === 'CLIENTE_FECHADO' || item.status === 'FECHADO')
    .map((item) => item.data || item.createdAt)
    .filter(Boolean)
    .sort()
    .pop() || lead.atualizadoEm || lead.coletadoEm || '';
}

function daysSince(value) {
  const date = new Date(value || 0);
  if (Number.isNaN(date.getTime())) return null;
  return Math.max(0, Math.floor((Date.now() - date.getTime()) / 86_400_000));
}

function inferExpansionOpportunities(lead = {}) {
  const segment = String(lead.segmentoComercial || lead.tipo || lead.segmentoBuscado || '').toLowerCase();
  const hasSite = Boolean(lead.site);
  const opportunities = [];

  opportunities.push({
    type: 'RELACIONAMENTO',
    title: 'Pedir feedback do início do serviço',
    detail: 'Confirmar se a primeira entrega foi clara e se o cliente percebeu valor no trabalho.'
  });

  opportunities.push({
    type: 'INDICACAO',
    title: 'Solicitar indicação com naturalidade',
    detail: 'Depois de entregar valor, pedir indicação de outro negócio que possa se beneficiar do mesmo tipo de melhoria.'
  });

  if (!hasSite) {
    opportunities.push({
      type: 'EXPANSAO',
      title: 'Evoluir para presença digital completa',
      detail: 'Oferecer uma página profissional, botão de WhatsApp e organização das informações principais.'
    });
  }

  if (segment.includes('restaurante') || segment.includes('pizz') || segment.includes('hamburg')) {
    opportunities.push({
      type: 'EXPANSAO',
      title: 'Campanha para aumentar pedidos',
      detail: 'Sugerir melhoria de cardápio, fotos, promoções e chamadas para pedido pelo WhatsApp.'
    });
  }

  if (segment.includes('clínica') || segment.includes('clinica') || segment.includes('odont') || segment.includes('estética') || segment.includes('estetica')) {
    opportunities.push({
      type: 'EXPANSAO',
      title: 'Campanha para novos agendamentos',
      detail: 'Sugerir conteúdo e página de serviços para aumentar confiança antes do primeiro contato.'
    });
  }

  opportunities.push({
    type: 'RECORRENCIA',
    title: 'Plano mensal de acompanhamento',
    detail: 'Oferecer manutenção, ajustes, novas campanhas e acompanhamento simples da presença digital.'
  });

  return opportunities;
}

function buildReferralMessage(lead = {}) {
  const company = lead.nome || 'sua empresa';
  const segment = lead.segmentoComercial || lead.tipo || lead.segmentoBuscado || 'negócio local';

  return `Olá! Passando rapidamente para saber se está tudo certo com o que alinhamos para ${company}.\n\nSe você sentir que o trabalho fez sentido, queria te pedir uma indicação simples: existe algum outro ${segment} ou negócio da região que também poderia se beneficiar de uma presença digital mais clara e fácil de entender?\n\nPode ser só o nome ou contato. Eu abordo com cuidado, sem pressão, como fiz com vocês.`;
}

function buildExpansionMessage(lead = {}) {
  const company = lead.nome || 'sua empresa';
  const opportunities = inferExpansionOpportunities(lead);
  const primary = opportunities.find((item) => item.type === 'EXPANSAO') || opportunities[0];

  return `Olá! Pensei em uma próxima melhoria para ${company}.\n\nDepois do primeiro passo, acredito que faria sentido trabalharmos em: ${primary.title.toLowerCase()}.\n\nA ideia não é complicar, e sim aproveitar melhor o que vocês já têm para gerar mais contatos com clareza. Posso te mostrar uma sugestão simples?`;
}

function buildCustomerGrowthCard(lead = {}) {
  const closedAt = getClosedAt(lead);
  const age = daysSince(closedAt);
  const ticket = estimateTicketValue(lead.ticketEstimado);
  const opportunities = inferExpansionOpportunities(lead);

  let stage = 'ONBOARDING';
  let nextAction = 'Confirmar satisfação e alinhar primeira entrega.';

  if (age !== null && age >= 7) {
    stage = 'INDICACAO';
    nextAction = 'Pedir indicação após confirmar que o cliente percebeu valor.';
  }

  if (age !== null && age >= 20) {
    stage = 'EXPANSAO';
    nextAction = 'Apresentar uma melhoria complementar ou plano mensal simples.';
  }

  return {
    id: getLeadId(lead),
    name: lead.nome || 'Cliente',
    segment: lead.segmentoComercial || lead.tipo || lead.segmentoBuscado || 'negócio local',
    ticket,
    closedAt,
    daysSinceClose: age,
    stage,
    nextAction,
    opportunities,
    referralMessage: buildReferralMessage(lead),
    expansionMessage: buildExpansionMessage(lead)
  };
}

function buildCustomerGrowthSummary(leads = []) {
  const customers = leads
    .filter((lead) => normalizeStatus(lead.status) === 'FECHADO')
    .map(buildCustomerGrowthCard)
    .sort((a, b) => Number(b.daysSinceClose || 0) - Number(a.daysSinceClose || 0));

  const referralReady = customers.filter((customer) => ['INDICACAO', 'EXPANSAO'].includes(customer.stage));
  const expansionReady = customers.filter((customer) => customer.stage === 'EXPANSAO');
  const estimatedExpansionRevenue = expansionReady.reduce((sum, customer) => sum + Math.max(600, Math.round(Number(customer.ticket || 1200) * 0.35)), 0);

  return {
    summary: {
      customers: customers.length,
      referralReady: referralReady.length,
      expansionReady: expansionReady.length,
      estimatedExpansionRevenue
    },
    customers,
    recommendations: buildGrowthRecommendations({ customers, referralReady, expansionReady, estimatedExpansionRevenue })
  };
}

function buildGrowthRecommendations({ customers = [], referralReady = [], expansionReady = [], estimatedExpansionRevenue = 0 } = {}) {
  const recommendations = [];

  if (!customers.length) {
    recommendations.push('Ainda não há clientes fechados para ações de indicação ou expansão. Continue priorizando propostas abertas.');
    return recommendations;
  }

  if (referralReady.length) {
    recommendations.push(`${referralReady.length} cliente(s) já podem receber um pedido de indicação, desde que estejam satisfeitos com a entrega inicial.`);
  }

  if (expansionReady.length) {
    recommendations.push(`${expansionReady.length} cliente(s) têm potencial para uma oferta complementar ou plano mensal.`);
  }

  if (estimatedExpansionRevenue > 0) {
    recommendations.push(`Potencial estimado de expansão: ${estimatedExpansionRevenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}.`);
  }

  recommendations.push('Regra prática: primeiro confirme satisfação, depois peça indicação ou apresente uma melhoria complementar.');
  return recommendations;
}

function buildReferralInteraction({ message = '' } = {}) {
  return {
    data: new Date().toISOString(),
    tipo: 'PEDIDO_INDICACAO_GERADO',
    status: 'FECHADO',
    mensagem: String(message || '').trim(),
    resumo: 'Mensagem de indicação gerada para cliente fechado.',
    proximaAcao: 'Enviar somente se o cliente estiver satisfeito com a primeira entrega.'
  };
}

function buildExpansionInteraction({ message = '' } = {}) {
  return {
    data: new Date().toISOString(),
    tipo: 'OFERTA_EXPANSAO_GERADA',
    status: 'FECHADO',
    mensagem: String(message || '').trim(),
    resumo: 'Mensagem de expansão gerada para cliente fechado.',
    proximaAcao: 'Apresentar melhoria complementar de forma simples e sem pressão.'
  };
}

module.exports = {
  inferExpansionOpportunities,
  buildReferralMessage,
  buildExpansionMessage,
  buildCustomerGrowthCard,
  buildCustomerGrowthSummary,
  buildReferralInteraction,
  buildExpansionInteraction
};
