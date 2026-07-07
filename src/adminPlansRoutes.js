const express = require('express');
const { requireAuth } = require('./middleware/auth');
const { requireAdmin } = require('./middleware/admin');
const { getAllPlans, updatePlan } = require('./planConfig');
const { writeAdminAudit } = require('./services/adminAuditService');

const router = express.Router();

router.get('/api/admin/plans', requireAuth, requireAdmin, (_req, res) => res.json(getAllPlans()));

router.patch('/api/admin/plans/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const before = getAllPlans().find((plan) => plan.id === req.params.id) || null;
    const plan = updatePlan(req.params.id, req.body);
    await writeAdminAudit(req, 'ADMIN_PLAN_UPDATED', { before, after: plan });
    res.json({ ok: true, plan });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
