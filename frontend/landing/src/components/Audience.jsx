import React from 'react';
import { audience } from '../content.js';

export default function Audience() {
  return (
    <section id="para-quem" className="border-y border-slate-200 bg-slate-50 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[.8fr_1.2fr] lg:items-center">
          <div><span className="text-xs font-black uppercase tracking-[.18em] text-blue-600">Para quem é</span><h2 className="mt-3 text-3xl font-black tracking-[-.035em] text-slate-950 sm:text-4xl">Para quem sabe entregar tecnologia, mas precisa de um fluxo comercial melhor.</h2><p className="mt-4 text-base leading-7 text-slate-600">O LeadHunter Pro ajuda profissionais tech a encontrar problemas reais, apresentar soluções relevantes e acompanhar cada oportunidade até a decisão.</p></div>
          <div className="grid gap-4 sm:grid-cols-2">
            {audience.map(({ icon: Icon, title, text }) => <article key={title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><span className="grid size-10 place-items-center rounded-xl bg-blue-50 text-blue-600"><Icon size={20} /></span><h3 className="mt-4 font-black text-slate-950">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{text}</p></article>)}
          </div>
        </div>
      </div>
    </section>
  );
}
