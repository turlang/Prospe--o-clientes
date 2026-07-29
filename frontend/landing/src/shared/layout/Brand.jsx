/**
 * @fileoverview Marca textual acessível do LeadHunter Pro.
 *
 * @module landing/shared/layout/Brand
 */

import React from 'react';
import { SITE_CONFIG } from '../../config/site.js';

/** @returns {React.JSX.Element} Logotipo textual com link para o início da página. */
export default function Brand() {
  return (
    <a href="#inicio" className="inline-flex items-center gap-3 rounded-lg focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-blue-400" aria-label="LeadHunter Pro — voltar ao início">
      <span className="grid size-10 place-items-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 text-sm font-black text-white shadow-lg shadow-blue-500/20">
        {SITE_CONFIG.shortName}
      </span>
      <span className="text-base font-black tracking-[-0.025em] text-white">
        LeadHunter <span className="text-cyan-300">Pro</span>
      </span>
    </a>
  );
}
