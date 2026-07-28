import React from 'react';
import { ArrowRight, Check, PlayCircle, Sparkles } from 'lucide-react';
import DashboardPreview from './DashboardPreview.jsx';

export default function Hero() {
  return (
    <section id="inicio" className="relative overflow-hidden bg-slate-950 py-16 sm:py-20 lg:py-24">
      <div className="absolute inset-0 -z-0 bg-[radial-gradient(circle_at_20%_20%,rgba(37,99,235,.22),transparent_35%),radial-gradient(circle_at_85%_30%,rgba(6,182,212,.16),transparent_30%)]" />
      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-[.95fr_1.05fr] lg:px-8">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-400/10 px-3 py-1.5 text-xs font-extrabold text-blue-200"><Sparkles size={14} /> Prospecção criada para quem vende tecnologia</span>
          <h1 className="mt-6 max-w-3xl text-4xl font-black leading-[1.02] tracking-[-.045em] text-white sm:text-5xl lg:text-[3.8rem]">
            Encontre empresas que precisam de sites, sistemas e IA — e feche mais contratos de tecnologia.
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
            Descubra negócios com presença digital fraca, diagnostique oportunidades, crie abordagens com IA e organize tudo em um CRM feito para desenvolvedores, freelancers e agências.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a href="/app" className="inline-flex h-13 items-center justify-center gap-2 rounded-xl bg-emerald-400 px-6 text-sm font-black text-slate-950 shadow-xl shadow-emerald-400/20 transition hover:-translate-y-0.5 hover:bg-emerald-300">Testar grátis agora <ArrowRight size={18} /></a>
            <a href="#recursos" className="inline-flex h-13 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-6 text-sm font-extrabold text-white transition hover:bg-white/10"><PlayCircle size={18} /> Ver como funciona</a>
          </div>
          <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-xs font-semibold text-slate-400">
            {['10 leads para testar', 'Sem instalação', 'CRM integrado'].map((item) => <span key={item} className="inline-flex items-center gap-1.5"><Check size={14} className="text-emerald-300" /> {item}</span>)}
          </div>
        </div>
        <DashboardPreview />
      </div>
    </section>
  );
}
