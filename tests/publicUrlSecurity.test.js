/**
 * @fileoverview Testes automatizados de regressão para o componente `publicUrlSecurity.test`.
 *
 * Responsabilidade delimitada conforme a arquitetura descrita em
 * `docs/ARQUITETURA.md`. Alterações neste arquivo devem preservar os contratos
 * documentados e ser acompanhadas por testes quando afetarem regras de negócio.
 *
 * @module tests/publicUrlSecurity.test
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  assertPublicHttpUrl,
  isBlockedHostname,
  isPrivateIp,
  normalizeHttpUrl
} = require('../src/security/publicUrl');

test('normaliza domínio sem protocolo para HTTPS', () => {
  assert.equal(normalizeHttpUrl('example.com/path').href, 'https://example.com/path');
});

test('bloqueia hostnames locais e endereços privados/reservados', () => {
  assert.equal(isBlockedHostname('localhost'), true);
  assert.equal(isBlockedHostname('painel.internal'), true);
  assert.equal(isPrivateIp('127.0.0.1'), true);
  assert.equal(isPrivateIp('10.0.0.8'), true);
  assert.equal(isPrivateIp('192.168.1.20'), true);
  assert.equal(isPrivateIp('8.8.8.8'), false);
});

test('rejeita domínio que resolve para rede privada', async () => {
  await assert.rejects(
    () => assertPublicHttpUrl('https://empresa.test', {
      lookup: async () => [{ address: '192.168.0.10', family: 4 }]
    }),
    /rede privada ou reservada/
  );
});

test('aceita domínio que resolve apenas para endereço público', async () => {
  const url = await assertPublicHttpUrl('https://empresa.test/pagina', {
    lookup: async () => [{ address: '8.8.8.8', family: 4 }]
  });
  assert.equal(url.href, 'https://empresa.test/pagina');
});
