/**
 * @fileoverview Barra inferior mobile para troca de telas sem rolagem.
 *
 * @module landing/shared/layout/BottomNavigation
 */

import React from 'react';
import { BadgeDollarSign, Radar, Route, UsersRound, Wrench } from 'lucide-react';
import { SITE_CONFIG } from '../../config/site.js';

const ICONS = Object.freeze({
  inicio: Radar,
  'como-funciona': Route,
  ferramentas: Wrench,
  publico: UsersRound,
  planos: BadgeDollarSign
});

/**
 * @param {{activeView: string, onNavigate: Function}} props Estado de navegação.
 * @returns {React.JSX.Element} Navegação mobile.
 */
export default function BottomNavigation({ activeView, onNavigate }) {
  return (
    <nav className="landing-bottom-nav lg:hidden" role="tablist" aria-label="Conteúdo da landing">
      {SITE_CONFIG.navigation.map((item) => {
        const Icon = ICONS[item.id];
        const isActive = activeView === item.id;
        return (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-controls={`panel-${item.id}`}
            className="landing-bottom-nav__button"
            onClick={() => onNavigate(item.id)}
          >
            <Icon size={17} strokeWidth={isActive ? 2.8 : 2} />
            <span>{item.mobileLabel}</span>
          </button>
        );
      })}
    </nav>
  );
}
