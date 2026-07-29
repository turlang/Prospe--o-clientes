/**
 * @fileoverview Sincronização reativa dos planos comerciais da landing.
 *
 * Além do carregamento inicial, o hook revalida os dados ao recuperar foco,
 * quando a aba volta a ficar visível, por intervalo de segurança e por eventos
 * enviados pelo painel administrativo através de BroadcastChannel/storage.
 *
 * @module landing/hooks/usePlans
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { FALLBACK_PLANS } from '../data/content.js';
import { fetchPublicPlans } from '../services/plansApi.js';

const REFRESH_INTERVAL_MS = 30_000;
const CONFIGURATION_CHANNEL = 'leadhunter:configuration';
const STORAGE_EVENT_KEY = 'leadhunter:plans-updated';

/**
 * @returns {{plans: Array<object>, isUsingFallback: boolean, refreshPlans: Function}}
 */
export function usePlans() {
  const [plans, setPlans] = useState(FALLBACK_PLANS);
  const [isUsingFallback, setIsUsingFallback] = useState(true);
  const activeController = useRef(null);

  const refreshPlans = useCallback(async () => {
    activeController.current?.abort();
    const controller = new AbortController();
    activeController.current = controller;

    try {
      const remotePlans = await fetchPublicPlans(controller.signal);
      setPlans(remotePlans);
      setIsUsingFallback(false);
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.warn('[landing] Não foi possível revalidar os planos:', error.message);
      }
    }
  }, []);

  useEffect(() => {
    refreshPlans();

    const handleFocus = () => refreshPlans();
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') refreshPlans();
    };
    const handleStorage = (event) => {
      if (event.key === STORAGE_EVENT_KEY) refreshPlans();
    };

    window.addEventListener('focus', handleFocus);
    window.addEventListener('storage', handleStorage);
    document.addEventListener('visibilitychange', handleVisibility);

    const intervalId = window.setInterval(refreshPlans, REFRESH_INTERVAL_MS);
    const channel = 'BroadcastChannel' in window
      ? new BroadcastChannel(CONFIGURATION_CHANNEL)
      : null;

    if (channel) {
      channel.onmessage = (event) => {
        if (event.data?.type === 'plans-updated') refreshPlans();
      };
    }

    return () => {
      activeController.current?.abort();
      window.clearInterval(intervalId);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('storage', handleStorage);
      document.removeEventListener('visibilitychange', handleVisibility);
      channel?.close();
    };
  }, [refreshPlans]);

  return { plans, isUsingFallback, refreshPlans };
}
