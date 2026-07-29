/**
 * @fileoverview Cabeçalho responsivo com identidade de central comercial.
 *
 * @module landing/shared/layout/Header
 */

import React, { useState } from 'react';
import { Menu, Radio, X } from 'lucide-react';
import { SITE_CONFIG } from '../../config/site.js';
import ActionLink from '../ui/ActionLink.jsx';
import Brand from './Brand.jsx';

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const closeMenu = () => setIsOpen(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/[.08] bg-[#050812]/90 text-white backdrop-blur-2xl">
      <div className="mx-auto flex min-h-18 max-w-[88rem] items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4"><Brand /><span className="hidden items-center gap-2 border-l border-white/10 pl-4 text-[9px] font-black uppercase tracking-[.16em] text-slate-500 md:inline-flex"><Radio size={10} className="text-emerald-400" /> Signal Engine</span></div>

        <nav className="hidden items-center gap-1 rounded-full border border-white/[.08] bg-white/[.035] p-1.5 lg:flex" aria-label="Navegação principal">
          {SITE_CONFIG.navigation.map((item) => <a key={item.href} href={item.href} className="rounded-full px-4 py-2 text-xs font-bold text-slate-400 transition hover:bg-white/[.06] hover:text-white">{item.label}</a>)}
        </nav>

        <div className="hidden items-center gap-3 lg:flex"><a href={SITE_CONFIG.appUrl} className="text-xs font-black text-slate-300 transition hover:text-white">Entrar</a><ActionLink href={SITE_CONFIG.appUrl}>Testar grátis</ActionLink></div>

        <button type="button" className="grid size-11 place-items-center rounded-xl border border-white/15 bg-white/5 text-white transition hover:bg-white/10 lg:hidden" aria-expanded={isOpen} aria-controls="mobile-navigation" aria-label={isOpen ? 'Fechar menu' : 'Abrir menu'} onClick={() => setIsOpen((current) => !current)}>{isOpen ? <X size={21} /> : <Menu size={21} />}</button>
      </div>

      <nav id="mobile-navigation" hidden={!isOpen} className="border-t border-white/10 bg-[#070b16] px-4 pb-5 pt-3 lg:hidden" aria-label="Navegação mobile">
        <div className="mx-auto grid max-w-7xl gap-1">{SITE_CONFIG.navigation.map((item) => <a key={item.href} href={item.href} onClick={closeMenu} className="rounded-lg px-3 py-3 text-sm font-bold text-slate-200 hover:bg-white/5">{item.label}</a>)}<a href={SITE_CONFIG.appUrl} onClick={closeMenu} className="rounded-lg px-3 py-3 text-sm font-bold text-slate-200 hover:bg-white/5">Entrar no sistema</a><ActionLink href={SITE_CONFIG.appUrl} className="mt-2 w-full">Testar grátis</ActionLink></div>
      </nav>
    </header>
  );
}
