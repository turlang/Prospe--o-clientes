/**
 * @fileoverview Tela interativa do fluxo comercial.
 *
 * Cada etapa atualiza a composição central sem deslocar a viewport. A trilha
 * visual explicita onde a oportunidade está e reduz áreas vazias no painel.
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
          <div>
            <p className="panel-eyebrow panel-eyebrow--light">Fluxo de prospecção tech</p>
            <h2>Quatro decisões para transformar um sinal em contrato.</h2>
          </div>
          <p>Selecione uma etapa. O painel mostra o dado recebido, a decisão comercial e a próxima ação gerada.</p>
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
            <div className="workflow-detail__topline">
              <div className="workflow-detail__icon"><Icon size={26} /></div>
              <div className="workflow-detail__copy">
                <small>{detail.label}</small>
                <h3>{current.title}</h3>
                <p>{current.text}</p>
                <strong>{detail.outcome}</strong>
              </div>
              <div className="workflow-detail__metric"><span>{detail.metric}</span><small>resultado demonstrativo</small></div>
            </div>

            <div className="workflow-detail__board" aria-label="Trilha da oportunidade">
              {WORKFLOW_STEPS.map((step, index) => (
                <div key={step.title} className="workflow-node" data-state={index < activeStep ? 'done' : index === activeStep ? 'active' : 'next'}>
                  <span>{index < activeStep ? '✓' : `0${index + 1}`}</span>
                  <div><small>{index === activeStep ? 'etapa atual' : index < activeStep ? 'concluída' : 'próxima'}</small><strong>{step.title}</strong><p>{step.text}</p></div>
                </div>
              ))}
            </div>

            <ul>{detail.bullets.map((item) => <li key={item}><CheckCircle2 size={15} /> {item}</li>)}</ul>
            <button type="button" className="workflow-next" onClick={() => setActiveStep((activeStep + 1) % WORKFLOW_STEPS.length)}>Próxima etapa <ArrowRight size={14} /></button>
          </article>
        </div>
      </div>
    </section>
  );
}
