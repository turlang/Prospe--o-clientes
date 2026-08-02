/**
 * @fileoverview Serviço de reinicialização controlada dos dados operacionais.
 *
 * A operação remove dados de prospecção, funil, cobrança, segurança e usuários
 * comuns, preservando exclusivamente as contas administrativas. O serviço
 * exige reautenticação e confirmação textual para reduzir exclusões acidentais.
 *
 * @module src/services/databaseResetService
 */

const path = require('node:path');

const RESET_CONFIRMATION_PHRASE = 'REINICIAR LEADHUNTER';
const LOCAL_DATA_FILES = Object.freeze({
  users: path.join(process.cwd(), 'data', 'users.json'),
  leads: path.join(process.cwd(), 'data', 'leads.json'),
  tasks: path.join(process.cwd(), 'data', 'tasks.json'),
  usage: path.join(process.cwd(), 'data', 'usage.json'),
  copilotConversations: path.join(process.cwd(), 'data', 'copilot-conversations.json')
});

function createHttpError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function normalizeCountResult(result) {
  return Number(result?.deletedCount || 0);
}

function normalizeConfirmation(value) {
  return String(value || '').trim().replace(/\s+/g, ' ').toUpperCase();
}

function sumCounts(counts) {
  return Object.values(counts || {}).reduce((total, value) => total + Number(value || 0), 0);
}

/**
 * Cria o serviço com dependências injetadas para permitir testes sem banco real.
 *
 * @param {object} dependencies Adaptadores de persistência e autenticação.
 * @returns {{getPreview: Function, executeReset: Function, isResetInProgress: Function}}
 */
