/**
 * @fileoverview Rotas públicas, diagnóstico operacional e informações de capacidade do sistema.
 *
 * As dependências externas continuam recebidas por injeção, enquanto caminhos
 * e metadados estáveis são importados da camada de configuração. Essa divisão
 * mantém os testes simples e evita reconstruir caminhos em cada requisição.
 *
 * @module routes/systemRoutes
 */

const {
  APP_PAGE_PATH,
  LANDING_BUILD_PATH,
  LANDING_FALLBACK_PATH,
  RESET_PASSWORD_PAGE_PATH
} = require('../config/paths');
const {
  APPLICATION_VERSION,
  LANDING_VERSION
} = require('../config/application');

/**
 * Configura cabeçalhos de documentos HTML que não devem permanecer obsoletos
 * após um deploy. Assets versionados continuam usando cache no middleware
 * estático, mas os documentos de entrada são sempre revalidados.
 *
 * @param {import('express').Response} res Resposta Express.
 * @param {string} pageName Identificador da página para diagnóstico.
 */
function setHtmlResponseHeaders(res, pageName) {
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('X-Application-Version', APPLICATION_VERSION);
  res.setHeader('X-Page-Name', pageName);
}

/**
 * Retorna o estado do artefato público da landing.
 *
 * @param {{existsSync: Function}} fs Adaptador de sistema de arquivos.
 * @returns {{source: 'react-build'|'static-prebuilt'|'static-fallback', path: string, available: boolean}} Estado resolvido.
 */
function resolveLandingArtifact(fs) {
  if (fs.existsSync(LANDING_BUILD_PATH)) {
    let source = 'static-prebuilt';

    // O Vite monta a aplicação em #root. A versão estática contém as seções
    // completas no HTML. Identificar o formato evita diagnóstico incorreto.
    if (typeof fs.readFileSync === 'function') {
      try {
        const document = fs.readFileSync(LANDING_BUILD_PATH, 'utf8');
        if (document.includes('id=\"root\"')) source = 'react-build';
      } catch {
        // A existência do artefato já foi confirmada. A leitura será refeita
        // pelo sendFile e eventuais erros serão tratados pelo Express.
      }
    }

    return { source, path: LANDING_BUILD_PATH, available: true };
  }

  return {
    source: 'static-fallback',
    path: LANDING_FALLBACK_PATH,
    available: fs.existsSync(LANDING_FALLBACK_PATH)
  };
}

/**
 * Registra o conjunto de rotas deste domínio na aplicação Express.
 *
 * @param {import('express').Express} app Aplicação Express.
 * @param {object} context Dependências e políticas compartilhadas da camada HTTP.
 * @returns {import('express').Express} A mesma instância recebida.
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
    getPasswordResetEmailStatus,
    getCatalogMetadata,
    getPublicPlans,
    getDailyUsage,
    getTotalUsage,
    getCurrentUserPlan,
    getAiProviderStatus,
    sendApiError,
    startedAt
  } = context;

  app.get('/app', (_req, res) => {
    setHtmlResponseHeaders(res, 'authenticated-app');
    res.sendFile(APP_PAGE_PATH);
  });

  app.get('/reset-password.html', (_req, res) => {
    setHtmlResponseHeaders(res, 'reset-password');
    res.sendFile(RESET_PASSWORD_PAGE_PATH);
  });

  const sendLandingPage = (_req, res) => {
    const artifact = resolveLandingArtifact(fs);
    setHtmlResponseHeaders(res, 'public-landing');
    res.setHeader('X-Landing-Version', LANDING_VERSION);
    res.setHeader('X-Landing-Source', artifact.source);

    if (!artifact.available) {
      return res.status(503).type('text/plain').send('Landing page indisponível. Execute o build do frontend.');
    }

    return res.sendFile(artifact.path);
  };

  app.get('/', sendLandingPage);
  app.get('/landing.html', sendLandingPage);

  app.get('/api/health', (_req, res) => {
    const landing = resolveLandingArtifact(fs);
    res.json({
      ok: true,
      service: 'prospeccao-leads',
      version: APPLICATION_VERSION,
      uptimeSeconds: Math.round(process.uptime()),
      startedAt,
      mongodbAtivo: hasMongoUri(),
      mongodbStatus: getMongoStatus(),
      landing: {
        version: LANDING_VERSION,
        available: landing.available,
        source: landing.source
      },
      plans: getCatalogMetadata()
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
    const metadata = getCatalogMetadata();
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('X-Plans-Revision', String(metadata.revision));
    if (metadata.updatedAt) res.setHeader('Last-Modified', new Date(metadata.updatedAt).toUTCString());
    res.json(getPublicPlans());
  });

  app.get('/api/ai/status', requireAuth, (_req, res) => {
    res.json(getAiProviderStatus());
  });

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
      recuperacaoSenha: (() => {
        const status = getPasswordResetEmailStatus();
        return {
          disponivel: status.available,
          configurado: status.configured,
          provedor: status.provider,
          motivo: status.reason
        };
      })(),
      dica: fs.existsSync(envTxtPath)
        ? 'Você criou .env.txt. Renomeie para .env sem extensão.'
        : 'O arquivo .env deve ficar na raiz do projeto, ao lado do package.json.'
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

module.exports = {
  registerSystemRoutes,
  resolveLandingArtifact,
  setHtmlResponseHeaders
};
