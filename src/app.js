/**
 * @fileoverview Composição da aplicação HTTP do LeadHunter Pro.
 *
 * A função `createApp` aplica o padrão Application Factory: middlewares e
 * módulos de rota são compostos sem abrir uma porta de rede. Essa separação
 * reduz efeitos colaterais, favorece testes e mantém o bootstrap independente.
 *
 * @module app
 */

const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(process.cwd(), '.env') });
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const bcrypt = require('bcryptjs');
const { format } = require('@fast-csv/format');
const { searchPlaces, testGoogleConnection } = require('./integrations/googlePlaces');
const { scoreLead, filterActionable } = require('./domain/leads/leadScoring');
const { auditWebsite } = require('./integrations/siteAuditor');
const { readLeads, saveLeads, updateLeadStatus, updateLeadMeta, getLeadStats } = require('./repositories/leadRepository');
const SearchHistory = require('./models/SearchHistory');
const { analyzeLeadResponse } = require('./domain/conversations/conversationEngine');
const authRoutes = require('./routes/authRoutes');
const { requireAuth, assertSecurityEnv } = require('./middleware/auth');
const { requireAdmin } = require('./middleware/admin');
const { requestLogger, requestCounters } = require('./middleware/requestLogger');
const { simpleRateLimit } = require('./middleware/rateLimit');
const { hasMongoUri, getMongoStatus } = require('./infrastructure/database/mongoConnection');
const User = require('./models/User');
const Payment = require('./models/Payment');
const Usage = require('./models/Usage');
const AdminAuditLog = require('./models/AdminAuditLog');
const TrialGuard = require('./models/TrialGuard');
const PasswordReset = require('./models/PasswordReset');
const Lead = require('./models/Lead');
const Task = require('./models/Task');
const CopilotConversation = require('./models/CopilotConversation');
const { getAllPlans, getPlan, normalizePlan, updatePlan } = require('./domain/plans/planCatalog');
const { getDailyUsage, getTotalUsage, addDailyUsage } = require('./repositories/local/usageRepository');
const { findUserById, updateLocalUserPlan } = require('./repositories/local/userRepository');
const { buildCampaignSequence, nextFollowUpDate, buildAutomationPlan, getPriorityFromLead } = require('./domain/campaigns/campaignEngine');
const { createTask, createTaskIfMissing, completePendingAutomationTasksForLead, listTasks, completeTask } = require('./repositories/local/taskRepository');
const {
  createMercadoPagoPreference,
  downgradeExpiredUserIfNeeded,
  getCurrentUserPlan,
  getPlanExpirationDate,
  isSimulatedBillingAllowed,
  reconcileMercadoPagoPayment
} = require('./services/billingService');
const { writeAdminAudit } = require('./services/adminAuditService');
const { buildSalesApproach } = require('./services/salesStrategyEngine');
const { buildCommercialEngineOutput, buildNextTaskPlan } = require('./services/commercialFunnelEngine');
const { generateAiEnhancedApproach, getAiProviderStatus } = require('./services/aiApproachService');
const { buildAgendaSummary } = require('./services/commercialAgendaService');
const { buildCommercialIntelligence, buildObjectionResponse } = require('./services/commercialIntelligenceService');
const { buildCommercialReport, buildCommercialReportCsv } = require('./services/commercialReportService');
const { buildAiProposal, buildProposalSummary } = require('./services/commercialProposalService');
const { buildCustomerSuccessSummary, buildCloseInteraction, buildLostInteraction } = require('./services/customerSuccessService');
const {
  buildCustomerGrowthSummary,
  buildReferralMessage,
  buildExpansionMessage,
  buildReferralInteraction,
  buildExpansionInteraction
} = require('./services/customerGrowthService');
const {
  buildCampaignSummary,
  buildSmartCampaign,
  buildCampaignInteraction,
  buildCampaignTasks
} = require('./services/campaignAutomationService');
const { buildAutonomousCommandCenter, answerCommercialCopilot } = require('./services/autonomousCommercialService');
const { createSalesOsRoutes } = require('./core/routes/salesOsRoutes');
const { sendApiError } = require('./utils/httpError');
const { readJsonFile, writeJsonFileAtomic, withJsonFileLock } = require('./utils/jsonFileStore');
const { createDatabaseResetService, RESET_CONFIRMATION_PHRASE } = require('./services/databaseResetService');
const { getPasswordResetEmailStatus } = require('./services/emailService');
const { LEAD_STATUS_SET } = require('./domain/leadStatus');

