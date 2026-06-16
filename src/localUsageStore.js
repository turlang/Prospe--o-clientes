/**
 * localUsageStore.js
 * -----------------------------------------------------------------------------
 * Controle de uso do trial/planos.
 *
 * - Com MongoDB conectado: grava na collection Usage.
 * - Sem MongoDB: usa data/usage.json para desenvolvimento local.
 */

const fs = require('fs/promises');
const path = require('path');
const Usage = require('./models/Usage');
const { hasMongoUri } = require('./db');

const USAGE_PATH = path.join(__dirname, '..', 'data', 'usage.json');

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

async function readUsage() {
  try {
    return JSON.parse(await fs.readFile(USAGE_PATH, 'utf8'));
  } catch {
    return {};
  }
}

async function writeUsage(usage) {
  await fs.mkdir(path.dirname(USAGE_PATH), { recursive: true });
  await fs.writeFile(USAGE_PATH, JSON.stringify(usage, null, 2));
}

async function getDailyUsage(userId) {
  if (hasMongoUri()) {
    const doc = await Usage.findOne({ userId, day: todayKey() }).lean();
    return Number(doc?.count || 0);
  }

  const usage = await readUsage();
  const day = todayKey();
  return Number(usage?.[String(userId)]?.[day] || 0);
}

async function getTotalUsage(userId) {
  if (hasMongoUri()) {
    const rows = await Usage.find({ userId }).lean();
    return rows.reduce((sum, row) => sum + Number(row.count || 0), 0);
  }

  const usage = await readUsage();
  const days = Object.values(usage?.[String(userId)] || {});
  return days.reduce((sum, value) => sum + Number(value || 0), 0);
}

async function addDailyUsage(userId, amount) {
  const increment = Number(amount || 0);

  if (hasMongoUri()) {
    const doc = await Usage.findOneAndUpdate(
      { userId, day: todayKey() },
      { $inc: { count: increment } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).lean();

    return Number(doc?.count || 0);
  }

  const usage = await readUsage();
  const id = String(userId);
  const day = todayKey();

  usage[id] = usage[id] || {};
  usage[id][day] = Number(usage[id][day] || 0) + increment;

  await writeUsage(usage);
  return usage[id][day];
}

module.exports = { getDailyUsage, getTotalUsage, addDailyUsage, todayKey };
