const test = require('node:test');
const assert = require('node:assert/strict');
const { safeJsonParse, buildPrompt, getAiProviderStatus, normalizeProvider, normalizeGeminiModelName, pickBestGeminiModel, toFriendlyAiError } = require('../src/services/aiApproachService');
const { buildSalesApproach } = require('../src/services/salesStrategyEngine');

test('safeJsonParse extrai JSON válido mesmo com texto ao redor', () => {
  const parsed = safeJsonParse('resposta: {"abordagem":"Olá","followUps":[]} fim');
  assert.equal(parsed.abordagem, 'Olá');
});

test('prompt de IA contém contexto do lead e regra de personalização', () => {
  const local = buildSalesApproach({
    nome: 'Barbearia Elite',
    segmentoComercial: 'Barbearia',
    score: 88,
    telefone: '(11) 99999-9999'
  }, { variationSeed: 'teste' });

  const prompt = buildPrompt({
    leadContext: local.leadContext,
    localRecommendation: local,
    regenerateKey: 'teste-123'
  });

  assert.ok(prompt.includes('Barbearia Elite'));
  assert.ok(prompt.includes('regenerateKey: teste-123'));
  assert.ok(prompt.includes('Retorne SOMENTE JSON válido'));
});


test('normalizeProvider aceita groq, gemini e fallback automatico', () => {
  assert.equal(normalizeProvider('groq'), 'groq');
  assert.equal(normalizeProvider('gemini'), 'gemini');
  assert.equal(normalizeProvider('openai'), 'openai');
  assert.equal(normalizeProvider('qualquer'), 'auto');
});

test('status da IA informa Gemini quando chave estiver configurada', () => {
  const oldProvider = process.env.AI_PROVIDER;
  const oldGeminiKey = process.env.GEMINI_API_KEY;
  const oldModel = process.env.GEMINI_MODEL;

  process.env.AI_PROVIDER = 'gemini';
  process.env.GEMINI_API_KEY = 'fake-key-for-test';
  process.env.GEMINI_MODEL = 'gemini-1.5-flash';

  const status = getAiProviderStatus();
  assert.equal(status.provider, 'gemini');
  assert.equal(status.providerLabel, 'Google Gemini');
  assert.equal(status.model, 'gemini-1.5-flash');
  assert.equal(status.configured, true);

  if (oldProvider === undefined) delete process.env.AI_PROVIDER; else process.env.AI_PROVIDER = oldProvider;
  if (oldGeminiKey === undefined) delete process.env.GEMINI_API_KEY; else process.env.GEMINI_API_KEY = oldGeminiKey;
  if (oldModel === undefined) delete process.env.GEMINI_MODEL; else process.env.GEMINI_MODEL = oldModel;
});


test('normalizeGeminiModelName aceita nomes com prefixo models/', () => {
  assert.equal(normalizeGeminiModelName('models/gemini-2.0-flash'), 'gemini-2.0-flash');
  assert.equal(normalizeGeminiModelName('gemini-2.0-flash'), 'gemini-2.0-flash');
});

test('pickBestGeminiModel troca modelo configurado indisponivel por flash compativel', () => {
  const result = pickBestGeminiModel([
    { name: 'models/gemini-2.0-flash', supportedGenerationMethods: ['generateContent'] },
    { name: 'models/text-embedding-004', supportedGenerationMethods: ['embedContent'] }
  ], 'gemini-1.5-flash');

  assert.equal(result.model, 'gemini-2.0-flash');
  assert.equal(result.source, 'auto-selected');
  assert.equal(result.available, true);
});


test('status da IA prioriza Groq quando chave estiver configurada', () => {
  const oldProvider = process.env.AI_PROVIDER;
  const oldGroqKey = process.env.GROQ_API_KEY;
  const oldGroqModel = process.env.GROQ_MODEL;

  process.env.AI_PROVIDER = 'groq';
  process.env.GROQ_API_KEY = 'fake-groq-key-for-test';
  process.env.GROQ_MODEL = 'llama-3.3-70b-versatile';

  const status = getAiProviderStatus();
  assert.equal(status.provider, 'groq');
  assert.equal(status.providerLabel, 'Groq');
  assert.equal(status.model, 'llama-3.3-70b-versatile');
  assert.equal(status.configured, true);

  if (oldProvider === undefined) delete process.env.AI_PROVIDER; else process.env.AI_PROVIDER = oldProvider;
  if (oldGroqKey === undefined) delete process.env.GROQ_API_KEY; else process.env.GROQ_API_KEY = oldGroqKey;
  if (oldGroqModel === undefined) delete process.env.GROQ_MODEL; else process.env.GROQ_MODEL = oldGroqModel;
});

test('erro tecnico de IA vira mensagem amigavel', () => {
  assert.match(toFriendlyAiError(new Error('quota exceeded')), /limite de uso|cota/i);
  assert.match(toFriendlyAiError(new Error('invalid api key')), /chave/i);
});
