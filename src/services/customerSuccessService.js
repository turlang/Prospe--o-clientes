/**
 * @fileoverview Serviço de domínio `customerSuccessService` responsável por regras comerciais reutilizáveis.
 *
 * Responsabilidade delimitada conforme a arquitetura descrita em
 * `docs/ARQUITETURA.md`. Alterações neste arquivo devem preservar os contratos
 * documentados e ser acompanhadas por testes quando afetarem regras de negócio.
 *
 * @module src/services/customerSuccessService
 */

/**
 * customerSuccessService.js
 * -----------------------------------------------------------------------------
 * V21.4 — Carteira de clientes e pós-venda.
 *
 * Depois que uma proposta vira cliente, o CRM precisa deixar claro quem já
 * fechou, qual receita foi criada e qual próximo passo mantém o relacionamento
 * saudável. Este serviço transforma leads FECHADO em uma visão simples de
 * carteira, sem criar um módulo financeiro complexo.
 */

function getLeadId(lead = {}) {
  return String(lead.placeId || lead.nome || '').trim();
}

const { normalizeLeadStatus } = require('../domain/leadStatus');

function normalizeStatus(status = ''){
  return normalizeLeadStatus(status);
}

function estimateTicketValue(value) {
  if (typeof value === 'number') return value;
  const text = String(value || '').toLowerCase();
  const number = Number(text.replace(/[^\d,.-]/g, '').replace(/\./g, '').replace(',', '.'));
  if (Number.isFinite(number) && number > 0) return number;
  if (text.includes('alto')) return 3000;
  if (text.includes('médio') || text.includes('medio')) return 1800;
  if (text.includes('baixo')) return 900;
  return 1200;
}

function getLastInteraction(lead = {}) {
  const interactions = Array.isArray(lead.interacoes) ? lead.interacoes : [];
  return interactions
    .map((item) => ({ ...item, parsedDate: new Date(item.data || item.createdAt || 0) }))
    .filter((item) => !Number.isNaN(item.parsedDate.getTime()))
    .sort((a, b) => b.parsedDate - a.parsedDate)[0] || null;
}

function buildOnboardingPlan(lead = {}) {
  const company = lead.nome || 'cliente';
  const hasSite = Boolean(lead.site);
  const segment = String(lead.segmentoComercial || lead.tipo || lead.segmentoBuscado || '').toLowerCase();

  const plan = [
    {
      title: 'Confirmar escopo e prioridade',
      detail: `Alinhar com ${company} qual resultado é mais importante: mais chamadas no WhatsApp, mais pedidos ou mais agendamentos.`
    },
    {
      title: 'Coletar informações essenciais',
      detail: 'Solicitar fotos, serviços principais, diferenciais, endereço, horário de atendimento e canais de contato.'
    },
    {
      title: 'Apresentar primeira entrega rápida',
      detail: 'Mostrar uma melhoria simples e visível para gerar confiança logo no início do relacionamento.'
    }
  ];

  if (!hasSite) {
    plan.push({
      title: 'Criar presença de apresentação',
      detail: 'Organizar uma página simples com informações claras, botão de WhatsApp e localização.'
    });
  }

  if (segment.includes('restaurante') || segment.includes('pizz') || segment.includes('hamburg')) {
    plan.push({
      title: 'Facilitar pedidos',
      detail: 'Organizar cardápio, fotos e chamada direta para pedido ou WhatsApp.'
    });
  }

  return plan;
}

