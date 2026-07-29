/**
 * @fileoverview Análise de respostas comerciais e recomendação da próxima ação no funil.
 *
 * A análise é determinística e conservadora: identifica intenções explícitas,
 * preserva etapas mais avançadas e entrega uma resposta simples para revisão do
 * operador. O envio continua humano; apenas o registro, a etapa e a próxima
 * tarefa podem ser atualizados automaticamente.
 *
 * @module src/domain/conversations/conversationEngine
 */

const { normalizeLeadStatus, resolveResponseStatus } = require('../leadStatus');
const {
  buildHyperHumanApproach,
  buildPracticalDiagnosis,
  sanitizeCommercialLanguage
} = require('../../services/commercialFunnelEngine');

const POSITIVE_TERMS = [
  'sim', 'pode', 'claro', 'manda', 'mandar', 'envia', 'enviar', 'quero',
  'tenho interesse', 'interesse', 'me mostra', 'mostra', 'ok', 'beleza'
];
const PRICE_TERMS = ['quanto custa', 'valor', 'preço', 'preco', 'orçamento', 'orcamento'];
const DETAIL_TERMS = ['o que', 'quais', 'como assim', 'que melhoria', 'o que encontrou', 'manda o print', 'envia o print'];
const MEETING_TERMS = ['pode marcar', 'vamos marcar', 'agenda', 'agendar', 'reunião', 'reuniao', 'ligação', 'ligacao', 'pode ligar'];
const CLOSING_TERMS = ['fechado', 'aceito a proposta', 'vamos fazer', 'pode começar', 'pode comecar', 'quero contratar'];
const NEGATIVE_TERMS = ['não tenho interesse', 'nao tenho interesse', 'não quero', 'nao quero', 'sem interesse', 'agora não', 'agora nao'];

function normalize(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

function containsAny(text, terms) {
  return terms.some((term) => text.includes(normalize(term)));
}

/** Gera a primeira mensagem seguindo a política hiper-humana do motor. */
function buildInitialMessage(lead = {}) {
  return buildHyperHumanApproach(lead).message;
}

function buildDiagnosisReply(lead = {}) {
  const diagnosis = buildPracticalDiagnosis(lead);
  const points = diagnosis.pontos.slice(0, 2)
    .map((point) => `• ${point.achado}\n  Isso pode fazer o cliente desistir antes de chamar.`)
    .join('\n');

  return sanitizeCommercialLanguage(
    `Claro. O que eu vi foi isto:\n\n${points}\n\nO primeiro ajuste seria: ${diagnosis.solucaoComercial}\n\nSe fizer sentido, posso te explicar em uma conversa rápida de 10 a 15 minutos.`
  );
}

function buildPriceReply(lead = {}) {
  const name = lead.nome || 'o negócio';
  return `Para um trabalho simples como esse, dá para começar a partir de R$ 300, dependendo do que a ${name} realmente precisa. Antes de fechar um valor, posso te mostrar os pontos e entender o que faria mais sentido em uma conversa de 10 a 15 minutos?`;
}

function buildMeetingReply() {
  return 'Perfeito. Podemos fazer uma conversa rápida de 10 a 15 minutos. Qual período fica melhor para você: manhã, tarde ou começo da noite?';
}

function buildClosingReply() {
  return 'Ótimo, obrigado pela confiança. Vou organizar os próximos passos e confirmar por mensagem o que será feito, o valor combinado e a data de início.';
}

function buildNegativeReply() {
  return 'Sem problema, obrigado por responder. Não vou insistir. Caso isso faça sentido em outro momento, fico à disposição.';
}

function buildResponseAnalysis({ intent, suggestedStatus, proximoPasso, respostaSugerida }, lead) {
  const previousStatus = normalizeLeadStatus(lead.status || 'CONTATADO');
  const status = resolveResponseStatus(previousStatus, suggestedStatus);
  return {
    intent,
    status,
    previousStatus,
    statusChanged: status !== previousStatus,
    proximoPasso,
    respostaSugerida: sanitizeCommercialLanguage(respostaSugerida)
  };
}

/**
 * Classifica a resposta e determina a transição canônica do funil.
 *
 * @param {string} text Mensagem recebida do lead.
 * @param {object} lead Contexto atual da oportunidade.
 * @returns {object} Intenção, transição, resposta e próxima ação.
 */
function analyzeLeadResponse(text, lead = {}) {
  const normalized = normalize(text);
  if (!normalized) {
    const previousStatus = normalizeLeadStatus(lead.status || 'CONTATADO');
    return {
      intent: 'SEM_RESPOSTA',
      status: previousStatus,
      previousStatus,
      statusChanged: false,
      proximoPasso: 'Aguardar e deixar um retorno curto agendado para dois dias.',
      respostaSugerida: ''
    };
  }

  if (containsAny(normalized, NEGATIVE_TERMS)) {
    return buildResponseAnalysis({
      intent: 'NEGATIVA',
      suggestedStatus: 'SEM_INTERESSE',
      proximoPasso: 'Encerrar a oportunidade, registrar o motivo e não criar nova cobrança.',
      respostaSugerida: buildNegativeReply()
    }, lead);
  }

  if (containsAny(normalized, CLOSING_TERMS)) {
    return buildResponseAnalysis({
      intent: 'FECHAMENTO',
      suggestedStatus: 'FECHADO',
      proximoPasso: 'Marcar como ganho, concluir tarefas comerciais e mover para clientes ativos.',
      respostaSugerida: buildClosingReply()
    }, lead);
  }

  if (containsAny(normalized, MEETING_TERMS)) {
    return buildResponseAnalysis({
      intent: 'AGENDAMENTO',
      suggestedStatus: 'REUNIAO',
      proximoPasso: 'Agendar uma conversa de 10 a 15 minutos e preparar os pontos do diagnóstico.',
      respostaSugerida: buildMeetingReply()
    }, lead);
  }

  if (containsAny(normalized, PRICE_TERMS)) {
    return buildResponseAnalysis({
      intent: 'PRECO',
      suggestedStatus: 'INTERESSADO',
      proximoPasso: 'Enviar o diagnóstico, informar referência a partir de R$ 300 e propor conversa de 10 a 15 minutos.',
      respostaSugerida: buildPriceReply(lead)
    }, lead);
  }

  if (containsAny(normalized, DETAIL_TERMS) || containsAny(normalized, POSITIVE_TERMS)) {
    return buildResponseAnalysis({
      intent: containsAny(normalized, DETAIL_TERMS) ? 'PEDIU_DIAGNOSTICO' : 'POSITIVA',
      suggestedStatus: 'INTERESSADO',
      proximoPasso: 'Enviar o diagnóstico prático e criar a tarefa para conduzir o lead a uma conversa curta.',
      respostaSugerida: buildDiagnosisReply(lead)
    }, lead);
  }

  return buildResponseAnalysis({
    intent: 'NEUTRA',
    suggestedStatus: 'INTERESSADO',
    proximoPasso: 'Responder de forma curta, explicar o ponto observado e pedir autorização para enviar o diagnóstico.',
    respostaSugerida: 'Obrigado por responder. Dei uma olhada rápida e encontrei um detalhe simples que pode fazer algumas pessoas desistirem antes de chamar. Posso te mandar o print e explicar em duas linhas?'
  }, lead);
}

module.exports = { buildInitialMessage, analyzeLeadResponse };
