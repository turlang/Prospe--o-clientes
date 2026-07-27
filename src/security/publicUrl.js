/**
 * @fileoverview Política de segurança `publicUrl` para validação de entradas e acesso a recursos externos.
 *
 * Responsabilidade delimitada conforme a arquitetura descrita em
 * `docs/ARQUITETURA.md`. Alterações neste arquivo devem preservar os contratos
 * documentados e ser acompanhadas por testes quando afetarem regras de negócio.
 *
 * @module src/security/publicUrl
 */

const dns = require('node:dns').promises;
const net = require('node:net');

const BLOCKED_HOST_SUFFIXES = ['.localhost', '.local', '.internal', '.home', '.lan'];
const MAX_REDIRECTS = 4;
const MAX_RESPONSE_BYTES = 1_500_000;

function normalizeHttpUrl(value) {
  const raw = String(value || '').trim();
  if (!raw) throw createUrlError('Informe uma URL válida.');

  const candidate = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  let url;
  try {
    url = new URL(candidate);
  } catch {
    throw createUrlError('A URL informada é inválida.');
  }

  if (!['http:', 'https:'].includes(url.protocol)) {
    throw createUrlError('Somente URLs HTTP ou HTTPS podem ser auditadas.');
  }

  if (url.username || url.password) {
    throw createUrlError('URLs com usuário ou senha não são permitidas.');
  }

  return url;
}

function createUrlError(message) {
  const error = new Error(message);
  error.code = 'UNSAFE_URL';
  error.statusCode = 400;
  return error;
}

function isBlockedHostname(hostname) {
  const host = String(hostname || '').trim().toLowerCase().replace(/\.$/, '');
  if (!host) return true;
  if (host === 'localhost' || host === 'localhost.localdomain') return true;
  return BLOCKED_HOST_SUFFIXES.some((suffix) => host.endsWith(suffix));
}

function parseIpv4(address) {
  const parts = String(address).split('.').map(Number);
  if (parts.length !== 4 || parts.some((part) => !Number.isInteger(part) || part < 0 || part > 255)) return null;
  return parts;
}

function isPrivateIpv4(address) {
  const octets = parseIpv4(address);
  if (!octets) return false;
  const [a, b] = octets;

  return (
    a === 0 ||
    a === 10 ||
    a === 127 ||
    (a === 100 && b >= 64 && b <= 127) ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 0) ||
    (a === 192 && b === 168) ||
    (a === 198 && (b === 18 || b === 19)) ||
    a >= 224
  );
}

function isPrivateIpv6(address) {
  const normalized = String(address || '').toLowerCase().split('%')[0];
  if (!normalized) return true;
  if (normalized === '::' || normalized === '::1') return true;
  if (normalized.startsWith('fc') || normalized.startsWith('fd')) return true;
  if (/^fe[89ab]/.test(normalized)) return true;
  if (normalized.startsWith('ff')) return true;

  const mapped = normalized.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
  if (mapped) return isPrivateIpv4(mapped[1]);

  return false;
}

function isPrivateIp(address) {
  const family = net.isIP(String(address || ''));
  if (family === 4) return isPrivateIpv4(address);
  if (family === 6) return isPrivateIpv6(address);
  return true;
}

async function assertPublicHttpUrl(value, { lookup = dns.lookup } = {}) {
  const url = value instanceof URL ? value : normalizeHttpUrl(value);
  const hostname = url.hostname.toLowerCase().replace(/\.$/, '');

  if (isBlockedHostname(hostname)) {
    throw createUrlError('Endereços locais ou internos não podem ser auditados.');
  }

  if (net.isIP(hostname)) {
    if (isPrivateIp(hostname)) throw createUrlError('Endereços IP privados ou reservados não podem ser auditados.');
    return url;
  }

  let addresses;
  try {
    addresses = await lookup(hostname, { all: true, verbatim: true });
  } catch {
    throw createUrlError('Não foi possível resolver o domínio informado.');
  }

  if (!Array.isArray(addresses) || !addresses.length) {
    throw createUrlError('O domínio informado não possui um endereço público válido.');
  }

  if (addresses.some((entry) => isPrivateIp(entry.address))) {
    throw createUrlError('O domínio informado aponta para uma rede privada ou reservada.');
  }

  return url;
}

async function fetchPublicHttpUrl(value, options = {}) {
  const {
    lookup,
    maxRedirects = MAX_REDIRECTS,
    ...fetchOptions
  } = options;

  let currentUrl = await assertPublicHttpUrl(value, { lookup });

  for (let redirectCount = 0; redirectCount <= maxRedirects; redirectCount += 1) {
    const response = await fetch(currentUrl, { ...fetchOptions, redirect: 'manual' });

    if (![301, 302, 303, 307, 308].includes(response.status)) return response;

    const location = response.headers.get('location');
    if (!location) return response;
    if (redirectCount === maxRedirects) throw createUrlError('O site excedeu o limite seguro de redirecionamentos.');

    currentUrl = await assertPublicHttpUrl(new URL(location, currentUrl), { lookup });
  }

  throw createUrlError('Não foi possível acessar o endereço informado.');
}

async function readResponseTextLimited(response, maxBytes = MAX_RESPONSE_BYTES) {
  if (!response.body || typeof response.body.getReader !== 'function') {
    const text = await response.text();
    if (Buffer.byteLength(text, 'utf8') > maxBytes) throw createUrlError('A página é grande demais para auditoria automática.');
    return text;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let total = 0;
  let text = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > maxBytes) {
      await reader.cancel();
      throw createUrlError('A página é grande demais para auditoria automática.');
    }
    text += decoder.decode(value, { stream: true });
  }

  text += decoder.decode();
  return text;
}

module.exports = {
  assertPublicHttpUrl,
  fetchPublicHttpUrl,
  isBlockedHostname,
  isPrivateIp,
  normalizeHttpUrl,
  readResponseTextLimited
};