function createDatabaseResetService(dependencies) {
  const {
    hasMongoUri,
    models,
    readJsonFile,
    writeJsonFileAtomic,
    withJsonFileLock,
    verifyPassword,
    localFiles = LOCAL_DATA_FILES
  } = dependencies;

  let resetInProgress = false;

  const mongoOperationalModels = Object.freeze({
    leads: models.Lead,
    searchHistory: models.SearchHistory,
    tasks: models.Task,
    usage: models.Usage,
    payments: models.Payment,
    trialGuards: models.TrialGuard,
    passwordResets: models.PasswordReset,
    copilotConversations: models.CopilotConversation,
    auditLogs: models.AdminAuditLog
  });

  async function countLocalFile(filePath) {
    const rows = await readJsonFile(filePath, []);
    return Array.isArray(rows) ? rows.length : 0;
  }

  async function countLocalUsage() {
    const usage = await readJsonFile(localFiles.usage, {});
    if (!usage || typeof usage !== 'object' || Array.isArray(usage)) return 0;
    return Object.values(usage).reduce((total, days) => {
      if (!days || typeof days !== 'object' || Array.isArray(days)) return total;
      return total + Object.keys(days).length;
    }, 0);
  }

  async function getMongoPreview() {
    const counts = {};
    for (const [key, model] of Object.entries(mongoOperationalModels)) {
      counts[key] = await model.countDocuments({});
    }

    counts.nonAdminUsers = await models.User.countDocuments({ role: { $ne: 'admin' } });
    const adminsPreserved = await models.User.countDocuments({ role: 'admin' });

    return {
      mode: 'mongodb',
      adminsPreserved,
      counts,
      totalToDelete: sumCounts(counts)
    };
  }

  async function getLocalPreview() {
    const users = await readJsonFile(localFiles.users, []);
    const safeUsers = Array.isArray(users) ? users : [];
    const counts = {
      nonAdminUsers: safeUsers.filter((user) => user?.role !== 'admin').length,
      leads: await countLocalFile(localFiles.leads),
      tasks: await countLocalFile(localFiles.tasks),
      usage: await countLocalUsage(),
      copilotConversations: await countLocalFile(localFiles.copilotConversations)
    };

    return {
      mode: 'local-json',
      adminsPreserved: safeUsers.filter((user) => user?.role === 'admin').length,
      counts,
      totalToDelete: sumCounts(counts)
    };
  }

  async function getPreview() {
    return hasMongoUri() ? getMongoPreview() : getLocalPreview();
  }

  async function clearLocalFile(filePath) {
    return withJsonFileLock(filePath, async () => {
      const current = await readJsonFile(filePath, []);
      const deletedCount = Array.isArray(current) ? current.length : 0;
      await writeJsonFileAtomic(filePath, []);
      return deletedCount;
    });
  }

  async function clearLocalUsage() {
    return withJsonFileLock(localFiles.usage, async () => {
      const deletedCount = await countLocalUsage();
      await writeJsonFileAtomic(localFiles.usage, {});
      return deletedCount;
    });
  }

  async function resetLocalData() {
    const usersBefore = await readJsonFile(localFiles.users, []);
    const safeUsersBefore = Array.isArray(usersBefore) ? usersBefore : [];
    const adminsBefore = safeUsersBefore.filter((user) => user?.role === 'admin');
    if (!adminsBefore.length) {
      throw createHttpError(409, 'A reinicialização foi bloqueada porque nenhuma conta administradora seria preservada.');
    }

    const deleted = {};
    deleted.leads = await clearLocalFile(localFiles.leads);
    deleted.tasks = await clearLocalFile(localFiles.tasks);
    deleted.usage = await clearLocalUsage();
    deleted.copilotConversations = await clearLocalFile(localFiles.copilotConversations);

    // Usuários comuns são removidos por último pelo mesmo motivo adotado no
    // MongoDB: uma falha intermediária não pode eliminar o acesso ao painel.
    deleted.nonAdminUsers = await withJsonFileLock(localFiles.users, async () => {
      const users = await readJsonFile(localFiles.users, []);
      const safeUsers = Array.isArray(users) ? users : [];
      const admins = safeUsers.filter((user) => user?.role === 'admin');
      if (!admins.length) {
        throw createHttpError(409, 'A reinicialização foi bloqueada porque nenhuma conta administradora seria preservada.');
      }
      await writeJsonFileAtomic(localFiles.users, admins);
      return safeUsers.length - admins.length;
    });

    return {
      mode: 'local-json',
      adminsPreserved: (await readJsonFile(localFiles.users, [])).length,
      deleted,
      totalDeleted: sumCounts(deleted)
    };
  }

  async function resetMongoData() {
    const adminsPreserved = await models.User.countDocuments({ role: 'admin' });
    if (!adminsPreserved) {
      throw createHttpError(409, 'A reinicialização foi bloqueada porque nenhuma conta administradora seria preservada.');
    }

    const deleted = {};
    for (const [key, model] of Object.entries(mongoOperationalModels)) {
      deleted[key] = normalizeCountResult(await model.deleteMany({}));
    }

    // Usuários comuns são removidos por último. Assim, uma falha intermediária
    // permite repetir a limpeza sem perder o acesso administrativo ao sistema.
    deleted.nonAdminUsers = normalizeCountResult(
      await models.User.deleteMany({ role: { $ne: 'admin' } })
    );

    const remainingAdmins = await models.User.countDocuments({ role: 'admin' });
    if (!remainingAdmins) {
      throw createHttpError(500, 'A verificação final não encontrou administradores preservados.');
    }

    return {
      mode: 'mongodb',
      adminsPreserved: remainingAdmins,
      deleted,
      totalDeleted: sumCounts(deleted)
    };
  }

  /**
   * Executa a limpeza após confirmar papel, senha e frase destrutiva.
   *
   * @param {object} input Dados da solicitação administrativa.
   * @returns {Promise<object>} Resumo dos registros removidos.
   */
  async function executeReset({ adminUser, password, confirmation }) {
    if (resetInProgress) {
      throw createHttpError(409, 'Já existe uma reinicialização do banco em andamento.');
    }
    if (!adminUser || adminUser.role !== 'admin') {
      throw createHttpError(403, 'Apenas administradores podem reinicializar o banco de dados.');
    }
    if (normalizeConfirmation(confirmation) !== RESET_CONFIRMATION_PHRASE) {
      throw createHttpError(400, `Digite exatamente: ${RESET_CONFIRMATION_PHRASE}`);
    }

    const safePassword = String(password || '');
    if (!safePassword || safePassword.length > 128) {
      throw createHttpError(400, 'Informe a senha atual do administrador.');
    }
    if (!adminUser.passwordHash || !(await verifyPassword(safePassword, adminUser.passwordHash))) {
      throw createHttpError(401, 'Senha do administrador incorreta.');
    }

    resetInProgress = true;
    try {
      const result = hasMongoUri() ? await resetMongoData() : await resetLocalData();
      return {
        ...result,
        confirmationPhrase: RESET_CONFIRMATION_PHRASE,
        completedAt: new Date().toISOString()
      };
    } finally {
      resetInProgress = false;
    }
  }

  return {
    getPreview,
    executeReset,
    isResetInProgress: () => resetInProgress
  };
}

module.exports = {
  RESET_CONFIRMATION_PHRASE,
  LOCAL_DATA_FILES,
  normalizeConfirmation,
  createDatabaseResetService
};
