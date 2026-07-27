/**
 * @fileoverview Serviço de domínio `salesStrategyEngine` responsável por regras comerciais reutilizáveis.
 *
 * Responsabilidade delimitada conforme a arquitetura descrita em
 * `docs/ARQUITETURA.md`. Alterações neste arquivo devem preservar os contratos
 * documentados e ser acompanhadas por testes quando afetarem regras de negócio.
 *
 * @module src/services/salesStrategyEngine
 */

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
  if (!hasWebsite(lead)) return 'quem procura vocês no Google pode não encontrar um caminho claro para chamar ou pedir orçamento';
  if (!hasWhatsapp(lead)) return 'o cliente pode não encontrar rapidamente como chamar vocês no WhatsApp';
  if (!hasSocialPresence(lead)) return 'a primeira impressão antes do contato pode ficar mais forte e mais clara';
  return 'existem pontos simples para facilitar que mais clientes chamem vocês';
}

function inferOpportunityTags(lead = {}) {
  const tags = [];
  if (!hasWebsite(lead)) tags.push('Sem site próprio');
  if (hasWhatsapp(lead)) tags.push('Possui canal de WhatsApp/telefone');
  if (hasSocialPresence(lead)) tags.push('Possui presença social');
  if (Number(lead.score || 0) >= 80) tags.push('Alta prioridade comercial');
  if (Array.isArray(lead.dores) && lead.dores.length) tags.push('Pontos de melhoria detectados');
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
      reason: 'a empresa tem potencial, mas pode perder clientes porque algumas pessoas não encontram informações claras antes de chamar.'
    };
  }

  if (!website || !whatsapp) {
    return {
      id: 'pas',
      name: 'PAS — Problema, Agitação e Solução',
      reason: 'existe um ponto simples que pode estar fazendo interessados desistirem antes de chamar.'
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
    reason: 'uma conversa baseada em observação simples gera confiança antes de vender.'
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
  const playbook = SEGMENT_PLAYBOOKS[segmentGroup] || SEGMENT_PLAYBOOKS.local;
  const variants = STRATEGY_VARIATIONS[strategy.id] || STRATEGY_VARIATIONS.diagnostico;
  const variant = stableVariantIndex(variationSeed, variants.length);

  if (strategy.id === 'consultiva') {
    const messages = [
      `Olá! Encontrei a ${businessName} pesquisando opções de ${segment} na região e percebi um ponto simples que pode ajudar.\n\nHoje muita gente decide com quem falar antes mesmo de chamar no WhatsApp. No caso da ${businessName}, notei que ${primaryPain}.\n\nIsso pode fazer alguns clientes escolherem outro lugar só porque encontraram as informações com mais facilidade.\n\nEu ajudo empresas locais a usar a tecnologia de um jeito simples para receber mais chamadas e pedidos de orçamento. Posso te mandar 2 ou 3 ideias bem práticas para a ${businessName}?`,
      `Oi! Dei uma olhada rápida na ${businessName} e vi uma oportunidade que pode fazer diferença no dia a dia.\n\nQuando alguém procura por ${segment}, normalmente escolhe quem passa confiança e facilita o contato. Percebi que ${primaryPain}.\n\nNão é algo complicado de resolver. São ajustes pequenos que podem ajudar mais pessoas a chamar vocês.\n\nQuer que eu te envie algumas sugestões simples e específicas para a ${businessName}?`,
      `Olá! Vi a ${businessName} enquanto pesquisava empresas de ${segment} e achei que vale compartilhar uma observação.\n\nNesse tipo de negócio, o cliente costuma escolher por ${playbook.angle}. Hoje, ${primaryPain}.\n\nMeu trabalho é deixar esse caminho mais fácil: a pessoa encontra, entende, confia e chama.\n\nPosso te mostrar em poucas linhas o que eu faria primeiro?`
    ];
    return messages[variant];
  }

  if (strategy.id === 'pas') {
    const messages = [
      `Olá! Dei uma olhada rápida na ${businessName} e percebi um ponto que pode estar fazendo alguns clientes desistirem antes de chamar.\n\nHoje, ${primaryPain}.\n\nQuando a pessoa tem dúvida ou não encontra o caminho fácil para falar com a empresa, ela acaba procurando outra opção.\n\nPosso te enviar 3 ajustes simples para ajudar a ${businessName} a receber mais contatos?`,
      `Oi! Encontrei a ${businessName} pesquisando ${segment} e notei algo importante.\n\nÀs vezes o problema não é falta de cliente. É o cliente não encontrar rápido como confiar e chamar vocês. No caso da ${businessName}, ${primaryPain}.\n\nIsso pode estar custando chamadas e pedidos de orçamento sem ninguém perceber.\n\nQuer que eu te mostre uma ideia simples para melhorar isso?`,
      `Olá! Posso compartilhar uma observação rápida sobre a ${businessName}?\n\nEm negócios de ${segment}, cada detalhe antes do contato conta. Quando ${primaryPain}, parte dos clientes pode ir para outro concorrente.\n\nExistem ajustes simples, sem complicar sua rotina. Posso te mandar os principais?`
    ];
    return messages[variant];
  }

  if (strategy.id === 'prova-social') {
    const messages = [
      `Olá! Encontrei a ${businessName} e vi que existe uma boa oportunidade de transformar confiança em mais contatos.\n\nEm ${segment}, as pessoas costumam observar reputação, aparência das informações e facilidade para chamar antes de decidir.\n\nCom alguns ajustes simples, dá para ajudar mais clientes a sentirem segurança e entrarem em contato.\n\nPosso te enviar uma análise curta com ideias para a ${businessName}?`,
      `Oi! Vi a ${businessName} e percebi um potencial interessante.\n\nPara clientes desse segmento, confiança pesa muito: eles querem saber se a empresa é boa, se atende bem e se é fácil falar com alguém.\n\nA tecnologia pode ajudar nisso sem virar algo complicado.\n\nQuer que eu te mande algumas sugestões práticas?`,
      `Olá! Pesquisando empresas de ${segment}, encontrei a ${businessName}.\n\nVocês já têm elementos que passam confiança, mas dá para deixar mais claro para o cliente por que escolher vocês e como chamar rapidamente.\n\nPosso te enviar 3 ideias simples para melhorar esse primeiro contato?`
    ];
    return messages[variant];
  }

  if (strategy.id === 'curiosidade') {
    const messages = [
      `Olá! Posso fazer uma pergunta rápida?\n\nEncontrei a ${businessName} pesquisando empresas da região e notei um detalhe simples que pode estar atrapalhando a chegada de novos clientes.\n\nÉ algo bem prático para quem procura ${segment}. Posso te mostrar?`,
      `Oi! Vi a ${businessName} em uma busca local e tenho uma observação que talvez ajude vocês a receberem mais chamadas.\n\nNão quero te mandar uma proposta pronta. Prefiro te mostrar primeiro o ponto que encontrei.\n\nPosso enviar?`,
      `Olá! Achei a ${businessName} pesquisando ${segment} e percebi uma oportunidade que talvez esteja passando despercebida.\n\nPosso te explicar em poucas linhas o que eu ajustaria para facilitar a chegada de novos clientes?`
    ];
    return messages[variant];
  }

  const messages = [
    `Olá! Dei uma olhada rápida na ${businessName} e encontrei alguns pontos que podem ajudar mais clientes a chamar vocês.\n\nMeu trabalho é usar tecnologia de forma simples para negócios locais: melhorar como a empresa aparece, facilitar o contato e passar mais confiança antes da primeira conversa.\n\nPosso te enviar uma análise curta com os principais pontos que eu melhoraria na ${businessName}?`,
    `Oi! Analisei rapidamente como a ${businessName} aparece para quem procura ${segment}.\n\nVi oportunidades de deixar as informações mais claras e o contato mais fácil para o cliente.\n\nIsso costuma ajudar empresas locais a receber mais chamadas no WhatsApp e pedidos de orçamento.\n\nQuer que eu te mande algumas sugestões específicas?`,
    `Olá! Encontrei a ${businessName} e percebi que alguns ajustes simples podem facilitar a chegada de novos clientes.\n\nA ideia não é complicar, nem falar de tecnologia difícil. É ajudar quem já está procurando a entender melhor vocês e chamar com mais confiança.\n\nPosso te mandar 3 pontos que eu melhoraria primeiro?`
  ];
  return messages[variant];
}

function buildFollowUps(lead = {}, strategy, variationSeed) {
  const businessName = lead.nome || 'sua empresa';
  const variant = stableVariantIndex(variationSeed, 3);
  const day3 = [
    `Oi, tudo bem? Só passando para confirmar se faz sentido eu te enviar as sugestões que identifiquei para a ${businessName}.`,
    `Oi! Vi que talvez minha mensagem tenha se perdido. Quer que eu te envie os pontos de melhoria que encontrei para a ${businessName}?`,
    `Passando rapidamente: posso te mandar a análise curta que comentei sobre como facilitar a chegada de clientes para a ${businessName}?`
  ][variant];

  return [
    {
      day: 1,
      title: 'Mensagem inicial',
      objective: 'abrir conversa com uma observação simples e contextual',
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
      message: 'Enviar uma dica simples sobre Google, informações da empresa ou WhatsApp com base na principal oportunidade detectada.'
    },
    {
      day: 12,
      title: 'Convite para diagnóstico',
      objective: 'converter interesse em conversa',
      message: 'Oferecer uma conversa rápida de 10 minutos para mostrar os pontos de melhoria.'
    },
    {
      day: 20,
      title: 'Encerramento elegante',
      objective: 'manter porta aberta',
      message: 'Encerrar a sequência de forma cordial e deixar abertura para contato futuro.'
    }
  ].map((step) => ({ ...step, strategy: strategy.name }));
}


function adaptMessageToChannel(message, lead = {}, channel = 'generic', mode = 'new') {
  const businessName = lead.nome || 'sua empresa';
  const segment = lead.segmentoComercial || lead.tipo || lead.segmentoBuscado || 'negócio local';
  const clean = String(message || '').trim();

  if (channel === 'email') {
    return `Assunto: Ideias simples para facilitar novos contatos na ${businessName}\n\nOlá, tudo bem?\n\n${clean}\n\nSe fizer sentido, posso te enviar uma análise curta com 2 ou 3 pontos bem práticos.\n\nAbraço.`;
  }

  if (channel === 'call') {
    return `Roteiro de ligação:\n\n1. Olá, falo com alguém responsável pela ${businessName}?\n\n2. Meu nome é [seu nome]. Encontrei a empresa pesquisando ${segment} na região e percebi uma oportunidade simples para facilitar que mais clientes chamem vocês.\n\n3. Posso te explicar em 30 segundos o que observei?\n\n4. Se a pessoa permitir: ${clean.replace(/\n+/g, ' ')}\n\n5. Fechamento: faz sentido eu te enviar isso por WhatsApp para você olhar com calma?`;
  }

  if (channel === 'objection') {
    return `Entendo perfeitamente. Minha ideia não é te pressionar nem substituir algo que já funciona na ${businessName}.\n\nO ponto é só te mostrar uma visão simples de fora: às vezes existem pequenos ajustes que ajudam mais clientes a confiar e chamar vocês com menos dúvida.\n\nPosso te mandar essa observação de forma bem resumida, sem compromisso?`;
  }

  if (channel === 'followup' || mode === 'followup') {
    return `Oi! Passando rapidamente só para retomar minha mensagem sobre a ${businessName}.\n\nA ideia era te mostrar um ponto simples que pode facilitar a chegada de novos clientes, sem complicar a rotina de vocês.\n\nQuer que eu te envie em poucas linhas o que eu observei?`;
  }

  if (channel === 'proposal') {
    return `Pelo que vi da ${businessName}, eu começaria com um diagnóstico curto e bem prático: o que o cliente encontra hoje, onde pode ter dúvida e como facilitar o primeiro contato.\n\nA partir disso, dá para sugerir melhorias simples para gerar mais chamadas, orçamentos ou agendamentos.\n\nSe fizer sentido, posso montar essa primeira análise para vocês avaliarem com calma.`;
  }

  if (channel === 'whatsapp') {
    return clean
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .slice(0, 4)
      .join('\n\n');
  }

  return clean;
}

function buildSalesApproach(lead = {}, options = {}) {
  const variationSeed = options.variationSeed || options.regenerateKey || `${Date.now()}-${Math.random()}`;
  const channel = String(options.channel || 'generic').toLowerCase();
  const mode = String(options.mode || 'new').toLowerCase();
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

  const baseMessage = buildMessage({ lead, strategy, segmentGroup, primaryPain, variationSeed });

  return {
    source: 'local',
    strategy,
    diagnostics: { ...diagnostics, recommendedChannel: channel },
    leadContext: buildLeadContext(lead, diagnostics),
    abordagem: adaptMessageToChannel(baseMessage, lead, channel, mode),
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
  stableVariantIndex,
  adaptMessageToChannel
};
