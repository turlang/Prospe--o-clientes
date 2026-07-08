/**
 * aiApproachService.js
 * -----------------------------------------------------------------------------
 * Integração opcional para gerar abordagens com IA generativa.
 *
 * O sistema funciona sem IA externa. Quando um provedor estiver configurado,
 * a rota /api/gerar-abordagem tenta gerar uma mensagem nova, contextual e mais
 * próxima do lead. Se a API falhar, o motor local entra como fallback.
 *
 * Provedores suportados:
 * - gemini: Google Gemini via GEMINI_API_KEY.
 * - openai: OpenAI via OPENAI_API_KEY.
 * - auto: escolhe Gemini se configurado; depois OpenAI; depois motor local.
 */

const AI_PROVIDERS = {
  gemini: {
    id: 'gemini',
    label: 'Google Gemini',
    keyEnv: 'GEMINI_API_KEY',
    modelEnv: 'GEMINI_MODEL',
    defaultModel: 'gemini-2.0-flash'
  },
  openai: {
    id: 'openai',
    label: 'OpenAI',
    keyEnv: 'OPENAI_API_KEY',
    modelEnv: 'OPENAI_APPROACH_MODEL',
    defaultModel: 'gpt-4o-mini'
  }
};

const GEMINI_MODEL_CANDIDATES = [
  'gemini-2.0-flash',
  'gemini-1.5-flash-latest',
  'gemini-1.5-flash',
  'gemini-pro'
];

let geminiModelsCache = null;
let geminiModelsCacheAt = 0;
const GEMINI_MODELS_CACHE_MS = 1000 * 60 * 10;

function normalizeProvider(value = process.env.AI_PROVIDER) {
  const provider = String(value || 'auto').trim().toLowerCase();
  return ['auto', 'local', 'gemini', 'openai'].includes(provider) ? provider : 'auto';
}

function isAiFeatureEnabled() {
  return String(process.env.AI_APPROACHES_ENABLED || 'true').toLowerCase() !== 'false';
}

function hasProviderKey(provider) {
  const config = AI_PROVIDERS[provider];
  return Boolean(config && process.env[config.keyEnv]);
}

function getConfiguredProvider() {
  if (!isAiFeatureEnabled()) return null;

  const selected = normalizeProvider();
  if (selected === 'local') return null;
  if (selected === 'gemini' && hasProviderKey('gemini')) return 'gemini';
  if (selected === 'openai' && hasProviderKey('openai')) return 'openai';

  if (selected === 'auto') {
    if (hasProviderKey('gemini')) return 'gemini';
    if (hasProviderKey('openai')) return 'openai';
  }

  return null;
}

function normalizeGeminiModelName(model) {
  const value = String(model || '').trim();
  return value.startsWith('models/') ? value.slice('models/'.length) : value;
}

function getProviderModel(provider) {
  const config = AI_PROVIDERS[provider];
  if (!config) return 'local';
  const configured = process.env[config.modelEnv] || process.env.AI_MODEL || config.defaultModel;
  return provider === 'gemini' ? normalizeGeminiModelName(configured) : configured;
}

function getAiProviderStatus() {
  const selected = normalizeProvider();
  const activeProvider = getConfiguredProvider();

  if (!isAiFeatureEnabled()) {
    return {
      enabled: false,
      provider: 'local',
      providerLabel: 'Motor Local',
      model: 'local',
      mode: 'local',
      configured: false,
      reason: 'AI_APPROACHES_ENABLED=false. O sistema usará apenas o motor local.'
    };
  }

  if (activeProvider) {
    return {
      enabled: true,
      provider: activeProvider,
      providerLabel: AI_PROVIDERS[activeProvider].label,
      model: getProviderModel(activeProvider),
      mode: selected,
      configured: true,
      reason: `Variável ${AI_PROVIDERS[activeProvider].keyEnv} configurada. O modelo será validado antes da geração.`
    };
  }

  const missing = selected === 'gemini'
    ? 'GEMINI_API_KEY'
    : selected === 'openai'
      ? 'OPENAI_API_KEY'
      : 'GEMINI_API_KEY ou OPENAI_API_KEY';

  return {
    enabled: true,
    provider: 'local',
    providerLabel: 'Motor Local',
    model: 'local',
    mode: selected,
    configured: false,
    reason: `Nenhuma IA externa ativa. Configure ${missing} no Render para usar IA generativa.`
  };
}

