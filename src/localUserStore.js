/**
 * localUserStore.js
 * -----------------------------------------------------------------------------
 * Cadastro/login local em JSON para desenvolvimento sem MongoDB.
 *
 * Em produção, use MONGODB_URI com MongoDB Atlas. Este arquivo existe para o
 * projeto não travar durante testes locais da Fase 2.
 */

const fs = require('fs/promises');
const path = require('path');
const crypto = require('crypto');

const USERS_PATH = path.join(__dirname, '..', 'data', 'users.json');

async function readUsers() {
  try {
    return JSON.parse(await fs.readFile(USERS_PATH, 'utf8'));
  } catch {
    return [];
  }
}

async function writeUsers(users) {
  await fs.mkdir(path.dirname(USERS_PATH), { recursive: true });
  await fs.writeFile(USERS_PATH, JSON.stringify(users, null, 2));
}

async function findUserByEmail(email) {
  const users = await readUsers();
  return users.find((user) => user.email === email) || null;
}

async function findUserById(id) {
  const users = await readUsers();
  return users.find((user) => String(user.id) === String(id)) || null;
}

async function createLocalUser({ name, email, passwordHash }) {
  const users = await readUsers();
  const user = {
    id: crypto.randomUUID(),
    name,
    email,
    passwordHash,
    plan: 'trial',
    dailyLeadLimit: 10,
    totalLeadLimit: 10,
    trialStartedAt: new Date().toISOString(),
    subscriptionStatus: 'trial',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  users.push(user);
  await writeUsers(users);
  return user;
}

async function updateLocalUserPlan(id, plan, dailyLeadLimit, totalLeadLimit = null) {
  const users = await readUsers();
  const index = users.findIndex((user) => String(user.id) === String(id));
  if (index === -1) return null;

  users[index] = {
    ...users[index],
    plan,
    dailyLeadLimit,
    totalLeadLimit,
    subscriptionStatus: plan === 'trial' ? 'trial' : 'simulated',
    updatedAt: new Date().toISOString()
  };

  await writeUsers(users);
  return users[index];
}

module.exports = {
  readUsers,
  findUserByEmail,
  findUserById,
  createLocalUser,
  updateLocalUserPlan
};
