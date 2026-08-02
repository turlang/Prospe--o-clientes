/**
 * @fileoverview Orquestra a landing em tela única e painéis alternáveis.
 *
 * @module landing/features/presentation/LandingExperience
 */

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { SITE_CONFIG } from '../../config/site.js';
import AudiencePanel from './AudiencePanel.jsx';
import OverviewPanel from './OverviewPanel.jsx';
import PricingPanel from './PricingPanel.jsx';
import ToolsPanel from './ToolsPanel.jsx';
import WorkflowPanel from './WorkflowPanel.jsx';

const PANELS = Object.freeze({
  inicio: OverviewPanel,
  'como-funciona': WorkflowPanel,
  ferramentas: ToolsPanel,
  publico: AudiencePanel
});

/**
 * @param {{activeView: string, onNavigateRelative: Function, plans: Array<object>, isUsingFallback: boolean}} props Estado e dados.
 * @returns {React.JSX.Element} Área central sem scroll.
 */
export default function LandingExperience({ activeView, onNavigateRelative, plans, isUsingFallback }) {
  return (
    <main id="main-content" className="landing-stage">
      {SITE_CONFIG.navigation.map((item) => {
        const Panel = item.id === 'planos' ? PricingPanel : PANELS[item.id];
        return (
          <section
            key={item.id}
            id={`panel-${item.id}`}
            className="landing-view"
            role="tabpanel"
            aria-labelledby={`tab-${item.id}`}
            hidden={activeView !== item.id}
            data-view={item.id}
          >
            <Panel plans={plans} isUsingFallback={isUsingFallback} />
          </section>
        );
      })}

      <div className="view-stepper hidden lg:flex" aria-label="Navegação sequencial">
        <button type="button" onClick={() => onNavigateRelative(-1)} aria-label="Tela anterior"><ChevronLeft size={17} /></button>
        <span>{SITE_CONFIG.navigation.findIndex((item) => item.id === activeView) + 1} / {SITE_CONFIG.navigation.length}</span>
        <button type="button" onClick={() => onNavigateRelative(1)} aria-label="Próxima tela"><ChevronRight size={17} /></button>
      </div>
    </main>
  );
}
