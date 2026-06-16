/**
 * planConfig.js
 * -----------------------------------------------------------------------------
 * Planos: configuração centralizada dos planos comerciais.
 *
 * A ideia é deixar o produto pronto para monetização mesmo antes de conectar
 * Mercado Pago ou Stripe de verdade. O backend passa a respeitar limites por
 * plano, e a interface já mostra a página de assinatura.
 */

const PLANS = {
  trial: {
    id: 'trial',
    name: 'Teste Gratuito',
    priceLabel: 'R$ 0',
    dailyLeadLimit: 10,
    totalLeadLimit: 10,
    isPaid: false,
    features: [
      '10 leads totais para experimentar',
      'CRM Kanban básico',
      'Abordagens comerciais por templates',
      'Follow-ups manuais'
    ]
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    priceLabel: 'R$ 59/mês',
    dailyLeadLimit: 500,
    totalLeadLimit: null,
    isPaid: true,
    features: [
      '500 leads por dia',
      'Dashboard executivo',
      'Histórico completo',
      'Campanhas e follow-ups'
    ]
  },
  agency: {
    id: 'agency',
    name: 'Agência',
    priceLabel: 'R$ 199/mês',
    dailyLeadLimit: 5000,
    totalLeadLimit: null,
    isPaid: true,
    features: [
      'Até 5.000 leads por dia',
      'Uso para times e agências',
      'Pipeline comercial avançado',
      'Preparado para white label'
    ]
  }
};

function normalizePlan(plan) {
  return PLANS[String(plan || '').toLowerCase()] ? String(plan).toLowerCase() : 'trial';
}

function getPlan(plan) {
  return PLANS[normalizePlan(plan)];
}

function getAllPlans() {
  return Object.values(PLANS);
}

module.exports = { PLANS, normalizePlan, getPlan, getAllPlans };
