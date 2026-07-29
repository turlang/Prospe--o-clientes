/**
 * @fileoverview Controla a navegação sem rolagem entre as telas da landing.
 *
 * A URL mantém um hash semântico para permitir compartilhamento e navegação
 * pelo histórico, mas a troca de conteúdo acontece no estado React sem mover o
 * documento. O hook também oferece navegação sequencial para teclado e botões.
 *
 * @module landing/hooks/useLandingView
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { SITE_CONFIG } from '../config/site.js';

const DEFAULT_VIEW = SITE_CONFIG.navigation[0].id;
const VALID_VIEW_IDS = new Set(SITE_CONFIG.navigation.map((item) => item.id));

function readViewFromHash() {
  const candidate = window.location.hash.replace(/^#/, '');
  return VALID_VIEW_IDS.has(candidate) ? candidate : DEFAULT_VIEW;
}

/**
 * @returns {{activeView: string, navigateTo: Function, navigateRelative: Function}}
 */
export function useLandingView() {
  const [activeView, setActiveView] = useState(() => readViewFromHash());
  const orderedIds = useMemo(() => SITE_CONFIG.navigation.map((item) => item.id), []);

  const navigateTo = useCallback((viewId, { replace = false } = {}) => {
    if (!VALID_VIEW_IDS.has(viewId)) return;
    setActiveView(viewId);
    const nextUrl = `${window.location.pathname}${window.location.search}#${viewId}`;
    window.history[replace ? 'replaceState' : 'pushState']({ viewId }, '', nextUrl);
  }, []);

  const navigateRelative = useCallback((direction) => {
    const currentIndex = orderedIds.indexOf(activeView);
    const nextIndex = (currentIndex + direction + orderedIds.length) % orderedIds.length;
    navigateTo(orderedIds[nextIndex]);
  }, [activeView, navigateTo, orderedIds]);

  useEffect(() => {
    const handleNavigation = () => setActiveView(readViewFromHash());
    window.addEventListener('hashchange', handleNavigation);
    window.addEventListener('popstate', handleNavigation);
    return () => {
      window.removeEventListener('hashchange', handleNavigation);
      window.removeEventListener('popstate', handleNavigation);
    };
  }, []);

  useEffect(() => {
    if (!window.location.hash) navigateTo(DEFAULT_VIEW, { replace: true });
  }, [navigateTo]);

  return { activeView, navigateTo, navigateRelative };
}
