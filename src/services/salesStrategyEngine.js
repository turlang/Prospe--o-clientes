/**
 * salesStrategyEngine.js
 * -----------------------------------------------------------------------------
 * Motor local de estratégias comerciais.
 *
 * Objetivo: transformar o botão "Gerar abordagem" em uma recomendação comercial
 * contextual, usando dados já coletados do lead. Não depende de IA externa e pode
 * ser evoluído depois para usar modelos generativos por plano.
 */

const SEGMENT_KEYWORDS = {
  beleza: ['barbearia', 'cabeleireiro', 'salão', 'salao', 'estética', 'estetica', 'beauty', 'nails', 'unhas'],
  saude: ['clínica', 'clinica', 'dentista', 'odontologia', 'fisioterapia', 'médico', 'medico', 'psicologia'],
  alimentacao: ['restaurante', 'pizzaria', 'hamburgueria', 'lanchonete', 'padaria', 'açaí', 'acai'],
  servicos: ['assistência', 'assistencia', 'oficina', 'limpeza', 'manutenção', 'manutencao', 'segurança', 'seguranca'],
  educacao: ['escola', 'curso', 'idiomas', 'aula', 'ensino']
};

function normalizeText(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function inferSegmentGroup(lead = {}) {
  const source = normalizeText([lead.segmentoComercial, lead.tipo, lead.segmentoBuscado, lead.nome].filter(Boolean).join(' '));
  for (const [group, keywords] of Object.entries(SEGMENT_KEYWORDS)) {
    if (keywords.some((keyword) => source.includes(normalizeText(keyword)))) return group;
  }
  return 'local';
}

function hasWebsite(lead = {}) {
  return Boolean(String(lead.site || '').trim());
}

function hasWhatsapp(lead = {}) {
  const audit = lead.auditoriaSite || {};
  return Boolean(audit.whatsapp || String(lead.telefone || '').replace(/\D/g, '').length >= 10);
}

function hasSocialPresence(lead = {}) {
  const audit = lead.auditoriaSite || {};
  return Boolean(
    Array.isArray(audit.redesSociais) && audit.redesSociais.length
      || audit.engajamentoSocial?.score >= 30
  );
}

function getPrimaryPain(lead = {}) {
  if (Array.isArray(lead.dores) && lead.dores.length) return lead.dores[0];
  if (!hasWebsite(lead)) return 'sua empresa ainda não parece ter um site próprio para converter pesquisas em contatos';
  if (!hasWhatsapp(lead)) return 'o caminho para o cliente chamar no WhatsApp pode estar pouco claro';
  if (!hasSocialPresence(lead)) return 'a presença nas redes sociais parece ter espaço para ganhar mais confiança';
  return 'existem oportunidades para transformar a presença digital em mais contatos qualificados';
}

function inferOpportunityTags(lead = {}) {
  const tags = [];
  if (!hasWebsite(lead)) tags.push('Sem site próprio');
  if (hasWhatsapp(lead)) tags.push('Possui canal de WhatsApp/telefone');
  if (hasSocialPresence(lead)) tags.push('Possui presença social');
  if (Number(lead.score || 0) >= 80) tags.push('Alta prioridade comercial');
  if (Array.isArray(lead.dores) && lead.dores.length) tags.push('Dores digitais detectadas');
  if (lead.maps) tags.push('Encontrado no Google Maps');
  return tags.length ? tags : ['Oportunidade comercial local'];
}

function chooseStrategy(lead = {}, segmentGroup = inferSegmentGroup(lead)) {
  const score = Number(lead.score || 0);
  const website = hasWebsite(lead);
  const whatsapp = hasWhatsapp(lead);
  const social = hasSocialPresence(lead);

  if (!website && score >= 70) {
    return {
      id: 'consultiva',
      name: 'Consultiva',
      reason: 'o lead tem bom potencial, mas ainda perde confiança e conversões por não ter site próprio.'
    };
  }

  if (!website || !whatsapp) {
    return {
      id: 'pas',
      name: 'PAS — Problema, Agitação e Solução',
      reason: 'existe uma dor objetiva que pode estar fazendo a empresa perder contatos no digital.'
    };
  }

  if (social && ['beleza', 'alimentacao', 'saude'].includes(segmentGroup)) {
    return {
      id: 'prova-social',
      name: 'Prova social',
      reason: 'o segmento depende muito de confiança, reputação e indicação antes da decisão de compra.'
    };
  }

  if (score < 55) {
    return {
      id: 'curiosidade',
      name: 'Curiosidade',
      reason: 'para leads frios, uma pergunta curta tende a gerar mais resposta do que uma oferta direta.'
    };
  }

  return {
    id: 'diagnostico',
    name: 'Oferta de diagnóstico',
    reason: 'a abordagem com diagnóstico reduz resistência, gera valor primeiro e abre conversa comercial.'
  };
}

function segmentBenefit(segmentGroup) {
  return {
    beleza: 'atrair mais agendamentos e transmitir confiança antes do cliente chamar no WhatsApp',
    saude: 'aumentar a confiança de novos pacientes e facilitar solicitações de agendamento',
    alimentacao: 'facilitar pedidos, reservas e descoberta por clientes próximos',
    servicos: 'receber pedidos de orçamento mais qualificados e reduzir perda para concorrentes',
    educacao: 'gerar mais contatos de interessados e organizar melhor a captação de alunos',
    local: 'transformar pesquisas no Google em conversas comerciais pelo WhatsApp'
  }[segmentGroup] || 'gerar mais contatos qualificados';
}

function buildMessage({ lead, strategy, segmentGroup, primaryPain }) {
  const businessName = lead.nome || 'sua empresa';
  const segment = lead.segmentoComercial || lead.tipo || lead.segmentoBuscado || 'negócio local';
  const benefit = segmentBenefit(segmentGroup);

  if (strategy.id === 'consultiva') {
    return `Olá, tudo bem? Encontrei a ${businessName} enquanto pesquisava ${segment} na região.\n\nVi que vocês têm potencial para receber novos clientes pelo digital, mas percebi uma oportunidade importante: ${primaryPain}.\n\nHoje, muitos clientes pesquisam no Google antes de decidir com quem falar. Quando a empresa tem uma presença digital mais clara, ela passa mais confiança e facilita o contato.\n\nTrabalho ajudando negócios locais a ${benefit}. Posso te enviar 2 ou 3 sugestões objetivas para melhorar isso na ${businessName}?`;
  }

  if (strategy.id === 'pas') {
    return `Olá, tudo bem? Fiz uma análise rápida da presença digital da ${businessName}.\n\nPercebi um ponto que pode estar fazendo vocês perderem oportunidades: ${primaryPain}.\n\nQuando isso acontece, clientes interessados acabam escolhendo concorrentes que aparecem com mais clareza, têm um caminho de contato mais simples ou passam mais confiança logo na primeira impressão.\n\nA boa notícia é que isso pode ser melhorado com ajustes objetivos. Posso te mostrar um diagnóstico rápido com sugestões práticas para a ${businessName}?`;
  }

  if (strategy.id === 'prova-social') {
    return `Olá, tudo bem? Encontrei a ${businessName} e percebi que vocês já têm sinais importantes de presença digital.\n\nEm negócios de ${segment}, confiança é decisiva: o cliente costuma olhar reputação, aparência online e facilidade de contato antes de chamar.\n\nVi algumas oportunidades para transformar essa presença em mais conversas e possíveis clientes.\n\nPosso te enviar uma análise curta com ideias aplicáveis para a realidade da ${businessName}?`;
  }

  if (strategy.id === 'curiosidade') {
    return `Olá, tudo bem? Posso fazer uma pergunta rápida?\n\nEncontrei a ${businessName} pesquisando empresas da região e notei um detalhe na presença digital que pode estar limitando a chegada de novos clientes.\n\nÉ algo simples de observar e pode fazer diferença para quem procura ${segment} no Google.\n\nPosso te mostrar o que encontrei?`;
  }

  return `Olá, tudo bem? Fiz uma leitura rápida da presença digital da ${businessName}.\n\nEncontrei algumas oportunidades para melhorar a forma como novos clientes encontram e entram em contato com vocês.\n\nMeu trabalho é ajudar negócios locais a ${benefit}, com ajustes práticos em presença digital, Google e canais de contato.\n\nPosso te enviar um diagnóstico gratuito e objetivo com os principais pontos que eu melhoraria na ${businessName}?`;
}

function buildFollowUps(lead = {}, strategy) {
  const businessName = lead.nome || 'sua empresa';
  return [
    {
      day: 1,
      title: 'Mensagem inicial',
      objective: 'abrir conversa com diagnóstico contextual',
      message: 'Enviar a abordagem personalizada e aguardar sinal de interesse.'
    },
    {
      day: 3,
      title: 'Follow-up curto',
      objective: 'retomar sem pressionar',
      message: `Oi, tudo bem? Só passando para confirmar se faz sentido eu te enviar as sugestões que identifiquei para a ${businessName}.`
    },
    {
      day: 7,
      title: 'Dica prática',
      objective: 'gerar valor antes da venda',
      message: 'Enviar uma dica simples sobre Google, site ou WhatsApp com base na principal oportunidade detectada.'
    },
    {
      day: 12,
      title: 'Convite para diagnóstico',
      objective: 'converter interesse em conversa',
      message: 'Oferecer uma análise rápida de 10 minutos para mostrar os pontos de melhoria.'
    },
    {
      day: 20,
      title: 'Encerramento elegante',
      objective: 'manter porta aberta',
      message: 'Encerrar a sequência de forma cordial e deixar abertura para contato futuro.'
    }
  ].map((step) => ({ ...step, strategy: strategy.name }));
}

function buildSalesApproach(lead = {}) {
  const segmentGroup = inferSegmentGroup(lead);
  const primaryPain = getPrimaryPain(lead);
  const strategy = chooseStrategy(lead, segmentGroup);
  const diagnostics = {
    segmentGroup,
    score: Number(lead.score || 0),
    hasWebsite: hasWebsite(lead),
    hasWhatsapp: hasWhatsapp(lead),
    hasSocialPresence: hasSocialPresence(lead),
    primaryPain,
    opportunityTags: inferOpportunityTags(lead),
    priority: Number(lead.score || 0) >= 80 ? 'Alta' : Number(lead.score || 0) >= 60 ? 'Média' : 'Baixa'
  };

  return {
    strategy,
    diagnostics,
    abordagem: buildMessage({ lead, strategy, segmentGroup, primaryPain }),
    followUps: buildFollowUps(lead, strategy),
    explanation: [
      `Estratégia escolhida: ${strategy.name}.`,
      `Motivo: ${strategy.reason}`,
      `Dor principal usada na mensagem: ${primaryPain}.`
    ]
  };
}

module.exports = {
  buildSalesApproach,
  chooseStrategy,
  inferSegmentGroup,
  inferOpportunityTags,
  getPrimaryPain
};
