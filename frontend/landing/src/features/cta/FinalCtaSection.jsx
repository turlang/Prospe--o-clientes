/**
 * @fileoverview Chamada final com linguagem de ativação da operação comercial.
 *
 * @module landing/features/cta/FinalCtaSection
 */

import React from 'react';
import { ArrowRight, Radio, Sparkles } from 'lucide-react';
import ActionLink from '../../shared/ui/ActionLink.jsx';

export default function FinalCtaSection() {
  return (
    <section className="bg-[#f4f7fb] px-4 pb-20 sm:px-6 sm:pb-28 lg:px-8">
      <div className="relative mx-auto max-w-[88rem] overflow-hidden rounded-[2.25rem] border border-white/10 bg-[#050812] p-7 text-white shadow-[0_45px_110px_rgba(15,23,42,.25)] sm:p-12 lg:p-16">
        <div className="hero-grid pointer-events-none absolute inset-0 opacity-40" />
        <div className="pointer-events-none absolute -right-24 -top-24 size-96 rounded-full bg-blue-500/25 blur-[90px]" />
        <div className="pointer-events-none absolute -bottom-40 left-1/4 size-96 rounded-full bg-cyan-400/10 blur-[100px]" />

        <div className="relative grid gap-10 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="max-w-3xl">
            <p className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[.2em] text-cyan-300"><Radio size={12} className="animate-pulse" /> Radar pronto para ativação</p>
            <h2 className="mt-5 text-[clamp(2.2rem,4.2vw,4rem)] font-black leading-[.96] tracking-[-.055em]">Pare de procurar clientes no escuro.</h2>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-400">Ative a operação, encontre os primeiros sinais e transforme pesquisa dispersa em uma rotina comercial clara.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
            <ActionLink href="/app" className="min-w-52">Ativar agora <ArrowRight size={17} /></ActionLink>
            <span className="inline-flex items-center justify-center gap-2 text-[10px] font-bold text-slate-500"><Sparkles size={12} /> 10 leads para começar</span>
          </div>
        </div>
      </div>
    </section>
  );
}
