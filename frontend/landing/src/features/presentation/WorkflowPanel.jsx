/**
 * @fileoverview Tela interativa do fluxo comercial.
 *
 * Cada etapa é selecionada por botão e atualiza o conteúdo correspondente sem
 * mover a viewport.
 *
 * @module landing/features/presentation/WorkflowPanel
 */

import React, { useState } from 'react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { WORKFLOW_STEPS } from '../../data/content.js';

const DETAILS = Object.freeze([
  { label: 'Entrada', metric: '186 sinais', outcome: 'Lista qualificada por região e nicho.', bullets: ['Presença digital fraca', 'Ausência de site', 'Baixa conversão local'] },
  { label: 'Análise', metric: '84% aderência', outcome: 'Problema traduzido em oportunidade de serviço.', bullets: ['Site institucional', 'Sistema interno', 'Automação e IA'] },
  { label: 'Contato', metric: '3 versões', outcome: 'Mensagem criada com contexto, não com spam genérico.', bullets: ['Tom humanizado', 'Argumento específico', 'CTA comercial objetivo'] },
  { label: 'Execução', metric: 'Próxima ação', outcome: 'Negociação acompanhada até proposta e fechamento.', bullets: ['Follow-up', 'Reunião', 'Proposta e ganho'] }
]);

export default function WorkflowPanel() {
  const [activeStep, setActiveStep] = useState(0);
  const current = WORKFLOW_STEPS[activeStep];
  const detail = DETAILS[activeStep];
  const Icon = current.icon;

  return (
    <section id="panel-como-funciona" className="landing-panel" role="tabpanel">
      <div className="experience-card">
        <header className="experience-heading">
          <div><p className="panel-eyebrow panel-eyebrow--light">Fluxo de prospecção tech</p><h2>Quatro decisões. Uma operação comercial completa.</h2></div>
          <p>Selecione uma etapa para entender como o LeadHunter transforma dados públicos em uma próxima ação comercial.</p>
        </header>

        <div className="workflow-experience">
          <nav className="workflow-selector" role="tablist" aria-label="Etapas do fluxo">
            {WORKFLOW_STEPS.map((step, index) => {
              const StepIcon = step.icon;
              return (
                <button key={step.title} type="button" role="tab" aria-selected={activeStep === index} className="workflow-selector__button" onClick={() => setActiveStep(index)}>
                  <span>0{index + 1}</span><i><StepIcon size={18} /></i><strong>{step.title}</strong>
                </button>
              );
            })}
          </nav>

          <article className="workflow-detail" key={current.title}>
            <div className="workflow-detail__icon"><Icon size={28} /></div>
            <div className="workflow-detail__copy">
              <small>{detail.label}</small>
              <h3>{current.title}</h3>
              <p>{current.text}</p>
              <strong>{detail.outcome}</strong>
            </div>
            <div className="workflow-detail__metric"><span>{detail.metric}</span><small>resultado demonstrativo</small></div>
            <ul>{detail.bullets.map((item) => <li key={item}><CheckCircle2 size={15} /> {item}</li>)}</ul>
            <button type="button" className="workflow-next" onClick={() => setActiveStep((activeStep + 1) % WORKFLOW_STEPS.length)}>Próxima etapa <ArrowRight size={14} /></button>
          </article>
        </div>
      </div>
    </section>
  );
}
