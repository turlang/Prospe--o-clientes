import React from 'react';
import { ArrowRight } from 'lucide-react';
import { coreFeatures } from '../content.js';

export default function FeatureFlow() {
  return (
    <section id="recursos" className="bg-white py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[.82fr_1.18fr] lg:items-end">
          <div>
            <span className="text-xs font-black uppercase tracking-[.18em] text-blue-600">O fluxo de prospecção tech</span>
            <h2 className="mt-3 text-3xl font-black leading-tight tracking-[-.04em] text-slate-950 sm:text-4xl lg:text-5xl">
              Da oportunidade encontrada ao contrato fechado.
            </h2>
          </div>
          <p className="max-w-2xl text-base leading-7 text-slate-600 lg:justify-self-end lg:text-lg">
            O LeadHunter Pro reúne pesquisa, diagnóstico, abordagem e acompanhamento em um processo criado para quem vende tecnologia.
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:mt-12 lg:grid-cols-4">
          {coreFeatures.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <article
                key={feature.title}
                className="group relative min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_12px_40px_rgba(15,23,42,.05)] transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-[0_20px_50px_rgba(37,99,235,.10)] sm:p-6"
              >
                <div className="absolute right-4 top-3 text-5xl font-black tracking-tighter text-slate-100 transition group-hover:text-blue-50">0{index + 1}</div>
                <span className={`relative grid size-11 place-items-center rounded-xl bg-gradient-to-br ${feature.accent} text-white shadow-lg`}>
                  <Icon size={21} />
                </span>
                <h3 className="relative mt-5 text-lg font-black text-slate-950">{feature.title}</h3>
                <p className="relative mt-2 text-sm leading-6 text-slate-600">{feature.text}</p>
                <div className="relative mt-5 flex items-center gap-2 border-t border-slate-100 pt-4 text-xs font-bold text-slate-500">
                  <ArrowRight size={14} className="text-blue-500" /> {feature.stat}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
