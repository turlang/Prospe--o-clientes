import React from 'react';
import { ArrowRight } from 'lucide-react';
import { coreFeatures } from '../content.js';

export default function FeatureFlow() {
  return (
    <section id="recursos" className="bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <span className="text-xs font-black uppercase tracking-[.18em] text-blue-600">O fluxo de prospecção tech</span>
          <h2 className="mt-3 text-3xl font-black tracking-[-.035em] text-slate-950 sm:text-4xl">Do primeiro sinal de oportunidade ao contrato fechado.</h2>
          <p className="mt-4 text-base leading-7 text-slate-600">Um processo simples para transformar empresas encontradas em conversas comerciais relevantes — sem planilhas soltas e sem abordagem genérica.</p>
        </div>
        <div className="mt-10 grid gap-4 lg:grid-cols-4">
          {coreFeatures.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <article key={feature.title} className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl hover:shadow-slate-200/60">
                <div className="flex items-center justify-between"><span className={`grid size-11 place-items-center rounded-xl bg-gradient-to-br ${feature.accent} text-white shadow-lg`}><Icon size={21} /></span><span className="text-xs font-black text-slate-300">0{index + 1}</span></div>
                <h3 className="mt-5 text-lg font-black text-slate-950">{feature.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{feature.text}</p>
                <div className="mt-5 flex items-center gap-2 border-t border-slate-100 pt-4 text-xs font-bold text-slate-500"><ArrowRight size={14} className="text-blue-500" /> {feature.stat}</div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
