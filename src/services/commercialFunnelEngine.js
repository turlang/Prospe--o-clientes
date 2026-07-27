/**
 * @fileoverview Motor determinístico de inteligência comercial e automação de funil.
 *
 * Este serviço concentra três responsabilidades de domínio que precisam produzir
 * o mesmo resultado em qualquer interface do LeadHunter Pro:
 * 1. criar uma abordagem inicial curta, humana e sem jargão;
 * 2. mapear os canais públicos disponíveis para o primeiro contato;
 * 3. recomendar e descrever a próxima ação operacional do funil.
 *
 * O motor não envia mensagens sozinho e não afirma que um número está ativo sem
 * uma integração oficial de verificação. Ele prepara a ação e registra tarefas
 * para revisão humana, preservando rastreabilidade e segurança comercial.
 *
 * @module src/services/commercialFunnelEngine
 */

const { normalizeLeadStatus } = require('../domain/leadStatus');

const PROHIBITED_EXPRESSIONS = Object.freeze([
  'presença digital',
  'presenca digital',
  'otimização',
  'otimizacao',
  'seo',
  'tráfego orgânico',
  'trafego organico',
  'ponto cego',
  'landing page',
  'funil',
  'conversão',
  'conversao',
  'crm',
  'automação',
  'automacao',
  'website',
  'feedback',
  'follow-up',
  'business',
  'customer',
  'meeting',
  'schedule',
  'dashboard',
  'pipeline',
  'marketing'
]);

const LANGUAGE_REPLACEMENTS = Object.freeze([
  [/\bpresen[cç]a digital\b/gi, 'forma como a empresa aparece para o cliente'],
  [/\botimiza(?:ç[aã]o|r|do|da)\b/gi, 'melhoria'],
  [/\bseo\b/gi, 'facilidade para ser encontrado'],
  [/\btr[aá]fego org[aâ]nico\b/gi, 'pessoas que encontram a empresa pelo Google'],
  [/\bponto cego\b/gi, 'detalhe que pode estar passando despercebido'],
  [/\blanding page\b/gi, 'página simples com as informações e o botão de contato'],
  [/\bfunil\b/gi, 'etapa comercial'],
  [/\bconvers[aã]o\b/gi, 'contatos que viram clientes'],
  [/\bcrm\b/gi, 'cadastro comercial'],
  [/\bautoma(?:ç[aã]o|tizado|tizada)\b/gi, 'organização automática'],
  [/\bdentist\b/gi, 'dentista'],
  [/\bdental clinic\b/gi, 'clínica odontológica'],
  [/\bbeauty salon\b/gi, 'salão de beleza'],
  [/\bbarbershop\b/gi, 'barbearia'],
  [/\brestaurant\b/gi, 'restaurante'],
  [/\bstore\b/gi, 'loja'],
  [/\bclinic\b/gi, 'clínica'],
  [/\bwebsite\b/gi, 'site'],
  [/\bleads?\b/gi, 'possível cliente'],
  [/\bfeedback\b/gi, 'retorno'],
  [/\bfollow[ -]?up\b/gi, 'retorno'],
  [/\bbusiness\b/gi, 'empresa'],
  [/\bcustomer\b/gi, 'cliente'],
  [/\bmeeting\b/gi, 'reunião'],
  [/\bschedule\b/gi, 'agenda'],
  [/\bdashboard\b/gi, 'painel'],
  [/\bpipeline\b/gi, 'etapas comerciais'],
  [/\bmarketing\b/gi, 'divulgação'],
  [/\bonline\b/gi, 'na internet']
]);

const DEFAULT_DASHBOARD_URL = 'https://prospe-o-clientes.onrender.com/app';

const STAGE_LABELS = Object.freeze({
  NOVO: 'Abordagem',
  CONTATADO: 'Abordagem',
  INTERESSADO: 'Diagnóstico',
  REUNIAO: 'Proposta',
  PROPOSTA: 'Proposta',
  FECHADO: 'Fechamento',
  SEM_INTERESSE: 'Encerrado'
});

