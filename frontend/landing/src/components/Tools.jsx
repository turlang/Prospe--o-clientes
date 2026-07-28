import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { showcase } from '../content.js';

export default function Tools() {
  return (
    <section id="ferramentas" className="bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center"><span className="text-xs font-black uppercase tracking-[.18em] text-blue-600">Ferramentas do sistema</span><h2 className="mt-3 text-3xl font-black tracking-[-.035em] text-slate-950 sm:text-4xl">Tudo que você precisa para prospectar sem perder o controle.</h2></div>
        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {showcase.map(({ icon: Icon, title, text }) => <article key={title} className="rounded-2xl border border-slate-200 p-5"><div className="flex items-center justify-between"><span className="grid size-10 place-items-center rounded-xl bg-slate-950 text-cyan-300"><Icon size={19} /></span><CheckCircle2 size={18} className="text-emerald-500" /></div><h3 className="mt-5 font-black text-slate-950">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{text}</p></article>)}
        </div>
      </div>
    </section>
  );
}
