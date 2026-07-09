const test = require('node:test');
const assert = require('node:assert/strict');
const {
  buildProposalFromApproach,
  buildProposalSummary,
  estimateTicketValue,
  inferServiceFocus
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
