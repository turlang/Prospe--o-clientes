/**
 * @fileoverview Regras do CRM avançado: filtros, previsão, importação, metas e reativação.
 * @module services/crmAdvancedService
 */

const crypto = require('node:crypto');
const { normalizeLeadStatus, isContactedStatus } = require('../domain/leadStatus');
const { getPipeline, getStage } = require('../domain/crm/crmConfiguration');

const LOSS_REASONS = Object.freeze([
  'SEM_ORCAMENTO',
  'SEM_INTERESSE',
  'SEM_RESPOSTA',
  'CONCORRENTE',
  'ADIADO',
  'FORA_DO_PERFIL',
  'OUTRO'
]);

function normalizeMoney(value) {
  if (typeof value === 'number') return Number.isFinite(value) ? Math.max(0, value) : 0;
  const text = String(value || '').trim();
  if (!text) return 0;
  const normalized = text
    .replace(/R\$/gi, '')
    .replace(/\s+/g, '')
    .replace(/\.(?=\d{3}(?:\D|$))/g, '')
    .replace(',', '.');
  const number = Number(normalized.replace(/[^0-9.-]/g, ''));
  return Number.isFinite(number) ? Math.max(0, number) : 0;
}

function getLeadId(lead = {}) {
  return String(lead.placeId || lead.id || lead.nome || '').trim();
}

function normalizeText(value, maxLength = 240) {
  return String(value || '').trim().replace(/\s+/g, ' ').slice(0, maxLength);
}

function normalizeTags(values) {
  const source = Array.isArray(values) ? values : String(values || '').split(/[|,;]/);
  return [...new Set(source.map((item) => normalizeText(item, 40)).filter(Boolean))].slice(0, 16);
}

function normalizeServiceItems(items, catalog = []) {
  const catalogMap = new Map((Array.isArray(catalog) ? catalog : []).map((item) => [item.id, item]));
  return (Array.isArray(items) ? items : []).slice(0, 20).map((item) => {
    const catalogItem = catalogMap.get(String(item.catalogId || item.id || ''));
    const quantity = Math.max(1, Math.min(999, Number(item.quantity || 1)));
    const unitPrice = normalizeMoney(item.unitPrice ?? catalogItem?.unitPrice ?? 0);
    return {
      catalogId: String(item.catalogId || item.id || catalogItem?.id || '').trim().slice(0, 60),
      name: normalizeText(item.name || catalogItem?.name || 'Serviço', 90),
      type: String(item.type || catalogItem?.type || 'service') === 'product' ? 'product' : 'service',
      quantity: Number.isFinite(quantity) ? quantity : 1,
      unitPrice,
      recurring: Boolean(item.recurring ?? catalogItem?.recurring),
      total: Math.round(unitPrice * (Number.isFinite(quantity) ? quantity : 1) * 100) / 100
    };
  }).filter((item) => item.name);
}

function calculateCommercialValues(serviceItems = [], explicit = {}) {
  const oneTime = serviceItems.filter((item) => !item.recurring).reduce((sum, item) => sum + Number(item.total || 0), 0);
  const monthly = serviceItems.filter((item) => item.recurring).reduce((sum, item) => sum + Number(item.total || 0), 0);
  const contractValue = normalizeMoney(explicit.contractValue || explicit.valorContrato || explicit.ticketEstimado) || oneTime + monthly * 12;
  const monthlyRecurringRevenue = normalizeMoney(explicit.monthlyRecurringRevenue || explicit.receitaRecorrenteMensal) || monthly;
  const closedValue = normalizeMoney(explicit.valorFechado) || 0;
  return {
    contractValue: Math.round(contractValue * 100) / 100,
    monthlyRecurringRevenue: Math.round(monthlyRecurringRevenue * 100) / 100,
    valorFechado: Math.round(closedValue * 100) / 100
  };
}

function normalizeCustomFields(input = {}, definitions = []) {
  const safeInput = input && typeof input === 'object' && !Array.isArray(input) ? input : {};
  const output = {};
  for (const field of definitions || []) {
    if (!field.active || !(field.id in safeInput)) continue;
    const value = safeInput[field.id];
    if (field.type === 'number') output[field.id] = normalizeMoney(value);
    else if (field.type === 'boolean') output[field.id] = Boolean(value);
    else if (field.type === 'date') {
      const date = new Date(value);
      output[field.id] = Number.isNaN(date.getTime()) ? '' : date.toISOString().slice(0, 10);
    } else if (field.type === 'select') {
      const text = normalizeText(value, 80);
      output[field.id] = field.options.includes(text) ? text : '';
    } else output[field.id] = normalizeText(value, 500);
  }
  return output;
}

