/**
 * @fileoverview Hero editorial da landing pública.
 *
 * A seção apresenta a promessa comercial ao lado de um radar de oportunidades.
 * O visual evita o padrão genérico de dashboard e transforma a descoberta de
 * leads em uma metáfora clara de sinais comerciais detectados em tempo real.
 *
 * @module landing/features/hero/HeroSection
 */

import React from 'react';
import { ArrowRight, Check, Play, Radio, Sparkles } from 'lucide-react';
import { HERO_PROOF_ITEMS } from '../../data/content.js';
import ActionLink from '../../shared/ui/ActionLink.jsx';
import ProductMockup from './ProductMockup.jsx';

const FULL_HEADLINE = 'Encontre empresas que precisam de sites, sistemas e IA — e feche mais contratos de tecnologia.';

export default function HeroSection() {
  return (
    <section id="inicio" className="signal-hero relative isolate overflow-hidden bg-[#050812] text-white">
      <div className="hero-noise pointer-events-none absolute inset-0 -z-30" />
      <div className="hero-grid pointer-events-none absolute inset-0 -z-20" />
      <div className="pointer-events-none absolute -left-48 top-12 -z-10 size-[38rem] rounded-full bg-blue-600/20 blur-[120px]" />
      <div className="pointer-events-none absolute -right-52 top-0 -z-10 size-[34rem] rounded-full bg-cyan-400/10 blur-[110px]" />

      <div className="mx-auto grid max-w-[88rem] items-center gap-14 px-4 pb-16 pt-14 sm:px-6 sm:pb-20 sm:pt-20 lg:grid-cols-[minmax(0,.88fr)_minmax(540px,1.12fr)] lg:px-8 lg:pb-24 lg:pt-24">
        <div className="relative min-w-0">
          <div className="mb-7 flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/[.07] px-3 py-1.5 text-[10px] font-black uppercase tracking-[.16em] text-emerald-200">
              <Radio size={12} className="animate-pulse" /> Signal Engine ativo
            </span>
            <span className="text-[10px] font-bold uppercase tracking-[.16em] text-slate-500">Sales intelligence OS para tecnologia</span>
          </div>

          <h1 aria-label={FULL_HEADLINE} className="max-w-[12.5ch] text-[clamp(2.8rem,5.1vw,5.15rem)] font-black leading-[.92] tracking-[-.065em] text-white">
            Encontre empresas que precisam de{' '}
            <span className="relative inline-block text-cyan-300">
              sites, sistemas e IA
              <span className="absolute inset-x-0 -bottom-1 h-px bg-gradient-to-r from-transparent via-cyan-300/70 to-transparent" aria-hidden="true" />
            </span>.
          </h1>

          <p className="mt-7 max-w-xl text-[15px] leading-7 text-slate-300 sm:text-lg sm:leading-8">
            O LeadHunter transforma sinais digitais fracos em oportunidades comerciais claras: quem abordar, qual problema resolver e o que dizer para iniciar a conversa.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <ActionLink href="/app" className="group">
              Ativar meu radar grátis <ArrowRight size={17} className="transition group-hover:translate-x-1" />
            </ActionLink>
            <ActionLink href="#ferramentas" variant="secondary">
              <Play size={16} fill="currentColor" /> Explorar a operação
            </ActionLink>
          </div>

          <ul className="mt-7 grid max-w-xl grid-cols-1 gap-2.5 text-xs font-semibold text-slate-300 sm:grid-cols-3" aria-label="Benefícios do teste">
            {HERO_PROOF_ITEMS.map((item) => (
              <li key={item} className="inline-flex items-center gap-2">
                <span className="grid size-5 shrink-0 place-items-center rounded-full border border-emerald-300/20 bg-emerald-300/10 text-emerald-300"><Check size={11} strokeWidth={3} /></span>
                {item}
              </li>
            ))}
          </ul>

          <div className="mt-9 flex items-center gap-3 border-l border-cyan-300/30 pl-4 text-xs leading-5 text-slate-500">
            <Sparkles size={15} className="shrink-0 text-cyan-300" />
            <span>Desenvolvido para freelancers, devs, agências e especialistas em automação que vendem soluções de alto valor.</span>
          </div>
        </div>

        <ProductMockup />
      </div>

      <div className="border-y border-white/[.07] bg-white/[.025]">
        <div className="mx-auto grid max-w-[88rem] grid-cols-2 divide-x divide-white/[.07] px-4 sm:grid-cols-4 sm:px-6 lg:px-8">
          {[
            ['01', 'Sinal detectado', 'Presença digital fraca'],
            ['02', 'Diagnóstico', 'Problema comercial claro'],
            ['03', 'Abordagem', 'Mensagem contextualizada'],
            ['04', 'Pipeline', 'Próxima ação organizada']
          ].map(([number, title, description]) => (
            <div key={number} className="px-4 py-5 first:pl-0 sm:px-6">
              <span className="text-[9px] font-black tracking-[.2em] text-cyan-300">{number}</span>
              <strong className="mt-1 block text-xs text-white sm:text-sm">{title}</strong>
              <small className="mt-1 block text-[10px] leading-4 text-slate-500 sm:text-xs">{description}</small>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
