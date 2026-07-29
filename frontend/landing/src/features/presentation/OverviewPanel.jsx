/**
 * @fileoverview Tela inicial da landing sem rolagem.
 *
 * @module landing/features/presentation/OverviewPanel
 */

import React from 'react';
import { ArrowRight, Check, Sparkles } from 'lucide-react';
import ActionLink from '../../shared/ui/ActionLink.jsx';
import SignalConsole from './SignalConsole.jsx';

export default function OverviewPanel() {
  return (
    <section id="panel-inicio" className="landing-panel landing-panel--dark" role="tabpanel" aria-labelledby="tab-inicio">
      <div className="landing-panel__grid landing-panel__grid--hero">
        <div className="hero-copy-compact">
          <p className="panel-eyebrow"><Sparkles size={12} /> Prospecção para profissionais de tecnologia</p>
          <h1>Encontre empresas que precisam de <em>sites, sistemas e IA</em> — antes da concorrência.</h1>
          <p className="hero-copy-compact__description">O LeadHunter encontra sinais de oportunidade, explica o que vender e entrega a próxima ação comercial dentro do CRM.</p>
          <div className="hero-copy-compact__actions">
            <ActionLink href="/app">Começar com 10 leads <ArrowRight size={15} /></ActionLink>
            <span>Sem cartão · CRM integrado · Configuração imediata</span>
          </div>
          <ul className="hero-proof-compact">
            {['Radar por nicho e região', 'Diagnóstico comercial', 'Abordagem contextualizada'].map((item) => <li key={item}><Check size={12} strokeWidth={3} /> {item}</li>)}
          </ul>
        </div>
        <SignalConsole />
      </div>
    </section>
  );
}
