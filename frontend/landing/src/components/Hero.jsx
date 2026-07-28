import React from 'react';
import { ArrowRight, Check, MousePointerClick, Sparkles } from 'lucide-react';
import DashboardPreview from './DashboardPreview.jsx';

const headline = 'Encontre empresas que precisam de sites, sistemas e IA — e feche mais contratos de tecnologia.';

export default function Hero() {
  return (
    <section id="inicio" className="relative isolate overflow-hidden bg-slate-950 pb-12 pt-12 text-white sm:pb-16 sm:pt-16 lg:pb-20 lg:pt-20">
      <div className="pointer-events-none absolute inset-0 -z-20 bg-[radial-gradient(circle_at_20%_0%,rgba(37,99,235,.30),transparent_33%),radial-gradient(circle_at_92%_22%,rgba(6,182,212,.17),transparent_30%)]" />
      <div className="hero-grid pointer-events-none absolute inset-0 -z-10 opacity-40" />

      <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-[minmax(0,.92fr)_minmax(520px,1.08fr)] lg:gap-14 lg:px-8">
        <div className="min-w-0">
          <div className="inline-flex max-w-full items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/8 px-3 py-1.5 text-[10px] font-black uppercase tracking-[.14em] text-cyan-200 sm:text-xs">
            <Sparkles size={13} className="shrink-0" />
            <span className="truncate">Prospecção comercial para profissionais de tecnologia</span>
          </div>

          <h1
            aria-label={headline}
            className="mt-5 max-w-[760px] text-[clamp(2rem,5.2vw,4rem)] font-black leading-[1.04] tracking-[-.045em] text-white"
          >
            Encontre empresas que precisam de{' '}
            <span className="bg-gradient-to-r from-blue-300 via-cyan-300 to-emerald-300 bg-clip-text text-transparent">
              sites, sistemas e IA
            </span>
            <span className="block pt-1 text-slate-100">— e feche mais contratos de tecnologia.</span>
          </h1>

          <p className="mt-5 max-w-2xl text-[15px] leading-7 text-slate-300 sm:text-lg sm:leading-8">
            Descubra empresas com oportunidades reais, receba um diagnóstico comercial e transforme cada lead em uma abordagem personalizada — tudo dentro de um CRM simples e objetivo.
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <a
              href="/app"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-blue-500 px-5 text-sm font-black text-white shadow-xl shadow-blue-500/25 transition duration-200 hover:-translate-y-0.5 hover:bg-blue-400"
            >
              Começar com 10 leads grátis <ArrowRight size={17} />
            </a>
            <a
              href="#ferramentas"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-5 text-sm font-extrabold text-white transition duration-200 hover:border-white/25 hover:bg-white/10"
            >
              <MousePointerClick size={17} /> Ver o produto
            </a>
          </div>

          <div className="mt-6 grid max-w-xl grid-cols-1 gap-2.5 text-xs font-semibold text-slate-300 sm:grid-cols-3">
            {['Sem cartão', 'Configuração imediata', 'CRM integrado'].map((item) => (
              <span key={item} className="inline-flex items-center gap-2">
                <span className="grid size-5 shrink-0 place-items-center rounded-full bg-emerald-400/15 text-emerald-300">
                  <Check size={12} strokeWidth={3} />
                </span>
                {item}
              </span>
            ))}
          </div>
        </div>

        <DashboardPreview />
      </div>

      <div className="mx-auto mt-10 max-w-7xl px-4 sm:mt-14 sm:px-6 lg:px-8">
        <div className="grid gap-3 rounded-2xl border border-white/10 bg-white/[.045] p-3 backdrop-blur sm:grid-cols-2 lg:grid-cols-4">
          {[
            ['Encontre', 'negócios com presença digital fraca'],
            ['Diagnostique', 'sites, sistemas, automações e IA'],
            ['Aborde', 'com mensagens personalizadas'],
            ['Organize', 'todo o processo no CRM Kanban']
          ].map(([title, text], index) => (
            <div key={title} className="flex gap-3 rounded-xl px-3 py-2.5">
              <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-blue-500/15 text-[11px] font-black text-blue-200">0{index + 1}</span>
              <p className="text-xs leading-5 text-slate-400"><strong className="block text-sm text-white">{title}</strong>{text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
