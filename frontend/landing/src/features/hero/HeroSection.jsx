/**
 * @fileoverview Hero de alta conversão da landing pública.
 *
 * A hierarquia limita o comprimento visual do título e posiciona o produto no
 * primeiro viewport, evitando o bloco tipográfico excessivo da versão anterior.
 *
 * @module landing/features/hero/HeroSection
 */

import React from 'react';
import { ArrowRight, Check, MousePointerClick, Sparkles } from 'lucide-react';
import { HERO_PROOF_ITEMS } from '../../data/content.js';
import ActionLink from '../../shared/ui/ActionLink.jsx';
import ProductMockup from './ProductMockup.jsx';

const FULL_HEADLINE = 'Encontre empresas que precisam de sites, sistemas e IA — e feche mais contratos de tecnologia.';

export default function HeroSection() {
  return (
    <section id="inicio" className="relative isolate overflow-hidden bg-slate-950 pb-14 pt-12 text-white sm:pb-18 sm:pt-16 lg:pb-22 lg:pt-20">
      <div className="pointer-events-none absolute inset-0 -z-20 bg-[radial-gradient(circle_at_15%_0%,rgba(37,99,235,.34),transparent_34%),radial-gradient(circle_at_95%_20%,rgba(6,182,212,.18),transparent_28%)]" />
      <div className="hero-grid pointer-events-none absolute inset-0 -z-10 opacity-40" />

      <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-[minmax(0,.92fr)_minmax(500px,1.08fr)] lg:gap-14 lg:px-8">
        <div className="min-w-0">
          <p className="inline-flex max-w-full items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/[.07] px-3 py-1.5 text-[9px] font-black uppercase tracking-[.14em] text-cyan-200 sm:text-[11px]">
            <Sparkles size={13} className="shrink-0" />
            <span>Prospecção comercial para profissionais de tecnologia</span>
          </p>

          <h1 aria-label={FULL_HEADLINE} className="mt-5 max-w-[13ch] text-[clamp(2.45rem,4.6vw,4.3rem)] font-black leading-[.98] tracking-[-.05em] text-white">
            Encontre empresas que precisam de <span className="text-cyan-300">sites, sistemas e IA</span>.
            <span className="mt-2 block text-[.74em] leading-[1.05] tracking-[-.035em] text-slate-200">Feche mais contratos de tecnologia.</span>
          </h1>

          <p className="mt-6 max-w-xl text-[15px] leading-7 text-slate-300 sm:text-lg sm:leading-8">
            Descubra empresas com oportunidades reais, receba um diagnóstico comercial e transforme cada lead em uma abordagem personalizada — tudo dentro de um CRM simples e objetivo.
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <ActionLink href="/app">Começar com 10 leads grátis <ArrowRight size={17} /></ActionLink>
            <ActionLink href="#ferramentas" variant="secondary"><MousePointerClick size={17} /> Ver o produto</ActionLink>
          </div>

          <ul className="mt-6 grid max-w-xl grid-cols-1 gap-2.5 text-xs font-semibold text-slate-300 sm:grid-cols-3" aria-label="Benefícios do teste">
            {HERO_PROOF_ITEMS.map((item) => (
              <li key={item} className="inline-flex items-center gap-2"><span className="grid size-5 shrink-0 place-items-center rounded-full bg-emerald-400/15 text-emerald-300"><Check size={12} strokeWidth={3} /></span>{item}</li>
            ))}
          </ul>
        </div>

        <ProductMockup />
      </div>
    </section>
  );
}