function isAiApproachEnabled() {
  return Boolean(getConfiguredProvider());
}

function safeJsonParse(text) {
  try {
    return JSON.parse(text);
  } catch {
    const match = String(text || '').match(/\{[\s\S]*\}/);
    if (!match) return null;
    try { return JSON.parse(match[0]); } catch { return null; }
  }
}

function compactLeadForPrompt(leadContext = {}) {
  return {
    nome: leadContext.nome,
    segmento: leadContext.segmento,
    grupo: leadContext.segmentoGrupo,
    endereco: leadContext.endereco,
    telefoneDisponivel: Boolean(leadContext.telefone),
    site: leadContext.site ? 'possui site' : 'não identificado',
    score: leadContext.score,
    probabilidade: leadContext.probabilidade,
    ticketEstimado: leadContext.ticketEstimado,
    dores: leadContext.dores,
    servicos: leadContext.servicos,
    perfilDoCliente: leadContext.playbook?.client,
    beneficioMaisForte: leadContext.playbook?.benefit,
    anguloComercial: leadContext.playbook?.angle,
    diagnostico: leadContext.diagnostico
  };
}

function buildPrompt({ leadContext, localRecommendation, regenerateKey, previousApproach = '' }) {
  const lead = compactLeadForPrompt(leadContext);
  const antiRepeat = previousApproach
    ? `Abordagem anterior que NÃO deve ser repetida: ${previousApproach}`
    : 'Não repita frases prontas. Crie uma versão original para esta geração.';

  return [
    'Você é um especialista em vendas B2B consultivas para negócios locais no Brasil.',
    'Crie uma abordagem comercial curta, humana e personalizada para o lead abaixo.',
    'A mensagem deve parecer escrita por uma pessoa que realmente analisou a empresa.',
    'Não use promessa exagerada, não invente dados, não diga que falou com alguém e não use pressão artificial.',
    'Evite texto genérico como “trabalho com soluções digitais”. Seja específico sobre a oportunidade observada.',
    'A mensagem deve abrir conversa, pedir permissão e aproximar-se da realidade do negócio.',
    'Use português do Brasil, tom profissional, simples e direto. Evite emojis em excesso.',
    'Gere uma variação nova sempre que o campo regenerateKey mudar.',
    antiRepeat,
    '',
    'Retorne SOMENTE JSON válido neste formato:',
    '{',
    '  "abordagem": "mensagem pronta para WhatsApp ou e-mail",',
    '  "strategy": { "id": "consultiva|pas|aida|spin|curiosidade|diagnostico", "name": "nome da estratégia", "reason": "por que ela foi escolhida" },',
    '  "diagnostics": { "primaryPain": "dor principal", "priority": "Alta|Média|Baixa", "opportunityTags": ["tag"] },',
    '  "followUps": [ { "day": 3, "title": "Follow-up curto", "objective": "objetivo", "message": "mensagem" } ],',
    '  "explanation": ["motivo da escolha", "como a mensagem se aproxima do lead"]',
    '}',
    '',
    'Lead analisado:',
    JSON.stringify(lead, null, 2),
    '',
    'Recomendação local de referência, apenas para contexto. Melhore e personalize:',
    JSON.stringify({
      strategy: localRecommendation.strategy,
      diagnostics: localRecommendation.diagnostics,
      abordagem: localRecommendation.abordagem
    }, null, 2),
    '',
    `regenerateKey: ${regenerateKey || Date.now()}`
  ].join('\n');
}

