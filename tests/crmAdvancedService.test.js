/**
 * @fileoverview Regressões do Marco 2: CRM avançado.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  createDefaultCrmConfiguration,
  normalizeCrmConfiguration
} = require('../src/domain/crm/crmConfiguration');
const {
  normalizeLeadCommercialUpdates,
  validateStageRequirements,
  applyLeadFilters,
  buildForecast,
  buildPeriodReport,
  parseCsv,
  guessMapping,
  importCsvLeads,
  buildFullExportCsv,
  findReactivationCandidates
} = require('../src/services/crmAdvancedService');

test('configuração padrão entrega pipeline, metas e catálogo', () => {
  const config = createDefaultCrmConfiguration();
  assert.equal(config.activePipelineId, 'sales');
  assert.equal(config.pipelines[0].stages.length, 7);
  assert.ok(config.catalog.length >= 3);
  assert.equal(config.goals.period, 'monthly');
});

test('normalização preserva múltiplos pipelines e campos personalizados', () => {
  const config = normalizeCrmConfiguration({
    activePipelineId: 'sites',
    pipelines: [
      { id: 'sites', name: 'Sites', stages: [{ key: 'NOVO', label: 'Entrada' }, { key: 'FECHADO', label: 'Ganho' }] },
      { id: 'automacoes', name: 'Automações', stages: [{ key: 'NOVO' }, { key: 'PROPOSTA' }] }
    ],
    customFields: [{ id: 'prazo', label: 'Prazo', type: 'date', requiredAtStages: ['PROPOSTA'] }]
  });
  assert.equal(config.pipelines.length, 2);
  assert.equal(config.activePipelineId, 'sites');
  assert.equal(config.customFields[0].type, 'date');
});

test('etapa proposta bloqueia lead sem valor obrigatório', () => {
  const config = createDefaultCrmConfiguration();
  const invalid = validateStageRequirements({ pipelineId: 'sales', ticketEstimado: '' }, 'PROPOSTA', config);
  assert.equal(invalid.valid, false);
  assert.deepEqual(invalid.missingFields, ['ticketEstimado']);
  const valid = validateStageRequirements({ pipelineId: 'sales', ticketEstimado: 1800 }, 'PROPOSTA', config);
  assert.equal(valid.valid, true);
});

test('dados comerciais calculam contrato, recorrência e catálogo', () => {
  const config = createDefaultCrmConfiguration();
  const updates = normalizeLeadCommercialUpdates({
    pipelineId: 'sales',
    serviceItems: [
      { catalogId: 'site-institucional', quantity: 1 },
      { catalogId: 'manutencao', quantity: 1 }
    ],
    tags: ['urgente', 'urgente', 'site'],
    customFields: {}
  }, config);
  assert.equal(updates.contractValue, 4800);
  assert.equal(updates.monthlyRecurringRevenue, 250);
  assert.deepEqual(updates.tags, ['urgente', 'site']);
});

test('filtros avançados combinam pipeline, segmento, serviço e valor', () => {
  const config = createDefaultCrmConfiguration();
  const leads = [
    { nome: 'Clínica Alfa', pipelineId: 'sales', status: 'PROPOSTA', segmentoComercial: 'Saúde', servicoPrincipal: 'Site', contractValue: 3000, score: 80 },
    { nome: 'Loja Beta', pipelineId: 'sales', status: 'NOVO', segmentoComercial: 'Varejo', servicoPrincipal: 'Automação', contractValue: 900, score: 70 }
  ];
  const result = applyLeadFilters(leads, { segment: 'saúde', service: 'site', minValue: 2000 }, config);
  assert.equal(result.length, 1);
  assert.equal(result[0].nome, 'Clínica Alfa');
});

test('previsão inclui receita ponderada, MRR e progresso de metas', () => {
  const config = createDefaultCrmConfiguration();
  const now = new Date('2026-08-15T12:00:00.000Z');
  const leads = [
    { status: 'PROPOSTA', pipelineId: 'sales', contractValue: 2000, atualizadoEm: '2026-08-10T12:00:00.000Z' },
    { status: 'FECHADO', pipelineId: 'sales', valorFechado: 3000, monthlyRecurringRevenue: 250, atualizadoEm: '2026-08-11T12:00:00.000Z' }
  ];
  const forecast = buildForecast(leads, config, now);
  assert.equal(forecast.weightedRevenue, 1160);
  assert.equal(forecast.closedRevenue, 3000);
  assert.equal(forecast.monthlyRecurringRevenue, 250);
  assert.equal(forecast.goals.current.closed, 1);
});

test('relatório por período agrega serviços e motivos de perda', () => {
  const config = createDefaultCrmConfiguration();
  const report = buildPeriodReport([
    { status: 'FECHADO', valorFechado: 1800, serviceItems: [{ name: 'Site', total: 1800 }], atualizadoEm: '2026-08-03T00:00:00.000Z' },
    { status: 'SEM_INTERESSE', motivoPerda: 'SEM_ORCAMENTO', atualizadoEm: '2026-08-04T00:00:00.000Z' }
  ], config, { from: '2026-08-01', to: '2026-09-01', now: new Date('2026-08-15') });
  assert.equal(report.summary.closed, 1);
  assert.equal(report.summary.revenue, 1800);
  assert.equal(report.byService[0].name, 'Site');
  assert.equal(report.lossReasons[0].reason, 'SEM_ORCAMENTO');
});

test('importação CSV mapeia colunas e elimina duplicidades por domínio', () => {
  const csv = 'Empresa;Site;Telefone;Valor\nClínica Alfa;clinica.com.br;11999999999;2500\nClínica repetida;https://www.clinica.com.br;11888888888;3000\nLoja Beta;loja.com.br;11777777777;900';
  const parsed = parseCsv(csv);
  const mapping = { ...guessMapping(parsed.headers), nome: 'Empresa', site: 'Site', telefone: 'Telefone', ticketEstimado: 'Valor' };
  const result = importCsvLeads(csv, mapping, [], createDefaultCrmConfiguration());
  assert.equal(result.leads.length, 2);
  assert.equal(result.duplicates, 1);
  assert.equal(result.leads[0].contractValue, 2500);
});

test('exportação completa inclui campos personalizados e histórico não é sobrescrito', () => {
  const config = normalizeCrmConfiguration({ customFields: [{ id: 'prazo', label: 'Prazo', type: 'text' }] });
  const csv = buildFullExportCsv([{ nome: 'Alfa', status: 'NOVO', customFields: { prazo: '30 dias' }, tags: ['quente'] }], config);
  assert.match(csv, /custom:prazo/);
  assert.match(csv, /30 dias/);
  assert.match(csv, /quente/);
});

test('reativação prioriza leads perdidos ou sem atividade', () => {
  const items = findReactivationCandidates([
    { placeId: '1', nome: 'Perdido', status: 'SEM_INTERESSE', score: 80, atualizadoEm: '2026-01-01' },
    { placeId: '2', nome: 'Parado', status: 'CONTATADO', score: 60, atualizadoEm: '2026-06-01' },
    { placeId: '3', nome: 'Ativo', status: 'CONTATADO', score: 90, atualizadoEm: '2026-08-01' }
  ], new Date('2026-08-15'), 30);
  assert.deepEqual(items.map((item) => item.leadId), ['1', '2']);
});
