/**
 * @fileoverview Repositório de leads com adaptação entre MongoDB e armazenamento JSON local.
 *
 * Responsabilidade delimitada conforme a arquitetura descrita em
 * `docs/ARQUITETURA.md`. Alterações neste arquivo devem preservar os contratos
 * documentados e ser acompanhadas por testes quando afetarem regras de negócio.
 *
 * @module src/storage
 */

/**
 * storage.js
 * -----------------------------------------------------------------------------
 * Camada única de persistência dos leads.
 *
 * - Com MongoDB conectado: salva por usuário na collection Lead.
 * - Sem MongoDB: salva em data/leads.json, também separado por usuário.
 */

const path = require('path');
const Lead = require('./models/Lead');
const { hasMongoUri } = require('./db');
const { readJsonFile, writeJsonFileAtomic, withJsonFileLock } = require('./utils/jsonFileStore');
const { normalizeLeadStatus, isContactedStatus } = require('./domain/leadStatus');

const DB_PATH = path.join(__dirname, '..', 'data', 'leads.json');

async function readAllLocalLeads() {
  const leads = await readJsonFile(DB_PATH, []);
  return Array.isArray(leads) ? leads : [];
}

async function persistAllLocalLeads(leads) {
  const sorted = [...leads].sort((a, b) => Number(b.score || 0) - Number(a.score || 0));
  await writeJsonFileAtomic(DB_PATH, sorted);
  return sorted;
}

function normalizeStoredLead(lead) {
  if (!lead || typeof lead !== 'object') return lead;
  return { ...lead, status: normalizeLeadStatus(lead.status) };
}

function belongsToUser(lead, userId) {
  if (!userId) return true;
  return String(lead.__userId || '') === String(userId);
}

async function readLeads(userId = null) {
  if (hasMongoUri() && userId) {
    const docs = await Lead.find({ userId }).sort({ 'data.score': -1, updatedAt: -1 }).lean();
    return docs.map((doc) => normalizeStoredLead(doc.data));
  }

  const leads = await readAllLocalLeads();
  const normalized = leads.map(normalizeStoredLead);
  return userId ? normalized.filter((lead) => belongsToUser(lead, userId)) : normalized;
}

async function saveLeads(newLeads, userId = null) {
  if (hasMongoUri() && userId) {
    for (const lead of newLeads) {
      const leadKey = getLeadKey(lead);
      const previous = await Lead.findOne({ userId, leadKey }).lean();
      const previousData = previous?.data || {};

      const data = {
        ...previousData,
        ...lead,
        status: normalizeLeadStatus(previousData.status || lead.status || 'NOVO'),
        interacoes: previousData.interacoes || lead.interacoes || [],
        atualizadoEm: new Date().toISOString()
      };

      await Lead.updateOne(
        { userId, leadKey },
        { $set: { data } },
        { upsert: true }
      );
    }

    return readLeads(userId);
  }

  return withJsonFileLock(DB_PATH, async () => {
    const allLeads = await readAllLocalLeads();
    const map = new Map(allLeads.map((lead) => [`${lead.__userId || 'global'}:${getLeadKey(lead)}`, lead]));

    for (const lead of newLeads) {
      const leadKey = getLeadKey(lead);
      if (!leadKey) continue;
      const key = `${userId || 'global'}:${leadKey}`;
      const previous = map.get(key) || {};
      map.set(key, {
        ...previous,
        ...lead,
        __userId: userId || previous.__userId || 'global',
        status: normalizeLeadStatus(previous.status || lead.status || 'NOVO'),
        interacoes: previous.interacoes || lead.interacoes || [],
        atualizadoEm: new Date().toISOString()
      });
    }

    const saved = await persistAllLocalLeads([...map.values()]);
    return userId ? saved.filter((lead) => belongsToUser(lead, userId)) : saved;
  });
}

async function updateLeadStatus(leadId, status, interaction = null, userId = null) {
  if (hasMongoUri() && userId) {
    const doc = await Lead.findOne({ userId, leadKey: String(leadId) });
    if (!doc) return null;

    const interacoes = Array.isArray(doc.data.interacoes) ? doc.data.interacoes : [];
    doc.data = {
      ...doc.data,
      status: normalizeLeadStatus(status),
      atualizadoEm: new Date().toISOString(),
      interacoes: interaction ? [...interacoes, interaction] : interacoes
    };

    await doc.save();
    return doc.data;
  }

  return withJsonFileLock(DB_PATH, async () => {
    const allLeads = await readAllLocalLeads();
    const index = allLeads.findIndex((lead) => getLeadKey(lead) === String(leadId) && belongsToUser(lead, userId));
    if (index === -1) return null;

    const current = allLeads[index];
    const interacoes = Array.isArray(current.interacoes) ? current.interacoes : [];
    allLeads[index] = {
      ...current,
      status: normalizeLeadStatus(status),
      atualizadoEm: new Date().toISOString(),
      interacoes: interaction ? [...interacoes, interaction] : interacoes
    };

    await persistAllLocalLeads(allLeads);
    return allLeads[index];
  });
}

async function updateLeadMeta(leadId, updates = {}, interaction = null, userId = null) {
  const safeUpdates = {
    favorito: Boolean(updates.favorito),
    tags: Array.isArray(updates.tags) ? updates.tags.map(String).map((tag) => tag.trim()).filter(Boolean).slice(0, 8) : [],
    notas: String(updates.notas || '').trim().slice(0, 1200),
    atualizadoEm: new Date().toISOString()
  };

  if (hasMongoUri() && userId) {
    const doc = await Lead.findOne({ userId, leadKey: String(leadId) });
    if (!doc) return null;
    const interacoes = Array.isArray(doc.data.interacoes) ? doc.data.interacoes : [];
    doc.data = {
      ...doc.data,
      ...safeUpdates,
      interacoes: interaction ? [...interacoes, interaction] : interacoes
    };
    await doc.save();
    return doc.data;
  }

  return withJsonFileLock(DB_PATH, async () => {
    const allLeads = await readAllLocalLeads();
    const index = allLeads.findIndex((lead) => getLeadKey(lead) === String(leadId) && belongsToUser(lead, userId));
    if (index === -1) return null;

    const current = allLeads[index];
    const interacoes = Array.isArray(current.interacoes) ? current.interacoes : [];
    allLeads[index] = {
      ...current,
      ...safeUpdates,
      interacoes: interaction ? [...interacoes, interaction] : interacoes
    };

    await persistAllLocalLeads(allLeads);
    return allLeads[index];
  });
}

async function getLeadStats(userId = null) {
  const leads = await readLeads(userId);
  const byStatus = leads.reduce((acc, lead) => {
    const status = normalizeLeadStatus(lead.status);
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  return {
    total: leads.length,
    favoritos: leads.filter((lead) => lead.favorito).length,
    quentes: leads.filter((lead) => Number(lead.score || 0) >= 80).length,
    contatados: leads.filter((lead) => isContactedStatus(lead.status)).length,
    fechados: leads.filter((lead) => normalizeLeadStatus(lead.status) === 'FECHADO').length,
    taxaContato: leads.length ? Math.round((leads.filter((lead) => isContactedStatus(lead.status)).length / leads.length) * 100) : 0,
    byStatus
  };
}

function getLeadKey(lead) {
  return String(lead.placeId || lead.nome || '').trim();
}

module.exports = { readLeads, saveLeads, updateLeadStatus, updateLeadMeta, getLeadStats, getLeadKey };