function normalizeLeadCommercialUpdates(input = {}, config = {}) {
  const catalog = Array.isArray(config.catalog) ? config.catalog : [];
  const serviceItems = normalizeServiceItems(input.serviceItems, catalog);
  const values = calculateCommercialValues(serviceItems, input);
  const lossReason = normalizeText(input.motivoPerda || input.lossReason, 80).toUpperCase();
  const pipeline = getPipeline(config, input.pipelineId || config.activePipelineId);
  return {
    pipelineId: pipeline.id,
    segmentoComercial: normalizeText(input.segmentoComercial || input.segment, 100),
    servicoPrincipal: normalizeText(input.servicoPrincipal || input.primaryService, 100),
    serviceItems,
    contractValue: values.contractValue,
    monthlyRecurringRevenue: values.monthlyRecurringRevenue,
    valorFechado: values.valorFechado,
    ticketEstimado: values.contractValue || normalizeMoney(input.ticketEstimado) || input.ticketEstimado || '',
    motivoPerda: LOSS_REASONS.includes(lossReason) ? lossReason : (lossReason ? 'OUTRO' : ''),
    motivoPerdaDetalhe: normalizeText(input.motivoPerdaDetalhe || input.lossReasonDetail, 500),
    customFields: normalizeCustomFields(input.customFields, config.customFields),
    tags: normalizeTags(input.tags),
    favorito: Boolean(input.favorito),
    notas: normalizeText(input.notas, 2000),
    atualizadoEm: new Date().toISOString()
  };
}

function valueForField(lead = {}, fieldName) {
  if (String(fieldName).startsWith('custom:')) {
    return lead.customFields?.[String(fieldName).slice(7)];
  }
  return lead[fieldName];
}

function hasMeaningfulValue(value) {
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === 'number') return value > 0;
  if (typeof value === 'boolean') return value;
  return String(value || '').trim().length > 0;
}

function validateStageRequirements(lead = {}, targetStatus, config = {}, pipelineId) {
  const status = normalizeLeadStatus(targetStatus);
  const pipeline = getPipeline(config, pipelineId || lead.pipelineId || config.activePipelineId);
  const stage = getStage(config, pipeline.id, status);
  const required = new Set(stage?.requiredFields || []);
  for (const field of config.customFields || []) {
    if (field.active && field.requiredAtStages?.includes(status)) required.add(`custom:${field.id}`);
  }

  const missingFields = [...required].filter((field) => !hasMeaningfulValue(valueForField(lead, field)));
  return {
    valid: missingFields.length === 0,
    status,
    pipelineId: pipeline.id,
    stage,
    missingFields
  };
}

function textIncludes(value, term) {
  return String(value || '').toLowerCase().includes(term);
}

