const express = require('express');
const { requireAuth } = require('./middleware/auth');
const { hasMongoUri } = require('./db');
const User = require('./models/User');
const { findUserById } = require('./localUserStore');
const { getAllPlans, updatePlan } = require('./planConfig');

const router = express.Router();

async function requireAdmin(req, res, next) {
  try {
    if (!req.user?.sub) return res.status(403).json({ error: 'Acesso restrito ao administrador.' });
    const user = hasMongoUri() ? await User.findById(req.user.sub).lean() : await findUserById(req.user.sub);
    if (!user || user.role !== 'admin') return res.status(403).json({ error: 'Acesso restrito ao administrador.' });
    req.adminUser = user;
    return next();
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

router.get('/api/admin/plans', requireAuth, requireAdmin, (_req, res) => res.json(getAllPlans()));

router.patch('/api/admin/plans/:id', requireAuth, requireAdmin, (req, res) => {
  try {
    res.json({ ok: true, plan: updatePlan(req.params.id, req.body) });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
