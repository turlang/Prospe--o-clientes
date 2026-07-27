/**
 * @fileoverview Serviço de domínio `commercialPromptEngine` responsável por regras comerciais reutilizáveis.
 *
 * Responsabilidade delimitada conforme a arquitetura descrita em
 * `docs/ARQUITETURA.md`. Alterações neste arquivo devem preservar os contratos
 * documentados e ser acompanhadas por testes quando afetarem regras de negócio.
 *
 * @module src/services/commercialPromptEngine
 */

/**
 * commercialPromptEngine.js
 * -----------------------------------------------------------------------------
 * Prompt Engine Comercial V20.6.
 *
 * Este módulo transforma dados brutos do lead em um briefing comercial antes de
 * chamar a IA. A abordagem deixa de ser um pedido genérico e passa a ser baseada
 * em diagnóstico, estratégia, histórico e objetivo de canal.
 */

const SYSTEM_PROMPT = [
  'Você é um vendedor consultivo extremamente experiente em vender serviços tecnológicos para pequenos negócios brasileiros.',
  'Você sabe conversar com donos de barbearias, clínicas, restaurantes, lojas e prestadores de serviço que geralmente não dominam termos técnicos.',
  'Sua missão é aproximar a tecnologia da realidade do cliente, usando linguagem simples, humana, comercial e fácil de entender.',
  'Você nunca deve inventar dados, resultados, clientes, reuniões, cases, nomes de pessoas ou informações que não estejam no briefing.',
  'Você não fala como técnico e não usa jargões. Você fala como um vendedor maduro que entende o negócio do lead e quer abrir uma conversa útil.',
  'Você evita pressão, evita promessa exagerada e transforma tecnologia em benefício prático: mais chamadas no WhatsApp, mais confiança, mais agendamentos, mais pedidos ou mais orçamentos.',
  'Escreva em português do Brasil, com tom natural, próximo, respeitoso e comercial.'
].join('\n');

const CHANNEL_RULES = {
  whatsapp: [
    'Canal: WhatsApp.',
    'A mensagem deve ser curta, com 4 a 7 linhas no máximo.',
    'Use frases simples, como uma conversa real entre vendedor e dono do negócio.',
    'Evite formalidade excessiva e qualquer termo técnico.',
    'Use no máximo um emoji, e somente se fizer sentido.',
    'Termine com uma pergunta simples que facilite resposta.'
  ],
  email: [
    'Canal: E-mail.',
    'Crie uma mensagem com assunto sugerido e corpo objetivo.',
    'Use uma estrutura clara: contexto, observação, oportunidade e convite.',
    'Evite parecer newsletter, mala direta ou proposta técnica.'
  ],
  call: [
    'Canal: ligação.',
    'Crie um roteiro breve de abertura para ligação comercial.',
    'Inclua uma frase para pedir permissão antes de explicar a oportunidade.',
    'Evite monólogo longo.',
    'A resposta deve parecer um script falado, com pausas e pergunta de confirmação.'
  ],
  objection: [
    'Canal: tratamento de objeção.',
    'Crie uma resposta para quando o lead disser que não tem interesse, já tem fornecedor, está sem tempo ou achou caro.',
    'A resposta deve acolher a objeção, reduzir resistência e abrir uma próxima conversa sem insistência.',
    'Não pressione, não discuta preço e não desqualifique fornecedores atuais.'
  ],
  followup: [
    'Canal: follow-up.',
    'Crie uma mensagem curta para retomar contato depois de uma primeira abordagem sem resposta.',
    'Não cobre retorno. Reforce uma observação útil e faça uma pergunta simples.',
    'A mensagem deve ser diferente da abordagem anterior.'
  ],
  proposal: [
    'Canal: proposta curta.',
    'Crie uma mensagem para levar o lead a aceitar uma conversa ou diagnóstico, sem enviar preço fechado.',
    'Mostre o próximo passo de forma simples e segura.',
    'Evite termos como contrato, implantação, escopo técnico ou automação.'
  ],
  generic: [
    'Canal: mensagem inicial genérica para WhatsApp ou e-mail curto.',
    'Priorize naturalidade e clareza.',
    'A mensagem deve ser pronta para copiar e enviar.'
  ]
};