function applyLeadFilters(leads = [], query = {}, config = {}) {
  let result = Array.isArray(leads) ? [...leads] : [];
  const status = normalizeText(query.status, 40).toUpperCase();
  const q = normalizeText(query.q, 160).toLowerCase();
  const pipelineId = normalizeText(query.pipelineId, 60);
  const segment = normalizeText(query.segment || query.segmento, 100).toLowerCase();
  const service = normalizeText(query.service || query.servico, 100).toLowerCase();
  const tag = normalizeText(query.tag, 40);
  const lossReason = normalizeText(query.lossReason || query.motivoPerda, 80).toUpperCase();
  const minValue = normalizeMoney(query.minValue);
  const maxValue = normalizeMoney(query.maxValue);

  if (status) result = result.filter((lead) => normalizeLeadStatus(lead.status) === status);
  if (pipelineId) result = result.filter((lead) => String(lead.pipelineId || config.activePipelineId) === pipelineId);
  if (String(query.favorito) === 'true' || String(query.favorite) === 'true') result = result.filter((lead) => Boolean(lead.favorito));
  if (tag) result = result.filter((lead) => Array.isArray(lead.tags) && lead.tags.includes(tag));
  if (segment) result = result.filter((lead) => textIncludes(lead.segmentoComercial || lead.tipo || lead.segmentoBuscado, segment));
  if (service) result = result.filter((lead) => textIncludes(lead.servicoPrincipal || lead.servico, service)
    || (lead.serviceItems || []).some((item) => textIncludes(item.name, service)));
  if (lossReason) result = result.filter((lead) => String(lead.motivoPerda || '').toUpperCase() === lossReason);
  if (minValue > 0) result = result.filter((lead) => normalizeMoney(lead.contractValue || lead.ticketEstimado) >= minValue);
  if (maxValue > 0) result = result.filter((lead) => normalizeMoney(lead.contractValue || lead.ticketEstimado) <= maxValue);
  if (q) {
    result = result.filter((lead) => [
      lead.nome,
      lead.endereco,
      lead.segmentoComercial,
      lead.tipo,
      lead.telefone,
      lead.email,
      lead.site,
      lead.servicoPrincipal,
      ...(lead.tags || []),
      ...Object.values(lead.customFields || {})
    ].some((value) => textIncludes(value, q)));
  }

  for (const [key, value] of Object.entries(query)) {
    if (!key.startsWith('custom.')) continue;
    const fieldId = key.slice(7);
    const expected = normalizeText(value, 200).toLowerCase();
    if (!expected) continue;
    result = result.filter((lead) => textIncludes(lead.customFields?.[fieldId], expected));
  }

  const sort = String(query.sort || 'score-desc');
  result.sort((a, b) => {
    if (sort === 'name-asc') return String(a.nome || '').localeCompare(String(b.nome || ''), 'pt-BR');
    if (sort === 'value-desc') return normalizeMoney(b.contractValue || b.ticketEstimado) - normalizeMoney(a.contractValue || a.ticketEstimado);
    if (sort === 'updated-desc') return new Date(b.atualizadoEm || b.coletadoEm || 0) - new Date(a.atualizadoEm || a.coletadoEm || 0);
    return Number(b.score || 0) - Number(a.score || 0);
  });

  return result;
}

function getStageProbability(lead, config) {
  const pipeline = getPipeline(config, lead.pipelineId || config.activePipelineId);
  const stage = pipeline.stages.find((item) => item.key === normalizeLeadStatus(lead.status));
  return Number(stage?.probability ?? 0) / 100;
}

function periodBounds(now = new Date(), period = 'monthly') {
  const start = period === 'quarterly'
    ? new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1)
    : new Date(now.getFullYear(), now.getMonth(), 1);
  const end = period === 'quarterly'
    ? new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3 + 3, 1)
    : new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return { start, end };
}

function dateFromLead(lead = {}) {
  const value = lead.atualizadoEm || lead.updatedAt || lead.coletadoEm || lead.createdAt;
  const date = new Date(value || 0);
  return Number.isNaN(date.getTime()) ? null : date;
}

function progress(current, target) {
  if (!target) return current > 0 ? 100 : 0;
  return Math.min(100, Math.round((current / target) * 100));
}

function buildForecast(leads = [], config = {}, now = new Date()) {
  const safeLeads = Array.isArray(leads) ? leads : [];
  const active = safeLeads.filter((lead) => !['FECHADO', 'SEM_INTERESSE'].includes(normalizeLeadStatus(lead.status)));
  const weightedRevenue = active.reduce((sum, lead) => sum + normalizeMoney(lead.contractValue || lead.ticketEstimado) * getStageProbability(lead, config), 0);
  const pipelineRevenue = active.reduce((sum, lead) => sum + normalizeMoney(lead.contractValue || lead.ticketEstimado), 0);
  const mrr = safeLeads.filter((lead) => normalizeLeadStatus(lead.status) === 'FECHADO')
    .reduce((sum, lead) => sum + normalizeMoney(lead.monthlyRecurringRevenue), 0);
  const closedRevenue = safeLeads.filter((lead) => normalizeLeadStatus(lead.status) === 'FECHADO')
    .reduce((sum, lead) => sum + normalizeMoney(lead.valorFechado || lead.contractValue || lead.ticketEstimado), 0);

  const goals = config.goals || {};
  const { start, end } = periodBounds(now, goals.period);
  const inPeriod = safeLeads.filter((lead) => {
    const date = dateFromLead(lead);
    return date && date >= start && date < end;
  });
  const metrics = {
    leads: inPeriod.length,
    contacts: inPeriod.filter((lead) => isContactedStatus(lead.status)).length,
    proposals: inPeriod.filter((lead) => normalizeLeadStatus(lead.status) === 'PROPOSTA').length,
    closed: inPeriod.filter((lead) => normalizeLeadStatus(lead.status) === 'FECHADO').length,
    revenue: inPeriod.filter((lead) => normalizeLeadStatus(lead.status) === 'FECHADO')
      .reduce((sum, lead) => sum + normalizeMoney(lead.valorFechado || lead.contractValue || lead.ticketEstimado), 0)
  };

  return {
    pipelineRevenue: Math.round(pipelineRevenue),
    weightedRevenue: Math.round(weightedRevenue),
    closedRevenue: Math.round(closedRevenue),
    monthlyRecurringRevenue: Math.round(mrr),
    annualRecurringRevenue: Math.round(mrr * 12),
    activeDeals: active.length,
    goals: {
      period: goals.period || 'monthly',
      startsAt: start.toISOString(),
      endsAt: end.toISOString(),
      targets: goals,
      current: metrics,
      progress: Object.fromEntries(Object.keys(metrics).map((key) => [key, progress(metrics[key], Number(goals[key] || 0))]))
    }
  };
}

