const { getAllPlans, updatePlan, savePlans } = require('./planConfig');

function getPlans() {
  return Object.fromEntries(getAllPlans().map((plan) => [plan.id, plan]));
}

module.exports = { getPlans, savePlans, updatePlan };
