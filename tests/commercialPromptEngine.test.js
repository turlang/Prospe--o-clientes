/**
 * @fileoverview Testes automatizados de regressão para o componente `commercialPromptEngine.test`.
 *
 * Responsabilidade delimitada conforme a arquitetura descrita em
 * `docs/ARQUITETURA.md`. Alterações neste arquivo devem preservar os contratos
 * documentados e ser acompanhadas por testes quando afetarem regras de negócio.
 *
 * @module tests/commercialPromptEngine.test
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  buildCommercialPrompt,
  buildCommercialProfile,
  buildPromptPayload,
  normalizeMode,
  getCommercialMemory
} = require('../src/services/commercialPromptEngine');
const { buildSalesApproach } = require('../src/services/salesStrategyEngine');

test('Prompt Engine monta briefing comercial completo do lead', () => {
  const lead = {
    nome: 'Barbearia Elite',
    segmentoComercial: 'Barbearia',
    score: 88,
    telefone: '(11) 99999-9999',
    site: '',
    dores: ['não possui site próprio para captar clientes vindos do Google']
  };
  const local = buildSalesApproach(lead, { variationSeed: 'v206' });
  const prompt = buildCommercialPrompt({
    lead,
    leadContext: local.leadContext,
    localRecommendation: local,
    mode: 'new',
    regenerateKey: 'teste-v206'
  });

  assert.ok(prompt.includes('Barbearia Elite'));
  assert.ok(prompt.includes('Briefing comercial do lead'));
  assert.ok(prompt.includes('Memória comercial do lead'));
  assert.ok(prompt.includes('Retorne SOMENTE JSON válido'));
  assert.ok(prompt.includes('regenerateKey: teste-v206'));
});

test('Prompt Engine muda instrução quando modo é variant', () => {
  const payload = buildPromptPayload({ mode: 'variant' });
  assert.ok(payload.instructions.some((item) => /significativamente diferente/i.test(item)));
});

test('Perfil comercial classifica maturidade digital e probabilidade', () => {
  const profile = buildCommercialProfile({
    lead: { nome: 'Clínica Sorriso', segmentoComercial: 'Clínica odontológica', score: 82, telefone: '1199999' },
    localRecommendation: {
      diagnostics: {
        hasWebsite: false,
        hasWhatsapp: true,
        hasSocialPresence: false,
        primaryPain: 'não encontrei site próprio',
        opportunityTags: ['Sem site próprio']
      }
    }
  });

  assert.equal(profile.empresa, 'Clínica Sorriso');
  assert.equal(profile.probabilidadeConversao, 'Alta');
  assert.equal(profile.possuiSite, false);
});

test('Memória comercial recupera abordagens recentes do lead', () => {
  const memory = getCommercialMemory({
    interacoes: [
      { tipo: 'STATUS_ATUALIZADO', status: 'CONTATADO' },
      { tipo: 'ABORDAGEM_IA_GERADA', abordagem: 'Mensagem anterior', provider: 'Groq' }
    ]
  });

  assert.equal(memory.totalInteractions, 2);
  assert.equal(memory.lastApproach, 'Mensagem anterior');
});

test('normalizeMode mantém fallback seguro', () => {
  assert.equal(normalizeMode('variant'), 'variant');
  assert.equal(normalizeMode('qualquer'), 'new');
});

test('Prompt Engine exige abordagem humana sem jargões e com pergunta de baixo atrito', () => {
  const prompt = buildCommercialPrompt({
    lead: { nome: 'Barbearia Elite', segmentoComercial: 'Barbearia', score: 80 },
    mode: 'new',
    channel: 'whatsapp',
    regenerateKey: 'tom-v207'
  });

  assert.ok(prompt.includes('colega prático'));
  assert.ok(prompt.includes('É proibido usar'));
  assert.ok(prompt.includes('Posso te mandar o print do que vi?'));
  assert.ok(prompt.includes('Não use palavras em inglês'));
  assert.ok(prompt.includes('tom-v207'));
});

test('Prompt Engine possui regras por canal comercial', () => {
  const { buildPromptPayload } = require('../src/services/commercialPromptEngine');

  const emailPayload = buildPromptPayload({ channel: 'email' });
  assert.ok(emailPayload.instructions.some((item) => /E-mail/i.test(item)));

  const objectionPayload = buildPromptPayload({ channel: 'objection' });
  assert.ok(objectionPayload.instructions.some((item) => /objeção/i.test(item)));
});