function buildCustomerCard(lead = {}) {
  const lastInteraction = getLastInteraction(lead);
  const ticket = estimateTicketValue(lead.ticketEstimado);
  const closedAt = (Array.isArray(lead.interacoes) ? lead.interacoes : [])
    .filter((item) => item.tipo === 'CLIENTE_FECHADO' || item.status === 'FECHADO')
    .map((item) => item.data || item.createdAt)
    .filter(Boolean)
    .sort()
    .pop() || lead.atualizadoEm || '';

  return {
    id: getLeadId(lead),
    name: lead.nome || 'Cliente',
    segment: lead.segmentoComercial || lead.tipo || lead.segmentoBuscado || 'negócio local',
    phone: lead.telefone || '',
    site: lead.site || '',
    address: lead.endereco || '',
    ticket,
    ticketLabel: ticket.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
    closedAt,
    lastInteractionAt: lastInteraction?.data || lastInteraction?.createdAt || '',
    nextBestAction: 'Realizar onboarding e confirmar primeira entrega combinada.',
    onboardingPlan: buildOnboardingPlan(lead),
    notes: lead.notas || '',
    status: normalizeStatus(lead.status)
  };
}

function buildCustomerSuccessSummary(leads = []) {
  const customers = leads
    .filter((lead) => normalizeStatus(lead.status) === 'FECHADO')
    .map(buildCustomerCard)
    .sort((a, b) => new Date(b.closedAt || 0) - new Date(a.closedAt || 0));

  const proposals = leads.filter((lead) => normalizeStatus(lead.status) === 'PROPOSTA');
  const interested = leads.filter((lead) => normalizeStatus(lead.status) === 'INTERESSADO');
  const totalRevenue = customers.reduce((sum, customer) => sum + Number(customer.ticket || 0), 0);
  const openPipeline = [...proposals, ...interested].reduce((sum, lead) => sum + estimateTicketValue(lead.ticketEstimado), 0);

  return {
    summary: {
      customers: customers.length,
      totalRevenue,
      averageTicket: customers.length ? Math.round(totalRevenue / customers.length) : 0,
      openPipeline,
      proposals: proposals.length,
      interested: interested.length
    },
    customers,
    recommendations: buildCustomerRecommendations({ customers, proposals, interested, openPipeline })
  };
}

function buildCustomerRecommendations({ customers = [], proposals = [], interested = [], openPipeline = 0 } = {}) {
  const recommendations = [];

  if (!customers.length) {
    recommendations.push('Ainda não há clientes fechados. Priorize leads em PROPOSTA e faça follow-up objetivo nos próximos dias.');
  } else {
    recommendations.push('Acompanhe clientes fechados com onboarding claro. Um bom início aumenta indicação e reduz cancelamento.');
  }

  if (proposals.length) {
    recommendations.push(`${proposals.length} proposta(s) ainda estão abertas. Revise cada uma e defina uma próxima ação concreta.`);
  }

  if (interested.length) {
    recommendations.push(`${interested.length} lead(s) demonstraram interesse. Transforme interesse em proposta antes que a oportunidade esfrie.`);
  }

  if (openPipeline > 0) {
    recommendations.push(`Há ${openPipeline.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} em potencial aberto no funil.`);
  }

  return recommendations;
}

function buildCloseInteraction({ revenue = '', note = '' } = {}) {
  const amount = estimateTicketValue(revenue);
  return {
    data: new Date().toISOString(),
    tipo: 'CLIENTE_FECHADO',
    status: 'FECHADO',
    receita: amount,
    receitaLabel: amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
    resumo: note || 'Lead marcado como cliente fechado.',
    proximaAcao: 'Realizar onboarding e confirmar primeira entrega.'
  };
}

function buildLostInteraction({ reason = '' } = {}) {
  return {
    data: new Date().toISOString(),
    tipo: 'OPORTUNIDADE_PERDIDA',
    status: 'SEM_INTERESSE',
    motivo: String(reason || 'Sem motivo informado').trim(),
    resumo: 'Oportunidade marcada como perdida para manter o funil limpo.'
  };
}

module.exports = {
  getLeadId,
  estimateTicketValue,
  buildOnboardingPlan,
  buildCustomerCard,
  buildCustomerSuccessSummary,
  buildCloseInteraction,
  buildLostInteraction
};
