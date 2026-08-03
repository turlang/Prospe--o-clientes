/**
 * @fileoverview Persistência da configuração do CRM em MongoDB ou JSON local.
 * @module repositories/crmConfigurationRepository
 */

const { resolveDataPath } = require('../config/paths');
const CrmConfiguration = require('../models/CrmConfiguration');
const { hasMongoUri } = require('../infrastructure/database/mongoConnection');
const { readJsonFile, writeJsonFileAtomic, withJsonFileLock } = require('../utils/jsonFileStore');
const { createDefaultCrmConfiguration, normalizeCrmConfiguration } = require('../domain/crm/crmConfiguration');

const DB_PATH = resolveDataPath('crm-configurations.json');

async function getCrmConfiguration(userId) {
  if (hasMongoUri() && userId) {
    const doc = await CrmConfiguration.findOne({ userId }).lean();
    return normalizeCrmConfiguration(doc?.data || createDefaultCrmConfiguration());
  }

  const rows = await readJsonFile(DB_PATH, []);
  const row = (Array.isArray(rows) ? rows : []).find((item) => String(item.userId) === String(userId || 'global'));
  return normalizeCrmConfiguration(row?.data || createDefaultCrmConfiguration());
}

async function saveCrmConfiguration(userId, input) {
  const data = normalizeCrmConfiguration(input);
  if (hasMongoUri() && userId) {
    await CrmConfiguration.updateOne(
      { userId },
      { $set: { data } },
      { upsert: true }
    );
    return data;
  }

  return withJsonFileLock(DB_PATH, async () => {
    const rows = await readJsonFile(DB_PATH, []);
    const safeRows = Array.isArray(rows) ? rows : [];
    const key = String(userId || 'global');
    const index = safeRows.findIndex((item) => String(item.userId) === key);
    const record = { userId: key, data };
    if (index >= 0) safeRows[index] = record;
    else safeRows.push(record);
    await writeJsonFileAtomic(DB_PATH, safeRows);
    return data;
  });
}

module.exports = { getCrmConfiguration, saveCrmConfiguration, CRM_CONFIGURATION_PATH: DB_PATH };
