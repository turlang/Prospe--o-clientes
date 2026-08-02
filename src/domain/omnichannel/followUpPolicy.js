/**
 * @fileoverview Fundação omnichannel do LeadHunter: módulo src/domain/omnichannel/followUpPolicy.
 *
 * Responsabilidade isolada para conversas, integrações, agente SDR,
 * segurança ou validação deste domínio.
 * @module src/domain/omnichannel/followUpPolicy
 */

/** @module domain/omnichannel/followUpPolicy */

function normalizeSteps(steps = []) {
  return (Array.isArray(steps) ? steps : [])
    .map((step, index) => ({
      order: index + 1,
      delayMinutes: Math.max(1, Math.min(60 * 24 * 90, Number(step.delayMinutes || 0))),
      action: ['suggest_message', 'create_task', 'send_message', 'notify_human'].includes(step.action)
        ? step.action
        : 'create_task',
      template: String(step.template || '').trim().slice(0, 2000)
    }))
    .filter((step) => Number.isFinite(step.delayMinutes));
}

function nextExecutionAt(baseDate, step) {
  const date = new Date(baseDate || Date.now());
  if (Number.isNaN(date.getTime())) throw new TypeError('Data-base inválida.');
  date.setMinutes(date.getMinutes() + Number(step.delayMinutes || 0));
  return date;
}

function isWithinBusinessHours(date, schedule = {}) {
  const current = new Date(date || Date.now());
  const timezoneOffset = Number(schedule.timezoneOffsetMinutes || 0);
  const local = new Date(current.getTime() + timezoneOffset * 60_000);
  const weekday = local.getUTCDay();
  const allowedDays = Array.isArray(schedule.weekdays) ? schedule.weekdays : [1, 2, 3, 4, 5];
  if (!allowedDays.includes(weekday)) return false;
  const minutes = local.getUTCHours() * 60 + local.getUTCMinutes();
  const start = Number(schedule.startMinutes ?? 9 * 60);
  const end = Number(schedule.endMinutes ?? 18 * 60);
  return minutes >= start && minutes < end;
}

module.exports = { normalizeSteps, nextExecutionAt, isWithinBusinessHours };
