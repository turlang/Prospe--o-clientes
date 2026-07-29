/**
 * @fileoverview Tela de segmentação por público.
 *
 * @module landing/features/presentation/AudiencePanel
 */

import React, { useState } from 'react';
import { Check, Sparkles } from 'lucide-react';
import { AUDIENCES } from '../../data/content.js';

const AUDIENCE_DETAILS = Object.freeze([
  { offer: 'Sites, sistemas internos e integrações', signals: ['Site lento ou antigo', 'Processo manual', 'Ausência de integração'], result: 'Mais projetos com problema técnico claro.' },
  { offer: 'Landing pages, sites e manutenção', signals: ['Negócio sem site', 'Baixa presença local', 'Contato sem conversão'], result: 'Rotina de prospecção sem depender só de indicação.' },
  { offer: 'Projetos recorrentes e campanhas', signals: ['Volume de filiais', 'Múltiplos serviços', 'Equipe comercial ativa'], result: 'Pipeline compartilhado e previsibilidade para o time.' },
  { offer: 'Agentes, automações e eficiência operacional', signals: ['Atendimento repetitivo', 'Planilhas manuais', 'Follow-up inconsistente'], result: 'Oportunidades ancoradas em economia de tempo e escala.' }
]);

export default function AudiencePanel() {
  const [activeAudience, setActiveAudience] = useState(0);
  const audience = AUDIENCES[activeAudience];
  const detail = AUDIENCE_DETAILS[activeAudience];
  const Icon = audience.icon;

  return (
    <section id="panel-publico" className="landing-panel" role="tabpanel">
      <div className="audience-experience">
        <header>
          <p className="panel-eyebrow panel-eyebrow--light">Para quem vende tecnologia</p>
          <h2>A mesma inteligência. Argumentos diferentes para cada operação.</h2>
        </header>

        <nav className="audience-selector" role="tablist" aria-label="Perfis atendidos">
          {AUDIENCES.map((item, index) => {
            const ItemIcon = item.icon;
            return <button key={item.title} type="button" role="tab" aria-selected={activeAudience === index} onClick={() => setActiveAudience(index)}><ItemIcon size={17} /><span>{item.title}</span></button>;
          })}
        </nav>

        <article className="audience-stage" key={audience.title}>
          <div className="audience-stage__identity">
            <span><Icon size={30} /></span>
            <small>Modo de operação</small>
            <h3>{audience.title}</h3>
            <p>{audience.text}</p>
          </div>
          <div className="audience-stage__offer"><small>O que você vende</small><strong>{detail.offer}</strong></div>
          <div className="audience-stage__signals"><small>Sinais encontrados pelo radar</small><ul>{detail.signals.map((signal) => <li key={signal}><Check size={13} /> {signal}</li>)}</ul></div>
          <div className="audience-stage__result"><Sparkles size={18} /><div><small>Resultado esperado</small><strong>{detail.result}</strong></div></div>
        </article>
      </div>
    </section>
  );
}
