/**
 * @fileoverview Composição principal da landing page pública.
 *
 * A composição mantém as seções desacopladas e delega carregamento de dados ao
 * hook específico. Nenhuma regra de negócio ou autenticação vive nesta camada.
 *
 * @module landing/app/App
 */

import React from 'react';
import AudienceSection from '../features/audience/AudienceSection.jsx';
import FinalCtaSection from '../features/cta/FinalCtaSection.jsx';
import HeroSection from '../features/hero/HeroSection.jsx';
import PricingSection from '../features/pricing/PricingSection.jsx';
import ToolsSection from '../features/tools/ToolsSection.jsx';
import WorkflowSection from '../features/workflow/WorkflowSection.jsx';
import { usePlans } from '../hooks/usePlans.js';
import Footer from '../shared/layout/Footer.jsx';
import Header from '../shared/layout/Header.jsx';

export default function App() {
  const { plans, isUsingFallback } = usePlans();

  return (
    <>
      <a href="#main-content" className="skip-link">Pular para o conteúdo principal</a>
      <Header />
      <main id="main-content">
        <HeroSection />
        <WorkflowSection />
        <ToolsSection />
        <AudienceSection />
        <PricingSection plans={plans} isUsingFallback={isUsingFallback} />
        <FinalCtaSection />
      </main>
      <Footer />
    </>
  );
}
