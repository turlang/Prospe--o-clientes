/**
 * @fileoverview Vocabulário canônico e regras de transição do funil comercial.
 *
 * Este módulo é a fonte única de verdade da camada de domínio para os status de
 * lead. Ele impede que serviços distintos persistam nomes de etapa que não
 * existem no Kanban e também converte valores legados sem perder oportunidades.
 *
 * @module domain/leadStatus
 */

/** Ordem visual e progressiva das etapas ativas do funil. */
const LEAD_STATUS_ORDER = Object.freeze([
  'NOVO',
  'CONTATADO',
  'INTERESSADO',
  'REUNIAO',
  'PROPOSTA',
  'FECHADO',
  'SEM_INTERESSE'
]);

const LEAD_STATUS_SET = new Set(LEAD_STATUS_ORDER);

/**
 * Compatibilidade com valores produzidos por versões anteriores.
 *
 * `RESPONDEU` e `QUALIFICANDO` representam atividades comerciais, não colunas
 * independentes do funil. Por isso, ambas convergem para `INTERESSADO`.
 */
const LEAD_STATUS_ALIASES = Object.freeze({
  CONTACTADO: 'CONTATADO',
  RESPONDEU: 'INTERESSADO',
  QUALIFICANDO: 'INTERESSADO',
  QUALIFICADO: 'INTERESSADO',
  REUNIAO_AGENDADA: 'REUNIAO',
  NEGOCIACAO: 'PROPOSTA',
  GANHO: 'FECHADO',
  CLIENTE: 'FECHADO',
  PERDIDO: 'SEM_INTERESSE',
  RECUSADO: 'SEM_INTERESSE'
});

/**
 * Converte um valor arbitrário em uma etapa válida do funil.
 *
 * @param {unknown} value Status recebido de API, banco ou arquivo legado.
 * @param {string} [fallback='NOVO'] Etapa usada quando o valor é desconhecido.
 * @returns {string} Status canônico.
 */
function normalizeLeadStatus(value, fallback = 'NOVO') {
  const normalized = String(value || '').trim().toUpperCase();
  const canonical = LEAD_STATUS_ALIASES[normalized] || normalized;
  return LEAD_STATUS_SET.has(canonical) ? canonical : fallback;
}

/**
 * Evita regressão acidental quando uma resposta chega em etapa mais avançada.
 *
 * Exemplo: um lead em `PROPOSTA` que responde positivamente não deve voltar para
 * `INTERESSADO`. Respostas negativas encerram a oportunidade, exceto quando o
 * registro já representa um cliente fechado.
 *
 * @param {unknown} currentStatus Etapa atual persistida.
 * @param {unknown} suggestedStatus Etapa sugerida pela análise da resposta.
 * @returns {string} Etapa final que deve ser persistida.
 */
function resolveResponseStatus(currentStatus, suggestedStatus) {
  const current = normalizeLeadStatus(currentStatus);
  const suggested = normalizeLeadStatus(suggestedStatus, current);

  if (current === 'FECHADO') return 'FECHADO';
  if (suggested === 'SEM_INTERESSE') return 'SEM_INTERESSE';
  if (current === 'SEM_INTERESSE') return suggested;

  const currentRank = LEAD_STATUS_ORDER.indexOf(current);
  const suggestedRank = LEAD_STATUS_ORDER.indexOf(suggested);
  return suggestedRank > currentRank ? suggested : current;
}

function isContactedStatus(value) {
  return ['CONTATADO', 'INTERESSADO', 'REUNIAO', 'PROPOSTA', 'FECHADO'].includes(normalizeLeadStatus(value));
}

module.exports = {
  LEAD_STATUS_ORDER,
  LEAD_STATUS_SET,
  LEAD_STATUS_ALIASES,
  normalizeLeadStatus,
  resolveResponseStatus,
  isContactedStatus
};
