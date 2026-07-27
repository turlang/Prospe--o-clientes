/**
 * @fileoverview Utilitários seguros para geração de links e configuração da recuperação de senha.
 *
 * @module src/services/passwordRecoveryService
 */

const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '::1']);

function isProduction() {
  return String(process.env.NODE_ENV || '').trim().toLowerCase() === 'production';
}

function normalizeHttpOrigin(value) {
  const raw = String(value || '').trim();
  if (!raw) return '';

  const candidate = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;

  try {
    const url = new URL(candidate);
    if (!['http:', 'https:'].includes(url.protocol)) return '';
    return url.origin;
  } catch {
    return '';
  }
}

function isLocalOrigin(origin) {
  try {
    return LOCAL_HOSTS.has(new URL(origin).hostname.toLowerCase());
  } catch {
    return false;
  }
}

function requestOrigin(req) {
  const forwardedProto = String(req.headers?.['x-forwarded-proto'] || '')
    .split(',')[0]
    .trim();
  const forwardedHost = String(req.headers?.['x-forwarded-host'] || '')
    .split(',')[0]
    .trim();
  const protocol = forwardedProto || req.protocol || 'http';
  const host = forwardedHost || req.get?.('host') || req.headers?.host || '';
  return normalizeHttpOrigin(`${protocol}://${host}`);
}

/**
 * Resolve a origem pública usada no e-mail. Em produção, valores localhost são
 * ignorados para impedir que o usuário receba links inutilizáveis.
 */
function resolvePublicAppUrl(req) {
  const candidates = [
    process.env.PUBLIC_APP_URL,
    process.env.RENDER_EXTERNAL_URL,
    process.env.VERCEL_PROJECT_PRODUCTION_URL,
    requestOrigin(req)
  ];

  for (const candidate of candidates) {
    const origin = normalizeHttpOrigin(candidate);
    if (!origin) continue;
    if (isProduction() && isLocalOrigin(origin)) continue;
    return origin;
  }

  throw new Error('Não foi possível determinar a URL pública da aplicação. Configure PUBLIC_APP_URL.');
}

function shouldExposeDevelopmentResetLink() {
  return !isProduction()
    && String(process.env.EXPOSE_PASSWORD_RESET_LINK || '').trim().toLowerCase() === 'true';
}

module.exports = {
  isProduction,
  normalizeHttpOrigin,
  resolvePublicAppUrl,
  shouldExposeDevelopmentResetLink
};