function parseDate(value, fallback = null) {
  const date = new Date(value || 0);
  return Number.isNaN(date.getTime()) ? fallback : date;
}

function buildPeriodReport(leads = [], config = {}, options = {}) {
  const now = options.now instanceof Date ? options.now : new Date();
  const from = parseDate(options.from, new Date(now.getFullYear(), now.getMonth(), 1));
  const to = parseDate(options.to, new Date(now.getTime() + 86400000));
  const periodLeads = (Array.isArray(leads) ? leads : []).filter((lead) => {
    const date = dateFromLead(lead);
    return date && date >= from && date < to;
  });
  const pipeline = getPipeline(config, options.pipelineId || config.activePipelineId);
  const stageMetrics = pipeline.stages.map((stage) => {
    const rows = periodLeads.filter((lead) => normalizeLeadStatus(lead.status) === stage.key);
    return {
      status: stage.key,
      label: stage.label,
      count: rows.length,
      value: Math.round(rows.reduce((sum, lead) => sum + normalizeMoney(lead.contractValue || lead.ticketEstimado), 0))
    };
  });

  const serviceMap = new Map();
  const lossMap = new Map();
  for (const lead of periodLeads) {
    const services = lead.serviceItems?.length ? lead.serviceItems : [{ name: lead.servicoPrincipal || lead.servico || 'Não informado', total: normalizeMoney(lead.contractValue || lead.ticketEstimado) }];
    for (const service of services) {
      const key = service.name || 'Não informado';
      const current = serviceMap.get(key) || { name: key, deals: 0, value: 0, recurring: 0 };
      current.deals += 1;
      current.value += Number(service.total || 0);
      if (service.recurring) current.recurring += Number(service.total || 0);
      serviceMap.set(key, current);
    }
    if (normalizeLeadStatus(lead.status) === 'SEM_INTERESSE') {
      const reason = lead.motivoPerda || 'NÃO INFORMADO';
      lossMap.set(reason, (lossMap.get(reason) || 0) + 1);
    }
  }

  return {
    period: { from: from.toISOString(), to: to.toISOString() },
    summary: {
      total: periodLeads.length,
      contacted: periodLeads.filter((lead) => isContactedStatus(lead.status)).length,
      proposals: periodLeads.filter((lead) => normalizeLeadStatus(lead.status) === 'PROPOSTA').length,
      closed: periodLeads.filter((lead) => normalizeLeadStatus(lead.status) === 'FECHADO').length,
      lost: periodLeads.filter((lead) => normalizeLeadStatus(lead.status) === 'SEM_INTERESSE').length,
      revenue: Math.round(periodLeads.filter((lead) => normalizeLeadStatus(lead.status) === 'FECHADO')
        .reduce((sum, lead) => sum + normalizeMoney(lead.valorFechado || lead.contractValue || lead.ticketEstimado), 0))
    },
    stageMetrics,
    byService: [...serviceMap.values()].sort((a, b) => b.value - a.value).slice(0, 12),
    lossReasons: [...lossMap.entries()].map(([reason, count]) => ({ reason, count })).sort((a, b) => b.count - a.count),
    forecast: buildForecast(periodLeads, config, now)
  };
}

