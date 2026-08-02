/**
 * @fileoverview Testes automatizados de regressão para o componente `commercialProposalService.test`.
 *
 * Responsabilidade delimitada conforme a arquitetura descrita em
 * `docs/ARQUITETURA.md`. Alterações neste arquivo devem preservar os contratos
 * documentados e ser acompanhadas por testes quando afetarem regras de negócio.
 *
 * @module tests/commercialProposalService.test
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  buildProposalFromApproach,
  buildProposalSummary,
  estimateTicketValue,
  inferServiceFocus,
  buildProposalPrompt,
  normalizeAiProposal
} = require('../src/services/commercialProposalService');

test('V21.2 cria proposta comercial simples a partir do lead', () => {
  const proposal = buildProposalFromApproach({
    lead: {
      placeId: 'lead-1',
      nome: 'Barbearia Elite',
      segmentoComercial: 'Barbearia',
      site: '',
      telefone: '11999999999',
      ticketEstimado: 'R$ 2.500',
      dores: ['não possui site próprio']
    },
    recommendation: {
      abordagem: 'Mensagem consultiva para a barbearia.',
      providerLabel: 'Groq',
      model: 'llama',
      strategy: { name: 'Consultiva' }
    }
  });

  assert.equal(proposal.leadName, 'Barbearia Elite');
  assert.match(proposal.title, /Barbearia Elite/);
  assert.match(proposal.text, /Diagnóstico inicial/);
  assert.match(proposal.text, /Mensagem consultiva/);
  assert.ok(proposal.deliverables.length >= 3);
});

test('V21.2 central de propostas resume propostas pela timeline', () => {
  const result = buildProposalSummary([
    {
      placeId: '1',
      nome: 'Lead A',
      status: 'PROPOSTA',
      ticketEstimado: 'R$ 2.000',
      interacoes: [{ tipo: 'PROPOSTA_GERADA', data: '2026-07-09T10:00:00.000Z', proposta: 'Proposta A' }]
    },
    {
      placeId: '2',
      nome: 'Lead B',
      status: 'FECHADO',
      ticketEstimado: 'R$ 3.000',
      interacoes: []
    }
  ]);

  assert.equal(result.summary.generated, 1);
  assert.equal(result.summary.inProposalStage, 1);
  assert.equal(result.summary.closed, 1);
  assert.equal(result.summary.estimatedRevenue, 5000);
  assert.equal(result.proposals[0].leadName, 'Lead A');
});

test('V21.2 estima ticket e foco de serviço sem linguagem técnica', () => {
  assert.equal(estimateTicketValue('R$ 1.800'), 1800);
  const focus = inferServiceFocus({ segmentoComercial: 'Clínica odontológica', site: '' });
  assert.match(focus.title, /confiança|contatos|presença/i);
  assert.ok(focus.deliverables.every((item) => !/SEO|CRM|landing page/i.test(item)));
});


test('V21.3 prompt de proposta orienta IA a falar simples com cliente nao tecnico', () => {
  const prompt = buildProposalPrompt({
    lead: { nome: 'Clínica Sorriso', segmentoComercial: 'Clínica odontológica', site: '', telefone: '11' },
    localProposal: { title: 'Proposta local', deliverables: ['Página profissional'] },
    recommendation: { abordagem: 'Mensagem inicial consultiva' },
    objective: 'gerar mais agendamentos'
  });

  assert.match(prompt, /não entende tecnologia/i);
  assert.match(prompt, /Retorne SOMENTE JSON válido/i);
  assert.match(prompt, /Clínica Sorriso/);
  assert.match(prompt, /mais agendamentos|mais clientes/i);
});

test('V21.3 proposta normalizada usa dados retornados pela IA e preserva provedor', () => {
  const proposal = normalizeAiProposal({
    lead: { placeId: 'lead-ia', nome: 'Pet Shop Bom Cuidado', segmentoComercial: 'Pet shop' },
    fallbackProposal: buildProposalFromApproach({ lead: { nome: 'Pet Shop Bom Cuidado' }, recommendation: {} }),
    aiResult: {
      source: 'ai',
      provider: 'groq',
      providerLabel: 'Groq',
      model: 'llama-3.3-70b-versatile',
      parsed: {
        title: 'Proposta simples para Pet Shop Bom Cuidado',
        objective: 'facilitar que clientes chamem no WhatsApp',
        diagnosis: 'A empresa pode tornar mais fácil o primeiro contato de novos clientes.',
        recommendedSolution: 'Organizar uma apresentação simples com botões de contato.',
        deliverables: ['Página clara de apresentação', 'Botões para WhatsApp', 'Informações principais organizadas'],
        estimatedRange: 'A definir após conversa rápida',
        nextStep: 'Marcar uma conversa de 10 minutos.',
        messageToSend: 'Posso te mostrar uma ideia simples?',
        commercialReasoning: ['A proposta fala em benefício direto para o cliente.']
      }
    }
  });

  assert.equal(proposal.provider, 'Groq');
  assert.equal(proposal.model, 'llama-3.3-70b-versatile');
  assert.match(proposal.text, /Motor usado/);
  assert.match(proposal.text, /Posso te mostrar/);
});
