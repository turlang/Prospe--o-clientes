/**
 * @fileoverview Persistência local de usuários utilizada apenas nos ambientes permitidos.
 *
 * Responsabilidade delimitada conforme a arquitetura descrita em
 * `docs/ARQUITETURA.md`. Alterações neste arquivo devem preservar os contratos
 * documentados e ser acompanhadas por testes quando afetarem regras de negócio.
 *
 * @module src/localUserStore
 */

/**
 * Persistência local de usuários para desenvolvimento sem MongoDB.
 * Escritas são serializadas e atômicas para evitar perda de dados concorrente.
 */

const path = require('node:path');
const crypto = require('node:crypto');
const { readJsonFile, writeJsonFileAtomic, withJsonFileLock } = require('./utils/jsonFileStore');

const USERS_PATH = path.join(__dirname, '..', 'data', 'users.json');

async function readUsers() {
  const users = await readJsonFile(USERS_PATH, []);
  return Array.isArray(users) ? users : [];
}

async function findUserByEmail(email) {
  const normalized = String(email || '').trim().toLowerCase();
  const users = await readUsers();
  return users.find((user) => String(user.email || '').toLowerCase() === normalized) || null;
}

async function findUserById(id) {
  const users = await readUsers();
  return users.find((user) => String(user.id) === String(id)) || null;
}

async function findUserByDeviceId(deviceId) {
  const normalized = String(deviceId || '').trim();
  if (!normalized) return null;
  const users = await readUsers();
  return users.find((user) => String(user.deviceId || '') === normalized) || null;
}

async function countRecentLocalRegistrationsByIp(ip, windowMs) {
  const normalized = String(ip || '').trim();
  if (!normalized || normalized === 'unknown') return 0;
  const cutoff = Date.now() - Math.max(0, Number(windowMs || 0));
  const users = await readUsers();
  return users.filter((user) => {
    const createdAt = new Date(user.createdAt || 0).getTime();
    return String(user.registrationIp || '') === normalized && Number.isFinite(createdAt) && createdAt >= cutoff;
  }).length;
}

async function createLocalUser({ name, email, passwordHash, deviceId = '', registrationIp = '' }) {
  return withJsonFileLock(USERS_PATH, async () => {
    const users = await readUsers();
    const normalizedEmail = String(email || '').trim().toLowerCase();

    if (users.some((user) => String(user.email || '').toLowerCase() === normalizedEmail)) {
      const error = new Error('Este e-mail já está cadastrado.');
      error.code = 'LOCAL_DUPLICATE_EMAIL';
      throw error;
    }

    if (deviceId && users.some((user) => String(user.deviceId || '') === String(deviceId))) {
      const error = new Error('Este dispositivo já utilizou o teste gratuito.');
      error.code = 'LOCAL_DUPLICATE_DEVICE';
      throw error;
    }

    const now = new Date().toISOString();
    const user = {
      id: crypto.randomUUID(),
      name,
      email: normalizedEmail,
      passwordHash,
      plan: 'trial',
      dailyLeadLimit: 10,
      totalLeadLimit: 10,
      trialStartedAt: now,
      subscriptionStatus: 'trial',
      isActive: true,
      role: 'user',
      deviceId: String(deviceId || ''),
      registrationIp: String(registrationIp || ''),
      planActivatedAt: null,
      planExpiresAt: null,
      mercadoPagoLastPaymentId: '',
      createdAt: now,
      updatedAt: now
    };

    users.push(user);
    await writeJsonFileAtomic(USERS_PATH, users);
    return user;
  });
}


async function updateLocalUserPassword(id, passwordHash, passwordChangedAt = new Date()) {
  return withJsonFileLock(USERS_PATH, async () => {
    const users = await readUsers();
    const index = users.findIndex((user) => String(user.id) === String(id));
    if (index === -1) return null;

    const changedAt = new Date(passwordChangedAt).toISOString();
    users[index] = {
      ...users[index],
      passwordHash,
      passwordChangedAt: changedAt,
      updatedAt: changedAt
    };

    await writeJsonFileAtomic(USERS_PATH, users);
    return users[index];
  });
}

async function updateLocalUserPlan(id, plan, dailyLeadLimit, totalLeadLimit = null, options = {}) {
  return withJsonFileLock(USERS_PATH, async () => {
    const users = await readUsers();
    const index = users.findIndex((user) => String(user.id) === String(id));
    if (index === -1) return null;

    const isTrial = plan === 'trial';
    users[index] = {
      ...users[index],
      plan,
      dailyLeadLimit: Number(dailyLeadLimit || 0),
      totalLeadLimit,
      subscriptionStatus: options.subscriptionStatus || (isTrial ? 'trial' : 'simulated'),
      planActivatedAt: options.planActivatedAt !== undefined
        ? options.planActivatedAt
        : isTrial ? null : users[index].planActivatedAt || new Date().toISOString(),
      planExpiresAt: options.planExpiresAt !== undefined
        ? options.planExpiresAt
        : isTrial ? null : users[index].planExpiresAt || null,
      mercadoPagoLastPaymentId: options.mercadoPagoLastPaymentId !== undefined
        ? String(options.mercadoPagoLastPaymentId || '')
        : users[index].mercadoPagoLastPaymentId || '',
      updatedAt: new Date().toISOString()
    };

    await writeJsonFileAtomic(USERS_PATH, users);
    return users[index];
  });
}

module.exports = {
  readUsers,
  findUserByEmail,
  findUserById,
  findUserByDeviceId,
  countRecentLocalRegistrationsByIp,
  createLocalUser,
  updateLocalUserPassword,
  updateLocalUserPlan
};
