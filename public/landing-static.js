/**
 * @fileoverview Interações da landing estática e sincronização dos planos.
 */
(() => {
  'use strict';

  const CONFIGURATION_CHANNEL = 'leadhunter:configuration';
  const STORAGE_EVENT_KEY = 'leadhunter:plans-updated';
  const REFRESH_INTERVAL_MS = 30_000;
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
    return Number(value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 2 });
  }

  function renderPlans(plans) {
    const grid = document.querySelector('#pricing-grid');
    if (!grid || !Array.isArray(plans) || plans.length === 0) return;

    grid.replaceChildren(...plans.slice(0, 3).map((plan, index) => {
      const featured = Boolean(plan.featured || plan.id === 'pro' || index === 1);
      const article = document.createElement('article');
      article.className = `price-card${featured ? ' featured' : ''}`;
      if (featured) {
        const topLine = document.createElement('div');
        topLine.className = 'top-line';
        article.appendChild(topLine);
      }

      const header = document.createElement('header');
      const identity = document.createElement('div');
      const label = document.createElement('small');
      label.textContent = `MODO ${String(plan.name || plan.id || 'PLANO').toUpperCase()}`;
      const capacity = document.createElement('span');
      capacity.textContent = 'Capacidade operacional';
      identity.append(label, capacity);
      const badge = document.createElement('i');
      badge.textContent = featured ? '✦ Recomendado' : '●';
      header.append(identity, badge);

      const description = document.createElement('p');
      description.textContent = plan.description || 'Plano comercial do LeadHunter Pro.';
      const price = document.createElement('strong');
      price.textContent = `${plan.displayPrice || plan.priceLabel || formatPrice(plan.price)} `;
      const period = document.createElement('em');
      period.textContent = `/${plan.billingPeriod || (plan.isPaid ? 'mês' : 'sem cobrança')}`;
      price.appendChild(period);

      const link = document.createElement('a');
      link.className = `button ${featured ? 'button-primary' : 'button-light'}`;
      link.href = '/app';
      link.textContent = plan.isPaid === false || Number(plan.price || 0) === 0 ? 'Ativar radar grátis →' : 'Escolher capacidade →';

      const divider = document.createElement('hr');
      const included = document.createElement('small');
      included.textContent = 'INCLUÍDO NA OPERAÇÃO';
      const list = document.createElement('ul');
      const features = Array.isArray(plan.features) && plan.features.length ? plan.features : [`${Number(plan.dailyLeadLimit || 0).toLocaleString('pt-BR')} leads por dia`, 'CRM Kanban', 'Dashboard comercial'];
      features.slice(0, 5).forEach((feature) => { const item = document.createElement('li'); item.textContent = `✓ ${feature}`; list.appendChild(item); });
      article.append(header, description, price, link, divider, included, list);
      return article;
    }));
  }

  async function refreshPlans() {
    const url = new URL('/api/plans', window.location.origin);
    url.searchParams.set('_refresh', String(Date.now()));
    try {
      const response = await fetch(url, { headers: { Accept: 'application/json', 'Cache-Control': 'no-cache' }, cache: 'no-store' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const payload = await response.json();
      renderPlans(Array.isArray(payload) ? payload : payload?.plans);
    } catch (error) {
      console.warn('[landing-static] Não foi possível atualizar os planos:', error.message);
    }
  }

  refreshPlans();
  window.setInterval(refreshPlans, REFRESH_INTERVAL_MS);
  window.addEventListener('focus', refreshPlans);
  window.addEventListener('storage', (event) => { if (event.key === STORAGE_EVENT_KEY) refreshPlans(); });
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') refreshPlans(); });
  if ('BroadcastChannel' in window) {
    const channel = new BroadcastChannel(CONFIGURATION_CHANNEL);
    channel.addEventListener('message', (event) => { if (event.data?.type === 'plans-updated') refreshPlans(); });
  }
})();