const MODE_RULES = {
  new: [
    'Objetivo: criar a primeira abordagem comercial.',
    'Não trate como follow-up.',
    'A primeira frase precisa demonstrar que o lead foi analisado.'
  ],
  variant: [
    'Objetivo: criar uma nova versão significativamente diferente da anterior.',
    'Mude a abertura, o argumento central e a chamada final.',
    'Não repita frases, estrutura ou gatilhos da abordagem anterior.'
  ],
  improve: [
    'Objetivo: melhorar a abordagem anterior.',
    'Mantenha o contexto do lead, mas torne a mensagem mais específica, natural e persuasiva.',
    'Remova clichês, frases longas e qualquer tom genérico.'
  ],
  followup: [
    'Objetivo: criar um follow-up respeitoso.',
    'Considere que já houve uma tentativa anterior.',
    'Não cobre resposta de forma agressiva.'
  ]
};

const STRATEGY_PLAYBOOK = {
  consultiva: [
    'Estratégia: Consultiva.',
    'Comece com uma observação real sobre a empresa.',
    'Mostre a oportunidade sem acusar o lead de estar fazendo algo errado.',
    'Ofereça ajuda primeiro, venda depois.'
  ],
  pas: [
    'Estratégia: PAS.',
    'Apresente o problema de forma leve.',
    'Mostre a consequência comercial sem criar medo artificial.',
    'Apresente a solução como diagnóstico ou sugestão prática.'
  ],
  aida: [
    'Estratégia: AIDA.',
    'Atenção: observação específica.',
    'Interesse: por que isso importa para o negócio.',
    'Desejo: benefício prático.',
    'Ação: convite simples.'
  ],
  spin: [
    'Estratégia: SPIN Selling.',
    'Use uma pergunta inteligente para abrir conversa.',
    'Não tente fechar venda na primeira mensagem.',
    'Conduza o lead a reconhecer a oportunidade.'
  ],
  curiosidade: [
    'Estratégia: Curiosidade.',
    'Use uma abertura curta e intrigante.',
    'Não revele tudo de uma vez.',
    'Peça permissão para compartilhar a observação.'
  ],
  diagnostico: [
    'Estratégia: Observação prática antes da venda.',
    'Ofereça uma análise curta e objetiva, sem parecer relatório técnico.',
    'Mostre que a análise será específica para a empresa e fácil de entender.',
    'Não prometa resultado financeiro e não use linguagem técnica.'
  ],
  'prova-social': [
    'Estratégia: Prova social ética.',
    'Use confiança, reputação e jornada do cliente como argumento.',
    'Não invente cases ou números.',
    'Mostre que negócios desse segmento dependem de credibilidade digital.'
  ]
};

function normalizeMode(mode = 'new') {
  const value = String(mode || 'new').toLowerCase();
  return MODE_RULES[value] ? value : 'new';
}

function normalizeChannel(channel = 'generic') {
  const value = String(channel || 'generic').toLowerCase();
  return CHANNEL_RULES[value] ? value : 'generic';
}

function getCommercialMemory(lead = {}) {
  const interactions = Array.isArray(lead.interacoes) ? lead.interacoes : [];
  const approachEvents = interactions
    .filter((item) => ['ABORDAGEM_IA_GERADA', 'ABORDAGEM_GERADA', 'RESPOSTA_RECEBIDA', 'FOLLOWUP_AGENDADO', 'STATUS_ATUALIZADO'].includes(item.tipo))
    .slice(-8)
    .map((item) => ({
      data: item.data || item.createdAt || '',
      tipo: item.tipo || '',
      status: item.status || '',
      strategy: item.strategy || item.estrategia || '',
      provider: item.provider || '',
      resumo: item.resumo || item.proximoPasso || item.intencao || '',
      mensagem: String(item.mensagem || item.abordagem || item.respostaSugerida || '').slice(0, 900)
    }));

  return {
    totalInteractions: interactions.length,
    recentEvents: approachEvents,
    lastApproach: approachEvents.slice().reverse().find((item) => item.mensagem)?.mensagem || ''
  };
}

