/**
 * @fileoverview Tela de comparação dos planos publicados pelo Admin.
 *
 * No desktop, os três planos permanecem visíveis para comparação imediata. Em
 * telas pequenas, botões alternam um card por vez para preservar a experiência
 * sem rolagem do documento.
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

function PlanCard({ plan, isUsingFallback, compact = false }) {
  const features = normalizeFeatures(plan).slice(0, compact ? 4 : 5);
  const displayPrice = plan.displayPrice || plan.priceLabel || formatPrice(plan.price);
  const billingPeriod = plan.billingPeriod || (plan.isPaid ? 'mês' : 'sem cobrança');
  const isFree = plan.isPaid === false || Number(plan.price || 0) === 0;
  const featured = plan.featured || plan.id === 'pro';

  return (
    <article className="pricing-card" data-featured={featured ? 'true' : 'false'}>
      <header>
        <div><small>{isFree ? 'Comece agora' : 'Plano comercial'}</small><h3>{plan.name}</h3></div>
        {featured ? <span><Sparkles size={11} /> Recomendado</span> : null}
      </header>
      <p>{plan.description || 'Plano comercial do LeadHunter Pro.'}</p>
      <div className="pricing-card__price"><strong>{displayPrice}</strong><span>/{billingPeriod}</span></div>
      <ul>{features.map((feature) => <li key={feature}><span><Check size={12} strokeWidth={3} /></span>{feature}</li>)}</ul>
      <ActionLink href="/app">{isFree ? 'Ativar radar grátis' : 'Escolher plano'} <ArrowRight size={14} /></ActionLink>
      <footer><Radio size={12} /><span>{isUsingFallback ? 'Sincronizando configuração…' : 'Publicado pelo Admin'}</span></footer>
    </article>
  );
}

export default function PricingPanel({ plans, isUsingFallback }) {
  const visiblePlans = useMemo(() => plans.slice(0, 3), [plans]);
  const recommendedIndex = Math.max(0, visiblePlans.findIndex((plan, index) => plan.featured || plan.id === 'pro' || index === 1));
  const [activePlan, setActivePlan] = useState(recommendedIndex);

  useEffect(() => {
    setActivePlan((current) => Math.min(current, Math.max(0, visiblePlans.length - 1)));
  }, [visiblePlans.length]);

  if (!visiblePlans.length) return null;
  const selectedPlan = visiblePlans[activePlan] || visiblePlans[0];

  return (
    <section id="panel-planos" className="landing-panel landing-panel--soft" role="tabpanel">
      <div className="pricing-experience">
        <header>
          <div><p className="panel-eyebrow panel-eyebrow--light"><Radio size={12} /> Planos publicados pelo Admin</p><h2>Planos para cada fase da operação.</h2></div>
          <p>Os valores e benefícios abaixo são lidos diretamente da configuração administrativa.</p>
        </header>

        <div className="pricing-grid pricing-grid--desktop">
          {visiblePlans.map((plan) => <PlanCard key={plan.id || plan.name} plan={plan} isUsingFallback={isUsingFallback} />)}
        </div>

        <div className="pricing-mobile">
          <nav className="plan-selector" role="tablist" aria-label="Planos comerciais">
            {visiblePlans.map((item, index) => <button key={item.id || item.name} type="button" role="tab" aria-selected={activePlan === index} onClick={() => setActivePlan(index)}><span>{item.name}</span>{item.featured || item.id === 'pro' ? <small><Sparkles size={10} /> recomendado</small> : null}</button>)}
          </nav>
          <PlanCard plan={selectedPlan} isUsingFallback={isUsingFallback} compact />
        </div>
      </div>
    </section>
  );
}