/** Normaliza texto para comparações sem acento e sem diferença de caixa. */
function normalizeText(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

/** Retorna apenas dígitos de um telefone sem modificar o dado persistido. */
function digitsOnly(value) {
  return String(value || '').replace(/\D/g, '');
}

/** Converte termos técnicos ou estrangeiros em linguagem comercial simples. */
function sanitizeCommercialLanguage(value) {
  let output = String(value || '').trim();
  for (const [pattern, replacement] of LANGUAGE_REPLACEMENTS) {
    output = output.replace(pattern, replacement);
  }
  return output.replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
}

/**
 * Verifica se uma mensagem cumpre as regras mínimas do motor comercial.
 *
 * @param {string} message Texto pronto para contato.
 * @returns {{valid: boolean, violations: string[]}}
 */
function validateHumanCommercialMessage(message) {
  const normalized = normalizeText(message);
  const violations = PROHIBITED_EXPRESSIONS.filter((term) => normalized.includes(normalizeText(term)));

  if (!/posso te mandar|posso enviar|quer que eu te mande|posso te mostrar/i.test(message)) {
    violations.push('chamada final de baixo atrito ausente');
  }
  if (String(message || '').length > 850) violations.push('mensagem longa demais para WhatsApp');

  return { valid: violations.length === 0, violations: [...new Set(violations)] };
}

function getSocialNetworks(lead = {}) {
  const audit = lead.auditoriaSite || {};
  const sources = [
    ...(Array.isArray(audit.redesSociais) ? audit.redesSociais : []),
    ...(Array.isArray(lead.redesSociais) ? lead.redesSociais : [])
  ];

  const map = new Map();
  for (const item of sources) {
    const platform = String(item?.plataforma || item?.nome || item?.chave || '').trim();
    const urls = Array.isArray(item?.urls) ? item.urls : [item?.url].filter(Boolean);
    if (!platform && !urls.length) continue;
    const key = normalizeText(platform || urls[0]);
    if (!map.has(key)) map.set(key, { plataforma: platform || 'Rede social', urls: urls.filter(Boolean) });
  }
  return [...map.values()];
}

function findWhatsappUrl(lead = {}, socialNetworks = getSocialNetworks(lead)) {
  const explicit = String(lead.whatsappUrl || lead.linkWhatsapp || '').trim();
  if (explicit) return explicit;

  for (const network of socialNetworks) {
    const url = (network.urls || []).find((item) => /(?:wa\.me|api\.whatsapp\.com)/i.test(String(item)));
    if (url) return url;
  }

  const phone = digitsOnly(lead.telefone || lead.whatsapp);
  if (phone.length >= 10) {
    const normalized = phone.startsWith('55') ? phone : `55${phone}`;
    return `https://wa.me/${normalized}`;
  }
  return '';
}

function classifyPhone(phoneDigits) {
  const localDigits = phoneDigits.startsWith('55') ? phoneDigits.slice(2) : phoneDigits;
  if (localDigits.length === 11) return 'celular ou WhatsApp provável';
  if (localDigits.length === 10) return 'telefone fixo ou comercial';
  return phoneDigits ? 'telefone informado, formato não confirmado' : 'não informado';
}

/**
 * Mapeia contatos públicos e escolhe o canal prioritário.
 *
 * “Funcional” aqui significa que existe um link direto ou número com formato
 * utilizável. A atividade real do número só pode ser confirmada pelo operador ou
 * por integração oficial do provedor de mensagens.
 */
function auditLeadContacts(lead = {}) {
  const audit = lead.auditoriaSite || {};
  const phone = digitsOnly(lead.telefone || lead.whatsapp || '');
  const socialNetworks = getSocialNetworks(lead);
  const whatsappUrl = findWhatsappUrl(lead, socialNetworks);
  const email = String(lead.email || audit.email || '').trim();
  const whatsappDetectedOnSite = Boolean(audit.whatsapp);
  const hasWhatsappCandidate = Boolean(whatsappUrl || whatsappDetectedOnSite || phone.length >= 10);
  const hasPhone = phone.length >= 8;

  let primaryChannel = 'PESQUISA_MANUAL';
  let primaryLabel = 'Localizar um contato público antes da abordagem';
  if (hasWhatsappCandidate) {
    primaryChannel = 'WHATSAPP';
    primaryLabel = 'Priorizar WhatsApp com mensagem curta';
  } else if (hasPhone) {
    primaryChannel = 'TELEFONE';
    primaryLabel = 'Fazer uma ligação curta e pedir o WhatsApp responsável';
  } else if (email) {
    primaryChannel = 'EMAIL';
    primaryLabel = 'Enviar e-mail curto e pedir o contato do responsável';
  } else if (socialNetworks.length) {
    primaryChannel = 'REDE_SOCIAL';
    primaryLabel = `Usar ${socialNetworks[0].plataforma} para pedir o contato comercial`;
  }

  const restrictions = [];
  if (hasWhatsappCandidate && !whatsappDetectedOnSite) {
    restrictions.push('O número possui formato utilizável, mas a atividade do WhatsApp não foi confirmada automaticamente.');
  }
  if (!hasWhatsappCandidate) restrictions.push('Nenhum link direto de WhatsApp foi identificado.');
  if (!email) restrictions.push('E-mail público não identificado.');
  if (!socialNetworks.length) restrictions.push('Nenhuma rede social secundária foi mapeada.');

  return {
    canalPrioritario: primaryChannel,
    orientacao: primaryLabel,
    whatsapp: {
      disponivel: hasWhatsappCandidate,
      linkDireto: whatsappUrl || null,
      detectadoNoSite: whatsappDetectedOnSite,
      verificadoAtivo: false,
      observacao: hasWhatsappCandidate
        ? 'Há um caminho utilizável para tentativa de contato. Confirme o recebimento antes de considerar o número ativo.'
        : 'WhatsApp não localizado nos dados públicos disponíveis.'
    },
    telefone: {
      disponivel: hasPhone,
      numero: lead.telefone || lead.whatsapp || null,
      tipoProvavel: classifyPhone(phone)
    },
    email: { disponivel: Boolean(email), endereco: email || null },
    redesSociais: socialNetworks,
    restricoes: restrictions,
    resumo: `${primaryLabel}. ${restrictions[0] || 'Os canais públicos essenciais foram encontrados.'}`
  };
}

function humanizeSegment(value) {
  const sanitized = sanitizeCommercialLanguage(value || 'negócio local');
  return sanitized
    .replace(/\bservi[cç]os?\b/i, 'serviço')
    .replace(/\bhealth\b/gi, 'saúde')
    .replace(/\bbeauty\b/gi, 'beleza')
    .trim() || 'negócio local';
}

function selectObservation(lead = {}, contacts = auditLeadContacts(lead)) {
  const audit = lead.auditoriaSite || {};
  if (!lead.site) return 'não encontrei uma página simples reunindo serviços, localização e um botão claro para chamar';
  if (!contacts.whatsapp.disponivel) return 'quem entra para conhecer o negócio pode demorar para achar onde chamar vocês';
  if (audit.analisado && audit.responsivo === false) return 'pelo celular, algumas informações podem ficar mais difíceis de consultar';
  if (audit.analisado && audit.formulario === false && audit.whatsapp === false) return 'o caminho para pedir informação ou orçamento não aparece logo de cara';
  if (Array.isArray(lead.dores) && lead.dores.length) return sanitizeCommercialLanguage(lead.dores[0]);
  return 'algumas informações importantes poderiam aparecer de forma mais direta para quem olha pelo celular';
}

/** Gera a abordagem inicial local, curta e orientada a uma observação verificável. */
function buildHyperHumanApproach(lead = {}, options = {}) {
  const contacts = auditLeadContacts(lead);
  const businessName = sanitizeCommercialLanguage(lead.nome || 'seu negócio');
  const segment = humanizeSegment(lead.segmentoComercial || lead.tipo || lead.segmentoBuscado);
  const observation = selectObservation(lead, contacts);
  const seed = String(options.variationSeed || options.regenerateKey || businessName);
  const variation = [...seed].reduce((sum, char, index) => sum + char.charCodeAt(0) * (index + 1), 0) % 3;

  const variants = [
    `Oi, tudo bem? Dei uma olhada rápida pelo celular na ${businessName} e reparei que ${observation}.\n\nQuando isso acontece, uma pessoa que já estava procurando ${segment} pode acabar chamando o concorrente que deixou o contato mais fácil.\n\nPosso te mandar o print do que vi?`,
    `Oi! Encontrei a ${businessName} procurando ${segment} na região e vi uma bobeira simples: ${observation}.\n\nNão parece grave, mas pode fazer um cliente pronto para chamar desistir e escolher outra empresa.\n\nPosso te mandar o print e explicar em duas linhas?`,
    `Olá! Olhei rapidamente como a ${businessName} aparece no celular e notei que ${observation}.\n\nÉ justamente nesse momento que muita gente compara duas ou três opções e chama quem facilita mais.\n\nPosso te mandar o print do que encontrei?`
  ];

  const sanitized = sanitizeCommercialLanguage(variants[variation]);
  const validation = validateHumanCommercialMessage(sanitized);
  return {
    message: sanitized,
    validation,
    observation,
    contacts
  };
}

/** Produz um diagnóstico curto que traduz sinais técnicos em consequência comercial. */
function buildPracticalDiagnosis(lead = {}) {
  const contacts = auditLeadContacts(lead);
  const audit = lead.auditoriaSite || {};
  const points = [];

  if (!lead.site) {
    points.push({
      achado: 'Não foi encontrada uma página própria com as informações principais.',
      impacto: 'Quem pesquisa pode ficar sem segurança ou procurar outra empresa antes de chamar.',
      solucao: 'Criar uma página profissional, leve e direta, com serviços, localização e botão de WhatsApp.'
    });
  }
  if (!contacts.whatsapp.disponivel) {
    points.push({
      achado: 'O WhatsApp não aparece de forma clara nos canais analisados.',
      impacto: 'O cliente pode desistir por não encontrar um jeito rápido de falar com alguém.',
      solucao: 'Deixar um botão de WhatsApp visível logo no primeiro acesso pelo celular.'
    });
  }
  if (audit.analisado && audit.responsivo === false) {
    points.push({
      achado: 'A leitura pelo celular pode estar desconfortável.',
      impacto: 'Informações difíceis de ler reduzem a confiança e aumentam a chance de abandono.',
      solucao: 'Organizar o conteúdo para abrir bem no celular, com letras, botões e espaços adequados.'
    });
  }
  if (audit.analisado && audit.formulario === false && !audit.whatsapp) {
    points.push({
      achado: 'Não foi encontrado um caminho direto para pedir informação ou orçamento.',
      impacto: 'Uma pessoa interessada pode sair sem deixar contato.',
      solucao: 'Adicionar uma ação clara para chamar no WhatsApp ou solicitar orçamento.'
    });
  }

  if (!points.length) {
    points.push({
      achado: 'Os canais básicos existem, mas a primeira ação do cliente ainda pode ser mais direta.',
      impacto: 'Quanto mais passos a pessoa precisa dar, maior a chance de escolher outra opção.',
      solucao: 'Reorganizar a apresentação para destacar serviço, confiança e botão de contato logo no início.'
    });
  }

  return {
    titulo: 'Diagnóstico prático',
    pontos: points.slice(0, 3),
    resumo: points.slice(0, 2).map((point) => `${point.achado} ${point.impacto}`).join(' '),
    solucaoComercial: points[0].solucao
  };
}

function addMinutes(date, minutes) {
  return new Date(new Date(date).getTime() + minutes * 60_000).toISOString();
}

function addDays(date, days) {
  return new Date(new Date(date).getTime() + days * 86_400_000).toISOString();
}

/**
 * Define a tarefa idempotente esperada para a etapa atual.
 *
 * @param {{lead?: object, status?: string, intent?: string, now?: Date|string}} input
 * @returns {object|null}
 */
function buildNextTaskPlan({ lead = {}, status = lead.status, intent = '', now = new Date() } = {}) {
  const canonicalStatus = normalizeLeadStatus(status || 'NOVO');
  const normalizedIntent = String(intent || '').toUpperCase();
  const leadName = lead.nome || 'lead';

  if (canonicalStatus === 'NOVO') {
    return {
      title: 'Enviar abordagem inicial',
      dueAt: addMinutes(now, 15),
      message: `Enviar a mensagem curta para ${leadName} pelo canal prioritário e registrar o contato realizado.`,
      priority: Number(lead.score || 0) >= 80 ? 'ALTA' : 'MÉDIA',
      automationType: 'FUNIL_ABORDAGEM',
      actionType: 'ENVIAR_ABORDAGEM',
      targetStatus: 'CONTATADO'
    };
  }

  if (canonicalStatus === 'CONTATADO') {
    return {
      title: 'Verificar resposta da abordagem',
      dueAt: addDays(now, 2),
      message: `Se ${leadName} não responder, enviar um retorno curto sem cobrar resposta.`,
      priority: 'MÉDIA',
      automationType: 'FUNIL_RETORNO_ABORDAGEM',
      actionType: 'FOLLOWUP_ABORDAGEM',
      targetStatus: 'CONTATADO'
    };
  }

  if (canonicalStatus === 'INTERESSADO') {
    const asksPrice = normalizedIntent === 'PRECO';
    return {
      title: asksPrice ? 'Enviar diagnóstico e alinhar valor' : 'Enviar diagnóstico prático',
      dueAt: addMinutes(now, 30),
      message: asksPrice
        ? `Enviar o diagnóstico para ${leadName}, explicar que projetos simples começam em R$ 300 e propor uma conversa de 10 a 15 minutos.`
        : `Enviar os pontos encontrados para ${leadName} em linguagem simples e sugerir uma conversa de 10 a 15 minutos.`,
      priority: 'ALTA',
      automationType: 'FUNIL_DIAGNOSTICO',
      actionType: 'ENVIAR_DIAGNOSTICO',
      targetStatus: 'REUNIAO',
      durationMinutes: 15,
      referencePrice: 'a partir de R$ 300'
    };
  }

  if (canonicalStatus === 'REUNIAO') {
    return {
      title: 'Preparar proposta comercial',
      dueAt: addDays(now, 1),
      message: `Preparar proposta objetiva para ${leadName}, com valor de referência a partir de R$ 300 e próximo passo claro.`,
      priority: 'ALTA',
      automationType: 'FUNIL_PROPOSTA',
      actionType: 'GERAR_PROPOSTA',
      targetStatus: 'PROPOSTA',
      durationMinutes: 15,
      referencePrice: 'a partir de R$ 300'
    };
  }

  if (canonicalStatus === 'PROPOSTA') {
    return {
      title: 'Acompanhar proposta enviada',
      dueAt: addDays(now, 2),
      message: `Confirmar se ${leadName} conseguiu avaliar a proposta e perguntar qual ponto precisa ser esclarecido.`,
      priority: 'ALTA',
      automationType: 'FUNIL_FECHAMENTO',
      actionType: 'FOLLOWUP_PROPOSTA',
      targetStatus: 'FECHADO'
    };
  }

  return null;
}

/** Retorna a orientação da próxima etapa em formato próprio para API e interface. */
function buildNextFunnelAction({ lead = {}, status = lead.status, intent = '', task = null } = {}) {
  const canonicalStatus = normalizeLeadStatus(status || 'NOVO');
  const plan = task || buildNextTaskPlan({ lead, status: canonicalStatus, intent });

  if (canonicalStatus === 'FECHADO') {
    return {
      etapaAtual: 'Fechamento',
      acao: 'Manter como cliente ativo',
      descricao: 'O lead foi ganho. Encerrar tarefas comerciais pendentes e acompanhar entrega, satisfação e novas oportunidades.',
      automatica: true,
      targetStatus: 'FECHADO',
      task: null,
      agendaUrl: process.env.PUBLIC_APP_URL || DEFAULT_DASHBOARD_URL
    };
  }

  if (canonicalStatus === 'SEM_INTERESSE') {
    return {
      etapaAtual: 'Encerrado',
      acao: 'Encerrar oportunidade com respeito',
      descricao: 'Registrar o motivo, não insistir e manter apenas o histórico comercial.',
      automatica: true,
      targetStatus: 'SEM_INTERESSE',
      task: null,
      agendaUrl: process.env.PUBLIC_APP_URL || DEFAULT_DASHBOARD_URL
    };
  }

  return {
    etapaAtual: STAGE_LABELS[canonicalStatus] || 'Abordagem',
    acao: plan?.title || 'Revisar próximo passo',
    descricao: plan?.message || 'Verificar o histórico e definir a próxima ação comercial.',
    automatica: Boolean(plan),
    targetStatus: plan?.targetStatus || canonicalStatus,
    agendamentoMinutos: plan?.durationMinutes || null,
    valorReferencia: plan?.referencePrice || null,
    task: plan,
    agendaUrl: process.env.PUBLIC_APP_URL || DEFAULT_DASHBOARD_URL
  };
}

/** Cria a resposta padronizada exigida pelo motor comercial. */
function buildCommercialEngineOutput({ lead = {}, approach = '', status = lead.status, intent = '', task = null, channel = 'whatsapp' } = {}) {
  const localApproach = buildHyperHumanApproach(lead);
  const message = sanitizeCommercialLanguage(approach || localApproach.message);
  const validation = validateHumanCommercialMessage(message);
  const requiresWhatsappPattern = ['generic', 'whatsapp'].includes(String(channel || 'whatsapp').toLowerCase());
  const finalMessage = requiresWhatsappPattern && !validation.valid ? localApproach.message : message;
  const contactStatus = auditLeadContacts(lead);
  const nextAction = buildNextFunnelAction({ lead, status, intent, task });

  return {
    mensagemAbordagemSugerida: finalMessage,
    statusContatos: contactStatus,
    proximaAcaoFunil: nextAction,
    diagnosticoPratico: buildPracticalDiagnosis(lead),
    quality: validation.valid ? validation : validateHumanCommercialMessage(localApproach.message)
  };
}

module.exports = {
  PROHIBITED_EXPRESSIONS,
  DEFAULT_DASHBOARD_URL,
  STAGE_LABELS,
  sanitizeCommercialLanguage,
  validateHumanCommercialMessage,
  auditLeadContacts,
  buildHyperHumanApproach,
  buildPracticalDiagnosis,
  buildNextTaskPlan,
  buildNextFunnelAction,
  buildCommercialEngineOutput
};
