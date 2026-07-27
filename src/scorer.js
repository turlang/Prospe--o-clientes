const { hasOwnDomain } = require('./siteAuditor');
const { buildInitialMessage } = require('./conversationEngine');

const SEGMENTOS_PREMIUM = [
  { termos: ['dentist', 'dental', 'odont', 'clínica odontológica', 'clinica odontologica'], pontos: 30, ticket: 'R$ 3.000 a R$ 15.000', servicos: ['landing page para captação de pacientes', 'agendamento online', 'automacao de WhatsApp'] },
  { termos: ['doctor', 'clinic', 'health', 'médic', 'medic', 'estética', 'estetica', 'fisioterapia'], pontos: 28, ticket: 'R$ 3.000 a R$ 18.000', servicos: ['site institucional premium', 'funil de agendamento', 'CRM simples'] },
  { termos: ['lawyer', 'advogado', 'advocacia', 'legal'], pontos: 25, ticket: 'R$ 2.500 a R$ 12.000', servicos: ['site de autoridade', 'SEO local', 'página de consulta'] },
  { termos: ['real_estate', 'imobili', 'construtora', 'construction'], pontos: 28, ticket: 'R$ 5.000 a R$ 30.000', servicos: ['catálogo de imóveis', 'landing pages', 'CRM de atendimento'] },
  { termos: ['accounting', 'contabil', 'contabilidade'], pontos: 22, ticket: 'R$ 2.000 a R$ 10.000', servicos: ['site institucional', 'captação B2B', 'automacao de formulários'] },
  { termos: ['gym', 'academia', 'fitness'], pontos: 18, ticket: 'R$ 2.000 a R$ 8.000', servicos: ['landing page', 'matrícula online', 'WhatsApp comercial'] },
  { termos: ['school', 'escola', 'curso', 'educação', 'educacao'], pontos: 22, ticket: 'R$ 3.000 a R$ 15.000', servicos: ['site com captação de matrículas', 'páginas de cursos', 'formulários'] },
  { termos: ['solar', 'energia solar'], pontos: 30, ticket: 'R$ 5.000 a R$ 25.000', servicos: ['landing page de orçamento', 'calculadora de economia', 'CRM de propostas'] },
  { termos: ['restaurant', 'restaurante', 'pizzaria', 'burger', 'hamburg'], pontos: 10, ticket: 'R$ 800 a R$ 5.000', servicos: ['cardápio digital', 'site com WhatsApp', 'delivery próprio'] },
  { termos: ['beauty', 'salon', 'beleza', 'barbearia'], pontos: 14, ticket: 'R$ 800 a R$ 5.000', servicos: ['landing page', 'agenda pelo WhatsApp', 'portfólio de serviços'] }
];

function scoreLead(lead) {
  return scoreLeadComercial(lead);
}

function scoreLeadComercial(lead) {
  let score = 0;
  const motivos = [];
  const dores = [];

  const segmento = matchSegment(lead);
  score += segmento.pontos;
  if (segmento.pontos) motivos.push(`segmento com bom potencial comercial (+${segmento.pontos})`);

  if (lead.telefone) { score += 10; motivos.push('tem telefone público'); }
  if (lead.site) { score += 10; motivos.push('tem site para auditoria e melhoria'); }
  else { score += 22; motivos.push('não possui site: oportunidade direta'); dores.push('sem site próprio visível no Google'); }

  if (hasOwnDomain(lead.site)) { score += 8; motivos.push('usa domínio próprio'); }

  if (lead.avaliacoes >= 300) { score += 22; motivos.push('muitas avaliações: empresa com movimento local forte'); }
  else if (lead.avaliacoes >= 100) { score += 18; motivos.push('boa quantidade de avaliações'); }
  else if (lead.avaliacoes >= 30) { score += 12; motivos.push('presença local razoável'); }
  else if (lead.avaliacoes > 0) { score += 6; motivos.push('presença local inicial'); }

  if (lead.nota && lead.nota >= 4.5) { score += 8; motivos.push('reputação alta'); }
  else if (lead.nota && lead.nota < 4) { score += 5; dores.push('nota pode indicar necessidade de melhorar atendimento e presença digital'); }

  if (lead.status === 'OPERATIONAL') { score += 5; motivos.push('negócio ativo'); }

  const auditoria = lead.auditoriaSite || null;
  if (auditoria) {
    if (auditoria.analisado) score += 5;
    if (auditoria.problemas?.length) {
      const pontosDor = Math.min(auditoria.problemas.length * 4, 20);
      score += pontosDor;
      motivos.push(`auditoria encontrou oportunidades técnicas (+${pontosDor})`);
      dores.push(...auditoria.problemas.slice(0, 5));
    }
    if (auditoria.dominioProprio) score += 5;
    if (!auditoria.responsivo) score += 8;
    if (!auditoria.formulario) score += 8;
    if (!auditoria.whatsapp) score += 5;
    if (!auditoria.analytics) score += 5;

    if (auditoria.engajamentoSocial) {
      const socialBonus = Math.round((auditoria.engajamentoSocial.score || 0) * 0.12);
      if (socialBonus) {
        score += socialBonus;
        motivos.push(`presença social com engajamento estimado ${auditoria.engajamentoSocial.nivel} (+${socialBonus})`);
      }

      if ((auditoria.engajamentoSocial.alertas || []).length) {
        dores.push(...auditoria.engajamentoSocial.alertas.slice(0, 3));
      }
    }
  }

  score = Math.max(0, Math.min(100, score));

  const nivel = score >= 80 ? 'Muito promissor' : score >= 65 ? 'Quente' : score >= 45 ? 'Morno' : 'Frio';
  const probabilidade = score >= 80 ? 'ALTA' : score >= 65 ? 'BOA' : score >= 45 ? 'MÉDIA' : 'BAIXA';
  const ticketEstimado = estimateTicket(lead, segmento, score);
  const servicos = suggestServices(lead, segmento, auditoria);
  const relatorio = buildDiagnosis({ lead, score, nivel, probabilidade, ticketEstimado, servicos, dores, auditoria });

  return {
    ...lead,
    score,
    nivel,
    probabilidade,
    ticketEstimado,
    segmentoComercial: segmento.nome,
    motivos: unique(motivos),
    dores: unique(dores),
    servico: servicos[0],
    servicos,
    relatorio,
    status: lead.status || 'NOVO',
    abordagem: buildMessage({ ...lead, score }, { servicos, dores, ticketEstimado })
  };
}

