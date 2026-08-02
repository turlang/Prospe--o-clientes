/**
 * @fileoverview Testes automatizados de regressão para o componente `emailService.test`.
 *
 * Responsabilidade delimitada conforme a arquitetura descrita em
 * `docs/ARQUITETURA.md`. Alterações neste arquivo devem preservar os contratos
 * documentados e ser acompanhadas por testes quando afetarem regras de negócio.
 *
 * @module tests/emailService.test
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const authRoutes = fs.readFileSync('src/routes/authRoutes.js', 'utf8');
const emailService = fs.readFileSync('src/services/emailService.js', 'utf8');

test('recuperação de senha usa serviço de e-mail modularizado', () => {
  assert.match(authRoutes, /require\('..\/services\/emailService'\)/);
  assert.doesNotMatch(authRoutes, /async function sendPasswordResetEmail/);
});

test('serviço de e-mail está preparado para Resend', () => {
  assert.match(emailService, /RESEND_API_KEY/);
  assert.match(emailService, /api\.resend\.com\/emails/);
  assert.match(emailService, /Idempotency-Key/);
  assert.match(emailService, /AbortController/);
});
