/**
 * @fileoverview Landing page comercial do LeadHunter Pro em React + Tailwind CSS.
 */
import React, { useEffect, useState } from 'react';
import Header from './components/Header.jsx';
import Hero from './components/Hero.jsx';
import FeatureFlow from './components/FeatureFlow.jsx';
import Audience from './components/Audience.jsx';
import Tools from './components/Tools.jsx';
import Pricing from './components/Pricing.jsx';
import FinalCta from './components/FinalCta.jsx';
import Footer from './components/Footer.jsx';
import { fallbackPlans } from './content.js';

function usePlans() {
  const [plans, setPlans] = useState(fallbackPlans);
  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/plans', { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error('Não foi possível carregar os planos.');
        return response.json();
      })
      .then((payload) => {
        if (Array.isArray(payload) && payload.length) setPlans(payload);
      })
      .catch((error) => {
        if (error.name !== 'AbortError') console.warn('[landing] Planos padrão em uso.', error.message);
      });
    return () => controller.abort();
  }, []);
  return plans;
}

export default function App() {
  const plans = usePlans();
  return <><Header /><main><Hero /><FeatureFlow /><Audience /><Tools /><Pricing plans={plans} /><FinalCta /></main><Footer /></>;
}
