const test = require('node:test');
const assert = require('node:assert/strict');
const { SalesOsCore } = require('../src/core/commercial/salesOsCore');
const { listTemplates, renderTemplate } = require('../src/core/prompts/promptManager');
const { buildLearningSummary, recommendStrategy } = require('../src/core/learning/learningEngine');
const { createMemoryEvent, buildLeadMemory } = require('../src/core/memory/salesMemory');
const { evaluateAutomationRules } = require('../src/core/automation/automationEngine');

test('Prompt Manager lista e renderiza prompts externos', () => {
  const templates = listTemplates();
  assert.ok(templates.includes('system'));
  assert.ok(templates.includes('copilot'));
  assert.match(renderTemplate('system'), /diretor comercial/i);
});

test('Sales OS Core cria snapshot integrado', () => {
  const core = new SalesOsCore();
  const snapshot = core.buildSnapshot({
    leads: [{ placeId: '1', nome: 'Loja A', status: 'NOVO', score: 72, coletadoEm: new Date().toISOString() }],
    tasks: [],
    now: new Date('2026-07-09T12:00:00Z')
  });
  assert.equal(snapshot.version, '23.2.0');
  assert.equal(snapshot.intelligence.summary.activeLeads, 1);
  assert.ok(Array.isArray(snapshot.prompts));
  assert.ok(snapshot.ai.status);
});

test('Learning Engine calcula taxa e recomenda estratégia', () => {
  const events = [
    { segment: 'barbearia', strategy: 'consultiva', outcome: 'won' },
    { segment: 'barbearia', strategy: 'consultiva', outcome: 'won' },
    { segment: 'barbearia', strategy: 'pas', outcome: 'lost' }
  ];
  const summary = buildLearningSummary(events);
  assert.equal(summary[0].strategy, 'consultiva');
  assert.equal(summary[0].winRate, 100);
  assert.equal(recommendStrategy(events, 'barbearia').strategy, 'consultiva');
});

test('Sales Memory cria e recupera eventos do lead', () => {
  const event = createMemoryEvent({ leadId: 'abc', type: 'approach_sent', content: 'Olá' });
  assert.equal(event.type, 'APPROACH_SENT');
  const memory = buildLeadMemory([event, { ...event, leadId: 'outro' }], 'abc');
  assert.equal(memory.length, 1);
});

test('Automation Engine identifica lead sem próximo passo', () => {
  const actions = evaluateAutomationRules({ leads: [{ placeId: '1', nome: 'A', status: 'PROPOSTA' }], tasks: [] });
  assert.equal(actions.length, 1);
  assert.equal(actions[0].priority, 'ALTA');
});
