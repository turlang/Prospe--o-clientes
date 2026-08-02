/**
 * @fileoverview Composição da landing pública em viewport única.
 *
 * A página não usa seções empilhadas. O usuário escolhe a informação pelos
 * botões do cabeçalho ou pela barra mobile, reduzindo esforço de navegação e
 * mantendo a proposta comercial visível em uma única tela.
 *
 * @module landing/app/App
 */

import React from 'react';
import LandingExperience from '../features/presentation/LandingExperience.jsx';
import { useLandingView } from '../hooks/useLandingView.js';
import { usePlans } from '../hooks/usePlans.js';
import BottomNavigation from '../shared/layout/BottomNavigation.jsx';
import Header from '../shared/layout/Header.jsx';

export default function App() {
  const { plans, isUsingFallback } = usePlans();
  const { activeView, navigateTo, navigateRelative } = useLandingView();

  return (
    <div className="landing-shell">
      <a href="#main-content" className="skip-link">Pular para o conteúdo principal</a>
      <Header activeView={activeView} onNavigate={navigateTo} />
      <LandingExperience
        activeView={activeView}
        onNavigateRelative={navigateRelative}
        plans={plans}
        isUsingFallback={isUsingFallback}
      />
      <BottomNavigation activeView={activeView} onNavigate={navigateTo} />
    </div>
  );
}