function parseCsv(text = '') {
  const input = String(text || '').replace(/^\uFEFF/, '').trim();
  if (!input) return { headers: [], rows: [] };
  const firstLine = input.split(/\r?\n/, 1)[0];
  const delimiters = [',', ';', '\t'];
  const delimiter = delimiters.sort((a, b) => firstLine.split(b).length - firstLine.split(a).length)[0];
  const records = [];
  let row = [];
  let cell = '';
  let quoted = false;
  for (let i = 0; i < input.length; i += 1) {
    const char = input[i];
    if (char === '"') {
      if (quoted && input[i + 1] === '"') { cell += '"'; i += 1; }
      else quoted = !quoted;
      continue;
    }
    if (!quoted && char === delimiter) { row.push(cell); cell = ''; continue; }
    if (!quoted && (char === '\n' || char === '\r')) {
      if (char === '\r' && input[i + 1] === '\n') i += 1;
      row.push(cell); cell = '';
      if (row.some((value) => String(value).trim())) records.push(row);
      row = [];
      continue;
    }
    cell += char;
  }
  row.push(cell);
  if (row.some((value) => String(value).trim())) records.push(row);
  const headers = (records.shift() || []).map((header) => normalizeText(header, 100));
  return {
    headers,
    rows: records.map((values) => Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ''])))
  };
}

function guessMapping(headers = []) {
  const aliases = {
    nome: ['nome', 'empresa', 'company', 'razao social', 'lead'],
    email: ['email', 'e-mail', 'mail'],
    telefone: ['telefone', 'phone', 'celular', 'whatsapp'],
    site: ['site', 'website', 'url', 'dominio'],
    endereco: ['endereco', 'endereço', 'address', 'cidade'],
    segmentoComercial: ['segmento', 'segment', 'categoria', 'nicho'],
    status: ['status', 'etapa', 'stage'],
    ticketEstimado: ['ticket', 'valor', 'receita', 'value'],
    servicoPrincipal: ['servico', 'serviço', 'service', 'produto'],
    tags: ['tags', 'etiquetas', 'labels'],
    notas: ['notas', 'observacoes', 'observações', 'notes']
  };
  const normalizedHeaders = headers.map((header) => ({ original: header, normalized: header.toLowerCase().trim() }));
  return Object.fromEntries(Object.entries(aliases).map(([field, names]) => {
    const match = normalizedHeaders.find((header) => names.includes(header.normalized));
    return [field, match?.original || ''];
  }));
}

