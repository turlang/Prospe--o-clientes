/**
 * @fileoverview Tela interativa do fluxo comercial.
 *
 * O painel usa uma composição editorial de duas colunas: contexto e seleção à
 * esquerda; demonstração operacional à direita. A estrutura mantém a landing
 * em uma única viewport e evita títulos superdimensionados ou áreas vazias.
 *
 * @module landing/features/presentation/WorkflowPanel
 */

import React, { useState } from 'react';
import { ArrowRight, CheckCircle2, Crosshair, Globe2, TrendingUp } from 'lucide-react';
import { WORKFLOW_STEPS } from '../../data/content.js';

const DETAILS = Object.freeze([
  {
    label: 'Entrada',
    metric: '186 sinais',
    description: 'Encontramos negócios locais sem presença digital forte que estão perdendo oportunidades todos os dias.',
    bullets: ['Presença digital fraca', 'Ausência de site', 'Baixa conversão local'],
    features: [
      { icon: Globe2, title: 'Varredura contínua', text: 'Coletamos e analisamos dados públicos de múltiplas fontes.' },
      { icon: Crosshair, title: 'Detecção precisa', text: 'Avaliamos presença digital, reputação e conversão local.' },
      { icon: TrendingUp, title: 'Oportunidades qualificadas', text: 'Priorizamos os melhores alvos para gerar impacto imediato.' }
    ]
  },
  {
    label: 'Análise',
    metric: '84% aderência',
    description: 'Traduzimos sinais técnicos e comerciais em uma oportunidade objetiva de site, sistema, automação ou IA.',
    bullets: ['Site institucional', 'Sistema interno', 'Automação e IA'],
    features: [
      { icon: Globe2, title: 'Leitura do cenário', text: 'Organizamos os sinais encontrados em um diagnóstico claro.' },
      { icon: Crosshair, title: 'Problema prioritário', text: 'Destacamos a dor com maior potencial de gerar uma proposta.' },
      { icon: TrendingUp, title: 'Oferta aderente', text: 'Relacionamos a necessidade ao serviço que você realmente vende.' }
    ]
  },
  {
    label: 'Contato',
    metric: '3 versões',
    description: 'A IA prepara uma abordagem contextualizada, humanizada e alinhada ao problema comercial encontrado.',
    bullets: ['Tom humanizado', 'Argumento específico', 'CTA comercial objetivo'],
    features: [
      { icon: Globe2, title: 'Contexto do lead', text: 'A mensagem parte do diagnóstico, não de um texto genérico.' },
      { icon: Crosshair, title: 'Argumento específico', text: 'A proposta de conversa aponta um ganho concreto para o negócio.' },
      { icon: TrendingUp, title: 'Próxima ação', text: 'O contato termina com um convite comercial claro e objetivo.' }
    ]
  },
  {
    label: 'Execução',
    metric: 'Próxima ação',
    description: 'O CRM acompanha cada contato, follow-up, reunião e proposta até o fechamento ou descarte da oportunidade.',
    bullets: ['Follow-up', 'Reunião', 'Proposta e ganho'],
    features: [
      { icon: Globe2, title: 'Histórico centralizado', text: 'Interações e decisões ficam registradas na mesma oportunidade.' },
      { icon: Crosshair, title: 'Cadência comercial', text: 'Tarefas e retornos mantêm a negociação em movimento.' },
      { icon: TrendingUp, title: 'Previsibilidade', text: 'O pipeline revela volume, conversão e potencial de receita.' }
    ]
  }
]);

export default function WorkflowPanel() {
  const [activeStep, setActiveStep] = useState(0);
  const current = WORKFLOW_STEPS[activeStep];
  const detail = DETAILS[activeStep];

  return (
    <section id="panel-como-funciona" className="landing-panel" role="tabpanel">
      <div className="experience-card workflow-card">
        <aside className="workflow-intro">
          <div>
            <p className="panel-eyebrow panel-eyebrow--light">Fluxo de prospecção tech</p>
            <h2>Quatro decisões. Uma operação comercial completa.</h2>
            <p>Siga as etapas do LeadHunter para transformar dados públicos em oportunidades reais e avançar com precisão no funil.</p>
          </div>

          <nav className="workflow-selector" role="tablist" aria-label="Etapas do fluxo">
            {WORKFLOW_STEPS.map((step, index) => {
              const StepIcon = step.icon;
              return (
                <button
                  key={step.title}
                  type="button"
                  role="tab"
                  aria-selected={activeStep === index}
                  className="workflow-selector__button"
                  onClick={() => setActiveStep(index)}
                >
                  <span>0{index + 1}</span>
                  <i><StepIcon size={18} /></i>
                  <strong>{step.title}</strong>
                  <b aria-hidden="true">›</b>
                </button>
              );
            })}
          </nav>
        </aside>

        <article className="workflow-detail" key={current.title}>
          <header className="workflow-detail__topline">
            <div className="workflow-detail__copy">
              <small><span aria-hidden="true" /> {detail.label}</small>
              <h3>{current.title}</h3>
              <p>{detail.description}</p>
            </div>
            <div className="workflow-detail__metric">
              <span>{detail.metric}</span>
              <small>resultado encontrado</small>
            </div>
          </header>

          <div className="workflow-detail__content">
            <div className="workflow-radar" aria-hidden="true">
              <div className="workflow-radar__rings"><i /><i /><i /><i /></div>
              <div className="workflow-radar__crosshair" />
              <div className="workflow-radar__beam" />
              <span className="workflow-radar__point workflow-radar__point--1" />
              <span className="workflow-radar__point workflow-radar__point--2" />
              <span className="workflow-radar__point workflow-radar__point--3" />
              <span className="workflow-radar__core" />
            </div>

            <div className="workflow-feature-list">
              {detail.features.map((feature) => {
                const FeatureIcon = feature.icon;
                return (
                  <article key={feature.title}>
                    <i><FeatureIcon size={21} /></i>
                    <div><strong>{feature.title}</strong><p>{feature.text}</p></div>
                  </article>
                );
              })}
            </div>
          </div>

          <footer className="workflow-detail__footer">
            <ul>{detail.bullets.map((item) => <li key={item}><CheckCircle2 size={15} /> {item}</li>)}</ul>
            <button type="button" className="workflow-next" onClick={() => setActiveStep((activeStep + 1) % WORKFLOW_STEPS.length)}>
              Próxima etapa <ArrowRight size={14} />
            </button>
          </footer>
        </article>
      </div>
    </section>
  );
}