function matchSegment(lead) {
  const text = `${lead.tipo || ''} ${lead.nome || ''} ${lead.segmentoBuscado || ''}`.toLowerCase();
  const found = SEGMENTOS_PREMIUM.find((item) => item.termos.some((term) => text.includes(term)));
  if (!found) return { nome: lead.tipo || 'geral', pontos: 8, ticket: 'R$ 800 a R$ 4.000', servicos: ['landing page', 'site institucional', 'automacao de atendimento'] };
  return { nome: found.termos[0], pontos: found.pontos, ticket: found.ticket, servicos: found.servicos };
}

function estimateTicket(_lead, segmento, score) {
  if (score >= 80) return segmento.ticket;
  if (score >= 65) return segmento.ticket.replace(/R\$ ([\d.]+).*R\$ ([\d.]+)/, 'R$ $1 a R$ $2');
  if (score >= 45) return 'R$ 800 a R$ 5.000';
  return 'R$ 500 a R$ 2.000';
}

function suggestServices(lead, segmento, auditoria) {
  const services = [...segmento.servicos];
  if (!lead.site) services.unshift('criação de site/landing page profissional');
  if (auditoria) {
    if (!auditoria.formulario) services.unshift('formulário de orçamento/captação de leads');
    if (!auditoria.responsivo) services.unshift('modernização responsiva para celular');
    if (!auditoria.analytics || !auditoria.pixelMeta) services.push('instalação de métricas e pixel');
    if (!auditoria.metaDescription) services.push('SEO local básico');
    if (auditoria.engajamentoSocial?.nivel === 'Baixo' || auditoria.engajamentoSocial?.nivel === 'Muito baixo') {
      services.push('organização da presença em redes sociais');
    }
    if (auditoria.redesSociais?.length) {
      services.push('landing page integrada às redes sociais');
    }
  }
  return unique(services).slice(0, 4);
}

function buildDiagnosis({ lead, score, nivel, probabilidade, ticketEstimado, servicos, dores }) {
  const linhas = [
    `Empresa: ${lead.nome}`,
    `Score comercial: ${score}/100 (${nivel})`,
    `Probabilidade de fechamento: ${probabilidade}`,
    `Ticket estimado: ${ticketEstimado}`,
    '',
    'Principais oportunidades:',
    ...(dores.length ? dores.slice(0, 5).map((item) => `- ${item}`) : ['- melhorar presença digital e captação online']),
    '',
    'Serviços sugeridos:',
    ...servicos.map((item) => `- ${item}`)
  ];
  return linhas.join('\n');
}

function buildMessage(lead) {
  return buildInitialMessage(lead);
}


function filterActionable(leads, allowIncomplete = false) {
  if (allowIncomplete) return leads;
  return leads.filter((lead) => lead.telefone || lead.site || lead.maps);
}

function unique(list) {
  return [...new Set((list || []).filter(Boolean))];
}

module.exports = { scoreLead, scoreLeadComercial, filterActionable };
