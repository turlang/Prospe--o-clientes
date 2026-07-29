/**
 * @fileoverview Rodapé institucional da landing page.
 *
 * @module landing/shared/layout/Footer
 */

import React from 'react';
import { Radio } from 'lucide-react';
import { SITE_CONFIG } from '../../config/site.js';
import Brand from './Brand.jsx';

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#050812] text-slate-500">
      <div className="mx-auto grid max-w-[88rem] gap-7 px-4 py-9 sm:px-6 md:grid-cols-[auto_1fr_auto] md:items-center lg:px-8">
        <Brand />
        <p className="text-sm md:text-center">© 2026 {SITE_CONFIG.name}. Inteligência comercial para quem vende tecnologia.</p>
        <a href={SITE_CONFIG.appUrl} className="inline-flex items-center gap-2 text-sm font-bold text-slate-300 transition hover:text-white"><Radio size={13} className="text-emerald-400" /> Acessar operação →</a>
      </div>
    </footer>
  );
}
