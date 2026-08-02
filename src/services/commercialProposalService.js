/**
 * @fileoverview Serviço de domínio `commercialProposalService` responsável por regras comerciais reutilizáveis.
 *
 * Responsabilidade delimitada conforme a arquitetura descrita em
 * `docs/ARQUITETURA.md`. Alterações neste arquivo devem preservar os contratos
 * documentados e ser acompanhadas por testes quando afetarem regras de negócio.
 *
 * @module src/services/commercialProposalService
 */

/**
 * commercialProposalService.js
 * -----------------------------------------------------------------------------
 * V21.2 — Propostas comerciais inteligentes.
 *
 * O objetivo deste serviço é transformar um lead em uma proposta curta, simples
 * e pronta para ser enviada. A proposta não tenta substituir um contrato; ela
 * organiza o próximo passo comercial depois que o lead demonstrou interesse.
 */

const { generateAiJsonContent, getAiProviderStatus } = require('./aiApproachService');

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

function inferServiceFocus(lead = {}) {
  const segment = String(lead.segmentoComercial || lead.tipo || lead.segmentoBuscado || '').toLowerCase();
  const pains = Array.isArray(lead.dores) ? lead.dores.join(' ').toLowerCase() : '';
  const hasSite = Boolean(lead.site);

  if (!hasSite || pains.includes('site')) {
    return {
      title: 'Presença digital simples para gerar mais contatos',
      deliverables: [
        'Página profissional de apresentação da empresa',
        'Botões claros para WhatsApp, localização e orçamento',
        'Organização das principais informações que o cliente procura antes de chamar',
        'Ajustes básicos para transmitir mais confiança para quem encontra a empresa no Google'
      ]
    };
  }

  if (segment.includes('restaurante') || segment.includes('hamburg') || segment.includes('pizz')) {
    return {
      title: 'Melhoria da presença comercial para aumentar pedidos e contatos',
      deliverables: [
        'Organização do cardápio, fotos e canais de pedido',
        'Melhoria da primeira impressão para quem encontra o negócio pelo Google',
        'Botões diretos para WhatsApp, rota e pedido',
        'Sugestões práticas para reduzir dúvidas antes do contato'
      ]
    };
  }

  if (segment.includes('clínica') || segment.includes('clinica') || segment.includes('odont') || segment.includes('estética') || segment.includes('estetica')) {
    return {
      title: 'Mais confiança e facilidade para novos agendamentos',
      deliverables: [
        'Página clara para apresentar serviços e diferenciais',
        'Caminho simples para o paciente chamar no WhatsApp',
        'Organização de informações essenciais antes do agendamento',
        'Sugestões para melhorar a percepção de confiança antes do primeiro contato'
      ]
    };
  }

  return {
    title: 'Diagnóstico e melhoria comercial da presença digital',
    deliverables: [
      'Organização das informações principais da empresa',
      'Caminhos mais claros para contato por WhatsApp ou orçamento',
      'Melhoria da primeira impressão para novos clientes',
      'Plano simples de próximos passos para gerar mais conversas comerciais'
    ]
  };
}


function buildProposalPrompt({ lead = {}, localProposal = {}, recommendation = {}, objective = '', previousProposal = '' } = {}) {
  const company = lead.nome || 'empresa local';
  const segment = lead.segmentoComercial || lead.tipo || lead.segmentoBuscado || 'negócio local';
  const pains = Array.isArray(lead.dores) ? lead.dores : [];
  const services = Array.isArray(lead.servicos) ? lead.servicos : [lead.servico].filter(Boolean);
  const hasSite = Boolean(lead.site);
  const hasPhone = Boolean(lead.telefone);

  const briefing = {
    empresa: company,
    segmento: segment,
    endereco: lead.endereco || '',
    telefoneOuWhatsAppDisponivel: hasPhone,
    siteIdentificado: hasSite,
    ticketEstimado: lead.ticketEstimado || '',
    probabilidade: lead.probabilidade || '',
    score: lead.score || 0,
    dores: pains,
    servicosSugeridos: services,
    objetivoComercial: objective || localProposal.objective || 'transformar a conversa inicial em uma proposta simples e fácil de entender',
    abordagemGeradaAntes: recommendation.abordagem || '',
    propostaAnterior: previousProposal || ''
  };

  const outputSchema = {
    title: `Proposta comercial simples para ${company}`,
    objective: 'objetivo da proposta em linguagem comercial simples',
    diagnosis: 'diagnóstico curto, sem termos técnicos, baseado apenas nos dados do lead',
    recommendedSolution: 'solução recomendada em linguagem de cliente final',
    deliverables: ['3 a 6 entregáveis claros, sem jargões técnicos'],
    estimatedRange: 'referência comercial ou texto a definir após conversa',
    nextStep: 'próximo passo leve, de baixa pressão',
    messageToSend: 'mensagem curta para enviar junto com a proposta por WhatsApp ou e-mail',
    commercialReasoning: ['por que esta proposta faz sentido para este lead'],
    qualityChecklist: ['itens atendidos']
  };

  return [
    'Você é um vendedor extremamente experiente de serviços tecnológicos para pequenos negócios locais.',
    'Seu papel é transformar uma oportunidade em uma proposta comercial simples, humana e vendável.',
    '',
    'IMPORTANTE:',
    '- O cliente provavelmente não entende tecnologia.',
    '- Não use termos técnicos como SEO, landing page, funil, conversão, automação, tráfego, CRM ou performance.',
    '- Traduza tecnologia para resultado percebido: mais clientes chamando, mais confiança, mais orçamentos, mais agendamentos, menos dúvidas antes do contato.',
    '- Não prometa resultado garantido.',
    '- Não invente dados que não estão no briefing.',
    '- A proposta deve parecer feita por um consultor comercial experiente, não por um técnico.',
    '- Seja objetivo, próximo e fácil de entender.',
    '- Se houver proposta anterior, gere uma versão realmente diferente e melhor.',
    '',
    'Briefing do lead:',
    JSON.stringify(briefing, null, 2),
    '',
    'Proposta local de referência, apenas como apoio. Não copie literalmente:',
    JSON.stringify(localProposal, null, 2),
    '',
    'Retorne SOMENTE JSON válido seguindo este formato:',
    JSON.stringify(outputSchema, null, 2)
  ].join('\n');
}

