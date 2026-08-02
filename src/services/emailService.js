/**
 * @fileoverview Envio de e-mails transacionais da aplicação.
 *
 * @module src/services/emailService
 */

const { isProduction } = require('./passwordRecoveryService');

const RESEND_ENDPOINT = 'https://api.resend.com/emails';
const DEFAULT_DEVELOPMENT_FROM = 'LeadHunter Pro <onboarding@resend.dev>';
const INVALID_PRODUCTION_DOMAINS = new Set(['leadhunter.local', 'seudominio.com', 'example.com', 'seu-dominio-verificado.com']);

function escapeHtml(value) {
  return String(value || '').replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  })[character]);
}

function extractEmailAddress(value) {
  const text = String(value || '').trim();
  const bracketMatch = text.match(/<([^<>]+)>/);
  return String(bracketMatch?.[1] || text).trim().toLowerCase();
}

function getSenderDomain(value) {
  const address = extractEmailAddress(value);
  return address.includes('@') ? address.split('@').pop() : '';
}

function getPasswordResetEmailStatus() {
  const apiKey = String(process.env.RESEND_API_KEY || '').trim();
  const from = String(process.env.MAIL_FROM || '').trim() || DEFAULT_DEVELOPMENT_FROM;
  const senderDomain = getSenderDomain(from);
  const production = isProduction();

  if (!apiKey) {
    return {
      available: !production,
      configured: false,
      provider: production ? 'unavailable' : 'development_log',
      from,
      reason: production ? 'RESEND_API_KEY não configurada.' : 'E-mail será registrado no terminal.'
    };
  }

  if (!senderDomain) {
    return {
      available: false,
      configured: false,
      provider: 'resend',
      from,
      reason: 'MAIL_FROM não contém um endereço de e-mail válido.'
    };
  }

  if (production && (senderDomain === 'resend.dev' || INVALID_PRODUCTION_DOMAINS.has(senderDomain))) {
    return {
      available: false,
      configured: false,
      provider: 'resend',
      from,
      reason: 'MAIL_FROM deve usar um domínio verificado no Resend.'
    };
  }

  return {
    available: true,
    configured: true,
    provider: 'resend',
    from,
    reason: ''
  };
}

function createDeliveryError(message, code = 'EMAIL_DELIVERY_FAILED') {
  const error = new Error(message);
  error.code = code;
  return error;
}

async function sendPasswordResetEmail({ email, resetUrl, requestId = '' }) {
  const status = getPasswordResetEmailStatus();
  const appName = String(process.env.APP_NAME || 'LeadHunter Pro').trim().slice(0, 100);
  const subject = `Redefinição de senha — ${appName}`;
  const safeAppName = escapeHtml(appName);
  const safeResetUrl = escapeHtml(resetUrl);
  const html = `
    <p>Olá,</p>
    <p>Recebemos uma solicitação para redefinir sua senha no ${safeAppName}.</p>
    <p><a href="${safeResetUrl}">Clique aqui para criar uma nova senha</a>.</p>
    <p>Este link expira em 30 minutos. Se você não solicitou, ignore este e-mail.</p>
  `;
  const text = [
    `Recebemos uma solicitação para redefinir sua senha no ${appName}.`,
    `Acesse: ${resetUrl}`,
    'Este link expira em 30 minutos. Se você não solicitou, ignore este e-mail.'
  ].join('\n\n');

  if (!status.available) {
    throw createDeliveryError(status.reason, 'EMAIL_NOT_CONFIGURED');
  }

  if (!status.configured) {
    console.log('[PASSWORD_RESET_LINK]', email, resetUrl);
    return { sent: false, provider: 'development_log' };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);

  try {
    const response = await fetch(RESEND_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
        ...(requestId ? { 'Idempotency-Key': String(requestId).slice(0, 256) } : {})
      },
      body: JSON.stringify({
        from: status.from,
        to: [email],
        subject,
        html,
        text
      }),
      signal: controller.signal
    });

    const payloadText = await response.text();
    let payload = {};
    try { payload = payloadText ? JSON.parse(payloadText) : {}; } catch { payload = {}; }

    if (!response.ok) {
      const providerMessage = payload?.message || payload?.error?.message || payloadText || `HTTP ${response.status}`;
      throw createDeliveryError(`Falha no Resend: ${providerMessage}`);
    }

    return {
      sent: true,
      provider: 'resend',
      messageId: payload.id || ''
    };
  } catch (error) {
    if (error?.name === 'AbortError') {
      throw createDeliveryError('O serviço de e-mail excedeu o tempo limite.');
    }
    if (error?.code) throw error;
    throw createDeliveryError(error?.message || 'Falha ao enviar e-mail de recuperação.');
  } finally {
    clearTimeout(timeout);
  }
}

module.exports = {
  getPasswordResetEmailStatus,
  sendPasswordResetEmail
};