function normalizeAiResult({ parsed, provider, model, localRecommendation, resolvedModelInfo = null }) {
  if (!parsed || !parsed.abordagem) {
    throw new Error('A IA retornou uma resposta inválida.');
  }

  return {
    source: 'ai',
    provider,
    providerLabel: AI_PROVIDERS[provider]?.label || 'IA',
    model,
    resolvedModelInfo,
    abordagem: String(parsed.abordagem || '').trim(),
    strategy: parsed.strategy || localRecommendation.strategy,
    diagnostics: {
      ...localRecommendation.diagnostics,
      ...(parsed.diagnostics || {})
    },
    followUps: Array.isArray(parsed.followUps) && parsed.followUps.length
      ? parsed.followUps
      : localRecommendation.followUps,
    explanation: Array.isArray(parsed.explanation) && parsed.explanation.length
      ? parsed.explanation
      : localRecommendation.explanation
  };
}

async function listGeminiModels({ force = false } = {}) {
  if (!hasProviderKey('gemini')) return [];

  const now = Date.now();
  if (!force && geminiModelsCache && now - geminiModelsCacheAt < GEMINI_MODELS_CACHE_MS) {
    return geminiModelsCache;
  }

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(process.env.GEMINI_API_KEY)}`);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error?.message || 'Não foi possível consultar modelos do Gemini.');
  }

  geminiModelsCache = Array.isArray(data.models) ? data.models : [];
  geminiModelsCacheAt = now;
  return geminiModelsCache;
}

function canGenerateContent(model) {
  return Array.isArray(model.supportedGenerationMethods)
    ? model.supportedGenerationMethods.includes('generateContent')
    : true;
}

function toGeminiId(model) {
  return normalizeGeminiModelName(model?.name || model || '');
}

function pickBestGeminiModel(models = [], preferred = '') {
  const compatible = models
    .filter(canGenerateContent)
    .map((model) => ({ ...model, id: toGeminiId(model) }))
    .filter((model) => model.id);

  const normalizedPreferred = normalizeGeminiModelName(preferred);
  const exact = compatible.find((model) => model.id === normalizedPreferred);
  if (exact) return { model: exact.id, source: 'configured', available: true };

  const byCandidate = GEMINI_MODEL_CANDIDATES
    .map((candidate) => compatible.find((model) => model.id === candidate))
    .find(Boolean);

  if (byCandidate) {
    return {
      model: byCandidate.id,
      source: 'auto-selected',
      available: true,
      configuredModel: normalizedPreferred || null,
      note: normalizedPreferred ? `Modelo configurado ${normalizedPreferred} indisponível. Usando ${byCandidate.id}.` : null
    };
  }

  const flash = compatible.find((model) => /flash/i.test(model.id));
  if (flash) {
    return {
      model: flash.id,
      source: 'auto-selected',
      available: true,
      configuredModel: normalizedPreferred || null,
      note: normalizedPreferred ? `Modelo configurado ${normalizedPreferred} indisponível. Usando ${flash.id}.` : null
    };
  }

  const first = compatible[0];
  if (first) {
    return {
      model: first.id,
      source: 'auto-selected',
      available: true,
      configuredModel: normalizedPreferred || null,
      note: normalizedPreferred ? `Modelo configurado ${normalizedPreferred} indisponível. Usando ${first.id}.` : null
    };
  }

  return {
    model: normalizedPreferred || AI_PROVIDERS.gemini.defaultModel,
    source: 'configured-unverified',
    available: false,
    configuredModel: normalizedPreferred || null
  };
}

async function resolveGeminiModel() {
  const preferred = getProviderModel('gemini');

  if (String(process.env.GEMINI_AUTO_MODEL || 'true').toLowerCase() === 'false') {
    return { model: preferred, source: 'configured', available: null };
  }

  const models = await listGeminiModels();
  return pickBestGeminiModel(models, preferred);
}

async function callGeminiModel({ model, prompt, controller }) {
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(normalizeGeminiModelName(model))}:generateContent?key=${encodeURIComponent(process.env.GEMINI_API_KEY)}`, {
    method: 'POST',
    signal: controller.signal,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }]
        }
      ],
      generationConfig: {
        temperature: Number(process.env.AI_APPROACH_TEMPERATURE || 0.9),
        maxOutputTokens: Number(process.env.AI_MAX_TOKENS || 1400),
        responseMimeType: 'application/json'
      }
    })
  });

  const data = await response.json();
  if (!response.ok) {
    const error = new Error(data?.error?.message || 'Falha ao gerar abordagem com Gemini.');
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

async function generateWithGemini({ leadContext, localRecommendation, regenerateKey, previousApproach = '' }) {
  if (!hasProviderKey('gemini')) return null;

  const provider = 'gemini';
  const prompt = buildPrompt({ leadContext, localRecommendation, regenerateKey, previousApproach });
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), Number(process.env.AI_APPROACH_TIMEOUT_MS || 25000));
  let resolved = null;

  try {
    resolved = await resolveGeminiModel();
    let data;

    try {
      data = await callGeminiModel({ model: resolved.model, prompt, controller });
    } catch (error) {
      const shouldRetryModel = [400, 404].includes(Number(error.status)) && String(error.message || '').toLowerCase().includes('model');
      if (!shouldRetryModel) throw error;

      const models = await listGeminiModels({ force: true });
      const retryResolved = pickBestGeminiModel(models, resolved.configuredModel || getProviderModel('gemini'));
      if (!retryResolved.model || retryResolved.model === resolved.model) throw error;

      resolved = retryResolved;
      data = await callGeminiModel({ model: resolved.model, prompt, controller });
    }

    const content = data?.candidates?.[0]?.content?.parts?.map((part) => part.text || '').join('\n') || '';
    const parsed = safeJsonParse(content);
    return normalizeAiResult({
      parsed,
      provider,
      model: resolved.model,
      localRecommendation,
      resolvedModelInfo: resolved
    });
  } finally {
    clearTimeout(timeout);
  }
}

