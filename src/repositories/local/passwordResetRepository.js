/**
 * @fileoverview Persistência local de tokens de redefinição usada apenas fora de produção.
 *
 * @module src/repositories/local/passwordResetRepository
 */

const crypto = require('node:crypto');
const { resolveDataPath } = require('../../config/paths');
const { readJsonFile, writeJsonFileAtomic, withJsonFileLock } = require('../../utils/jsonFileStore');

const PASSWORD_RESETS_PATH = resolveDataPath('password-resets.json');

async function readLocalPasswordResets() {
  const rows = await readJsonFile(PASSWORD_RESETS_PATH, []);
  return Array.isArray(rows) ? rows : [];
}

async function createLocalPasswordReset(input) {
  return withJsonFileLock(PASSWORD_RESETS_PATH, async () => {
    const rows = await readLocalPasswordResets();
    const now = new Date().toISOString();
    const reset = {
      id: crypto.randomUUID(),
      userId: String(input.userId),
      email: String(input.email || '').toLowerCase(),
      tokenHash: String(input.tokenHash),
      expiresAt: new Date(input.expiresAt).toISOString(),
      usedAt: null,
      requestedIp: String(input.requestedIp || ''),
      userAgent: String(input.userAgent || '').slice(0, 500),
      createdAt: now,
      updatedAt: now
    };

    rows.push(reset);
    await writeJsonFileAtomic(PASSWORD_RESETS_PATH, rows);
    return reset;
  });
}

async function invalidateOtherLocalPasswordResets(userId, exceptId) {
  return withJsonFileLock(PASSWORD_RESETS_PATH, async () => {
    const rows = await readLocalPasswordResets();
    const now = new Date().toISOString();
    let changed = false;

    const next = rows.map((row) => {
      if (String(row.userId) !== String(userId) || String(row.id) === String(exceptId) || row.usedAt) return row;
      changed = true;
      return { ...row, usedAt: now, updatedAt: now };
    });

    if (changed) await writeJsonFileAtomic(PASSWORD_RESETS_PATH, next);
  });
}

async function consumeLocalPasswordReset(tokenHash) {
  return withJsonFileLock(PASSWORD_RESETS_PATH, async () => {
    const rows = await readLocalPasswordResets();
    const nowMs = Date.now();
    const index = rows.findIndex((row) => (
      row.tokenHash === tokenHash
      && !row.usedAt
      && new Date(row.expiresAt).getTime() > nowMs
    ));

    if (index === -1) return null;

    const now = new Date().toISOString();
    rows[index] = { ...rows[index], usedAt: now, updatedAt: now };
    await writeJsonFileAtomic(PASSWORD_RESETS_PATH, rows);
    return rows[index];
  });
}

async function releaseLocalPasswordReset(id) {
  return withJsonFileLock(PASSWORD_RESETS_PATH, async () => {
    const rows = await readLocalPasswordResets();
    const index = rows.findIndex((row) => String(row.id) === String(id));
    if (index === -1) return;
    rows[index] = { ...rows[index], usedAt: null, updatedAt: new Date().toISOString() };
    await writeJsonFileAtomic(PASSWORD_RESETS_PATH, rows);
  });
}

async function deleteLocalPasswordReset(id) {
  return withJsonFileLock(PASSWORD_RESETS_PATH, async () => {
    const rows = await readLocalPasswordResets();
    const next = rows.filter((row) => String(row.id) !== String(id));
    if (next.length !== rows.length) await writeJsonFileAtomic(PASSWORD_RESETS_PATH, next);
  });
}

module.exports = {
  createLocalPasswordReset,
  invalidateOtherLocalPasswordResets,
  consumeLocalPasswordReset,
  releaseLocalPasswordReset,
  deleteLocalPasswordReset
};
