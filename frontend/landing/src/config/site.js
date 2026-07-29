/**
 * @fileoverview Configuração imutável da landing page pública.
 *
 * Valores de navegação e identidade ficam centralizados para evitar textos e
 * URLs divergentes entre componentes. O objeto é congelado porque esses dados
 * são configuração de build, não estado da interface.
 *
 * @module landing/config/site
 */

export const SITE_CONFIG = Object.freeze({
  name: 'LeadHunter Pro',
  shortName: 'LH',
  version: '25.2.0',
  appUrl: '/app',
  navigation: [
    { label: 'Como funciona', href: '#como-funciona' },
    { label: 'Ferramentas', href: '#ferramentas' },
    { label: 'Para quem é', href: '#publico' },
    { label: 'Planos', href: '#planos' }
  ]
});