function buildCommercialProfile({ lead = {}, leadContext = {}, localRecommendation = {} }) {
  const diagnostics = localRecommendation.diagnostics || leadContext.diagnostico || {};
  const score = Number(diagnostics.score ?? lead.score ?? leadContext.score ?? 0);
  const hasWebsite = Boolean(diagnostics.hasWebsite ?? lead.site ?? leadContext.site);
  const hasWhatsapp = Boolean(diagnostics.hasWhatsapp ?? lead.telefone ?? leadContext.telefone);
  const hasSocialPresence = Boolean(diagnostics.hasSocialPresence);
  const opportunityTags = Array.isArray(diagnostics.opportunityTags) ? diagnostics.opportunityTags : [];
  const primaryPain = diagnostics.primaryPain || (Array.isArray(lead.dores) ? lead.dores[0] : '') || 'oportunidade de facilitar que mais clientes entendam a empresa e chamem no WhatsApp';

  let maturity = 'Inicial';
  if (hasWebsite && hasSocialPresence && hasWhatsapp) maturity = 'Boa';
  else if ((hasWebsite || hasSocialPresence) && hasWhatsapp) maturity = 'Média';

  let conversionProbability = 'Média';
  if (score >= 80) conversionProbability = 'Alta';
  else if (score < 55) conversionProbability = 'Baixa';

  return {
    empresa: leadContext.nome || lead.nome || 'empresa',
    segmento: leadContext.segmento || lead.segmentoComercial || lead.tipo || lead.segmentoBuscado || 'negócio local',
    segmentoGrupo: leadContext.segmentoGrupo || diagnostics.segmentGroup || 'local',
    endereco: leadContext.endereco || lead.endereco || '',
    scoreComercial: score,
    maturidadeDigital: maturity,
    probabilidadeConversao: conversionProbability,
    possuiSite: hasWebsite,
    possuiWhatsAppOuTelefone: hasWhatsapp,
    possuiPresencaSocial: hasSocialPresence,
    dorPrincipal: primaryPain,
    oportunidades: opportunityTags,
    servicosSugeridos: leadContext.servicos || lead.servicos || [lead.servico].filter(Boolean),
    beneficioMaisForte: leadContext.playbook?.benefit || '',
    anguloComercial: leadContext.playbook?.angle || '',
    ticketEstimado: leadContext.ticketEstimado || lead.ticketEstimado || '',
    probabilidade: leadContext.probabilidade || lead.probabilidade || ''
  };
}

