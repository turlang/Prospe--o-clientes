/**
 * @fileoverview Rotas administrativas para usuários, planos, segurança, auditoria e pagamentos.
 *
 * As dependências são recebidas por injeção para manter o módulo testável e
 * evitar acoplamento implícito ao processo de inicialização.
 *
 * @module routes/adminRoutes
 */

const { ADMIN_PAGE_PATH } = require('../config/paths');

/**
 * Registra o conjunto de rotas deste domínio na aplicação Express.
 *
 * @param {get: Function, post: Function, patch: Function, delete: Function} app Aplicação/roteador Express.
 * @param {} context Dependências e políticas compartilhadas da camada HTTP.
 * @returns {get: Function, post: Function} A mesma instância recebida, para composição encadeada.
 */
function registerAdminRoutes(app, context) {
  const {
    SearchHistory,
    requireAuth,
    requireAdmin,
    hasMongoUri,
    User,
    Payment,
    Usage,
    AdminAuditLog,
    TrialGuard,
    PasswordReset,
    getAllPlans,
    getPlan,
    normalizePlan,
    updatePlan,
    getPlanExpirationDate,
    writeAdminAudit,
    getDatabaseResetPreview,
    executeDatabaseReset,
    databaseResetConfirmationPhrase,
    sendApiError,
    sanitizeSearchText,
    escapeRegExp
  } = context;

  // Interface e visão geral administrativa.
  app.get('/admin', (_req, res) => {
    res.setHeader('Cache-Control', 'no-store, max-age=0');
    res.sendFile(ADMIN_PAGE_PATH);
  });

  app.get('/api/admin/overview', requireAuth, requireAdmin, async (_req, res) => {
    try {
      if (!hasMongoUri()) {
        return res.json({
          users: { total: 0, trial: 0, pro: 0, agency: 0, paid: 0, active: 0, suspended: 0, new30d: 0 },
          payments: { total: 0, approved: 0, created: 0, revenue: 0, mrr: 0, arpu: 0 },
          usage: { leads30d: 0, searches30d: 0, activeUsers30d: 0, averagePerActiveUser: 0 },
          business: { paidConversionRate: 0, activationRate: 0 },
          charts: { usageDaily: [], revenueMonthly: [], userGrowthMonthly: [], planDistribution: [] },
          audit: { total: 0 }, recentUsers: [], recentPayments: []
        });
      }

      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

      const [
        users,
        payments,
        auditCount,
        usageRows,
        searches30d,
        activeUsageUsers
      ] = await Promise.all([
        User.find({}).sort({ createdAt: -1 }).lean(),
        Payment.find({}).sort({ createdAt: -1 }).lean(),
        AdminAuditLog.countDocuments({}),
        Usage.find({ day: { $gte: thirtyDaysAgo.toISOString().slice(0, 10) } }).lean(),
        SearchHistory.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
        Usage.distinct('userId', { day: { $gte: thirtyDaysAgo.toISOString().slice(0, 10) }, count: { $gt: 0 } })
      ]);

      const paidUsers = users.filter((u) => ['pro', 'agency'].includes(u.plan) && u.isActive !== false);
      const activeUsers = users.filter((u) => u.isActive !== false);
      const newUsers30d = users.filter((u) => new Date(u.createdAt) >= thirtyDaysAgo).length;
      const activatedUsers = users.filter((u) => ['pro', 'agency'].includes(u.plan) || Number(u.totalLeadLimit) > 0 || u.subscriptionStatus === 'active').length;

      const userStats = {
        total: users.length,
        trial: users.filter((u) => u.plan === 'trial').length,
        pro: users.filter((u) => u.plan === 'pro').length,
        agency: users.filter((u) => u.plan === 'agency').length,
        paid: paidUsers.length,
        active: activeUsers.length,
        suspended: users.filter((u) => u.isActive === false).length,
        new30d: newUsers30d
      };

      const approvedPayments = payments.filter((p) => p.status === 'approved');
      const revenue = approvedPayments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
      const proPrice = Number(String(getPlan('pro').priceLabel || '59').replace(/[^0-9,]/g, '').replace(',', '.')) || 59;
      const agencyPrice = Number(String(getPlan('agency').priceLabel || '199').replace(/[^0-9,]/g, '').replace(',', '.')) || 199;
      const mrr = userStats.pro * proPrice + userStats.agency * agencyPrice;
      const paymentStats = {
        total: payments.length,
        approved: approvedPayments.length,
        created: payments.filter((p) => p.status === 'created').length,
        revenue,
        mrr,
        arpu: paidUsers.length ? revenue / paidUsers.length : 0
      };

      const leads30d = usageRows.reduce((sum, row) => sum + Number(row.count || 0), 0);
      const usageStats = {
        leads30d,
        searches30d,
        activeUsers30d: activeUsageUsers.length,
        averagePerActiveUser: activeUsageUsers.length ? leads30d / activeUsageUsers.length : 0
      };

      const business = {
        paidConversionRate: users.length ? (paidUsers.length / users.length) * 100 : 0,
        activationRate: users.length ? (activatedUsers / users.length) * 100 : 0
      };

      const usageByDay = new Map();
      for (let i = 29; i >= 0; i -= 1) {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        usageByDay.set(date.toISOString().slice(0, 10), 0);
      }
      usageRows.forEach((row) => usageByDay.set(row.day, (usageByDay.get(row.day) || 0) + Number(row.count || 0)));
      const usageDaily = Array.from(usageByDay.entries()).map(([day, count]) => ({ day, count }));

      function monthKey(dateValue) {
        const date = new Date(dateValue);
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      }
      const monthKeys = [];
      for (let i = 5; i >= 0; i -= 1) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        monthKeys.push(monthKey(date));
      }
      const revenueMap = new Map(monthKeys.map((key) => [key, 0]));
      approvedPayments.filter((p) => new Date(p.createdAt) >= sixMonthsAgo).forEach((p) => {
        const key = monthKey(p.createdAt);
        if (revenueMap.has(key)) revenueMap.set(key, revenueMap.get(key) + Number(p.amount || 0));
      });
      const userGrowthMap = new Map(monthKeys.map((key) => [key, 0]));
      users.filter((u) => new Date(u.createdAt) >= sixMonthsAgo).forEach((u) => {
        const key = monthKey(u.createdAt);
        if (userGrowthMap.has(key)) userGrowthMap.set(key, userGrowthMap.get(key) + 1);
      });

      res.json({
        users: userStats,
        payments: paymentStats,
        usage: usageStats,
        business,
        audit: { total: auditCount },
        charts: {
          usageDaily,
          revenueMonthly: monthKeys.map((month) => ({ month, value: revenueMap.get(month) || 0 })),
          userGrowthMonthly: monthKeys.map((month) => ({ month, value: userGrowthMap.get(month) || 0 })),
          planDistribution: [
            { label: 'Trial', value: userStats.trial },
            { label: 'Pro', value: userStats.pro },
            { label: 'Agência', value: userStats.agency }
          ]
        },
        recentUsers: users.slice(0, 20).map((u) => ({
          id: String(u._id), name: u.name, email: u.email, plan: u.plan,
          role: u.role || 'user', isActive: u.isActive !== false,
          subscriptionStatus: u.subscriptionStatus, dailyLeadLimit: u.dailyLeadLimit,
          totalLeadLimit: u.totalLeadLimit, createdAt: u.createdAt, planExpiresAt: u.planExpiresAt
        })),
        recentPayments: payments.slice(0, 20).map((p) => ({
          id: String(p._id), userId: String(p.userId || ''), plan: p.plan,
          status: p.status, amount: p.amount, provider: p.provider,
          paymentId: p.paymentId, preferenceId: p.preferenceId,
          createdAt: p.createdAt, updatedAt: p.updatedAt
        }))
      });
    } catch (error) {
      sendApiError(res, error);
    }
  });

  // Gestão de usuários e privilégios.
  app.get('/api/admin/users', requireAuth, requireAdmin, async (req, res) => {
    try {
      const q = sanitizeSearchText(req.query.q, 80);
      const safeQuery = escapeRegExp(q);
      const filter = q
        ? { $or: [
            { name: new RegExp(safeQuery, 'i') },
            { email: new RegExp(safeQuery, 'i') },
            { plan: new RegExp(safeQuery, 'i') }
          ] }
        : {};

      const users = hasMongoUri()
        ? await User.find(filter).sort({ createdAt: -1 }).limit(200).lean()
        : [];

      res.json(users.map((u) => ({
        id: String(u._id),
        name: u.name,
        email: u.email,
        plan: u.plan,
        role: u.role || 'user',
        isActive: u.isActive !== false,
        subscriptionStatus: u.subscriptionStatus,
        dailyLeadLimit: u.dailyLeadLimit,
        totalLeadLimit: u.totalLeadLimit,
        createdAt: u.createdAt,
        planActivatedAt: u.planActivatedAt,
        planExpiresAt: u.planExpiresAt
      })));
    } catch (error) {
      sendApiError(res, error);
    }
  });

  app.patch('/api/admin/users/:id', requireAuth, requireAdmin, async (req, res) => {
    try {
      if (!hasMongoUri()) return res.status(400).json({ error: 'Admin requer MongoDB ativo.' });

      const { plan, isActive, role, subscriptionStatus } = req.body;
      const beforeUser = await User.findById(req.params.id).lean();
      if (!beforeUser) return res.status(404).json({ error: 'Usuário não encontrado.' });
      const update = {};

      if (plan) {
        const safePlan = normalizePlan(plan);
        const planConfig = getPlan(safePlan);
        update.plan = planConfig.id;
        update.dailyLeadLimit = planConfig.dailyLeadLimit;
        update.totalLeadLimit = planConfig.totalLeadLimit ?? null;
        update.subscriptionStatus = subscriptionStatus || (safePlan === 'trial' ? 'trial' : 'active');
        update.planActivatedAt = safePlan === 'trial' ? null : new Date();
        update.planExpiresAt = safePlan === 'trial' ? null : getPlanExpirationDate(safePlan);
      }

      if (typeof isActive === 'boolean') update.isActive = isActive;
      if (['user', 'admin'].includes(role)) update.role = role;
      if (subscriptionStatus && !plan) update.subscriptionStatus = subscriptionStatus;

      const user = await User.findByIdAndUpdate(req.params.id, update, { new: true }).lean();

      if (user && role === 'admin') {
        await TrialGuard.deleteMany({
          $or: [
            { email: user.email },
            { deviceId: user.deviceId || '__none__' },
            { ip: user.registrationIp || '__none__' }
          ]
        });
      }
      if (!user) return res.status(404).json({ error: 'Usuário não encontrado.' });

      await writeAdminAudit(req, 'ADMIN_USER_UPDATED', {
        targetUserId: user._id,
        before: { plan: beforeUser.plan, role: beforeUser.role, isActive: beforeUser.isActive, subscriptionStatus: beforeUser.subscriptionStatus, dailyLeadLimit: beforeUser.dailyLeadLimit, totalLeadLimit: beforeUser.totalLeadLimit },
        after: { plan: user.plan, role: user.role, isActive: user.isActive, subscriptionStatus: user.subscriptionStatus, dailyLeadLimit: user.dailyLeadLimit, totalLeadLimit: user.totalLeadLimit }
      });

      res.json({
        ok: true,
        user: {
          id: String(user._id),
          name: user.name,
          email: user.email,
          plan: user.plan,
          role: user.role || 'user',
          isActive: user.isActive !== false,
          subscriptionStatus: user.subscriptionStatus,
          dailyLeadLimit: user.dailyLeadLimit,
          totalLeadLimit: user.totalLeadLimit
        }
      });
    } catch (error) {
      sendApiError(res, error);
    }
  });


  // Controles antiabuso e trilha de segurança.
  app.get('/api/admin/security', requireAuth, requireAdmin, async (_req, res) => {
    try {
      if (!hasMongoUri()) return res.json({ blocked: 0, allowed: 0, recent: [] });

      const [blocked, allowed, passwordResets, recent] = await Promise.all([
        TrialGuard.countDocuments({ status: 'blocked' }),
        TrialGuard.countDocuments({ status: 'allowed' }),
        PasswordReset.countDocuments({}),
        TrialGuard.find({}).sort({ createdAt: -1 }).limit(50).lean()
      ]);

      res.json({
        blocked,
        allowed,
        passwordResets,
        recent: await Promise.all(recent.map(async (item) => {
          const user = item.email ? await User.findOne({ email: item.email }).lean() : null;

          return {
            id: String(item._id),
            email: item.email,
            emailDomain: item.emailDomain,
            ip: item.ip,
            deviceId: item.deviceId,
            status: item.status,
            reason: item.reason,
            userRole: user?.role || 'none',
            createdAt: item.createdAt
          };
        }))
      });
    } catch (error) {
      sendApiError(res, error);
    }
  });


  app.delete('/api/admin/security/:id', requireAuth, requireAdmin, async (req, res) => {
    try {
      if (!hasMongoUri()) return res.status(400).json({ error: 'Admin requer MongoDB ativo.' });

      const deleted = await TrialGuard.findByIdAndDelete(req.params.id);
      if (!deleted) return res.status(404).json({ error: 'Registro não encontrado.' });

      await writeAdminAudit(req, 'ADMIN_SECURITY_RECORD_DELETED', { before: deleted.toObject ? deleted.toObject() : deleted });

      res.json({ ok: true, message: 'Registro de segurança removido.' });
    } catch (error) {
      sendApiError(res, error);
    }
  });

  app.post('/api/admin/security/clear', requireAuth, requireAdmin, async (req, res) => {
    try {
      if (!hasMongoUri()) return res.status(400).json({ error: 'Admin requer MongoDB ativo.' });

      const { email, deviceId, ip } = req.body;
      const filters = [];

      if (email) filters.push({ email: String(email).trim().toLowerCase() });
      if (deviceId) filters.push({ deviceId: String(deviceId).trim() });
      if (ip) filters.push({ ip: String(ip).trim() });

      if (!filters.length) return res.status(400).json({ error: 'Informe e-mail, IP ou dispositivo.' });

      const result = await TrialGuard.deleteMany({ $or: filters });
      await writeAdminAudit(req, 'ADMIN_SECURITY_RECORDS_CLEARED', { before: { filters }, after: { deletedCount: result.deletedCount || 0 } });
      res.json({ ok: true, deletedCount: result.deletedCount || 0 });
    } catch (error) {
      sendApiError(res, error);
    }
  });



  // Reinicialização destrutiva e controlada do ambiente operacional.
  app.get('/api/admin/database-reset/preview', requireAuth, requireAdmin, async (_req, res) => {
    try {
      const preview = await getDatabaseResetPreview();
      res.json({
        ...preview,
        confirmationPhrase: databaseResetConfirmationPhrase,
        warning: 'A operação é irreversível e preserva apenas contas com função admin.'
      });
    } catch (error) {
      sendApiError(res, error, 'Não foi possível calcular a prévia da reinicialização.');
    }
  });

  app.post('/api/admin/database-reset', requireAuth, requireAdmin, async (req, res) => {
    try {
      const result = await executeDatabaseReset({
        adminUser: req.adminUser,
        password: req.body.password,
        confirmation: req.body.confirmation
      });

      // Os registros antigos de auditoria fazem parte da limpeza. Esta entrada é
      // criada depois da reinicialização para manter somente o recibo da ação.
      await writeAdminAudit(req, 'ADMIN_DATABASE_RESET_COMPLETED', {
        before: { requestedBy: String(req.adminUser?._id || req.adminUser?.id || req.user?.sub || '') },
        after: {
          mode: result.mode,
          adminsPreserved: result.adminsPreserved,
          deleted: result.deleted,
          totalDeleted: result.totalDeleted,
          completedAt: result.completedAt
        }
      });

      res.json({
        ok: true,
        message: 'Banco reinicializado. Somente as contas administrativas foram preservadas.',
        result
      });
    } catch (error) {
      sendApiError(res, error, 'Não foi possível reinicializar o banco de dados.');
    }
  });


  // Administração de planos, auditoria e pagamentos.
  app.get('/api/admin/plans', requireAuth, requireAdmin, async (_req, res) => {
    try {
      res.json(getAllPlans());
    } catch (error) {
      sendApiError(res, error);
    }
  });

  app.patch('/api/admin/plans/:id', requireAuth, requireAdmin, async (req, res) => {
    try {
      const before = getPlan(req.params.id);
      const updated = updatePlan(req.params.id, {
        name: req.body.name,
        priceLabel: req.body.priceLabel,
        durationDays: req.body.durationDays,
        dailyLeadLimit: req.body.dailyLeadLimit,
        totalLeadLimit: req.body.totalLeadLimit === '' ? null : req.body.totalLeadLimit,
        features: req.body.features
      });

      await writeAdminAudit(req, 'ADMIN_PLAN_UPDATED', {
        before,
        after: updated
      });

      res.json({ ok: true, plan: updated });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get('/api/admin/audit-logs', requireAuth, requireAdmin, async (_req, res) => {
    try {
      if (!hasMongoUri()) return res.json([]);
      const logs = await AdminAuditLog.find({}).sort({ createdAt: -1 }).limit(80).lean();
      res.json(logs.map((log) => ({
        id: String(log._id),
        adminId: String(log.adminId || ''),
        targetUserId: String(log.targetUserId || ''),
        action: log.action,
        before: log.before,
        after: log.after,
        ip: log.ip,
        createdAt: log.createdAt
      })));
    } catch (error) {
      sendApiError(res, error);
    }
  });

  app.get('/api/admin/payments', requireAuth, requireAdmin, async (_req, res) => {
    try {
      const payments = hasMongoUri()
        ? await Payment.find({}).sort({ createdAt: -1 }).limit(200).lean()
        : [];

      res.json(payments.map((p) => ({
        id: String(p._id),
        userId: String(p.userId || ''),
        plan: p.plan,
        status: p.status,
        amount: p.amount,
        provider: p.provider,
        preferenceId: p.preferenceId,
        paymentId: p.paymentId,
        externalReference: p.externalReference,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt
      })));
    } catch (error) {
      sendApiError(res, error);
    }
  });


  return app;
}

module.exports = { registerAdminRoutes };
