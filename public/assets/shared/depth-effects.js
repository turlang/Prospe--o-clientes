/**
 * @fileoverview Efeito de profundidade progressivo e acessível.
 *
 * A camada observa cards adicionados dinamicamente e aplica uma inclinação
 * discreta em desktops. O layout continua funcional sem JavaScript.
 * @module public/assets/shared/depth-effects
 */
(() => {
  'use strict';

  const enabled = window.matchMedia('(hover: hover) and (pointer: fine)').matches
    && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!enabled) return;

  const selectors = [
    '.overview-kpi-card',
    '.overview-funnel-panel',
    '.overview-forecast-card',
    '.overview-decision-card',
    '.overview-conversion-panel',
    '.cockpit-metric',
    '.cockpit-metrics > article',
    '.cockpit-focus-card',
    '.chart-card',
    '.admin-card',
    '.admin-panel',
    '.lead',
    '.kanban-card'
  ].join(',');

  const darkSelectors = '.funnel-chart-card, .admin-card, .chart-card, .admin-panel';
  const initialized = new WeakSet();

  function attach(element) {
    if (!(element instanceof HTMLElement) || initialized.has(element)) return;
    initialized.add(element);
    element.classList.add('depth-surface');
    if (element.matches(darkSelectors)) element.classList.add('depth-surface--dark');

    element.addEventListener('pointermove', (event) => {
      const rect = element.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const x = Math.min(Math.max((event.clientX - rect.left) / rect.width, 0), 1);
      const y = Math.min(Math.max((event.clientY - rect.top) / rect.height, 0), 1);
      element.style.setProperty('--tilt-y', `${((x - .5) * 3.2).toFixed(2)}deg`);
      element.style.setProperty('--tilt-x', `${((.5 - y) * 2.8).toFixed(2)}deg`);
      element.style.setProperty('--glow-x', `${(x * 100).toFixed(1)}%`);
      element.style.setProperty('--glow-y', `${(y * 100).toFixed(1)}%`);
      element.classList.add('is-depth-active');
    }, { passive: true });

    element.addEventListener('pointerleave', () => {
      element.style.setProperty('--tilt-x', '0deg');
      element.style.setProperty('--tilt-y', '0deg');
      element.classList.remove('is-depth-active');
    }, { passive: true });
  }

  function scan(root = document) {
    if (root instanceof HTMLElement && root.matches(selectors)) attach(root);
    root.querySelectorAll?.(selectors).forEach(attach);
  }

  document.addEventListener('DOMContentLoaded', () => {
    scan();
    const observer = new MutationObserver((records) => {
      for (const record of records) {
        record.addedNodes.forEach((node) => {
          if (node instanceof HTMLElement) scan(node);
        });
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }, { once: true });
})();