function buildPromptPayload({ lead = {}, leadContext = {}, localRecommendation = {}, mode = 'new', channel = 'generic', regenerateKey = '', previousApproach = '' }) {
  const normalizedMode = normalizeMode(mode);
  const normalizedChannel = normalizeChannel(channel);
  const strategy = localRecommendation.strategy || { id: 'diagnostico', name: 'Observação prática', reason: 'gera confiança antes da venda' };
  const strategyRules = STRATEGY_PLAYBOOK[strategy.id] || STRATEGY_PLAYBOOK.diagnostico;
  const profile = buildCommercialProfile({ lead, leadContext, localRecommendation });
  const memory = getCommercialMemory(lead);
  const lastApproach = previousApproach || memory.lastApproach || '';

  return {
    systemPrompt: SYSTEM_PROMPT,
    instructions: [
      ...MODE_RULES[normalizedMode],
      ...CHANNEL_RULES[normalizedChannel],
      ...strategyRules,
      'Regras de qualidade:',
      '- Escreva como um vendedor de serviços tecnológicos muito experiente, não como um analista técnico.',
      '- O lead provavelmente não entende termos como SEO, funil, conversão, tráfego, presença digital, landing page, automação ou CRM. Evite esses termos ou traduza para algo simples.',
      '- Troque termos técnicos por benefícios claros: mais clientes chamando, mais confiança antes do contato, mais agendamentos, mais pedidos, mais orçamentos, menos gente desistindo antes de falar com a empresa.',
      '- Não use: “Espero que esteja bem”, “venho apresentar”, “soluções digitais”, “aumentar sua presença online”, “otimizar conversão”, “jornada digital” ou frases parecidas.',
      '- Não diga que fez uma análise profunda se os dados são limitados; use “dei uma olhada rápida” ou “observei um ponto simples”.',
      '- Não invente avaliações, redes sociais, faturamento, dores ou dados que não estejam no briefing.',
      '- A abordagem deve mencionar a empresa pelo nome quando disponível.',
      '- A mensagem precisa soar como alguém que entende o dia a dia do negócio e quer ajudar, não como anúncio.',
      '- Use palavras comuns: cliente, chamada no WhatsApp, orçamento, agendamento, pedido, confiança, escolha, concorrente, indicação.',
      '- Termine com uma pergunta de baixa fricção.'
    ],
    strategy,
    profile,
    memory,
    previousApproach: lastApproach,
    localReference: {
      abordagem: localRecommendation.abordagem || '',
      diagnostics: localRecommendation.diagnostics || {},
      explanation: localRecommendation.explanation || []
    },
    outputSchema: {
      abordagem: 'mensagem final pronta para enviar',
      strategy: { id: 'id da estratégia', name: 'nome', reason: 'motivo comercial' },
      diagnostics: {
        primaryPain: 'dor principal usada',
        priority: 'Alta|Média|Baixa',
        opportunityTags: ['tags de oportunidade'],
        recommendedChannel: 'whatsapp|email|call',
        tone: 'tom recomendado'
      },
      followUps: [
        { day: 3, title: 'título', objective: 'objetivo', message: 'mensagem pronta' }
      ],
      explanation: ['por que a abordagem se aproxima deste lead'],
      channelUse: 'onde usar esta peça: WhatsApp, e-mail, ligação, objeção, follow-up ou proposta',
      qualityChecklist: ['itens de qualidade atendidos']
    },
    regenerateKey
  };
}

function buildCommercialPrompt(args = {}) {
  const payload = buildPromptPayload(args);
  const sections = [
    payload.systemPrompt,
    '',
    'Tarefa:',
    'Crie uma abordagem comercial personalizada com base no briefing abaixo.',
    'A resposta deve ser útil para um vendedor real iniciar conversa com este lead.',
    'O tom deve ser de um vendedor de tecnologia experiente que fala simples com quem não é da área técnica.',
    '',
    'Instruções obrigatórias:',
    payload.instructions.map((item) => `- ${item}`).join('\n'),
    '',
    'Briefing comercial do lead:',
    JSON.stringify(payload.profile, null, 2),
    '',
    'Estratégia recomendada pelo motor local:',
    JSON.stringify(payload.strategy, null, 2),
    '',
    'Memória comercial do lead:',
    JSON.stringify(payload.memory, null, 2),
    '',
    payload.previousApproach
      ? `Abordagem anterior que deve ser evitada ou melhorada:\n${payload.previousApproach}`
      : 'Não há abordagem anterior registrada. Gere uma primeira mensagem original.',
    '',
    'Referência local apenas como apoio, não copie literalmente:',
    JSON.stringify(payload.localReference, null, 2),
    '',
    'Retorne SOMENTE JSON válido seguindo este formato:',
    JSON.stringify(payload.outputSchema, null, 2),
    '',
    `regenerateKey: ${payload.regenerateKey || Date.now()}`
  ];

  return sections.join('\n');
}

module.exports = {
  SYSTEM_PROMPT,
  CHANNEL_RULES,
  MODE_RULES,
  STRATEGY_PLAYBOOK,
  normalizeMode,
  normalizeChannel,
  getCommercialMemory,
  buildCommercialProfile,
  buildPromptPayload,
  buildCommercialPrompt
};
