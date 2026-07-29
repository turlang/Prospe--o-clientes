/**
 * @fileoverview Hook responsável pelo carregamento resiliente dos planos.
 *
 * @module landing/hooks/usePlans
 */

import { useEffect, useState } from 'react';
import { FALLBACK_PLANS } from '../data/content.js';
import { fetchPublicPlans } from '../services/plansApi.js';

/**
 * Mantém a landing funcional mesmo quando a API de planos está temporariamente
 * indisponível. O fallback é somente visual; preços reais continuam sendo
 * validados pelo backend no fluxo de assinatura.
 *
 * @returns {{plans: Array<object>, isUsingFallback: boolean}} Estado dos planos públicos.
 */
export function usePlans() {
  const [plans, setPlans] = useState(FALLBACK_PLANS);
  const [isUsingFallback, setIsUsingFallback] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    fetchPublicPlans(controller.signal)
      .then((remotePlans) => {
        setPlans(remotePlans);
        setIsUsingFallback(false);
      })
      .catch((error) => {
        if (error.name !== 'AbortError') {
          console.warn('[landing] Planos de contingência em uso:', error.message);
        }
      });

    return () => controller.abort();
  }, []);

  return { plans, isUsingFallback };
}
