/**
 * @fileoverview Segmentação explícita do público-alvo do SaaS.
 *
 * @module landing/features/audience/AudienceSection
 */

import React from 'react';
import { AUDIENCES, TRUST_MARKERS } from '../../data/content.js';
import SectionHeading from '../../shared/ui/SectionHeading.jsx';

export default function AudienceSection() {
  return (
    <section id="publico" className="overflow-hidden bg-slate-950 py-18 text-white sm:py-24">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[.8fr_1.2fr] lg:items-center lg:px-8">
        <div>
          <SectionHeading
            eyebrow="Para quem é"
            title="Criado para quem vende tecnologia."
            description="O LeadHunter Pro traduz oportunidades digitais em ações comerciais claras, sem exigir uma equipe de vendas complexa."
            inverse
          />
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            {TRUST_MARKERS.map((marker) => {
              const Icon = marker.icon;
              return <div key={marker.value} className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[.045] p-4"><span className="grid size-10 place-items-center rounded-xl bg-blue-500/15 text-cyan-300"><Icon size={19} /></span><div><strong className="block text-sm text-white">{marker.value}</strong><span className="text-xs text-slate-400">{marker.label}</span></div></div>;
            })}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {AUDIENCES.map((audience) => {
            const Icon = audience.icon;
            return (
              <article key={audience.title} className="rounded-2xl border border-white/10 bg-white/[.045] p-6 transition hover:border-cyan-300/25 hover:bg-white/[.065]">
                <Icon size={24} className="text-cyan-300" />
                <h3 className="mt-5 text-lg font-black text-white">{audience.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-400">{audience.text}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
