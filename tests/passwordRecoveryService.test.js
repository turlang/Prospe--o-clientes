/**
 * @fileoverview Testes da geração de URL pública e configuração do e-mail de recuperação.
 *
 * @module tests/passwordRecoveryService.test
 */

const test = require('node:test');
const assert = require('node:assert/strict');

const {
  normalizeHttpOrigin,
  resolvePublicAppUrl,
  shouldExposeDevelopmentResetLink
} = require('../src/services/passwordRecoveryService');
const {
  getPasswordResetEmailStatus,
  sendPasswordResetEmail
} = require('../src/services/emailService');

function preserveEnv(names) {
  const snapshot = Object.fromEntries(names.map((name) => [name, process.env[name]]));
  return () => {
    for (const [name, value] of Object.entries(snapshot)) {
      if (value === undefined) delete process.env[name];
      else process.env[name] = value;
    }
  };
}

function fakeRequest({ protocol = 'https', host = 'app.exemplo.com', headers = {} } = {}) {
  return {
    protocol,
    headers,
    get(name) { return String(name).toLowerCase() === 'host' ? host : ''; }
  };
}

test('normaliza somente origens HTTP e remove caminhos adicionais', () => {
  assert.equal(normalizeHttpOrigin('app.exemplo.com/reset'), 'https://app.exemplo.com');
  assert.equal(normalizeHttpOrigin('javascript:alert(1)'), '');
});

test('produção ignora PUBLIC_APP_URL local e usa o host público do proxy', () => {
  const restore = preserveEnv(['NODE_ENV', 'PUBLIC_APP_URL', 'RENDER_EXTERNAL_URL', 'VERCEL_PROJECT_PRODUCTION_URL']);
  try {
    process.env.NODE_ENV = 'production';
    process.env.PUBLIC_APP_URL = 'http://localhost:3000';
    delete process.env.RENDER_EXTERNAL_URL;
    delete process.env.VERCEL_PROJECT_PRODUCTION_URL;

    const req = fakeRequest({
      protocol: 'http',
      host: 'interno:3000',
      headers: {
        'x-forwarded-proto': 'https',
        'x-forwarded-host': 'prospeccao.onrender.com'
      }
    });

    assert.equal(resolvePublicAppUrl(req), 'https://prospeccao.onrender.com');
  } finally {
    restore();
  }
});

test('produção sinaliza quando Resend ou remetente verificado não estão configurados', () => {
  const restore = preserveEnv(['NODE_ENV', 'RESEND_API_KEY', 'MAIL_FROM']);
  try {
    process.env.NODE_ENV = 'production';
    delete process.env.RESEND_API_KEY;
    process.env.MAIL_FROM = 'LeadHunter Pro <noreply@seudominio.com>';
    assert.equal(getPasswordResetEmailStatus().available, false);

    process.env.RESEND_API_KEY = 're_teste';
    assert.equal(getPasswordResetEmailStatus().available, false);
  } finally {
    restore();
  }
});

test('desenvolvimento pode expor o link somente quando habilitado explicitamente', () => {
  const restore = preserveEnv(['NODE_ENV', 'EXPOSE_PASSWORD_RESET_LINK']);
  try {
    process.env.NODE_ENV = 'development';
    process.env.EXPOSE_PASSWORD_RESET_LINK = 'true';
    assert.equal(shouldExposeDevelopmentResetLink(), true);

    process.env.NODE_ENV = 'production';
    assert.equal(shouldExposeDevelopmentResetLink(), false);
  } finally {
    restore();
  }
});

test('envio pelo Resend usa remetente configurado, texto alternativo e idempotência', async () => {
  const restore = preserveEnv(['NODE_ENV', 'RESEND_API_KEY', 'MAIL_FROM', 'APP_NAME']);
  const originalFetch = global.fetch;
  let request;

  try {
    process.env.NODE_ENV = 'production';
    process.env.RESEND_API_KEY = 're_teste';
    process.env.MAIL_FROM = 'LeadHunter Pro <noreply@empresa.com.br>';
    process.env.APP_NAME = 'LeadHunter Pro';

    global.fetch = async (url, options) => {
      request = { url, options };
      return {
        ok: true,
        status: 200,
        async text() { return JSON.stringify({ id: 'email_123' }); }
      };
    };

    const result = await sendPasswordResetEmail({
      email: 'usuario@example.net',
      resetUrl: 'https://app.exemplo.com/reset-password.html?token=abc',
      requestId: 'password-reset-123'
    });

    const body = JSON.parse(request.options.body);
    assert.equal(request.url, 'https://api.resend.com/emails');
    assert.equal(request.options.headers['Idempotency-Key'], 'password-reset-123');
    assert.equal(body.from, process.env.MAIL_FROM);
    assert.deepEqual(body.to, ['usuario@example.net']);
    assert.match(body.text, /https:\/\/app\.exemplo\.com\/reset-password\.html/);
    assert.equal(result.messageId, 'email_123');
  } finally {
    global.fetch = originalFetch;
    restore();
  }
});