async function generateWithOpenAI({ leadContext, localRecommendation, regenerateKey, previousApproach = '' }) {
  if (!hasProviderKey('openai')) return null;

  const provider = 'openai';
  const model = getProviderModel(provider);
  const prompt = buildPrompt({ leadContext, localRecommendation, regenerateKey, previousApproach });
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), Number(process.env.AI_APPROACH_TIMEOUT_MS || 20000));

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model,
        temperature: Number(process.env.AI_APPROACH_TEMPERATURE || 0.9),
        messages: [
          {
            role: 'system',
            content: 'Você gera abordagens comerciais éticas, consultivas e personalizadas. Retorne somente JSON válido.'
          },
          { role: 'user', content: prompt }
        ]
      })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data?.error?.message || 'Falha ao gerar abordagem com OpenAI.');
    }

    const content = data?.choices?.[0]?.message?.content || '';
    const parsed = safeJsonParse(content);
    return normalizeAiResult({ parsed, provider, model, localRecommendation });
  } finally {
    clearTimeout(timeout);
  }
}

async function generateWithConfiguredProvider(args) {
  const provider = getConfiguredProvider();
  if (provider === 'gemini') return generateWithGemini(args);
  if (provider === 'openai') return generateWithOpenAI(args);
  return null;
}

async function generateAiEnhancedApproach({ leadContext, localRecommendation, regenerateKey, previousApproach = '' }) {
  const status = getAiProviderStatus();

  try {
    const ai = await generateWithConfiguredProvider({ leadContext, localRecommendation, regenerateKey, previousApproach });
    if (ai) return { ...ai, aiStatus: { ...status, model: ai.model, resolvedModelInfo: ai.resolvedModelInfo || null } };
  } catch (error) {
    return {
      ...localRecommendation,
      source: 'local-fallback',
      provider: 'local',
      providerLabel: 'Motor Local',
      model: 'local',
      aiStatus: status,
      aiError: error.message,
      explanation: [
        ...(localRecommendation.explanation || []),
        `IA externa indisponível: ${error.message}. Foi usada uma abordagem local variada.`
      ]
    };
  }

  return {
    ...localRecommendation,
    source: 'local',
    provider: 'local',
    providerLabel: 'Motor Local',
    model: 'local',
    aiStatus: status
  };
}

module.exports = {
  AI_PROVIDERS,
  GEMINI_MODEL_CANDIDATES,
  normalizeProvider,
  normalizeGeminiModelName,
  getAiProviderStatus,
  isAiApproachEnabled,
  generateAiEnhancedApproach,
  buildPrompt,
  safeJsonParse,
  pickBestGeminiModel,
  listGeminiModels
};
