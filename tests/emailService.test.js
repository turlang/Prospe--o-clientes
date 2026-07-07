const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const authRoutes = fs.readFileSync('src/authRoutes.js', 'utf8');
const emailService = fs.readFileSync('src/services/emailService.js', 'utf8');

test('recuperação de senha usa serviço de e-mail modularizado', () => {
  assert.match(authRoutes, /require\('\.\/services\/emailService'\)/);
  assert.doesNotMatch(authRoutes, /async function sendPasswordResetEmail/);
});

test('serviço de e-mail está preparado para Resend', () => {
  assert.match(emailService, /RESEND_API_KEY/);
  assert.match(emailService, /api\.resend\.com\/emails/);
});