function normalizeAiProposal({ lead = {}, aiResult = {}, fallbackProposal = {} } = {}) {
  const parsed = aiResult.parsed || {};
  const deliverables = Array.isArray(parsed.deliverables) && parsed.deliverables.length
    ? parsed.deliverables.map(String)
    : fallbackProposal.deliverables;

  const proposal = {
    ...fallbackProposal,
    id: fallbackProposal.id || `proposal-${Date.now()}`,
    createdAt: fallbackProposal.createdAt || new Date().toISOString(),
    leadId: getLeadId(lead),
    leadName: lead.nome || fallbackProposal.leadName || 'Lead',
    segment: lead.segmentoComercial || lead.tipo || lead.segmentoBuscado || fallbackProposal.segment || 'negócio local',
    title: String(parsed.title || fallbackProposal.title || `Proposta comercial para ${lead.nome || 'lead'}`).trim(),
    objective: String(parsed.objective || fallbackProposal.objective || '').trim(),
    diagnosis: String(parsed.diagnosis || fallbackProposal.diagnosis || '').trim(),
    recommendedSolution: String(parsed.recommendedSolution || fallbackProposal.recommendedSolution || '').trim(),
    deliverables,
    estimatedRange: String(parsed.estimatedRange || fallbackProposal.estimatedRange || 'a definir após diagnóstico').trim(),
    nextStep: String(parsed.nextStep || fallbackProposal.nextStep || '').trim(),
    generatedMessage: String(parsed.messageToSend || parsed.generatedMessage || fallbackProposal.generatedMessage || '').trim(),
    commercialReasoning: Array.isArray(parsed.commercialReasoning) ? parsed.commercialReasoning.map(String) : [],
    qualityChecklist: Array.isArray(parsed.qualityChecklist) ? parsed.qualityChecklist.map(String) : [],
    provider: aiResult.providerLabel || aiResult.provider || fallbackProposal.provider || 'Motor Local',
    model: aiResult.model || fallbackProposal.model || 'local',
    source: aiResult.source || fallbackProposal.source || 'local',
    aiStatus: aiResult.aiStatus || getAiProviderStatus(),
    aiError: aiResult.aiError || null
  };

  proposal.text = proposalToPlainText(proposal);
  return proposal;
}

async function buildAiProposal({ lead = {}, recommendation = {}, objective = '', previousProposal = '' } = {}) {
  const fallbackProposal = buildProposalFromApproach({ lead, recommendation, objective });
  const prompt = buildProposalPrompt({ lead, localProposal: fallbackProposal, recommendation, objective, previousProposal });
  const aiResult = await generateAiJsonContent({
    prompt,
    systemContent: 'Você cria propostas comerciais simples, humanas e consultivas para pequenos negócios. Retorne somente JSON válido.',
    maxTokens: Number(process.env.AI_PROPOSAL_MAX_TOKENS || 1900)
  });

  if (!aiResult || !aiResult.parsed) {
    return normalizeAiProposal({ lead, aiResult: aiResult || {}, fallbackProposal });
  }

  return normalizeAiProposal({ lead, aiResult, fallbackProposal });
}

