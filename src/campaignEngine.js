/**
 * campaignEngine.js
 * -----------------------------------------------------------------------------
 * Campanhas: motor de campanhas e follow-up.
 *
 * O objetivo é transformar o CRM em uma operação comercial guiada:
 * - criação de sequência de mensagens;
 * - sugestão de próximo passo;
 * - agenda de follow-up manual;
 * - sem disparo automático para evitar spam e manter revisão humana.
 */

function normalizeName(name) {
  return String(name || 'tudo bem').split('-')[0].trim();
}

function buildCampaignSequence(lead, objective = 'vender site personalizado') {
  const nome = normalizeName(lead.nome);
  const segmento = lead.segmentoComercial || lead.tipo || 'negócio local';
  const dor = Array.isArray(lead.dores) && lead.dores.length
    ? lead.dores[0]
    : 'melhorar a presença digital e captar mais clientes';
  const siteStatus = lead.site ? 'vi que vocês já possuem um site' : 'não encontrei um site claro vinculado ao negócio';
  const maps = lead.maps || '';

  return [
    {
      day: 0,
      title: 'Primeiro contato',
      channel: 'WhatsApp',
      message: `Olá, ${nome}. Tudo bem?\n\nEncontrei sua ${segmento} no Google e ${siteStatus}. Percebi uma oportunidade: ${dor}.\n\nEu desenvolvo websites personalizados para a necessidade de cada empreendimento, com foco em gerar mais contatos pelo Google e pelo WhatsApp.\n\nPosso te enviar 2 sugestões rápidas de melhoria sem compromisso?`
    },
    {
      day: 2,
      title: 'Follow-up de valor',
      channel: 'WhatsApp',
      message: `Olá, ${nome}. Passando só para complementar minha mensagem anterior.\n\nNegócios locais costumam perder contatos quando o cliente não encontra informações claras, botão de WhatsApp ou uma página objetiva mostrando serviços.\n\nNo seu caso, eu faria um diagnóstico simples e mostraria onde dá para melhorar primeiro. Posso te mandar esse resumo?`
    },
    {
      day: 5,
      title: 'Último toque educado',
      channel: 'WhatsApp',
      message: `Olá, ${nome}. Último contato para não te incomodar.\n\nSe fizer sentido em algum momento melhorar a presença digital da sua ${segmento}, posso montar uma proposta simples e objetiva.\n\nDeixo meu contato à disposição.`
    }
  ].map((item) => ({
    ...item,
    leadName: lead.nome,
    objective,
    maps
  }));
}

function nextFollowUpDate(days = 2) {
  const date = new Date();
  date.setDate(date.getDate() + Number(days || 2));
  return date.toISOString();
}

module.exports = { buildCampaignSequence, nextFollowUpDate };


function getPriorityFromLead(lead) {
  const score = Number(lead.score || lead.pontuacao || 0);
  const status = String(lead.status || 'NOVO').toUpperCase();

  if (score >= 85) return { priority: 'ALTA', days: [0, 1, 3], label: 'Lead quente' };
  if (status === 'INTERESSADO' || status === 'PROPOSTA') return { priority: 'ALTA', days: [0, 1, 2], label: 'Lead engajado' };
  if (score >= 65) return { priority: 'MÉDIA', days: [0, 2, 5], label: 'Boa oportunidade' };

  return { priority: 'BAIXA', days: [1, 4, 8], label: 'Nutrição leve' };
}

function buildAutomationPlan(lead, objective = 'vender website personalizado') {
  const profile = getPriorityFromLead(lead);
  const sequence = buildCampaignSequence(lead, objective);

  return sequence.map((step, index) => {
    const due = new Date();
    due.setDate(due.getDate() + Number(profile.days[index] ?? step.day ?? index + 1));

    return {
      ...step,
      priority: profile.priority,
      label: profile.label,
      dueAt: due.toISOString(),
      automationType: 'FOLLOWUP_SEQUENCE',
      statusSuggestion: index === 0 ? 'CONTATADO' : 'INTERESSADO'
    };
  });
}

module.exports = { buildCampaignSequence, nextFollowUpDate, buildAutomationPlan, getPriorityFromLead };
