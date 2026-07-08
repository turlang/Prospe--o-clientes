/**
 * salesStrategyEngine.js
 * -----------------------------------------------------------------------------
 * Motor local de estratégias comerciais.
 *
 * Ele continua funcionando sem API externa, mas agora gera variações reais por
 * lead e entrega contexto suficiente para uma IA externa gerar uma abordagem
 * ainda mais próxima do cliente quando OPENAI_API_KEY estiver configurada.
 */

const SEGMENT_KEYWORDS = {
  beleza: ['barbearia', 'cabeleireiro', 'salão', 'salao', 'estética', 'estetica', 'beauty', 'nails', 'unhas'],
  saude: ['clínica', 'clinica', 'dentista', 'odontologia', 'fisioterapia', 'médico', 'medico', 'psicologia'],
  alimentacao: ['restaurante', 'pizzaria', 'hamburgueria', 'lanchonete', 'padaria', 'açaí', 'acai'],
  servicos: ['assistência', 'assistencia', 'oficina', 'limpeza', 'manutenção', 'manutencao', 'segurança', 'seguranca'],
  educacao: ['escola', 'curso', 'idiomas', 'aula', 'ensino'],
  varejo: ['loja', 'moda', 'roupas', 'calçados', 'calcados', 'ótica', 'otica', 'mercado']
};

const SEGMENT_PLAYBOOKS = {
  beleza: {
    client: 'clientes que escolhem por confiança, estilo, avaliações e facilidade de agendamento',
    benefit: 'atrair mais agendamentos e transmitir confiança antes do cliente chamar no WhatsApp',
    angle: 'agenda cheia, recorrência e primeira impressão visual'
  },
  saude: {
    client: 'pacientes que pesquisam reputação, localização e segurança antes de agendar',
    benefit: 'aumentar a confiança de novos pacientes e facilitar solicitações de agendamento',
    angle: 'confiança, autoridade e agendamento simples'
  },
  alimentacao: {
    client: 'pessoas próximas que decidem rápido por cardápio, avaliações e facilidade de pedido',
    benefit: 'facilitar pedidos, reservas e descoberta por clientes próximos',
    angle: 'fome, conveniência e decisão rápida'
  },
  servicos: {
    client: 'clientes que precisam resolver um problema e comparam rapidez, confiança e orçamento',
    benefit: 'receber pedidos de orçamento mais qualificados e reduzir perda para concorrentes',
    angle: 'urgência, orçamento e prova de confiança'
  },
  educacao: {
    client: 'interessados que comparam proposta, credibilidade e facilidade de falar com a escola',
    benefit: 'gerar mais contatos de interessados e organizar melhor a captação de alunos',
    angle: 'credibilidade, clareza da oferta e matrícula'
  },
  varejo: {
    client: 'compradores que pesquisam antes de visitar, chamar no WhatsApp ou comparar opções',
    benefit: 'aumentar visitas, pedidos pelo WhatsApp e confiança na marca local',
    angle: 'produto certo, confiança e chamada rápida para comprar'
  },
  local: {
    client: 'clientes próximos que pesquisam no Google antes de escolher uma empresa',
    benefit: 'transformar pesquisas no Google em conversas comerciais pelo WhatsApp',
    angle: 'presença local, confiança e contato fácil'
  }
};

const STRATEGY_VARIATIONS = {
  consultiva: [
    'observação específica + oportunidade + convite leve',
    'elogio real + lacuna digital + sugestão objetiva',
    'contexto local + risco de perda para concorrentes + diagnóstico gratuito'
  ],
  pas: [
    'problema direto + consequência + solução simples',
    'dor invisível + perda de contatos + ajuste prático',
    'fricção na jornada + impacto comercial + convite para análise'
  ],
  'prova-social': [
    'confiança + reputação + transformação em contatos',
    'comportamento de escolha do cliente + autoridade + sugestão',
    'presença atual + otimização + resultado comercial'
  ],
  curiosidade: [
    'pergunta curta + observação + permissão',
    'gancho de curiosidade + detalhe encontrado + convite',
    'abertura humana + ponto de melhoria + conversa rápida'
  ],
  diagnostico: [
    'análise rápida + pontos de melhoria + oferta gratuita',
    'diagnóstico objetivo + comparação com concorrência + próximo passo',
    'leitura comercial + oportunidades + permissão para enviar ideias'
  ]
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
  if (!hasWebsite(lead)) return 'a empresa ainda não parece ter um site próprio para converter pesquisas em contatos';
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
  if (lead.endereco) tags.push('Atuação local identificada');
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
  return (SEGMENT_PLAYBOOKS[segmentGroup] || SEGMENT_PLAYBOOKS.local).benefit;
}

function stableVariantIndex(seed, size) {
  const raw = String(seed || Date.now());
  let total = 0;
  for (let index = 0; index < raw.length; index += 1) total += raw.charCodeAt(index) * (index + 1);
  return Math.abs(total) % Math.max(size, 1);
}

