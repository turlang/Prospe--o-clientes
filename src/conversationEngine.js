/**
 * conversationEngine.js
 * -----------------------------------------------------------------------------
 * Módulo responsável pela estratégia de comunicação comercial do agente.
 *
 * Boa prática aplicada:
 * - Separação de responsabilidades: regras de mensagem e resposta ficam isoladas.
 * - Baixo acoplamento: o restante do sistema apenas chama funções públicas.
 * - Linguagem orientada a valor: evita termos técnicos como "full stack" e foca no
 *   problema do cliente: presença digital, captação e atendimento.
 * - Prospecção responsável: o sistema gera mensagens para revisão humana e não faz
 *   disparo massivo automático.
 */

const POSITIVE_TERMS = [
  'sim', 'pode', 'claro', 'manda', 'mandar', 'envia', 'enviar', 'quero',
  'tenho interesse', 'interesse', 'me mostra', 'mostra', 'ok', 'beleza'
];

const PRICE_TERMS = ['quanto custa', 'valor', 'preço', 'preco', 'orçamento', 'orcamento'];
const WHAT_TERMS = ['o que', 'quais', 'como assim', 'que melhoria', 'o que encontrou'];
const NEGATIVE_TERMS = ['não tenho interesse', 'nao tenho interesse', 'não quero', 'nao quero', 'sem interesse', 'agora não', 'agora nao'];

function buildInitialMessage(lead) {
  const score = Number(lead.score || 0);
  const leadName = lead.nome ? ` da ${lead.nome}` : ' da sua empresa';

  if (score >= 80) {
    return `Olá, tudo bem?\n\nAnalisei rapidamente a presença digital${leadName} e identifiquei oportunidades que podem ajudar na captação de novos clientes.\n\nPosso compartilhar uma análise rápida e gratuita?`;
  }

  if (score >= 50) {
    return `Olá, tudo bem?\n\nEstava analisando a presença digital${leadName} e notei algumas melhorias que podem facilitar o contato com novos clientes.\n\nPosso lhe enviar uma análise resumida?`;
  }

  return `Olá, tudo bem?\n\nEncontrei sua empresa durante uma análise de negócios da região e identifiquei oportunidades para fortalecer sua presença online.\n\nPosso compartilhar uma análise rápida e sem compromisso?`;
}

function buildPositiveReply(lead) {
  const problems = Array.isArray(lead.dores) && lead.dores.length
    ? lead.dores.slice(0, 3)
    : ['presença online', 'captação de contatos', 'experiência do cliente'];

  const services = Array.isArray(lead.servicos) && lead.servicos.length
    ? lead.servicos.slice(0, 3)
    : ['website personalizado', 'página de captação', 'melhoria no atendimento digital'];

  return `Ótimo! Fiz uma análise inicial e separei alguns pontos que podem gerar oportunidade para o negócio:\n\n${problems.map((item) => `• ${item}`).join('\n')}\n\nCom base nisso, eu sugeriria avaliar:\n${services.map((item) => `• ${item}`).join('\n')}\n\nPosso te explicar por mensagem ou prefere uma conversa rápida de 10 minutos?`;
}

function buildPriceReply() {
  return 'O valor depende do objetivo e da necessidade do projeto. Antes de falar em orçamento, prefiro entender rapidamente o que faria mais sentido para a empresa, assim evito sugerir algo desnecessário. Posso fazer 2 perguntas rápidas?';
}

function buildWhatFoundReply(lead) {
  const problems = Array.isArray(lead.dores) && lead.dores.length
    ? lead.dores.slice(0, 3).map((item) => `• ${item}`).join('\n')
    : '• oportunidades de melhoria na presença online\n• possíveis melhorias na captação de contatos\n• ajustes na experiência de quem visita o site';

  return `Identifiquei alguns pontos ligados à presença digital e à geração de contatos. Em resumo:\n\n${problems}\n\nA ideia não é vender algo pronto, mas mostrar onde um website ou solução digital personalizada poderia ajudar o negócio.`;
}

function buildNegativeReply() {
  return 'Sem problemas. Agradeço pela atenção e desejo muito sucesso para a empresa. Caso precise de algum website ou solução digital personalizada no futuro, fico à disposição.';
}

function analyzeLeadResponse(text, lead = {}) {
  const normalized = normalize(text);

  if (!normalized) {
    return {
      intent: 'SEM_RESPOSTA',
      status: lead.status || 'CONTATADO',
      proximoPasso: 'Aguardar resposta ou realizar follow-up posteriormente.',
      respostaSugerida: ''
    };
  }

  if (containsAny(normalized, NEGATIVE_TERMS)) {
    return {
      intent: 'NEGATIVA',
      status: 'PERDIDO',
      proximoPasso: 'Encerrar contato de forma educada e manter registro no CRM.',
      respostaSugerida: buildNegativeReply()
    };
  }

  if (containsAny(normalized, PRICE_TERMS)) {
    return {
      intent: 'PRECO',
      status: 'QUALIFICANDO',
      proximoPasso: 'Fazer perguntas de qualificação antes de enviar orçamento.',
      respostaSugerida: buildPriceReply()
    };
  }

  if (containsAny(normalized, WHAT_TERMS)) {
    return {
      intent: 'PEDIU_DETALHES',
      status: 'INTERESSADO',
      proximoPasso: 'Enviar resumo do diagnóstico e tentar conduzir para reunião curta.',
      respostaSugerida: buildWhatFoundReply(lead)
    };
  }

  if (containsAny(normalized, POSITIVE_TERMS)) {
    return {
      intent: 'POSITIVA',
      status: 'INTERESSADO',
      proximoPasso: 'Enviar análise resumida e sugerir conversa rápida de 10 minutos.',
      respostaSugerida: buildPositiveReply(lead)
    };
  }

  return {
    intent: 'NEUTRA',
    status: 'RESPONDEU',
    proximoPasso: 'Responder com cordialidade, esclarecer a proposta e buscar autorização para enviar a análise.',
    respostaSugerida: 'Obrigado pelo retorno. A ideia é compartilhar uma análise rápida, sem compromisso, mostrando alguns pontos de melhoria que podem fortalecer a presença digital da empresa. Posso enviar?'
  };
}

function containsAny(text, terms) {
  return terms.some((term) => text.includes(term));
}

function normalize(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

module.exports = {
  buildInitialMessage,
  analyzeLeadResponse
};
