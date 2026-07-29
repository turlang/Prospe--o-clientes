/**
 * @fileoverview Cliente HTTP da configuração pública de planos.
 *
 * Requisições usam `no-store` e um identificador de tempo para impedir que
 * navegador, CDN ou proxy reutilize uma resposta anterior após uma alteração
 * feita no painel administrativo.
 *
 * @module landing/services/plansApi
 */

/**
 * Carrega os planos comerciais publicados pelo backend.
 *
 * @param {AbortSignal} [signal] Sinal opcional para cancelamento.
 * @returns {Promise<Array<object>>} Lista pública de planos.
 */
export async function fetchPublicPlans(signal) {
  const url = new URL('/api/plans', window.location.origin);
  url.searchParams.set('_refresh', String(Date.now()));

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'Cache-Control': 'no-cache'
    },
    cache: 'no-store',
    signal
  });

  if (!response.ok) {
    throw new Error(`Falha ao carregar planos: HTTP ${response.status}.`);
  }

  const payload = await response.json();
  const plans = Array.isArray(payload) ? payload : payload?.plans;

  if (!Array.isArray(plans) || plans.length === 0) {
    throw new Error('A API de planos retornou uma coleção vazia ou inválida.');
  }

  return plans;
}