function buildLeadContext(lead = {}, diagnostics = null) {
  const segmentGroup = inferSegmentGroup(lead);
  const playbook = SEGMENT_PLAYBOOKS[segmentGroup] || SEGMENT_PLAYBOOKS.local;
  return {
    nome: lead.nome || 'empresa',
    segmento: lead.segmentoComercial || lead.tipo || lead.segmentoBuscado || 'negócio local',
    segmentoGrupo: segmentGroup,
    endereco: lead.endereco || '',
    telefone: lead.telefone || '',
    site: lead.site || '',
    maps: lead.maps || '',
    score: Number(lead.score || 0),
    probabilidade: lead.probabilidade || '',
    ticketEstimado: lead.ticketEstimado || '',
    dores: Array.isArray(lead.dores) ? lead.dores.slice(0, 5) : [],
    servicos: Array.isArray(lead.servicos) ? lead.servicos.slice(0, 5) : [lead.servico].filter(Boolean),
    playbook,
    diagnostico: diagnostics || null
  };
}

function buildMessage({ lead, strategy, segmentGroup, primaryPain, variationSeed }) {
  const businessName = lead.nome || 'sua empresa';
  const segment = lead.segmentoComercial || lead.tipo || lead.segmentoBuscado || 'negócio local';
  const benefit = segmentBenefit(segmentGroup);
  const playbook = SEGMENT_PLAYBOOKS[segmentGroup] || SEGMENT_PLAYBOOKS.local;
  const variants = STRATEGY_VARIATIONS[strategy.id] || STRATEGY_VARIATIONS.diagnostico;
  const variant = stableVariantIndex(variationSeed, variants.length);

  if (strategy.id === 'consultiva') {
    const messages = [
      `Olá, tudo bem? Encontrei a ${businessName} pesquisando ${segment} na região e vi uma oportunidade bem prática.\n\nO cliente que procura esse tipo de serviço normalmente decide pela confiança que sente antes mesmo de chamar no WhatsApp. No caso da ${businessName}, percebi que ${primaryPain}.\n\nIsso pode fazer algumas pessoas compararem com concorrentes que passam uma primeira impressão mais completa.\n\nEu trabalho ajudando negócios locais a ${benefit}. Posso te enviar 2 ou 3 sugestões específicas para a ${businessName}, sem compromisso?`,
      `Oi, tudo bem? Estava analisando empresas de ${segment} e a ${businessName} chamou minha atenção.\n\nVocês já têm potencial de atrair clientes pela busca local, mas encontrei um ponto que pode melhorar a conversão: ${primaryPain}.\n\nNa prática, quando alguém pesquisa no Google, pequenos detalhes de presença digital podem decidir se a pessoa chama vocês ou outro concorrente.\n\nPosso te mandar um diagnóstico curto com melhorias objetivas para aumentar essa confiança?`,
      `Olá! Vi a ${businessName} enquanto pesquisava opções de ${segment} e notei uma oportunidade comercial.\n\nPara esse segmento, o cliente costuma escolher por ${playbook.angle}. Hoje, ${primaryPain}.\n\nNão estou falando de mudar tudo, mas de ajustar a forma como a empresa aparece e conduz o cliente até o contato.\n\nQuer que eu te envie algumas ideias específicas para aplicar na ${businessName}?`
    ];
    return messages[variant];
  }

  if (strategy.id === 'pas') {
    const messages = [
      `Olá, tudo bem? Fiz uma leitura rápida da presença digital da ${businessName}.\n\nPercebi um ponto que pode estar tirando oportunidades de vocês: ${primaryPain}.\n\nQuando o caminho até o contato não está claro, o cliente interessado pode desistir ou escolher uma empresa que pareça mais fácil de chamar.\n\nPosso te mostrar um diagnóstico simples com ajustes que ajudariam a ${businessName} a receber contatos mais qualificados?`,
      `Oi! Encontrei a ${businessName} pesquisando ${segment} e notei algo importante.\n\nO problema não é aparecer na internet; é transformar essa aparição em contato real. Hoje, ${primaryPain}.\n\nIsso pode gerar perda silenciosa de clientes, principalmente quando eles estão comparando empresas da região.\n\nPosso te enviar uma análise objetiva com o que eu melhoraria primeiro?`,
      `Olá, tudo bem? Posso compartilhar uma observação rápida sobre a ${businessName}?\n\nEm negócios de ${segment}, cada etapa até o WhatsApp precisa ser simples. Quando ${primaryPain}, parte dos clientes acaba indo para outra opção.\n\nExistem ajustes pequenos que podem reduzir essa perda. Posso te mandar 3 sugestões práticas?`
    ];
    return messages[variant];
  }

  if (strategy.id === 'prova-social') {
    const messages = [
      `Olá, tudo bem? Encontrei a ${businessName} e percebi que vocês já têm sinais importantes de presença digital.\n\nEm ${segment}, confiança pesa muito: o cliente olha reputação, aparência online e facilidade de contato antes de decidir.\n\nVi oportunidades para transformar essa confiança em mais conversas comerciais.\n\nPosso te enviar uma análise curta com ideias aplicáveis à realidade da ${businessName}?`,
      `Oi! Vi a ${businessName} e gostei do potencial de presença local de vocês.\n\nPara clientes desse segmento, a decisão geralmente passa por prova social: avaliações, clareza da oferta e facilidade para falar com a empresa.\n\nAcredito que alguns ajustes podem fazer mais pessoas saírem da pesquisa e entrarem em contato.\n\nQuer que eu te mande um diagnóstico rápido?`,
      `Olá! Pesquisando empresas de ${segment}, encontrei a ${businessName}.\n\nVocês já têm elementos que ajudam na confiança, mas dá para deixar a jornada do cliente mais direta até o contato.\n\nMinha ideia é mostrar oportunidades simples para transformar visibilidade em conversas. Posso enviar?`
    ];
    return messages[variant];
  }

  if (strategy.id === 'curiosidade') {
    const messages = [
      `Olá, tudo bem? Posso fazer uma pergunta rápida?\n\nEncontrei a ${businessName} pesquisando empresas da região e notei um detalhe na presença digital que pode estar limitando novos contatos.\n\nÉ algo simples, mas costuma fazer diferença para quem procura ${segment}. Posso te mostrar?`,
      `Oi! Vi a ${businessName} em uma pesquisa local e fiquei com uma observação que talvez ajude vocês a receberem mais contatos.\n\nNão quero te mandar uma proposta genérica. Posso te mostrar primeiro o ponto que encontrei?`,
      `Olá! Achei a ${businessName} pesquisando ${segment} e percebi uma oportunidade que talvez esteja passando despercebida.\n\nPosso te enviar em poucas linhas o que eu ajustaria para facilitar a chegada de novos clientes?`
    ];
    return messages[variant];
  }

  const messages = [
    `Olá, tudo bem? Fiz uma leitura rápida da presença digital da ${businessName}.\n\nEncontrei algumas oportunidades para melhorar a forma como novos clientes encontram e entram em contato com vocês.\n\nMeu trabalho é ajudar negócios locais a ${benefit}, com ajustes práticos em presença digital, Google e canais de contato.\n\nPosso te enviar um diagnóstico gratuito e objetivo com os principais pontos que eu melhoraria na ${businessName}?`,
    `Oi! Analisei rapidamente como a ${businessName} aparece para quem procura ${segment}.\n\nVi oportunidades de melhorar a clareza, a confiança e o caminho até o contato.\n\nIsso costuma ajudar empresas locais a transformar pesquisa em conversa comercial.\n\nPosso enviar um diagnóstico curto com sugestões específicas?`,
    `Olá! Encontrei a ${businessName} e percebi que há espaço para fortalecer a presença digital de forma prática.\n\nA ideia não é complicar, e sim facilitar que quem já está procurando chegue até vocês com mais confiança.\n\nPosso te mandar 3 pontos de melhoria que identifiquei?`
  ];
  return messages[variant];
}

