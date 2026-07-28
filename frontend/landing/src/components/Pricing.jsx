import React from 'react';
import { ArrowRight, Check, Crown, Rocket, Sparkles } from 'lucide-react';

const planMeta = {
  trial: { icon: Sparkles, description: 'Para conhecer o fluxo e validar a ferramenta.' },
  pro: { icon: Rocket, description: 'Para freelancers com prospecção recorrente.' },
  agency: { icon: Crown, description: 'Para equipes e agências que precisam de escala.' }
};

export default function Pricing({ plans }) {
  return (
    <section id="planos" className="bg-slate-950 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center"><span className="text-xs font-black uppercase tracking-[.18em] text-cyan-300">Planos</span><h2 className="mt-3 text-3xl font-black tracking-[-.035em] text-white sm:text-4xl">Comece grátis e aumente o volume quando sua operação crescer.</h2><p className="mt-4 text-slate-400">Sem instalação. Acesse pelo navegador e mantenha seus leads organizados desde o primeiro contato.</p></div>
        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {plans.map((plan) => {
            const meta = planMeta[plan.id] || planMeta.pro;
            const Icon = meta.icon;
            const featured = plan.id === 'pro';
            return (
              <article key={plan.id} className={`relative rounded-2xl border p-6 ${featured ? 'border-blue-400 bg-white shadow-2xl shadow-blue-500/20 lg:-translate-y-2' : 'border-white/10 bg-white/[.05] text-white'}`}>
                {featured && <span className="absolute -top-3 left-6 rounded-full bg-blue-600 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-white">Mais escolhido</span>}
                <div className="flex items-center gap-3"><span className={`grid size-11 place-items-center rounded-xl ${featured ? 'bg-blue-50 text-blue-600' : 'bg-white/10 text-cyan-300'}`}><Icon size={20} /></span><div><h3 className={`font-black ${featured ? 'text-slate-950' : 'text-white'}`}>{plan.name}</h3><p className={`text-xs ${featured ? 'text-slate-500' : 'text-slate-400'}`}>{meta.description}</p></div></div>
                <strong className={`mt-7 block text-3xl font-black ${featured ? 'text-slate-950' : 'text-white'}`}>{plan.priceLabel}</strong>
                <a href="/app" className={`mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl text-sm font-black transition hover:-translate-y-0.5 ${featured ? 'bg-blue-600 text-white hover:bg-blue-500' : 'border border-white/15 bg-white/5 text-white hover:bg-white/10'}`}>Escolher plano <ArrowRight size={16} /></a>
                <ul className="mt-6 space-y-3">{(plan.features || []).map((feature) => <li key={feature} className={`flex gap-2 text-sm ${featured ? 'text-slate-600' : 'text-slate-300'}`}><Check size={16} className="mt-0.5 shrink-0 text-emerald-400" />{feature}</li>)}</ul>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
