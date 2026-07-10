const fs = require('fs/promises');
const path = require('path');
const crypto = require('crypto');
const CopilotConversation = require('../../models/CopilotConversation');
const { hasMongoUri } = require('../../db');

const LOCAL_PATH = path.join(__dirname, '..', '..', '..', 'data', 'copilot-conversations.json');

async function readLocal() {
  try { return JSON.parse(await fs.readFile(LOCAL_PATH, 'utf8')); } catch { return []; }
}

async function writeLocal(rows) {
  await fs.mkdir(path.dirname(LOCAL_PATH), { recursive: true });
  await fs.writeFile(LOCAL_PATH, JSON.stringify(rows, null, 2));
}

function publicMessage(row) {
  return {
    id: String(row._id || row.id),
    role: row.role,
    content: row.content,
    provider: row.provider || 'local',
    model: row.model || 'local',
    recommendedActions: Array.isArray(row.recommendedActions) ? row.recommendedActions : [],
    metadata: row.metadata || {},
    createdAt: row.createdAt instanceof Date ? row.createdAt.toISOString() : row.createdAt
  };
}

async function addCopilotMessage({ userId, role, content, provider = 'local', model = 'local', recommendedActions = [], metadata = {} }) {
  const safe = {
    userId,
    role,
    content: String(content || '').trim().slice(0, 8000),
    provider,
    model,
    recommendedActions: Array.isArray(recommendedActions) ? recommendedActions.map(String).slice(0, 8) : [],
    metadata: metadata && typeof metadata === 'object' ? metadata : {}
  };
  if (!safe.content) throw new Error('Mensagem vazia.');

  if (hasMongoUri()) return publicMessage(await CopilotConversation.create(safe));

  const rows = await readLocal();
  const row = { id: crypto.randomUUID(), ...safe, userId: String(userId), createdAt: new Date().toISOString() };
  rows.push(row);
  await writeLocal(rows.slice(-2000));
  return publicMessage(row);
}

async function listCopilotMessages(userId, limit = 40) {
  const safeLimit = Math.min(100, Math.max(1, Number(limit) || 40));
  if (hasMongoUri()) {
    const rows = await CopilotConversation.find({ userId }).sort({ createdAt: -1 }).limit(safeLimit).lean();
    return rows.reverse().map(publicMessage);
  }
  const rows = await readLocal();
  return rows.filter((row) => String(row.userId) === String(userId)).slice(-safeLimit).map(publicMessage);
}

async function clearCopilotMessages(userId) {
  if (hasMongoUri()) {
    const result = await CopilotConversation.deleteMany({ userId });
    return Number(result.deletedCount || 0);
  }
  const rows = await readLocal();
  const kept = rows.filter((row) => String(row.userId) !== String(userId));
  const deleted = rows.length - kept.length;
  await writeLocal(kept);
  return deleted;
}

module.exports = { addCopilotMessage, listCopilotMessages, clearCopilotMessages };
