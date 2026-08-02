/**
 * @fileoverview Contratos de domínio documentados com JSDoc.
 *
 * O projeto permanece em JavaScript, porém estes tipos fornecem documentação
 * navegável e melhoram o IntelliSense sem introduzir uma etapa de compilação.
 *
 * @module types/domain
 */

/**
 * @typedef {object} Lead
 * @property {string} [placeId] Identificador do provedor de origem.
 * @property {string} nome Nome comercial do estabelecimento.
 * @property {string} [telefone] Telefone normalizado para contato.
 * @property {string} [site] Endereço público do site.
 * @property {string} [endereco] Endereço textual do estabelecimento.
 * @property {number} score Pontuação comercial entre 0 e 100.
 * @property {'NOVO'|'CONTATADO'|'INTERESSADO'|'REUNIAO'|'PROPOSTA'|'FECHADO'|'SEM_INTERESSE'} status Etapa atual do funil.
 * @property {string} [abordagem] Última abordagem comercial aprovada.
 * @property {Array<object>} [interacoes] Linha do tempo de interações do lead.
 */

/**
 * @typedef {object} CommercialPlan
 * @property {'trial'|'pro'|'agency'|string} id Identificador estável do plano.
 * @property {string} name Nome exibido ao usuário.
 * @property {number} price Preço mensal em reais.
 * @property {number|null} dailyLeadLimit Limite diário, quando aplicável.
 * @property {number|null} totalLeadLimit Limite total, quando aplicável.
 * @property {boolean} active Define se o plano pode ser contratado.
 */

/**
 * @typedef {object} AuthenticatedUser
 * @property {string} id Identificador persistente.
 * @property {string} name Nome do usuário.
 * @property {string} email E-mail normalizado.
 * @property {'user'|'admin'} role Papel de autorização.
 * @property {string} planId Plano atualmente associado.
 * @property {'active'|'suspended'} status Situação operacional da conta.
 */

/**
 * @typedef {object} FollowUpTask
 * @property {string} id Identificador da tarefa.
 * @property {string} userId Proprietário da tarefa.
 * @property {string} leadId Lead associado.
 * @property {string} title Ação que deve ser realizada.
 * @property {string} dueAt Data ISO de vencimento.
 * @property {boolean} completed Indica conclusão da tarefa.
 */

/**
 * @typedef {object} ApiErrorPayload
 * @property {string} error Mensagem segura para o consumidor da API.
 * @property {string} [code] Código estável opcional para tratamento programático.
 */

// Arquivo exclusivamente documental; não expõe comportamento em tempo de execução.
module.exports = {};