function buildProposalFromApproach({ lead = {}, recommendation = {}, objective = '' } = {}) {
  const service = inferServiceFocus(lead);
  const ticket = estimateTicketValue(lead.ticketEstimado);
  const estimatedRange = `A partir de ${ticket.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`;
  const approachText = String(recommendation.abordagem || '').trim();
  const company = lead.nome || 'sua empresa';
  const segment = lead.segmentoComercial || lead.tipo || lead.segmentoBuscado || 'negócio local';
  const primaryPain = Array.isArray(lead.dores) && lead.dores.length
    ? lead.dores[0]
    : 'facilitar que mais clientes entendam a empresa e chamem no WhatsApp';

  const proposal = {
    id: `proposal-${Date.now()}`,
    createdAt: new Date().toISOString(),
    leadId: getLeadId(lead),
    leadName: company,
    segment,
    title: `Proposta comercial inicial para ${company}`,
    objective: objective || service.title,
    diagnosis: `Pelo que foi observado, ${company} tem uma oportunidade de melhorar a forma como novos clientes entendem o negócio antes de fazer contato. O ponto principal é ${primaryPain}.`,
    recommendedSolution: service.title,
    deliverables: service.deliverables,
    estimatedRange,
    nextStep: 'Marcar uma conversa rápida de 10 a 15 minutos para entender melhor o momento da empresa e validar se faz sentido avançar com uma proposta fechada.',
    generatedMessage: approachText,
    provider: recommendation.providerLabel || recommendation.provider || 'Motor Local',
    model: recommendation.model || 'local',
    strategy: recommendation.strategy?.name || recommendation.strategy?.id || 'comercial'
  };

  proposal.text = proposalToPlainText(proposal);
  return proposal;
}

function proposalToPlainText(proposal = {}) {
  const deliverables = Array.isArray(proposal.deliverables) ? proposal.deliverables : [];
  const reasoning = Array.isArray(proposal.commercialReasoning) ? proposal.commercialReasoning : [];
  return [
    proposal.title,
    '',
    `Empresa: ${proposal.leadName || '-'}`,
    `Segmento: ${proposal.segment || '-'}`,
    '',
    'Diagnóstico inicial:',
    proposal.diagnosis || '-',
    '',
    'Solução recomendada:',
    proposal.recommendedSolution || '-',
    '',
    'O que pode ser entregue:',
    ...deliverables.map((item) => `- ${item}`),
    '',
    `Referência comercial: ${proposal.estimatedRange || 'a definir após diagnóstico'}`,
    '',
    'Próximo passo:',
    proposal.nextStep || '-',
    reasoning.length ? ['','Por que esta proposta faz sentido:', ...reasoning.map((item) => `- ${item}`)].join('\n') : '',
    proposal.generatedMessage ? ['','Mensagem sugerida para enviar:', proposal.generatedMessage].join('\n') : '',
    proposal.provider ? ['','Motor usado:', `${proposal.provider}${proposal.model ? ` · ${proposal.model}` : ''}`].join('\n') : ''
  ].filter(Boolean).join('\n');
}

function extractProposalEvents(leads = []) {
  return leads.flatMap((lead) => {
    const interactions = Array.isArray(lead.interacoes) ? lead.interacoes : [];
    return interactions
      .filter((item) => item.tipo === 'PROPOSTA_GERADA')
      .map((item) => ({
        id: item.propostaId || `${getLeadId(lead)}-${item.data || Date.now()}`,
        leadId: getLeadId(lead),
        leadName: lead.nome || 'Lead',
        status: normalizeStatus(lead.status),
        createdAt: item.data || item.createdAt || '',
        provider: item.provider || 'Motor Local',
        model: item.model || 'local',
        strategy: item.strategy || 'comercial',
        title: item.titulo || `Proposta para ${lead.nome || 'lead'}`,
        text: item.proposta || '',
        estimatedRange: item.valorReferencia || lead.ticketEstimado || ''
      }));
  }).sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
}

function buildProposalSummary(leads = []) {
  const proposals = extractProposalEvents(leads);
  const proposalStage = leads.filter((lead) => normalizeStatus(lead.status) === 'PROPOSTA').length;
  const closed = leads.filter((lead) => normalizeStatus(lead.status) === 'FECHADO').length;
  const estimatedRevenue = leads
    .filter((lead) => ['PROPOSTA', 'FECHADO'].includes(normalizeStatus(lead.status)))
    .reduce((sum, lead) => sum + estimateTicketValue(lead.ticketEstimado), 0);

  return {
    summary: {
      generated: proposals.length,
      inProposalStage: proposalStage,
      closed,
      estimatedRevenue
    },
    proposals
  };
}

module.exports = {
  getLeadId,
  estimateTicketValue,
  inferServiceFocus,
  buildProposalPrompt,
  normalizeAiProposal,
  buildAiProposal,
  buildProposalFromApproach,
  proposalToPlainText,
  extractProposalEvents,
  buildProposalSummary
};
