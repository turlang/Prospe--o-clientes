/**
 * @fileoverview Console comercial compacta para a tela inicial.
 *
 * O componente comunica descoberta, diagnóstico e abordagem sem ocupar uma
 * seção vertical inteira. Os dados são demonstrativos e não representam leads
 * reais do usuário.
 *
 * @module landing/features/presentation/SignalConsole
 */

import React from 'react';
import { Bot, Building2, Crosshair, MapPin, MessageSquareText, Radio } from 'lucide-react';

const DOTS = Object.freeze([
  { angle: '18deg', distance: '31%', delay: '0s' },
  { angle: '128deg', distance: '37%', delay: '.55s' },
  { angle: '242deg', distance: '40%', delay: '1.1s' }
]);

export default function SignalConsole() {
  return (
    <div className="compact-console" aria-label="Demonstração do radar comercial LeadHunter Pro">
      <header className="compact-console__bar">
        <span className="compact-console__lights" aria-hidden="true"><i /><i /><i /></span>
        <span><Radio size={11} className="text-emerald-400" /> Signal Engine ativo</span>
        <strong>LH / 25.6</strong>
      </header>

      <div className="compact-console__body">
        <section className="compact-radar-panel">
          <div className="compact-panel-heading">
            <div><small>Varredura inteligente</small><strong>186 sinais na região</strong></div>
            <span>87/100</span>
          </div>
          <div className="compact-radar">
            <i className="compact-radar__ring compact-radar__ring--one" />
            <i className="compact-radar__ring compact-radar__ring--two" />
            <i className="compact-radar__axis compact-radar__axis--x" />
            <i className="compact-radar__axis compact-radar__axis--y" />
            <i className="compact-radar__sweep" />
            <span className="compact-radar__center"><Crosshair size={18} /></span>
            {DOTS.map((dot, index) => (
              <span
                key={`${dot.angle}-${dot.distance}`}
                className="signal-dot absolute left-1/2 top-1/2"
                style={{ '--signal-angle': dot.angle, '--signal-distance': dot.distance, '--signal-delay': dot.delay }}
              ><i /></span>
            ))}
          </div>
          <div className="compact-radar__metrics">
            <span><small>Cobertura</small><strong>12 km</strong></span>
            <span><small>Nichos</small><strong>08</strong></span>
            <span><small>Alta prioridade</small><strong>42</strong></span>
          </div>
        </section>

        <aside className="compact-lead-panel">
          <div className="compact-lead-panel__header">
            <div><small>Sinal prioritário</small><strong>Clínica Horizonte</strong></div>
            <b>92</b>
          </div>
          <ul className="compact-lead-meta">
            <li><MapPin size={13} /> Campinas · SP</li>
            <li><Building2 size={13} /> Saúde · 4,7★</li>
          </ul>
          <div className="compact-diagnosis">
            <small>Diagnóstico encontrado</small>
            <strong>Agendamento ainda depende de atendimento manual.</strong>
            <span><i /> 84% de aderência</span>
          </div>
          <div className="compact-ai-message">
            <header><span><Bot size={14} /></span><small>Abordagem com IA</small></header>
            <p>“Percebi que os agendamentos ainda ficam no WhatsApp. Posso mostrar uma solução simples para reduzir o trabalho manual?”</p>
            <span className="compact-ai-message__action"><MessageSquareText size={12} /> Mensagem pronta</span>
          </div>
        </aside>
      </div>
    </div>
  );
}
