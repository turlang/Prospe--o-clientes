/**
 * @fileoverview Cabeçalho responsivo e navegação principal da landing.
 *
 * O menu mobile usa estado local e atributos ARIA para preservar navegação por
 * teclado e leitura correta por tecnologias assistivas.
 *
 * @module landing/shared/layout/Header
 */

import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { SITE_CONFIG } from '../../config/site.js';
import ActionLink from '../ui/ActionLink.jsx';
import Brand from './Brand.jsx';

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);

  function closeMenu() {
    setIsOpen(false);
  }

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/92 text-white backdrop-blur-xl">
      <div className="mx-auto flex min-h-18 max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Brand />

        <nav className="hidden items-center gap-7 lg:flex" aria-label="Navegação principal">
          {SITE_CONFIG.navigation.map((item) => (
            <a key={item.href} href={item.href} className="text-sm font-bold text-slate-300 transition hover:text-white">
              {item.label}
            </a>
          ))}
          <a href={SITE_CONFIG.appUrl} className="text-sm font-bold text-slate-300 transition hover:text-white">Entrar</a>
          <ActionLink href={SITE_CONFIG.appUrl}>Testar grátis</ActionLink>
        </nav>

        <button
          type="button"
          className="grid size-11 place-items-center rounded-xl border border-white/15 bg-white/5 text-white transition hover:bg-white/10 lg:hidden"
          aria-expanded={isOpen}
          aria-controls="mobile-navigation"
          aria-label={isOpen ? 'Fechar menu' : 'Abrir menu'}
          onClick={() => setIsOpen((current) => !current)}
        >
          {isOpen ? <X size={21} /> : <Menu size={21} />}
        </button>
      </div>

      <nav id="mobile-navigation" hidden={!isOpen} className="border-t border-white/10 px-4 pb-5 pt-3 lg:hidden" aria-label="Navegação mobile">
        <div className="mx-auto grid max-w-7xl gap-1">
          {SITE_CONFIG.navigation.map((item) => (
            <a key={item.href} href={item.href} onClick={closeMenu} className="rounded-lg px-3 py-3 text-sm font-bold text-slate-200 hover:bg-white/5">
              {item.label}
            </a>
          ))}
          <a href={SITE_CONFIG.appUrl} onClick={closeMenu} className="rounded-lg px-3 py-3 text-sm font-bold text-slate-200 hover:bg-white/5">Entrar no sistema</a>
          <ActionLink href={SITE_CONFIG.appUrl} className="mt-2 w-full">Testar grátis</ActionLink>
        </div>
      </nav>
    </header>
  );
}
