/**
 * @fileoverview Rotas de limites, checkout, webhook e sincronização de pagamentos.
 *
 * As dependências são recebidas por injeção para manter o módulo testável e
 * evitar acoplamento implícito ao processo de inicialização.
 *
 * @module routes/billingRoutes
 */

/**
 * Registra o conjunto de rotas deste domínio na aplicação Express.
 *
 * @param {get: Function, post: Function, patch: Function, delete: Function} app Aplicação/roteador Express.
 * @param {} context Dependências e políticas compartilhadas da camada HTTP.
 * @returns {get: Function, post: Function} A mesma instância recebida, para composição encadeada.
 */
function registerBillingRoutes(app, context) {
  const {
    requireAuth,
    hasMongoUri,
    User,
    getPlan,
    normalizePlan,
    getDailyUsage,
    getTotalUsage,
    findUserById,
    updateLocalUserPlan,
    createMercadoPagoPreference,
    downgradeExpiredUserIfNeeded,
    getCurrentUserPlan,
    getPlanExpirationDate,
    isSimulatedBillingAllowed,
    reconcileMercadoPagoPayment,
    sendApiError,
    planRank
  } = context;

  // Consulta de consumo e criação de checkout.
  app.get('/api/billing/usage', requireAuth, async (req, res) => {
    try {
      const { plan, dailyLeadLimit } = await getCurrentUserPlan(req.user.sub);
      const usedToday = await getDailyUsage(req.user.sub);
      const usedTotal = await getTotalUsage(req.user.sub);
      const totalLeadLimit = plan.totalLeadLimit ?? null;
      res.json({
        plan,
        usedToday,
        usedTotal,
        dailyLeadLimit,
        totalLeadLimit,
        remainingToday: Math.max(dailyLeadLimit - usedToday, 0),
        remainingTotal: totalLeadLimit === null ? null : Math.max(totalLeadLimit - usedTotal, 0)
      });
    } catch (error) {
      sendApiError(res, error);
    }
  });

  /**
   * Checkout Mercado Pago.
   *
   * Em produção cria uma preferência real e nunca altera o plano antes da
   * confirmação do pagamento pelo webhook/sincronização.
   */
  app.post('/api/billing/checkout', requireAuth, async (req, res) => {
    try {
      const requestedPlan = req.body.plan || req.body.planId || req.body.id;
      const planId = normalizePlan(requestedPlan);
      if (!requestedPlan || planId === 'trial') {
        return res.status(400).json({ error: 'Escolha um plano pago válido: pro ou agency.' });
      }

      const plan = getPlan(planId);
      const { user } = await getCurrentUserPlan(req.user.sub);
      const currentPlan = getPlan(user?.plan || 'trial');

      if (user?.subscriptionStatus === 'active' && planRank(plan.id) <= planRank(currentPlan.id)) {
        return res.status(409).json({
          error: `Você já possui o plano ${currentPlan.name} ativo.`
        });
      }

      const preference = await createMercadoPagoPreference({ req, plan });

      if (preference) {
        return res.json({
          ok: true,
          mode: 'mercado_pago',
          message: `Checkout do plano ${plan.name} criado. Você será redirecionado para pagamento.`,
          plan,
          checkoutUrl: preference.checkoutUrl,
          sandboxCheckoutUrl: preference.sandboxCheckoutUrl,
          preferenceId: preference.preferenceId,
          externalReference: preference.externalReference
        });
      }

      if (!isSimulatedBillingAllowed()) {
        return res.status(503).json({
          error: 'Checkout indisponível. Configure MERCADO_PAGO_ACCESS_TOKEN para ativar planos pagos.'
        });
      }

      if (hasMongoUri()) {
        await User.findByIdAndUpdate(req.user.sub, {
          plan: plan.id,
          dailyLeadLimit: plan.dailyLeadLimit,
          totalLeadLimit: plan.totalLeadLimit ?? null,
          subscriptionStatus: 'simulated',
          planActivatedAt: new Date(),
          planExpiresAt: getPlanExpirationDate(plan.id)
        });
      } else {
        await updateLocalUserPlan(req.user.sub, plan.id, plan.dailyLeadLimit, plan.totalLeadLimit ?? null, {
          subscriptionStatus: 'simulated',
          planActivatedAt: new Date().toISOString(),
          planExpiresAt: getPlanExpirationDate(plan.id).toISOString()
        });
      }

      res.json({
        ok: true,
        mode: 'simulated',
        message: `Plano ${plan.name} ativado somente no ambiente de desenvolvimento.`,
        plan
      });
    } catch (error) {
      sendApiError(res, error);
    }
  });


  // Reconciliação assíncrona e consulta do estado da assinatura.
  app.post('/api/billing/webhook', async (req, res) => {
    try {
      console.info('[Mercado Pago Webhook] notificação recebida');

      const paymentId =
        req.body?.data?.id ||
        req.body?.id ||
        req.query?.id ||
        req.query?.['data.id'];

      const topic = req.body?.type || req.body?.topic || req.query?.topic || '';

      if (!paymentId || !String(topic).includes('payment')) {
        return res.status(200).json({ received: true, ignored: true });
      }

      const result = await reconcileMercadoPagoPayment(paymentId);
      return res.json({ received: true, ...result, payment: undefined });
    } catch (error) {
      console.error('[Mercado Pago Webhook Error]', error.message);
      return res.status(500).json({ received: false, error: 'Falha ao processar a notificação de pagamento.' });
    }
  });

  app.post('/api/billing/sync', requireAuth, async (req, res) => {
    try {
      const paymentId =
        req.body?.paymentId ||
        req.body?.payment_id ||
        req.query?.payment_id ||
        req.query?.collection_id;

      if (!paymentId) {
        return res.status(400).json({ error: 'Informe o payment_id para sincronizar.' });
      }

      const result = await reconcileMercadoPagoPayment(paymentId, { expectedUserId: req.user.sub });
      const user = hasMongoUri() ? await User.findById(req.user.sub).lean() : await findUserById(req.user.sub);
      const plan = getPlan(user?.plan || 'trial');

      res.json({
        ok: true,
        ...result,
        payment: undefined,
        user: {
          plan: plan.id,
          planName: plan.name,
          dailyLeadLimit: Number(user?.dailyLeadLimit ?? plan.dailyLeadLimit),
          totalLeadLimit: user?.totalLeadLimit ?? plan.totalLeadLimit ?? null,
          subscriptionStatus: user?.subscriptionStatus || 'trial',
          planActivatedAt: user?.planActivatedAt || null,
          planExpiresAt: user?.planExpiresAt || null
        }
      });
    } catch (error) {
      sendApiError(res, error);
    }
  });

  app.get('/api/billing/status', requireAuth, async (req, res) => {
    try {
      let user = hasMongoUri() ? await User.findById(req.user.sub).lean() : await findUserById(req.user.sub);
      user = await downgradeExpiredUserIfNeeded(user);
      if (!user) return res.status(404).json({ error: 'Usuário não encontrado.' });

      const plan = getPlan(user.plan || 'trial');
      res.json({
        plan,
        subscriptionStatus: user.subscriptionStatus || 'trial',
        planActivatedAt: user.planActivatedAt || null,
        planExpiresAt: user.planExpiresAt || null,
        mercadoPagoLastPaymentId: user.mercadoPagoLastPaymentId || ''
      });
    } catch (error) {
      sendApiError(res, error);
    }
  });


  return app;
}

module.exports = { registerBillingRoutes };
