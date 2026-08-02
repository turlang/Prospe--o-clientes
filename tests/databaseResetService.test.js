/**
 * @fileoverview Testes do serviço de reinicialização administrativa do banco.
 *
 * Valida confirmação destrutiva, reautenticação, preservação de administradores
 * e limpeza dos armazenamentos MongoDB e JSON local.
 *
 * @module tests/databaseResetService.test
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const {
  RESET_CONFIRMATION_PHRASE,
  normalizeConfirmation,
  createDatabaseResetService
} = require('../src/services/databaseResetService');
const { readJsonFile, writeJsonFileAtomic, withJsonFileLock } = require('../src/utils/jsonFileStore');

async function createLocalFixture() {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'leadhunter-reset-'));
  const localFiles = {
    users: path.join(directory, 'users.json'),
    leads: path.join(directory, 'leads.json'),
    tasks: path.join(directory, 'tasks.json'),
    usage: path.join(directory, 'usage.json'),
    copilotConversations: path.join(directory, 'copilot-conversations.json')
  };

  await writeJsonFileAtomic(localFiles.users, [
    { id: 'admin-1', role: 'admin', passwordHash: 'hash-admin' },
    { id: 'user-1', role: 'user' },
    { id: 'user-2' }
  ]);
  await writeJsonFileAtomic(localFiles.leads, [{ id: 'l1' }, { id: 'l2' }]);
  await writeJsonFileAtomic(localFiles.tasks, [{ id: 't1' }]);
  await writeJsonFileAtomic(localFiles.usage, { 'user-1': { '2026-07-26': 2, '2026-07-27': 3 } });
  await writeJsonFileAtomic(localFiles.copilotConversations, [{ id: 'c1' }]);

  return { directory, localFiles };
}

test('normaliza a frase de confirmação sem aceitar texto diferente', () => {
  assert.equal(normalizeConfirmation('  reiniciar   leadhunter '), RESET_CONFIRMATION_PHRASE);
  assert.notEqual(normalizeConfirmation('reiniciar banco'), RESET_CONFIRMATION_PHRASE);
});

test('limpeza local preserva administradores e esvazia dados operacionais', async (t) => {
  const fixture = await createLocalFixture();
  t.after(() => fs.rm(fixture.directory, { recursive: true, force: true }));

  const service = createDatabaseResetService({
    hasMongoUri: () => false,
    models: {},
    readJsonFile,
    writeJsonFileAtomic,
    withJsonFileLock,
    verifyPassword: async (password, hash) => password === 'senha-correta' && hash === 'hash-admin',
    localFiles: fixture.localFiles
  });

  const preview = await service.getPreview();
  assert.equal(preview.mode, 'local-json');
  assert.equal(preview.adminsPreserved, 1);
  assert.equal(preview.counts.nonAdminUsers, 2);
  assert.equal(preview.counts.leads, 2);

  const result = await service.executeReset({
    adminUser: { id: 'admin-1', role: 'admin', passwordHash: 'hash-admin' },
    password: 'senha-correta',
    confirmation: RESET_CONFIRMATION_PHRASE
  });

  assert.equal(result.adminsPreserved, 1);
  assert.equal(result.deleted.nonAdminUsers, 2);
  assert.equal(result.deleted.leads, 2);
  assert.deepEqual(await readJsonFile(fixture.localFiles.users, []), [
    { id: 'admin-1', role: 'admin', passwordHash: 'hash-admin' }
  ]);
  assert.deepEqual(await readJsonFile(fixture.localFiles.leads, []), []);
  assert.deepEqual(await readJsonFile(fixture.localFiles.tasks, []), []);
  assert.deepEqual(await readJsonFile(fixture.localFiles.usage, {}), {});
  assert.deepEqual(await readJsonFile(fixture.localFiles.copilotConversations, []), []);
});

test('limpeza recusa frase ou senha incorretas', async (t) => {
  const fixture = await createLocalFixture();
  t.after(() => fs.rm(fixture.directory, { recursive: true, force: true }));

  const service = createDatabaseResetService({
    hasMongoUri: () => false,
    models: {},
    readJsonFile,
    writeJsonFileAtomic,
    withJsonFileLock,
    verifyPassword: async (password) => password === 'senha-correta',
    localFiles: fixture.localFiles
  });
  const adminUser = { role: 'admin', passwordHash: 'hash-admin' };

  await assert.rejects(
    service.executeReset({ adminUser, password: 'senha-correta', confirmation: 'APAGAR' }),
    (error) => error.statusCode === 400
  );
  await assert.rejects(
    service.executeReset({ adminUser, password: 'senha-errada', confirmation: RESET_CONFIRMATION_PHRASE }),
    (error) => error.statusCode === 401
  );
});

function createOperationalModel(initialCount) {
  let count = initialCount;
  return {
    async countDocuments() { return count; },
    async deleteMany() {
      const deletedCount = count;
      count = 0;
      return { deletedCount };
    }
  };
}

test('limpeza MongoDB remove coleções operacionais e usuários não administradores', async () => {
  const state = { admins: 2, nonAdmins: 3 };
  const User = {
    async countDocuments(filter) {
      return filter?.role === 'admin' ? state.admins : state.nonAdmins;
    },
    async deleteMany() {
      const deletedCount = state.nonAdmins;
      state.nonAdmins = 0;
      return { deletedCount };
    }
  };
  const models = {
    User,
    Lead: createOperationalModel(5),
    SearchHistory: createOperationalModel(4),
    Task: createOperationalModel(3),
    Usage: createOperationalModel(2),
    Payment: createOperationalModel(1),
    TrialGuard: createOperationalModel(6),
    PasswordReset: createOperationalModel(1),
    CopilotConversation: createOperationalModel(7),
    AdminAuditLog: createOperationalModel(8)
  };

  const service = createDatabaseResetService({
    hasMongoUri: () => true,
    models,
    readJsonFile: async () => [],
    writeJsonFileAtomic: async () => {},
    withJsonFileLock: async (_file, operation) => operation(),
    verifyPassword: async () => true
  });

  const result = await service.executeReset({
    adminUser: { role: 'admin', passwordHash: 'hash-admin' },
    password: 'senha-correta',
    confirmation: RESET_CONFIRMATION_PHRASE
  });

  assert.equal(result.mode, 'mongodb');
  assert.equal(result.adminsPreserved, 2);
  assert.equal(result.deleted.nonAdminUsers, 3);
  assert.equal(result.deleted.leads, 5);
  assert.equal(result.deleted.auditLogs, 8);
  assert.equal(state.nonAdmins, 0);
});
