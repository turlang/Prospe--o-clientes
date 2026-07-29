/**
 * @fileoverview Rodapé institucional da landing page.
 *
 * @module landing/shared/layout/Footer
 */

import React from 'react';
import { SITE_CONFIG } from '../../config/site.js';
import Brand from './Brand.jsx';

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-slate-950 text-slate-400">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
        <Brand />
        <p className="text-sm">© 2026 {SITE_CONFIG.name}. Prospecção e operação comercial para tecnologia.</p>
        <a href={SITE_CONFIG.appUrl} className="text-sm font-bold text-slate-300 transition hover:text-white">Acessar o sistema →</a>
      </div>
    </footer>
  );
}
