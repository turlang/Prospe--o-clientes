/**
 * @fileoverview Tela interativa das ferramentas do produto.
 *
 * @module landing/features/presentation/ToolsPanel
 */

import React, { useState } from 'react';
import { ArrowUpRight, Check } from 'lucide-react';
import { TOOL_CARDS } from '../../data/content.js';

const TOOL_POINTS = Object.freeze([
  ['Busca por nicho e cidade', 'Priorização automática', 'Lista pronta para CRM'],
  ['Critérios comerciais', 'Score de 0 a 100', 'Ordem de contato'],
  ['Resumo do lead', 'Argumento sugerido', 'Próxima ação'],
  ['Agenda centralizada', 'Alertas de retorno', 'Histórico completo'],
  ['Etapas visíveis', 'Potencial financeiro', 'Propostas organizadas'],
  ['Conversão por etapa', 'Motivos de perda', 'Previsão comercial']
]);

const TOOL_EVENTS = Object.freeze([
  ['Clínica Horizonte', 'Score 92', 'Diagnóstico pronto'],
  ['Atlas Contábil', 'Score 86', 'Contato sugerido'],
  ['Nova Forma', 'Score 81', 'Adicionar ao CRM']
]);

export default function ToolsPanel() {
  const [activeTool, setActiveTool] = useState(0);
  const tool = TOOL_CARDS[activeTool];
  const Icon = tool.icon;

  return (
    <section id="panel-ferramentas" className="landing-panel landing-panel--soft" role="tabpanel">
      <div className="tools-experience">
        <header className="tools-experience__heading">
          <p className="panel-eyebrow panel-eyebrow--light">Sistema operacional de prospecção</p>
          <h2>Uma ferramenta certa para cada decisão comercial.</h2>
          <p>Escolha um recurso e veja como ele entra na operação sem abrir outra página.</p>
        </header>

        <nav className="tool-selector" role="tablist" aria-label="Ferramentas do LeadHunter">
          {TOOL_CARDS.map((item, index) => {
            const ItemIcon = item.icon;
            return <button key={item.title} type="button" role="tab" aria-selected={activeTool === index} onClick={() => setActiveTool(index)}><ItemIcon size={17} /><span>{item.title}</span></button>;
          })}
        </nav>

        <article className="tool-stage" key={tool.title}>
          <div className="tool-stage__visual">
            <span className="tool-stage__signal">LIVE</span>
            <div className="tool-stage__metric"><small>{tool.eyebrow}</small><strong>{tool.metric}</strong></div>
            <div className="tool-stage__orb"><Icon size={36} /></div>
            <div className="tool-stage__queue">
              {TOOL_EVENTS.map(([name, score, status], index) => <div key={name} className={index === activeTool % TOOL_EVENTS.length ? 'is-highlighted' : ''}><span>0{index + 1}</span><strong>{name}</strong><small>{score} · {status}</small></div>)}
            </div>
            <div className="tool-stage__bars"><i /><i /><i /><i /><i /></div>
          </div>
          <div className="tool-stage__copy">
            <small>{tool.eyebrow}</small>
            <h3>{tool.title}</h3>
            <p>{tool.text}</p>
            <ul>{TOOL_POINTS[activeTool].map((point) => <li key={point}><Check size={14} strokeWidth={3} /> {point}</li>)}</ul>
            <a href="/app">Usar no sistema <ArrowUpRight size={14} /></a>
          </div>
        </article>
      </div>
    </section>
  );
}
