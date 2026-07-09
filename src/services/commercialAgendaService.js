/**
 * commercialAgendaService.js
 * -----------------------------------------------------------------------------
 * Monta uma visão executiva da agenda comercial.
 *
 * A agenda não envia mensagens automaticamente. Ela organiza o trabalho do
 * vendedor em blocos claros: atrasadas, hoje, próximos dias e concluídas.
 */

function parseDate(value) {
  const date = new Date(value || 0);
  return Number.isNaN(date.getTime()) ? null : date;
}

function startOfDay(date = new Date()) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function endOfDay(date = new Date()) {
  const copy = new Date(date);
  copy.setHours(23, 59, 59, 999);
  return copy;
}

function addDays(date, days) {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + Number(days || 0));
  return copy;
}

function normalizePriority(priority) {
  const value = String(priority || '').trim().toUpperCase();
  if (['ALTA', 'URGENTE'].includes(value)) return 'ALTA';
  if (['BAIXA'].includes(value)) return 'BAIXA';
  return 'MÉDIA';
}

function priorityWeight(priority) {
  return ({ ALTA: 3, 'MÉDIA': 2, BAIXA: 1 })[normalizePriority(priority)] || 2;
}

function normalizeTask(task) {
  const due = parseDate(task.dueAt);
  return {
    ...task,
    priority: normalizePriority(task.priority),
    dueAt: due ? due.toISOString() : task.dueAt,
    dueTime: due ? due.getTime() : 0,
    done: Boolean(task.done)
  };
}

function sortTasks(tasks) {
  return [...tasks].sort((a, b) => {
    if (a.done !== b.done) return a.done ? 1 : -1;
    const priorityDiff = priorityWeight(b.priority) - priorityWeight(a.priority);
    if (priorityDiff !== 0) return priorityDiff;
    return Number(a.dueTime || 0) - Number(b.dueTime || 0);
  });
}

function buildAgendaSummary(tasks = [], now = new Date()) {
  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);
  const nextSevenDaysEnd = endOfDay(addDays(now, 7));

  const normalized = tasks.map(normalizeTask);
  const pending = normalized.filter((task) => !task.done);
  const completed = normalized.filter((task) => task.done);

  const overdue = pending.filter((task) => task.dueTime && task.dueTime < todayStart.getTime());
  const today = pending.filter((task) => task.dueTime >= todayStart.getTime() && task.dueTime <= todayEnd.getTime());
  const upcoming = pending.filter((task) => task.dueTime > todayEnd.getTime() && task.dueTime <= nextSevenDaysEnd.getTime());
  const later = pending.filter((task) => task.dueTime > nextSevenDaysEnd.getTime());

  const nextTask = sortTasks([...overdue, ...today, ...upcoming, ...later])[0] || null;
  const highPriority = pending.filter((task) => normalizePriority(task.priority) === 'ALTA').length;

  return {
    summary: {
      total: normalized.length,
      pending: pending.length,
      overdue: overdue.length,
      today: today.length,
      upcoming: upcoming.length,
      later: later.length,
      completed: completed.length,
      highPriority,
      nextTask
    },
    groups: {
      overdue: sortTasks(overdue),
      today: sortTasks(today),
      upcoming: sortTasks(upcoming),
      later: sortTasks(later),
      completed: sortTasks(completed).slice(0, 12)
    },
    generatedAt: now.toISOString()
  };
}

module.exports = {
  buildAgendaSummary,
  normalizePriority,
  parseDate,
  startOfDay,
  endOfDay
};
