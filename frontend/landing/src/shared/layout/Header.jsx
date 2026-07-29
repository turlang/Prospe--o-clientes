/**
 * @fileoverview Cabeçalho da landing em tela única.
 *
 * A navegação usa botões com semântica de abas. Em desktop ela permanece no
 * cabeçalho; em mobile, a navegação principal migra para a barra inferior.
 *
 * @module landing/shared/layout/Header
 */

import React from 'react';
import { Radio } from 'lucide-react';
import { SITE_CONFIG } from '../../config/site.js';
import ActionLink from '../ui/ActionLink.jsx';
import Brand from './Brand.jsx';

/**
 * @param {{activeView: string, onNavigate: Function}} props Estado de navegação.
 * @returns {React.JSX.Element} Cabeçalho fixo da experiência.
 */
export default function Header({ activeView, onNavigate }) {
  const handleKeyDown = (event, index) => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const lastIndex = SITE_CONFIG.navigation.length - 1;
    const targetIndex = event.key === 'Home'
      ? 0
      : event.key === 'End'
        ? lastIndex
        : (index + (event.key === 'ArrowRight' ? 1 : -1) + SITE_CONFIG.navigation.length) % SITE_CONFIG.navigation.length;
    const target = SITE_CONFIG.navigation[targetIndex];
    onNavigate(target.id);
    document.querySelector(`[data-desktop-view="${target.id}"]`)?.focus();
  };

  return (
    <header className="landing-header">
      <div className="landing-header__inner">
        <div className="flex min-w-0 items-center gap-3 sm:gap-4">
          <Brand />
          <span className="hidden items-center gap-2 border-l border-white/10 pl-4 text-[9px] font-black uppercase tracking-[.16em] text-slate-500 md:inline-flex">
            <Radio size={10} className="text-emerald-400" /> Signal Engine
          </span>
        </div>

        <nav className="landing-tabs hidden lg:flex" role="tablist" aria-label="Conteúdo da landing">
          {SITE_CONFIG.navigation.map((item, index) => (
            <button
              key={item.id}
              type="button"
              id={`tab-${item.id}`}
              role="tab"
              data-desktop-view={item.id}
              aria-selected={activeView === item.id}
              aria-controls={`panel-${item.id}`}
              className="landing-tab"
              onClick={() => onNavigate(item.id)}
              onKeyDown={(event) => handleKeyDown(event, index)}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <a href={SITE_CONFIG.appUrl} className="hidden text-xs font-black text-slate-300 transition hover:text-white sm:inline">Entrar</a>
          <ActionLink href={SITE_CONFIG.appUrl} className="min-h-10 px-3 py-2 text-xs sm:px-4">Testar grátis</ActionLink>
        </div>
      </div>
    </header>
  );
}