const { registerSystemRoutes } = require('./routes/systemRoutes');
const { registerBillingRoutes } = require('./routes/billingRoutes');
const { registerLeadRoutes } = require('./routes/leadRoutes');
const { registerAdminRoutes } = require('./routes/adminRoutes');
const { registerCommercialRoutes } = require('./routes/commercialRoutes');


/**
 * Cria uma aplicação Express configurada e pronta para receber requisições.
 *
 * @returns {listen: Function, use: Function} Instância configurada do Express.
 */
function createApp() {
  const app = express();
  app.set('trust proxy', 1);
  assertSecurityEnv();

  const startedAt = new Date();
  function publicBaseUrl(req) {
    return process.env.PUBLIC_APP_URL || `${req.protocol}://${req.get('host')}`;
  }

  function planRank(planId) {
    return ({ trial: 0, pro: 1, agency: 2 })[planId] ?? 0;
  }

  const databaseResetService = createDatabaseResetService({
    hasMongoUri,
    models: {
      User,
      Lead,
      SearchHistory,
      Task,
      Usage,
      Payment,
      TrialGuard,
      PasswordReset,
      CopilotConversation,
      AdminAuditLog
    },
    readJsonFile,
    writeJsonFileAtomic,
    withJsonFileLock,
    verifyPassword: bcrypt.compare
  });

  const ALLOWED_LEAD_STATUSES = new Set(LEAD_STATUS_SET);

  function parseProspectingLimit(value) {
    const parsed = Number(value ?? 10);
    if (!Number.isInteger(parsed) || parsed < 1) return null;
    return Math.min(parsed, 20);
  }

  function sanitizeSearchText(value, maxLength = 120) {
    return String(value || '').trim().replace(/\s+/g, ' ').slice(0, maxLength);
  }

  function escapeRegExp(value) {
    return String(value || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function corsOriginAllowed(origin) {
    if (!origin) return true;

    let normalizedOrigin;
    try { normalizedOrigin = new URL(origin).origin; }
    catch { return false; }

    const configured = [process.env.PUBLIC_APP_URL, ...(process.env.CORS_ORIGINS || '').split(',')]
      .map((item) => String(item || '').trim())
      .filter(Boolean)
      .map((item) => {
        try { return new URL(item).origin; } catch { return ''; }
      })
      .filter(Boolean);

    if (configured.includes(normalizedOrigin)) return true;
    if (String(process.env.NODE_ENV || '').toLowerCase() !== 'production') {
      return /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(normalizedOrigin);
    }

    return false;
  }

  app.use(helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        defaultSrc: ["'self'"],
        // O frontend legado usa handlers inline (onclick) em vários botões.
        // Mantemos CSP ativa, mas liberamos inline scripts para preservar a UX até a migração completa para listeners externos.
        scriptSrc: ["'self'", "'unsafe-inline'"],
        // Helmet 7 também cria script-src-attr. Sem esta diretiva,
        // o navegador bloqueia onclick/ondrop/ondragstart do frontend legado.
        scriptSrcAttr: ["'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'", 'https://api.mercadopago.com'],
        frameAncestors: ["'self'"]
      }
    }
  }));
  app.use(cors({
    origin(origin, callback) { callback(null, corsOriginAllowed(origin)); },
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Device-Id'],
    maxAge: 600
  }));
  app.use(express.json({ limit: '256kb', strict: true }));
  app.use((req, _res, next) => { req.body = req.body && typeof req.body === 'object' ? req.body : {}; next(); });
  app.use(requestLogger);
  app.use('/api', simpleRateLimit({ windowMs: 60_000, max: 120 }));
  app.use('/api', (req, res, next) => {
    const isMutation = ['POST', 'PATCH', 'PUT', 'DELETE'].includes(req.method);
    if (isMutation && databaseResetService.isResetInProgress()) {
      res.setHeader('Retry-After', '5');
      return res.status(503).json({ error: 'O banco está em manutenção administrativa. Tente novamente em alguns segundos.' });
    }
    return next();
  });
  app.use(express.static('public', {
    index: false,
    maxAge: process.env.NODE_ENV === 'production' ? '1h' : 0,
    setHeaders(res, filePath) {
      if (filePath.endsWith('.html')) {
        res.setHeader('Cache-Control', 'no-store, max-age=0');
      }
    }
  }));

  const routeContext = {
    path,
    fs,
    format,
    searchPlaces,
    testGoogleConnection,
    scoreLead,
    filterActionable,
    auditWebsite,
    readLeads,
    saveLeads,
    updateLeadStatus,
    updateLeadMeta,
    getLeadStats,
    SearchHistory,
    analyzeLeadResponse,
    requireAuth,
    requireAdmin,
    requestCounters,
    hasMongoUri,
    getMongoStatus,
    getPasswordResetEmailStatus,
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
    getDailyUsage,
    getTotalUsage,
    addDailyUsage,
    findUserById,
    updateLocalUserPlan,
    buildCampaignSequence,
    nextFollowUpDate,
    buildAutomationPlan,
    getPriorityFromLead,
    createTask,
    createTaskIfMissing,
    completePendingAutomationTasksForLead,
    listTasks,
    completeTask,
    createMercadoPagoPreference,
    downgradeExpiredUserIfNeeded,
    getCurrentUserPlan,
    getPlanExpirationDate,
    isSimulatedBillingAllowed,
    reconcileMercadoPagoPayment,
    writeAdminAudit,
    getDatabaseResetPreview: databaseResetService.getPreview,
    executeDatabaseReset: databaseResetService.executeReset,
    databaseResetConfirmationPhrase: RESET_CONFIRMATION_PHRASE,
    buildSalesApproach,
    buildCommercialEngineOutput,
    buildNextTaskPlan,
    generateAiEnhancedApproach,
    getAiProviderStatus,
    buildAgendaSummary,
    buildCommercialIntelligence,
    buildObjectionResponse,
    buildCommercialReport,
    buildCommercialReportCsv,
    buildAiProposal,
    buildProposalSummary,
    buildCustomerSuccessSummary,
    buildCloseInteraction,
    buildLostInteraction,
    buildCustomerGrowthSummary,
    buildReferralMessage,
    buildExpansionMessage,
    buildReferralInteraction,
    buildExpansionInteraction,
    buildCampaignSummary,
    buildSmartCampaign,
    buildCampaignInteraction,
    buildCampaignTasks,
    buildAutonomousCommandCenter,
    answerCommercialCopilot,
    simpleRateLimit,
    sendApiError,
    startedAt,
    publicBaseUrl,
    planRank,
    ALLOWED_LEAD_STATUSES,
    parseProspectingLimit,
    sanitizeSearchText,
    escapeRegExp,
  };

  // A ordem de registro preserva as rotas específicas antes dos fallbacks.
  registerSystemRoutes(app, routeContext);
  app.use('/api/auth', authRoutes);
  app.use('/api/v23', createSalesOsRoutes({ requireAuth }));
  registerBillingRoutes(app, routeContext);
  registerLeadRoutes(app, routeContext);
  registerAdminRoutes(app, routeContext);
  registerCommercialRoutes(app, routeContext);

  app.use('/api', (_req, res) => {
    res.status(404).json({ error: 'Rota da API não encontrada.' });
  });

  app.use((error, _req, res, _next) => {
    console.error('Erro interno:', error);
    const expose = String(process.env.NODE_ENV || '').toLowerCase() !== 'production'
      || Number(error.statusCode) < 500;

    res.status(error.statusCode || 500).json({
      error: expose ? (error.message || 'Erro interno do servidor.') : 'Erro interno do servidor.'
    });
  });

  return app;
}

module.exports = { createApp };
