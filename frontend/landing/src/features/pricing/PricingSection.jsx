/**
 * @fileoverview Planos comerciais carregados da API pública.
 *
 * @module landing/features/pricing/PricingSection
 */

import React from 'react';
import { Check, Sparkles } from 'lucide-react';
import ActionLink from '../../shared/ui/ActionLink.jsx';
import SectionHeading from '../../shared/ui/SectionHeading.jsx';

function formatPrice(value) {
  return Number(value || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0
  });
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
    <section id="planos" className="bg-white py-18 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Planos"
          title="Comece gratuitamente. Escale quando o volume aumentar."
          description="Escolha o plano adequado ao seu momento comercial. Limites e cobrança são sempre confirmados pelo backend antes da contratação."
          align="center"
        />

        <div className="mt-10 grid items-stretch gap-5 lg:grid-cols-3">
          {plans.slice(0, 3).map((plan, index) => {
            const featured = Boolean(plan.featured || plan.id === 'pro' || index === 1);
            const features = normalizeFeatures(plan);
            return (
              <article key={plan.id || plan.name} className={`relative flex flex-col rounded-3xl border p-7 ${featured ? 'border-blue-500 bg-slate-950 text-white shadow-2xl shadow-blue-950/20 lg:-translate-y-3' : 'border-slate-200 bg-white text-slate-950 shadow-sm'}`}>
                {featured ? <span className="absolute right-5 top-5 inline-flex items-center gap-1 rounded-full bg-blue-500 px-3 py-1 text-[10px] font-black uppercase tracking-[.12em] text-white"><Sparkles size={11} /> Mais escolhido</span> : null}
                <p className={`text-xs font-black uppercase tracking-[.16em] ${featured ? 'text-cyan-300' : 'text-blue-600'}`}>{plan.name}</p>
                <p className={`mt-3 min-h-12 text-sm leading-6 ${featured ? 'text-slate-400' : 'text-slate-600'}`}>{plan.description || 'Plano comercial do LeadHunter Pro.'}</p>
                <div className="mt-6 flex items-end gap-2"><strong className="text-4xl font-black tracking-[-.05em]">{formatPrice(plan.price)}</strong><span className={`pb-1 text-xs ${featured ? 'text-slate-400' : 'text-slate-500'}`}>/{plan.billingPeriod || 'mês'}</span></div>
                <ActionLink href="/app" variant={featured ? 'primary' : 'light'} className="mt-6 w-full">{Number(plan.price || 0) === 0 ? 'Começar grátis' : 'Escolher plano'}</ActionLink>
                <ul className={`mt-7 space-y-3 border-t pt-6 text-sm ${featured ? 'border-white/10 text-slate-300' : 'border-slate-200 text-slate-600'}`}>
                  {features.slice(0, 5).map((feature) => <li key={feature} className="flex gap-2"><Check size={17} className="mt-0.5 shrink-0 text-emerald-400" />{feature}</li>)}
                </ul>
              </article>
            );
          })}
        </div>

        {isUsingFallback ? <p className="mt-5 text-center text-xs text-slate-500">Valores demonstrativos enquanto a configuração pública é carregada.</p> : null}
      </div>
    </section>
  );
}