function buildFollowUps(lead = {}, strategy, variationSeed) {
  const businessName = lead.nome || 'sua empresa';
  const variant = stableVariantIndex(variationSeed, 3);
  const day3 = [
    `Oi, tudo bem? Só passando para confirmar se faz sentido eu te enviar as sugestões que identifiquei para a ${businessName}.`,
    `Oi! Vi que talvez minha mensagem tenha se perdido. Quer que eu te envie os pontos de melhoria que encontrei para a ${businessName}?`,
    `Passando rapidamente: posso te mandar o diagnóstico curto que comentei sobre a presença digital da ${businessName}?`
  ][variant];

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
      message: day3
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

function buildSalesApproach(lead = {}, options = {}) {
  const variationSeed = options.variationSeed || options.regenerateKey || `${Date.now()}-${Math.random()}`;
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
    priority: Number(lead.score || 0) >= 80 ? 'Alta' : Number(lead.score || 0) >= 60 ? 'Média' : 'Baixa',
    variant: stableVariantIndex(variationSeed, 99)
  };

  return {
    source: 'local',
    strategy,
    diagnostics,
    leadContext: buildLeadContext(lead, diagnostics),
    abordagem: buildMessage({ lead, strategy, segmentGroup, primaryPain, variationSeed }),
    followUps: buildFollowUps(lead, strategy, variationSeed),
    explanation: [
      `Estratégia escolhida: ${strategy.name}.`,
      `Motivo: ${strategy.reason}`,
      `Dor principal usada na mensagem: ${primaryPain}.`,
      `Variação gerada: ${diagnostics.variant}.`
    ]
  };
}

module.exports = {
  buildSalesApproach,
  buildLeadContext,
  chooseStrategy,
  inferSegmentGroup,
  inferOpportunityTags,
  getPrimaryPain,
  stableVariantIndex
};
