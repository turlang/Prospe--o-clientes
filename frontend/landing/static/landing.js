/**
 * @fileoverview Interações mínimas do fallback estático da landing.
 *
 * O bundle React substitui este arquivo em builds completos. O fallback evita
 * dependências externas e mantém apenas menu mobile e atualização pública de
 * preços, sem armazenar dados pessoais.
 */
(() => {
  'use strict';

  const toggle = document.querySelector('.menu-toggle');
  const navigation = document.querySelector('#site-navigation');

  if (toggle && navigation) {
    toggle.addEventListener('click', () => {
      const isOpen = navigation.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(isOpen));
      toggle.setAttribute('aria-label', isOpen ? 'Fechar menu' : 'Abrir menu');
    });

    navigation.addEventListener('click', (event) => {
      if (event.target.closest('a')) {
        navigation.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-label', 'Abrir menu');
      }
    });
  }

  function formatPrice(value) {
    return Number(value || 0).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0
    });
  }

  function renderPlans(plans) {
    const grid = document.querySelector('#pricing-grid');
    if (!grid || !Array.isArray(plans) || plans.length === 0) return;

    grid.replaceChildren(...plans.slice(0, 3).map((plan, index) => {
      const article = document.createElement('article');
      const isFeatured = Boolean(plan.featured || plan.id === 'pro' || index === 1);
      article.className = `price-card${isFeatured ? ' featured' : ''}`;

      if (isFeatured) {
        const popular = document.createElement('span');
        popular.className = 'popular';
        popular.textContent = '✦ MAIS ESCOLHIDO';
        article.appendChild(popular);
      }

      const label = document.createElement('small');
      label.textContent = String(plan.name || plan.id || 'Plano').toUpperCase();
      const description = document.createElement('p');
      description.textContent = plan.description || 'Plano comercial do LeadHunter Pro.';
      const price = document.createElement('strong');
      price.textContent = `${formatPrice(plan.price)} `;
      const period = document.createElement('em');
      period.textContent = `/${plan.billingPeriod || 'mês'}`;
      price.appendChild(period);
      const link = document.createElement('a');
      link.className = `button ${isFeatured ? 'button-primary' : 'button-light'}`;
      link.href = '/app';
      link.textContent = Number(plan.price || 0) === 0 ? 'Começar grátis' : 'Escolher plano';
      const list = document.createElement('ul');
      const features = Array.isArray(plan.features) && plan.features.length
        ? plan.features
        : [`${Number(plan.dailyLeadLimit || 0).toLocaleString('pt-BR')} leads por dia`, 'CRM Kanban', 'Dashboard comercial'];
      features.slice(0, 5).forEach((feature) => {
        const item = document.createElement('li');
        item.textContent = `✓ ${feature}`;
        list.appendChild(item);
      });
      article.append(label, description, price, link, list);
      return article;
    }));
  }

  fetch('/api/plans', { headers: { Accept: 'application/json' } })
    .then((response) => response.ok ? response.json() : Promise.reject(new Error(`HTTP ${response.status}`)))
    .then(renderPlans)
    .catch((error) => console.warn('[landing-static] Planos locais mantidos:', error.message));
})();
