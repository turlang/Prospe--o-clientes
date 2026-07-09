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

test('Prompt Engine orienta IA a vender tecnologia em linguagem simples', () => {
  const prompt = buildCommercialPrompt({
    lead: { nome: 'Barbearia Elite', segmentoComercial: 'Barbearia', score: 80 },
    mode: 'new',
    channel: 'whatsapp',
    regenerateKey: 'tom-v207'
  });

  assert.ok(prompt.includes('vendedor de tecnologia experiente'));
  assert.ok(prompt.includes('termos técnicos'));
  assert.ok(prompt.includes('mais chamadas no WhatsApp'));
  assert.ok(prompt.includes('tom-v207'));
});
