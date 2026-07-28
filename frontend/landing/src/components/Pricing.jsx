import React from 'react';
import { ArrowRight, Check, Crown, Rocket, Sparkles } from 'lucide-react';

const planMeta = {
  trial: { icon: Sparkles, eyebrow: 'Para experimentar', description: 'Valide o fluxo antes de aumentar o volume.' },
  pro: { icon: Rocket, eyebrow: 'Mais escolhido', description: 'Para freelancers com prospecção recorrente.' },
  agency: { icon: Crown, eyebrow: 'Para escalar', description: 'Para equipes e agências com operação ativa.' }
};

export default function Pricing({ plans }) {
  return (
    <section id="planos" className="relative overflow-hidden bg-slate-950 py-16 text-white sm:py-20 lg:py-24">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(37,99,235,.22),transparent_36%)]" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <span className="text-xs font-black uppercase tracking-[.18em] text-cyan-300">Planos</span>
          <h2 className="mt-3 text-3xl font-black tracking-[-.04em] text-white sm:text-4xl lg:text-5xl">Comece grátis. Cresça quando sua prospecção ganhar ritmo.</h2>
          <p className="mt-4 text-base leading-7 text-slate-400 sm:text-lg">Use os primeiros leads para validar o processo e escolha o plano que acompanha seu volume comercial.</p>
        </div>

        <div className="mt-10 grid gap-5 lg:mt-12 lg:grid-cols-3 lg:items-stretch">
          {plans.map((plan) => {
            const meta = planMeta[plan.id] || planMeta.pro;
            const Icon = meta.icon;
            const featured = plan.id === 'pro';
            return (
              <article
                key={plan.id}
                className={`relative flex min-w-0 flex-col rounded-3xl border p-6 sm:p-7 ${featured ? 'border-blue-400 bg-white text-slate-950 shadow-2xl shadow-blue-500/20 lg:-translate-y-2' : 'border-white/10 bg-white/[.055] text-white'}`}
              >
                {featured && <span className="absolute -top-3 left-6 rounded-full bg-blue-500 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-white">Mais escolhido</span>}
                <div className="flex items-center gap-3">
                  <span className={`grid size-11 place-items-center rounded-xl ${featured ? 'bg-blue-50 text-blue-600' : 'bg-white/10 text-cyan-300'}`}><Icon size={20} /></span>
                  <div className="min-w-0"><span className={`text-[9px] font-black uppercase tracking-[.15em] ${featured ? 'text-blue-600' : 'text-cyan-300'}`}>{meta.eyebrow}</span><h3 className="truncate text-lg font-black">{plan.name}</h3></div>
                </div>
                <p className={`mt-4 text-sm leading-6 ${featured ? 'text-slate-600' : 'text-slate-400'}`}>{meta.description}</p>
                <strong className="mt-6 block text-3xl font-black tracking-[-.04em] sm:text-4xl">{plan.priceLabel}</strong>
                <a href="/app" className={`mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl text-sm font-black transition duration-200 hover:-translate-y-0.5 ${featured ? 'bg-blue-500 text-white hover:bg-blue-400' : 'border border-white/15 bg-white/5 text-white hover:bg-white/10'}`}>Escolher plano <ArrowRight size={16} /></a>
                <ul className="mt-6 space-y-3 border-t border-current/10 pt-6">
                  {(plan.features || []).map((feature) => <li key={feature} className={`flex gap-2 text-sm ${featured ? 'text-slate-600' : 'text-slate-300'}`}><Check size={16} className="mt-0.5 shrink-0 text-emerald-400" />{feature}</li>)}
                </ul>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
