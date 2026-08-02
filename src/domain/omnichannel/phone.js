/**
 * @fileoverview Fundação omnichannel do LeadHunter: módulo src/domain/omnichannel/phone.
 *
 * Responsabilidade isolada para conversas, integrações, agente SDR,
 * segurança ou validação deste domínio.
 * @module src/domain/omnichannel/phone
 */

/** @module domain/omnichannel/phone */

function normalizePhone(value, defaultCountryCode = '55') {
  let digits = String(value || '').replace(/\D/g, '');
  if (!digits) return '';

  if (digits.startsWith('00')) digits = digits.slice(2);
  if (digits.length === 10 || digits.length === 11) digits = `${defaultCountryCode}${digits}`;
  if (digits.length < 10 || digits.length > 15) return '';

  return `+${digits}`;
}

function phoneLookupKeys(value) {
  const normalized = normalizePhone(value);
  if (!normalized) return [];
  const digits = normalized.slice(1);
  const keys = new Set([normalized, digits]);
  if (digits.startsWith('55')) keys.add(digits.slice(2));
  return [...keys];
}

module.exports = { normalizePhone, phoneLookupKeys };
