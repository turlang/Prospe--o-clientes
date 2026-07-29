/**
 * @fileoverview Modos de operação associados aos diferentes públicos do SaaS.
 *
 * @module landing/features/audience/AudienceSection
 */

import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { AUDIENCES } from '../../data/content.js';

export default function AudienceSection() {
  return (
    <section id="publico" className="bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-[88rem] px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[.82fr_1.18fr] lg:items-end">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[.2em] text-blue-600">Escolha seu modo de operação</p>
            <h2 className="mt-4 max-w-[13ch] text-[clamp(2.3rem,4.2vw,4rem)] font-black leading-[.96] tracking-[-.055em] text-slate-950">A mesma inteligência, adaptada ao jeito que você vende tecnologia.</h2>
          </div>
          <p className="max-w-xl text-base leading-7 text-slate-600 lg:justify-self-end">Do profissional solo à agência com equipe comercial: use o LeadHunter para criar ritmo, contexto e previsibilidade sem transformar sua operação em uma planilha infinita.</p>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {AUDIENCES.map((audience, index) => {
            const Icon = audience.icon;
            return (
              <article key={audience.title} className="group relative overflow-hidden rounded-[1.75rem] border border-slate-200 bg-[#f7f9fc] p-6 transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:bg-white hover:shadow-[0_24px_65px_rgba(15,23,42,.09)]">
                <span className="absolute right-5 top-4 text-5xl font-black text-slate-200/70" aria-hidden="true">0{index + 1}</span>
                <span className="relative grid size-12 place-items-center rounded-2xl bg-slate-950 text-cyan-300"><Icon size={21} /></span>
                <h3 className="relative mt-7 text-xl font-black tracking-[-.035em] text-slate-950">{audience.title}</h3>
                <p className="relative mt-3 min-h-24 text-sm leading-6 text-slate-600">{audience.text}</p>
                <span className="relative mt-6 inline-flex items-center gap-2 text-xs font-black text-blue-600">Ver aplicação <ArrowUpRight size={14} className="transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" /></span>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
