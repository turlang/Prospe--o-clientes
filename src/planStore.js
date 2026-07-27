/**
 * @fileoverview Fachada de compatibilidade para acesso às configurações de planos.
 *
 * Responsabilidade delimitada conforme a arquitetura descrita em
 * `docs/ARQUITETURA.md`. Alterações neste arquivo devem preservar os contratos
 * documentados e ser acompanhadas por testes quando afetarem regras de negócio.
 *
 * @module src/planStore
 */

const { getAllPlans, updatePlan, savePlans } = require('./planConfig');

function getPlans() {
  return Object.fromEntries(getAllPlans().map((plan) => [plan.id, plan]));
}

module.exports = { getPlans, savePlans, updatePlan };
