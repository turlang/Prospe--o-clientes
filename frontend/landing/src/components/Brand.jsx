import React from 'react';
import { Crosshair } from 'lucide-react';

export default function Brand({ inverse = false }) {
  return (
    <a href="#inicio" className="inline-flex items-center gap-2.5" aria-label="LeadHunter Pro - início">
      <span className="grid size-9 place-items-center rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 text-white shadow-lg shadow-blue-500/25">
        <Crosshair size={19} strokeWidth={2.5} />
      </span>
      <span className={`text-[15px] font-black tracking-[-.02em] sm:text-base ${inverse ? 'text-white' : 'text-slate-950'}`}>
        LeadHunter <span className="text-cyan-400">Pro</span>
      </span>
    </a>
  );
}
