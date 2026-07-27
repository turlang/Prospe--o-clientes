/**
 * @fileoverview Testes automatizados de regressão para o componente `campaignAutomationService.test`.
 *
 * Responsabilidade delimitada conforme a arquitetura descrita em
 * `docs/ARQUITETURA.md`. Alterações neste arquivo devem preservar os contratos
 * documentados e ser acompanhadas por testes quando afetarem regras de negócio.
 *
 * @module tests/campaignAutomationService.test
 */

const test = require('node:test');
const assert = require('node:assert/strict');

const {
  classifyCampaignLead,
  buildCampaignSummary,
  buildLocalSmartSequence,
  normalizeAiCampaignResult,
  buildCampaignTasks,
  buildCampaignInteraction
} = require('../src/services/campaignAutomationService');

test('classifyCampaignLead prioriza leads interessados', () => {
  const lead = { nome: 'Clínica Alfa', status: 'INTERESSADO', score: 72, telefone: '11999999999' };
  const card = classifyCampaignLead(lead);

  assert.equal(card.priority, 'ALTA');
  assert.equal(card.recommendedChannel, 'WhatsApp');
  assert.match(card.objective, /interesse|proposta|conversa/i);
});

test('buildCampaignSummary retorna leads prontos para campanha', () => {
  const leads = [
    { nome: 'Barbearia A', status: 'NOVO', score: 86, telefone: '11' },
    { nome: 'Cliente Fechado', status: 'FECHADO', score: 99 },
    { nome: 'Restaurante B', status: 'CONTATADO', score: 58 }
  ];
  const tasks = [{ automationType: 'SMART_CAMPAIGN', done: false }];
  const result = buildCampaignSummary(leads, tasks);

  assert.equal(result.summary.campaignable, 2);
  assert.equal(result.summary.pendingCampaignTasks, 1);
  assert.equal(result.leads[0].name, 'Barbearia A');
});

test('buildLocalSmartSequence cria cadência revisável', () => {
  const sequence = buildLocalSmartSequence({ nome: 'Studio Beta', segmentoComercial: 'salão', site: '' });

  assert.ok(sequence.length >= 4);
  assert.equal(sequence[0].day, 0);
  assert.ok(sequence.every((step) => step.message && step.channel));
});

test('normalizeAiCampaignResult usa passos da IA quando válidos', () => {
  const result = normalizeAiCampaignResult({
    campaignName: 'Retomada consultiva',
    strategy: 'Consultiva',
    reason: 'Lead pronto para contato',
    steps: [{ day: 0, title: 'Abertura', channel: 'WhatsApp', message: 'Olá!', goal: 'Gerar resposta' }]
  }, { nome: 'Lead X' });

  assert.equal(result.campaignName, 'Retomada consultiva');
  assert.equal(result.steps.length, 1);
  assert.equal(result.steps[0].title, 'Abertura');
});

test('buildCampaignTasks converte etapas em tarefas', () => {
  const tasks = buildCampaignTasks({
    userId: 'u1',
    lead: { nome: 'Lead Y', placeId: 'abc' },
    campaign: {
      campaignName: 'Campanha teste',
      steps: [{ day: 2, title: 'Follow-up', message: 'Mensagem', channel: 'WhatsApp' }]
    }
  });

  assert.equal(tasks.length, 1);
  assert.equal(tasks[0].userId, 'u1');
  assert.equal(tasks[0].leadId, 'abc');
  assert.equal(tasks[0].automationType, 'SMART_CAMPAIGN');
});

test('buildCampaignInteraction registra criação da campanha', () => {
  const interaction = buildCampaignInteraction({ campaign: { campaignName: 'Teste', strategy: 'PAS', steps: [{}, {}] } });

  assert.equal(interaction.tipo, 'CAMPANHA_INTELIGENTE_CRIADA');
  assert.equal(interaction.quantidadeEtapas, 2);
});
