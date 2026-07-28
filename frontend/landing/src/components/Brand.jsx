import React from 'react';
import { Radar } from 'lucide-react';

export default function Brand({ inverse = false }) {
  return (
    <a href="#inicio" className="inline-flex items-center gap-3" aria-label="LeadHunter Pro - início">
      <span className="grid size-10 place-items-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 text-white shadow-lg shadow-blue-500/25">
        <Radar size={21} strokeWidth={2.4} />
      </span>
      <span className={`text-base font-black tracking-tight ${inverse ? 'text-white' : 'text-slate-950'}`}>
        LeadHunter <span className="text-blue-500">Pro</span>
      </span>
    </a>
  );
}
