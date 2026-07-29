/**
 * @fileoverview Planos comerciais sincronizados com o painel administrativo.
 *
 * A apresentação mantém a origem dinâmica dos dados e usa cartões com linguagem
 * de capacidade operacional, em vez de uma tabela de preços genérica.
 *
 * @module landing/features/pricing/PricingSection
 */

import React from 'react';
import { ArrowRight, Check, Radio, Sparkles } from 'lucide-react';
import ActionLink from '../../shared/ui/ActionLink.jsx';

function formatPrice(value) {
  return Number(value || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 2
  });
}

function getPricePresentation(plan) {
  return {
    displayPrice: plan.displayPrice || plan.priceLabel || formatPrice(plan.price),
    billingPeriod: plan.billingPeriod || (plan.isPaid ? 'mês' : 'sem cobrança')
  };
}

function normalizeFeatures(plan) {
  if (Array.isArray(plan.features) && plan.features.length) return plan.features;
  const features = [];
  if (plan.dailyLeadLimit) features.push(`${Number(plan.dailyLeadLimit).toLocaleString('pt-BR')} leads por dia`);
  features.push('CRM Kanban', 'Dashboard comercial');
  return features;
}

/**
 * @param {{plans: Array<object>, isUsingFallback: boolean}} props Planos e origem dos dados.
 * @returns {React.JSX.Element} Seção de preços.
 */
export default function PricingSection({ plans, isUsingFallback }) {
  return (
    <section id="planos" className="relative overflow-hidden bg-[#f4f7fb] py-20 sm:py-28">
      <div className="pointer-events-none absolute -left-40 bottom-0 size-[32rem] rounded-full bg-blue-500/10 blur-[120px]" />
      <div className="mx-auto max-w-[88rem] px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[.2em] text-blue-600"><Radio size={12} /> Capacidade da operação</p>
          <h2 className="mt-4 text-[clamp(2.35rem,4.5vw,4.35rem)] font-black leading-[.96] tracking-[-.055em] text-slate-950">Comece pequeno. Aumente o alcance quando o funil pedir.</h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-600">Planos publicados no painel administrativo aparecem aqui automaticamente. Você controla preço, limites e benefícios sem alterar o frontend.</p>
        </div>

        <div className="mt-12 grid items-stretch gap-4 lg:grid-cols-3">
          {plans.slice(0, 3).map((plan, index) => {
            const featured = Boolean(plan.featured || plan.id === 'pro' || index === 1);
            const features = normalizeFeatures(plan);
            const price = getPricePresentation(plan);
            const isFree = plan.isPaid === false || Number(plan.price || 0) === 0;

            return (
              <article key={plan.id || plan.name} className={`relative flex min-w-0 flex-col overflow-hidden rounded-[2rem] border p-6 sm:p-7 ${featured ? 'border-blue-400/40 bg-[#070b16] text-white shadow-[0_35px_90px_rgba(37,99,235,.18)] lg:-translate-y-3' : 'border-slate-200 bg-white text-slate-950 shadow-[0_18px_55px_rgba(15,23,42,.06)]'}`}>
                {featured ? <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-500 via-cyan-300 to-violet-500" /> : null}
                <div className="flex items-start justify-between gap-3">
                  <div><p className={`text-[10px] font-black uppercase tracking-[.18em] ${featured ? 'text-cyan-300' : 'text-blue-600'}`}>Modo {plan.name}</p><span className={`mt-2 block text-xs ${featured ? 'text-slate-500' : 'text-slate-500'}`}>Capacidade operacional</span></div>
                  {featured ? <span className="inline-flex items-center gap-1 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-[9px] font-black uppercase tracking-[.1em] text-cyan-200"><Sparkles size={10} /> Recomendado</span> : <span className="grid size-9 place-items-center rounded-xl bg-slate-100 text-slate-400"><Radio size={14} /></span>}
                </div>

                <p className={`mt-6 min-h-12 text-sm leading-6 ${featured ? 'text-slate-400' : 'text-slate-600'}`}>{plan.description || 'Plano comercial do LeadHunter Pro.'}</p>
                <div className="mt-5 flex min-w-0 items-end gap-2">
                  <strong className="min-w-0 break-words text-[clamp(2.1rem,4vw,3.4rem)] font-black tracking-[-.06em]">{price.displayPrice}</strong>
                  <span className={`pb-1.5 text-xs ${featured ? 'text-slate-500' : 'text-slate-500'}`}>/{price.billingPeriod}</span>
                </div>

                <ActionLink href="/app" variant={featured ? 'primary' : 'light'} className="mt-6 w-full">{isFree ? 'Ativar radar grátis' : 'Escolher capacidade'} <ArrowRight size={15} /></ActionLink>

                <div className={`my-6 h-px ${featured ? 'bg-white/10' : 'bg-slate-200'}`} />
                <p className={`text-[9px] font-black uppercase tracking-[.14em] ${featured ? 'text-slate-500' : 'text-slate-400'}`}>Incluído na operação</p>
                <ul className={`mt-4 space-y-3 text-sm ${featured ? 'text-slate-300' : 'text-slate-600'}`}>
                  {features.slice(0, 5).map((feature) => <li key={feature} className="flex gap-2.5"><span className={`mt-0.5 grid size-5 shrink-0 place-items-center rounded-full ${featured ? 'bg-emerald-300/10 text-emerald-300' : 'bg-emerald-50 text-emerald-600'}`}><Check size={11} strokeWidth={3} /></span><span>{feature}</span></li>)}
                </ul>
              </article>
            );
          })}
        </div>

        {isUsingFallback ? <p className="mt-5 text-center text-xs text-slate-500">Sincronizando a configuração comercial publicada…</p> : null}
      </div>
    </section>
  );
}
