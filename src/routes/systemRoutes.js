/**
 * @fileoverview Rotas públicas, diagnóstico operacional e informações de capacidade do sistema.
 *
 * As dependências são recebidas por injeção para manter o módulo testável e
 * evitar acoplamento implícito ao processo de inicialização.
 *
 * @module routes/systemRoutes
 */

/**
 * Registra o conjunto de rotas deste domínio na aplicação Express.
 *
 * @param {get: Function, post: Function, patch: Function, delete: Function} app Aplicação/roteador Express.
 * @param {} context Dependências e políticas compartilhadas da camada HTTP.
 * @returns {get: Function, post: Function} A mesma instância recebida, para composição encadeada.
 */
function registerSystemRoutes(app, context) {
  const {
    path,
    fs,
    testGoogleConnection,
    requireAuth,
    requireAdmin,
    requestCounters,
    hasMongoUri,
    getMongoStatus,
    getAllPlans,
    getDailyUsage,
    getTotalUsage,
    getCurrentUserPlan,
    getAiProviderStatus,
    sendApiError,
    startedAt
  } = context;

  // Páginas públicas e aplicação autenticada.
  app.get('/app', (_req, res) => {
    res.sendFile(path.join(process.cwd(), 'public', 'index.html'));
  });

  app.get('/', (_req, res) => {
    res.sendFile(path.join(process.cwd(), 'public', 'landing.html'));
  });

  app.get('/landing.html', (_req, res) => {
    res.sendFile(path.join(process.cwd(), 'public', 'landing.html'));
  });

  // Saúde, observabilidade e informações públicas de capacidade.
  app.get('/api/health', (_req, res) => {
    res.json({
      ok: true,
      service: 'prospeccao-leads',
      version: require('../package.json').version,
      uptimeSeconds: Math.round(process.uptime()),
      startedAt,
      mongodbAtivo: hasMongoUri(),
      mongodbStatus: getMongoStatus()
    });
  });

  app.get('/api/metrics', requireAuth, requireAdmin, async (req, res) => {
    const { plan, dailyLeadLimit } = await getCurrentUserPlan(req.user.sub);
    const usedToday = await getDailyUsage(req.user.sub);
    const usedTotal = await getTotalUsage(req.user.sub);

    res.json({
      requests: requestCounters,
      plan,
      usage: {
        usedToday,
        usedTotal,
        dailyLeadLimit,
        totalLeadLimit: plan.totalLeadLimit ?? null,
        remainingToday: Math.max(dailyLeadLimit - usedToday, 0),
        remainingTotal: plan.totalLeadLimit === null ? null : Math.max(plan.totalLeadLimit - usedTotal, 0)
      },
      memory: process.memoryUsage()
    });
  });


  app.get('/api/plans', (_req, res) => {
    res.json(getAllPlans());
  });

  app.get('/api/ai/status', requireAuth, (_req, res) => {
    res.json(getAiProviderStatus());
  });


  // Diagnósticos restritos ao administrador; nenhum segredo é retornado.
  app.get('/api/diagnostico-env', requireAuth, requireAdmin, (_req, res) => {
    const envPath = path.join(process.cwd(), '.env');
    const envTxtPath = path.join(process.cwd(), '.env.txt');
    const key = process.env.GOOGLE_PLACES_API_KEY || '';
    res.json({
      pastaAtual: process.cwd(),
      envExiste: fs.existsSync(envPath),
      envTxtExiste: fs.existsSync(envTxtPath),
      chaveCarregada: Boolean(key && key !== 'cole_sua_chave_aqui'),
      tamanhoChave: key.length,
      provider: process.env.PLACES_PROVIDER || null,
      mongodbAtivo: hasMongoUri(),
      mongodbStatus: getMongoStatus(),
      dica: fs.existsSync(envTxtPath) ? 'Você criou .env.txt. Renomeie para .env sem extensão.' : 'O arquivo .env deve ficar na raiz do projeto, ao lado do package.json.'
    });
  });

  app.get('/api/testar-google', requireAuth, requireAdmin, async (_req, res) => {
    try {
      const resultado = await testGoogleConnection();
      res.json(resultado);
    } catch (error) {
      sendApiError(res, error);
    }
  });

  return app;
}

module.exports = { registerSystemRoutes };
