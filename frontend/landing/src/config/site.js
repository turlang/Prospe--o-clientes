/**
 * @fileoverview Configuração imutável da experiência pública.
 *
 * A navegação representa telas, não âncoras verticais. Isso mantém a landing em
 * uma única viewport e evita divergência entre cabeçalho e navegação mobile.
 *
 * @module landing/config/site
 */

export const SITE_CONFIG = Object.freeze({
  name: 'LeadHunter Pro',
  shortName: 'LH',
  version: '25.7.0',
  appUrl: '/app',
  navigation: Object.freeze([
    { id: 'inicio', label: 'Visão geral', mobileLabel: 'Início' },
    { id: 'como-funciona', label: 'Fluxo', mobileLabel: 'Fluxo' },
    { id: 'ferramentas', label: 'Ferramentas', mobileLabel: 'Recursos' },
    { id: 'publico', label: 'Para quem é', mobileLabel: 'Público' },
    { id: 'planos', label: 'Planos', mobileLabel: 'Planos' }
  ])
});
