const { generateStructured } = require('./providerManager');
const { getTemplate } = require('../prompts/promptManager');

function localCopilotAnswer(question, context) {
  const normalized = String(question || '').toLowerCase();
  const plan = context.dailyPlan || [];
  const top = context.topLeads || [];
  const alerts = context.alerts || [];
  const metrics = context.metrics || {};

  if (/quem.*(ligar|contatar|falar)|prioridade|agora/.test(normalized)) {
    const first = plan[0] || top[0];
    return first
      ? { answer: `Comece por ${first.leadName || first.nome}. ${first.reason || first.action || 'É a oportunidade mais prioritária neste momento.'}`, recommendedActions: plan.slice(0, 3).map((item) => `${item.leadName || item.nome}: ${item.action || item.reason || 'fazer contato'}`) }
      : { answer: 'Não há uma prioridade clara porque o CRM ainda não possui leads ou tarefas suficientes.', recommendedActions: ['Prospecte novos leads', 'Registre tentativas de contato'] };
  }

  if (/proposta/.test(normalized)) {
    const proposals = top.filter((lead) => lead.status === 'PROPOSTA');
    return { answer: proposals.length ? `Há ${proposals.length} proposta(s) entre os leads prioritários. Comece por ${proposals[0].nome}.` : 'Não encontrei propostas abertas entre os leads prioritários.', recommendedActions: proposals.slice(0, 4).map((lead) => `Retomar ${lead.nome}`) };
  }

  if (/risco|parad|esquec|recuper/.test(normalized)) {
    return { answer: alerts.length ? `Existem ${alerts.length} oportunidades que merecem atenção. A mais urgente é ${alerts[0].leadName || 'a primeira da lista'}.` : 'Não identifiquei oportunidades críticas em risco neste momento.', recommendedActions: alerts.slice(0, 4).map((item) => `${item.leadName}: ${item.action || item.reason}`) };
  }

  if (/receita|fatur|previs/.test(normalized)) {
    return { answer: `A receita ponderada prevista é de aproximadamente R$ ${Number(metrics.weightedRevenue || 0).toLocaleString('pt-BR')}. A receita já fechada é R$ ${Number(metrics.closedRevenue || 0).toLocaleString('pt-BR')}.`, recommendedActions: ['Priorize propostas abertas', 'Faça follow-up das oportunidades em risco'] };
  }

  if (/coach|desempenho|melhorar|convers/.test(normalized)) {
    const contactRate = context.pipelineHealth?.contactRate || 0;
    return { answer: `Seu pipeline possui ${metrics.activeOpportunities || 0} oportunidades ativas. A taxa de contato indicada é ${contactRate}%. O maior ganho agora vem de executar follow-ups no prazo e registrar cada resposta.`, recommendedActions: (context.managerAdvice || []).slice(0, 4) };
  }

  return {
    answer: `Analisei ${metrics.activeOpportunities || 0} oportunidades ativas, ${metrics.pendingTasks || 0} tarefas pendentes e ${metrics.atRisk || 0} leads em risco. Posso detalhar prioridades, propostas, receita, follow-ups ou desempenho.`,
    recommendedActions: (context.managerAdvice || []).slice(0, 3)
  };
}

function buildCopilotPrompt({ question, context, history = [] }) {
  return `${getTemplate('copilot')}\n\nREGRAS ADICIONAIS:\n- Use exclusivamente o contexto fornecido.\n- Não invente empresas, contatos, resultados ou valores.\n- Fale como um diretor comercial experiente, em português simples.\n- Seja direto e indique ações executáveis.\n- Quando citar um lead, use exatamente o nome presente no contexto.\n- Retorne JSON válido com answer e recommendedActions.\n\nHISTÓRICO RECENTE DO CHAT:\n${JSON.stringify(history.slice(-10))}\n\nCONTEXTO ATUAL DO CRM:\n${JSON.stringify(context)}\n\nPERGUNTA DO USUÁRIO:\n${question}`;
}

async function answerCommercialQuestion({ question, context, history = [] }) {
  const local = localCopilotAnswer(question, context);
  const result = await generateStructured({
    systemContent: getTemplate('system'),
    prompt: buildCopilotPrompt({ question, context, history }),
    maxTokens: 1200
  });

  if (!result.parsed || !result.parsed.answer) {
    return { ...local, source: result.source, provider: result.provider, providerLabel: result.providerLabel, model: result.model, aiError: result.aiError || null };
  }

  return {
    answer: String(result.parsed.answer).trim(),
    recommendedActions: Array.isArray(result.parsed.recommendedActions) ? result.parsed.recommendedActions.map(String).slice(0, 6) : local.recommendedActions,
    source: result.source,
    provider: result.provider,
    providerLabel: result.providerLabel,
    model: result.model,
    aiError: result.aiError || null
  };
}

module.exports = { answerCommercialQuestion, localCopilotAnswer, buildCopilotPrompt };
