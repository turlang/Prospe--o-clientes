/**
 * @fileoverview Teste de integração leve da rota que processa respostas de leads.
 * @module tests/leadResponseRoute.test
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const { registerLeadRoutes } = require('../src/routes/leadRoutes');
const { analyzeLeadResponse } = require('../src/domain/conversations/conversationEngine');

function createRouteHarness(overrides = {}) {
  const handlers = new Map();
  const app = {
    get(path, ...stack) { handlers.set(`GET ${path}`, stack.at(-1)); },
    post(path, ...stack) { handlers.set(`POST ${path}`, stack.at(-1)); },
    patch(path, ...stack) { handlers.set(`PATCH ${path}`, stack.at(-1)); }
  };

  const lead = { placeId: 'lead-1', nome: 'Empresa Teste', status: 'CONTATADO', interacoes: [] };
  const context = {
    requireAuth: (_req, _res, next) => next?.(),
    readLeads: async () => [lead],
    analyzeLeadResponse,
    updateLeadStatus: async (_leadId, status, interaction) => ({ ...lead, status, interacoes: [interaction] }),
    sanitizeSearchText: (value, max = 120) => String(value || '').trim().slice(0, max),
    ALLOWED_LEAD_STATUSES: new Set(),
    sendApiError: (_res, error) => { throw error; },
    ...overrides
  };

  registerLeadRoutes(app, context);
  return { handler: handlers.get('POST /api/analisar-resposta') };
}

function createResponse() {
  return {
    statusCode: 200,
    payload: null,
    status(code) { this.statusCode = code; return this; },
    json(payload) { this.payload = payload; return this; }
  };
}

test('rota rejeita análise sem mensagem recebida', async () => {
  const { handler } = createRouteHarness();
  const res = createResponse();
  await handler({ user: { sub: 'user-1' }, body: { leadId: 'lead-1', resposta: '   ' } }, res);
  assert.equal(res.statusCode, 400);
  assert.match(res.payload.error, /Cole a resposta/);
});

test('rota registra interação e devolve transição visível do funil', async () => {
  let persistedStatus = null;
  const { handler } = createRouteHarness({
    updateLeadStatus: async (_leadId, status, interaction) => {
      persistedStatus = status;
      return { placeId: 'lead-1', nome: 'Empresa Teste', status, interacoes: [interaction] };
    }
  });
  const res = createResponse();

  await handler({ user: { sub: 'user-1' }, body: { leadId: 'lead-1', resposta: 'Sim, pode enviar.' } }, res);

  assert.equal(res.statusCode, 200);
  assert.equal(persistedStatus, 'INTERESSADO');
  assert.deepEqual(res.payload.transition, { from: 'CONTATADO', to: 'INTERESSADO', changed: true });
  assert.equal(res.payload.lead.interacoes[0].tipo, 'RESPOSTA_RECEBIDA');
});


test('resposta positiva conclui etapa anterior e cria tarefa de diagnóstico sem duplicação', async () => {
  let completedLeadId = null;
  let taskPayload = null;
  const { handler } = createRouteHarness({
    buildNextTaskPlan: ({ status }) => ({
      title: 'Enviar diagnóstico prático',
      dueAt: '2026-07-27T13:00:00.000Z',
      message: 'Enviar pontos e sugerir conversa de 15 minutos.',
      priority: 'ALTA',
      automationType: 'FUNIL_DIAGNOSTICO',
      actionType: 'ENVIAR_DIAGNOSTICO',
      targetStatus: 'REUNIAO',
      status
    }),
    completePendingAutomationTasksForLead: async (_userId, leadId) => { completedLeadId = leadId; return 1; },
    createTaskIfMissing: async (payload) => {
      taskPayload = payload;
      return { task: { id: 'task-1', ...payload }, created: true };
    },
    buildCommercialEngineOutput: ({ task }) => ({
      mensagemAbordagemSugerida: 'Mensagem',
      statusContatos: { canalPrioritario: 'WHATSAPP' },
      proximaAcaoFunil: { acao: task.title }
    })
  });
  const res = createResponse();

  await handler({ user: { sub: 'user-1' }, body: { leadId: 'lead-1', resposta: 'Sim, pode mandar o print.' } }, res);

  assert.equal(completedLeadId, 'lead-1');
  assert.equal(taskPayload.automationType, 'FUNIL_DIAGNOSTICO');
  assert.equal(res.payload.automaticTask.created, true);
  assert.equal(res.payload.proximaAcaoFunil.acao, 'Enviar diagnóstico prático');
});
