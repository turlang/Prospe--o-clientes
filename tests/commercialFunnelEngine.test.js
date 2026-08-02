/**
 * @fileoverview Testes do motor de inteligência comercial e automação do funil.
 * @module tests/commercialFunnelEngine.test
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  auditLeadContacts,
  buildHyperHumanApproach,
  buildPracticalDiagnosis,
  buildNextTaskPlan,
  buildCommercialEngineOutput,
  sanitizeCommercialLanguage,
  validateHumanCommercialMessage
} = require('../src/services/commercialFunnelEngine');

test('abordagem segue gancho pelo celular, consequência e chamada de baixo atrito', () => {
  const result = buildHyperHumanApproach({
    nome: 'Clínica Sorriso',
    segmentoComercial: 'dentist',
    telefone: '(11) 98888-7777',
    site: ''
  }, { variationSeed: 'humanizada-1' });

  assert.match(result.message, /celular/i);
  assert.match(result.message, /concorrente|outra empresa/i);
  assert.match(result.message, /Posso te mandar o print|Posso te mostrar/i);
  assert.doesNotMatch(result.message, /\bdentist\b|presença digital|SEO|landing page|CRM|automação|funil/i);
  assert.equal(result.validation.valid, true);
});

test('auditoria prioriza WhatsApp sem afirmar que o número está ativo', () => {
  const status = auditLeadContacts({ telefone: '(11) 98888-7777' });
  assert.equal(status.canalPrioritario, 'WHATSAPP');
  assert.equal(status.whatsapp.disponivel, true);
  assert.equal(status.whatsapp.verificadoAtivo, false);
  assert.match(status.whatsapp.observacao, /Confirme o recebimento/i);
});

test('auditoria usa e-mail ou rede social quando WhatsApp não existe', () => {
  const emailStatus = auditLeadContacts({ email: 'contato@empresa.com' });
  assert.equal(emailStatus.canalPrioritario, 'EMAIL');

  const socialStatus = auditLeadContacts({
    auditoriaSite: { redesSociais: [{ plataforma: 'Instagram', urls: ['https://instagram.com/empresa'] }] }
  });
  assert.equal(socialStatus.canalPrioritario, 'REDE_SOCIAL');
});

test('diagnóstico traduz achado em impacto e solução comercial simples', () => {
  const diagnosis = buildPracticalDiagnosis({ nome: 'Loja Local', site: '', telefone: '' });
  assert.ok(diagnosis.pontos.length >= 1);
  assert.match(diagnosis.pontos[0].impacto, /outra empresa|desistir|segurança/i);
  assert.match(diagnosis.pontos[0].solucao, /WhatsApp|página profissional/i);
});

test('etapas criam tarefas práticas com referência de preço e reunião curta', () => {
  const plan = buildNextTaskPlan({
    lead: { nome: 'Empresa Teste', status: 'INTERESSADO' },
    status: 'INTERESSADO',
    intent: 'PRECO',
    now: '2026-07-27T12:00:00.000Z'
  });
  assert.equal(plan.automationType, 'FUNIL_DIAGNOSTICO');
  assert.equal(plan.durationMinutes, 15);
  assert.equal(plan.referencePrice, 'a partir de R$ 300');
  assert.match(plan.message, /R\$ 300/);
});

test('saída do motor contém os três blocos obrigatórios', () => {
  const output = buildCommercialEngineOutput({
    lead: { nome: 'Barbearia Central', telefone: '11999999999', status: 'NOVO' }
  });
  assert.ok(output.mensagemAbordagemSugerida);
  assert.ok(output.statusContatos.canalPrioritario);
  assert.ok(output.proximaAcaoFunil.acao);
  assert.equal(output.proximaAcaoFunil.agendaUrl, 'https://prospe-o-clientes.onrender.com/app');
});

test('sanitização troca jargões e palavras estrangeiras', () => {
  const sanitized = sanitizeCommercialLanguage('SEO e landing page para dentist com automação de CRM, website, feedback e follow-up');
  assert.doesNotMatch(sanitized, /SEO|landing page|\bdentist\b|automação|\bCRM\b|website|feedback|follow-up/i);
  assert.match(sanitized, /dentista/);
  assert.equal(validateHumanCommercialMessage(`${sanitized}. Posso te mandar o print do que vi?`).valid, true);
});
