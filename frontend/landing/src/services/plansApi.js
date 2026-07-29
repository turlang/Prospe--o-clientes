/**
 * @fileoverview Cliente HTTP da API pública de planos.
 *
 * A camada de serviço isola detalhes de transporte dos componentes React.
 * Erros são propagados para que o hook decida quando usar dados de contingência.
 *
 * @module landing/services/plansApi
 */

/**
 * Carrega os planos comerciais publicados pelo backend.
 *
 * @param {AbortSignal} signal Sinal usado para cancelar a requisição ao desmontar o componente.
 * @returns {Promise<Array<object>>} Lista de planos normalizados pelo backend.
 * @throws {Error} Quando a API retorna erro HTTP ou formato inesperado.
 */
export async function fetchPublicPlans(signal) {
  const response = await fetch('/api/plans', {
    method: 'GET',
    headers: { Accept: 'application/json' },
    signal
  });

  if (!response.ok) {
    throw new Error(`Falha ao carregar planos: HTTP ${response.status}.`);
  }

  const payload = await response.json();
  if (!Array.isArray(payload) || payload.length === 0) {
    throw new Error('A API de planos retornou uma coleção vazia ou inválida.');
  }

  return payload;
}
