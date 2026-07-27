/**
 * Controle de uso do trial/planos.
 * MongoDB em produção; JSON local com escrita atômica em desenvolvimento.
 */

const path = require('node:path');
const Usage = require('./models/Usage');
const { hasMongoUri } = require('./db');
const { readJsonFile, writeJsonFileAtomic, withJsonFileLock } = require('./utils/jsonFileStore');

const USAGE_PATH = path.join(__dirname, '..', 'data', 'usage.json');

function todayKey(now = new Date()) {
  return now.toISOString().slice(0, 10);
}

async function readUsage() {
  const usage = await readJsonFile(USAGE_PATH, {});
  return usage && typeof usage === 'object' && !Array.isArray(usage) ? usage : {};
}

async function getDailyUsage(userId) {
  if (hasMongoUri()) {
    const doc = await Usage.findOne({ userId, day: todayKey() }).lean();
    return Number(doc?.count || 0);
  }

  const usage = await readUsage();
  return Number(usage?.[String(userId)]?.[todayKey()] || 0);
}

async function getTotalUsage(userId) {
  if (hasMongoUri()) {
    const rows = await Usage.find({ userId }).lean();
    return rows.reduce((sum, row) => sum + Number(row.count || 0), 0);
  }

  const usage = await readUsage();
  return Object.values(usage?.[String(userId)] || {}).reduce((sum, value) => sum + Number(value || 0), 0);
}

async function addDailyUsage(userId, amount) {
  const increment = Number(amount || 0);
  if (!Number.isFinite(increment) || increment < 0) throw new Error('Incremento de uso inválido.');

  if (hasMongoUri()) {
    const doc = await Usage.findOneAndUpdate(
      { userId, day: todayKey() },
      { $inc: { count: increment } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).lean();
    return Number(doc?.count || 0);
  }

  return withJsonFileLock(USAGE_PATH, async () => {
    const usage = await readUsage();
    const id = String(userId);
    const day = todayKey();
    usage[id] = usage[id] || {};
    usage[id][day] = Number(usage[id][day] || 0) + increment;
    await writeJsonFileAtomic(USAGE_PATH, usage);
    return usage[id][day];
  });
}

module.exports = { getDailyUsage, getTotalUsage, addDailyUsage, todayKey };