function normalizeDomain(value) {
  const raw = String(value || '').trim().toLowerCase();
  if (!raw) return '';
  try {
    const url = new URL(/^https?:\/\//.test(raw) ? raw : `https://${raw}`);
    return url.hostname.replace(/^www\./, '');
  } catch { return raw.replace(/^www\./, '').split('/')[0]; }
}

function normalizePhone(value) {
  return String(value || '').replace(/\D/g, '').slice(-13);
}

function normalizeEmail(value) {
  return String(value || '').trim().toLowerCase();
}

function dedupeKey(lead = {}) {
  const domain = normalizeDomain(lead.site);
  if (domain) return `domain:${domain}`;
  const phone = normalizePhone(lead.telefone);
  if (phone) return `phone:${phone}`;
  const email = normalizeEmail(lead.email);
  if (email) return `email:${email}`;
  const name = normalizeText(lead.nome, 180).toLowerCase();
  const address = normalizeText(lead.endereco, 180).toLowerCase();
  return `name:${name}|${address}`;
}

function createImportedLead(row, mapping = {}, config = {}) {
  const get = (field) => row[mapping[field]] ?? '';
  const name = normalizeText(get('nome'), 180);
  const key = dedupeKey({ nome: name, endereco: get('endereco'), site: get('site'), telefone: get('telefone'), email: get('email') });
  const status = normalizeLeadStatus(get('status'));
  const ticket = normalizeMoney(get('ticketEstimado'));
  return {
    placeId: `import:${crypto.createHash('sha256').update(key).digest('hex').slice(0, 24)}`,
    nome: name,
    email: normalizeEmail(get('email')),
    telefone: normalizeText(get('telefone'), 40),
    site: normalizeText(get('site'), 500),
    endereco: normalizeText(get('endereco'), 220),
    segmentoComercial: normalizeText(get('segmentoComercial'), 100),
    status,
    pipelineId: config.activePipelineId || 'sales',
    ticketEstimado: ticket,
    contractValue: ticket,
    servicoPrincipal: normalizeText(get('servicoPrincipal'), 100),
    tags: normalizeTags(get('tags')),
    notas: normalizeText(get('notas'), 2000),
    fonte: 'IMPORTACAO_CSV',
    score: 50,
    coletadoEm: new Date().toISOString(),
    atualizadoEm: new Date().toISOString(),
    interacoes: [{ data: new Date().toISOString(), tipo: 'LEAD_IMPORTADO', origem: 'CSV' }]
  };
}

function previewCsvImport(csvText, mappingInput = {}, existingLeads = [], config = {}) {
  const parsed = parseCsv(csvText);
  const mapping = { ...guessMapping(parsed.headers), ...(mappingInput || {}) };
  if (!mapping.nome) return { headers: parsed.headers, mapping, rows: [], valid: 0, duplicates: 0, invalid: parsed.rows.length, errors: ['Mapeie a coluna de nome/empresa.'] };
  const existingKeys = new Set((existingLeads || []).map(dedupeKey));
  const seen = new Set();
  const rows = parsed.rows.slice(0, 5000).map((row, index) => {
    const lead = createImportedLead(row, mapping, config);
    const key = dedupeKey(lead);
    const duplicate = existingKeys.has(key) || seen.has(key);
    seen.add(key);
    const valid = Boolean(lead.nome);
    return { rowNumber: index + 2, valid, duplicate, lead, key };
  });
  return {
    headers: parsed.headers,
    mapping,
    rows,
    valid: rows.filter((row) => row.valid && !row.duplicate).length,
    duplicates: rows.filter((row) => row.duplicate).length,
    invalid: rows.filter((row) => !row.valid).length,
    errors: []
  };
}

function importCsvLeads(csvText, mapping, existingLeads, config) {
  const preview = previewCsvImport(csvText, mapping, existingLeads, config);
  return {
    ...preview,
    leads: preview.rows.filter((row) => row.valid && !row.duplicate).map((row) => row.lead)
  };
}

function csvEscape(value) {
  return `"${String(value ?? '').replace(/"/g, '""')}"`;
}

function buildFullExportCsv(leads = [], config = {}) {
  const customFields = (config.customFields || []).filter((field) => field.active);
  const headers = [
    'nome', 'email', 'telefone', 'site', 'endereco', 'pipelineId', 'status', 'segmentoComercial',
    'servicoPrincipal', 'ticketEstimado', 'contractValue', 'monthlyRecurringRevenue', 'valorFechado',
    'motivoPerda', 'motivoPerdaDetalhe', 'tags', 'favorito', 'notas', 'score', 'fonte', 'coletadoEm', 'atualizadoEm',
    ...customFields.map((field) => `custom:${field.id}`)
  ];
  const rows = [headers];
  for (const lead of leads || []) {
    rows.push(headers.map((header) => {
      if (header === 'tags') return (lead.tags || []).join(' | ');
      if (header.startsWith('custom:')) return lead.customFields?.[header.slice(7)] ?? '';
      return lead[header] ?? '';
    }));
  }
  return rows.map((row) => row.map(csvEscape).join(',')).join('\n');
}

function getLastActivityDate(lead = {}) {
  const interactions = Array.isArray(lead.interacoes) ? lead.interacoes : [];
  const dates = interactions.map((item) => parseDate(item.data)).filter(Boolean);
  const fallback = dateFromLead(lead);
  return dates.length ? new Date(Math.max(...dates.map((date) => date.getTime()))) : fallback;
}

function findReactivationCandidates(leads = [], now = new Date(), minDays = 30) {
  return (Array.isArray(leads) ? leads : []).map((lead) => {
    const status = normalizeLeadStatus(lead.status);
    const lastActivity = getLastActivityDate(lead);
    const days = lastActivity ? Math.floor((now - lastActivity) / 86400000) : 9999;
    const eligible = status === 'SEM_INTERESSE' || (status !== 'FECHADO' && days >= minDays);
    return {
      leadId: getLeadId(lead),
      name: lead.nome || 'Lead sem nome',
      status,
      daysWithoutActivity: Math.max(0, days),
      reason: status === 'SEM_INTERESSE' ? (lead.motivoPerda || 'Oportunidade perdida') : 'Sem atividade recente',
      score: Number(lead.score || 0),
      eligible
    };
  }).filter((item) => item.eligible)
    .sort((a, b) => b.score - a.score || b.daysWithoutActivity - a.daysWithoutActivity)
    .slice(0, 100);
}

module.exports = {
  LOSS_REASONS,
  normalizeMoney,
  normalizeTags,
  normalizeServiceItems,
  calculateCommercialValues,
  normalizeLeadCommercialUpdates,
  validateStageRequirements,
  applyLeadFilters,
  buildForecast,
  buildPeriodReport,
  parseCsv,
  guessMapping,
  dedupeKey,
  previewCsvImport,
  importCsvLeads,
  buildFullExportCsv,
  findReactivationCandidates
};
