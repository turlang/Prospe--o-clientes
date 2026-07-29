/**
 * @fileoverview Tela compacta de planos publicados pelo Admin.
 *
 * Apenas um plano é exibido por vez. Isso reduz a altura necessária e mantém a
 * landing sem rolagem, enquanto os botões permitem comparação direta.
 *
 * @module landing/features/presentation/PricingPanel
 */

import React, { useEffect, useMemo, useState } from 'react';
import { ArrowRight, Check, Radio, Sparkles } from 'lucide-react';
import ActionLink from '../../shared/ui/ActionLink.jsx';

function formatPrice(value) {
  return Number(value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 2 });
}

function normalizeFeatures(plan) {
  if (Array.isArray(plan.features) && plan.features.length) return plan.features;
  const generated = [];
  if (plan.dailyLeadLimit) generated.push(`${Number(plan.dailyLeadLimit).toLocaleString('pt-BR')} leads por dia`);
  return [...generated, 'CRM Kanban', 'Dashboard comercial'];
}

/**
 * @param {{plans: Array<object>, isUsingFallback: boolean}} props Planos publicados.
 * @returns {React.JSX.Element} Tela de preços.
 */
export default function PricingPanel({ plans, isUsingFallback }) {
  const visiblePlans = useMemo(() => plans.slice(0, 3), [plans]);
  const recommendedIndex = Math.max(0, visiblePlans.findIndex((plan, index) => plan.featured || plan.id === 'pro' || index === 1));
  const [activePlan, setActivePlan] = useState(recommendedIndex);

  useEffect(() => {
    setActivePlan((current) => Math.min(current, Math.max(0, visiblePlans.length - 1)));
  }, [visiblePlans.length]);

  const plan = visiblePlans[activePlan] || visiblePlans[0];
  if (!plan) return null;

  const features = normalizeFeatures(plan).slice(0, 5);
  const displayPrice = plan.displayPrice || plan.priceLabel || formatPrice(plan.price);
  const billingPeriod = plan.billingPeriod || (plan.isPaid ? 'mês' : 'sem cobrança');
  const isFree = plan.isPaid === false || Number(plan.price || 0) === 0;

  return (
    <section id="panel-planos" className="landing-panel landing-panel--soft" role="tabpanel">
      <div className="pricing-experience">
        <header>
          <div><p className="panel-eyebrow panel-eyebrow--light"><Radio size={12} /> Planos publicados pelo Admin</p><h2>Escolha a capacidade da sua operação.</h2></div>
          <p>Preços, limites e benefícios continuam sincronizados com o painel administrativo.</p>
        </header>

        <nav className="plan-selector" role="tablist" aria-label="Planos comerciais">
          {visiblePlans.map((item, index) => <button key={item.id || item.name} type="button" role="tab" aria-selected={activePlan === index} onClick={() => setActivePlan(index)}><span>{item.name}</span>{item.featured || item.id === 'pro' ? <small><Sparkles size={10} /> recomendado</small> : null}</button>)}
        </nav>

        <article className="plan-stage" key={`${plan.id}-${displayPrice}`}>
          <div className="plan-stage__summary">
            <small>Modo {plan.name}</small>
            <h3>{plan.description || 'Plano comercial do LeadHunter Pro.'}</h3>
            <div className="plan-stage__price"><strong>{displayPrice}</strong><span>/{billingPeriod}</span></div>
            <ActionLink href="/app" className="w-full">{isFree ? 'Ativar radar grátis' : 'Escolher este plano'} <ArrowRight size={15} /></ActionLink>
          </div>
          <div className="plan-stage__features">
            <small>Incluído na operação</small>
            <ul>{features.map((feature) => <li key={feature}><span><Check size={13} strokeWidth={3} /></span>{feature}</li>)}</ul>
            <div className="plan-stage__status"><Radio size={15} /><div><small>Publicação dinâmica</small><strong>{isUsingFallback ? 'Sincronizando configuração…' : 'Configuração atual do Admin'}</strong></div></div>
          </div>
        </article>
      </div>
    </section>
  );
}
