/**
 * aiApproachService.js
 * -----------------------------------------------------------------------------
 * Integração opcional para gerar abordagens com IA generativa.
 *
 * O sistema funciona sem IA externa. Quando OPENAI_API_KEY estiver configurada,
 * a rota /api/gerar-abordagem tenta gerar uma mensagem nova, contextual e mais
 * próxima do lead. Se a API falhar, o motor local entra como fallback.
 */

function isAiApproachEnabled() {
  return Boolean(process.env.OPENAI_API_KEY) && String(process.env.AI_APPROACHES_ENABLED || 'true').toLowerCase() !== 'false';
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

function buildPrompt({ leadContext, localRecommendation, regenerateKey }) {
  const lead = compactLeadForPrompt(leadContext);
  return [
    'Você é um especialista em vendas B2B consultivas para negócios locais no Brasil.',
    'Crie uma abordagem comercial curta, humana e personalizada para o lead abaixo.',
    'A mensagem deve parecer escrita por uma pessoa que realmente analisou a empresa.',
    'Não use promessa exagerada, não invente dados, não diga que falou com alguém, não use pressão artificial.',
    'Evite texto genérico como “trabalho com soluções digitais”. Seja específico sobre a oportunidade observada.',
    'A mensagem deve abrir conversa, pedir permissão e aproximar-se da realidade do negócio.',
    'Use português do Brasil, tom profissional, simples e direto. Evite emojis em excesso.',
    'Gere uma variação nova sempre que o campo regenerateKey mudar.',
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

async function generateWithOpenAI({ leadContext, localRecommendation, regenerateKey }) {
  if (!isAiApproachEnabled()) return null;

  const model = process.env.OPENAI_APPROACH_MODEL || process.env.OPENAI_MODEL || 'gpt-4o-mini';
  const prompt = buildPrompt({ leadContext, localRecommendation, regenerateKey });
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
        temperature: Number(process.env.AI_APPROACH_TEMPERATURE || 0.85),
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
      throw new Error(data?.error?.message || 'Falha ao gerar abordagem com IA.');
    }

    const content = data?.choices?.[0]?.message?.content || '';
    const parsed = safeJsonParse(content);
    if (!parsed || !parsed.abordagem) {
      throw new Error('A IA retornou uma resposta inválida.');
    }

    return {
      source: 'ai',
      model,
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
  } finally {
    clearTimeout(timeout);
  }
}

async function generateAiEnhancedApproach({ leadContext, localRecommendation, regenerateKey }) {
  try {
    const ai = await generateWithOpenAI({ leadContext, localRecommendation, regenerateKey });
    if (ai) return ai;
  } catch (error) {
    return {
      ...localRecommendation,
      source: 'local-fallback',
      aiError: error.message,
      explanation: [
        ...(localRecommendation.explanation || []),
        `IA externa indisponível: ${error.message}. Foi usada uma abordagem local variada.`
      ]
    };
  }

  return localRecommendation;
}

module.exports = {
  isAiApproachEnabled,
  generateAiEnhancedApproach,
  buildPrompt,
  safeJsonParse
};
