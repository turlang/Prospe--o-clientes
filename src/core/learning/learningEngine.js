/**
 * @fileoverview Componente do núcleo Sales OS `learningEngine`, independente da camada de apresentação.
 *
 * Responsabilidade delimitada conforme a arquitetura descrita em
 * `docs/ARQUITETURA.md`. Alterações neste arquivo devem preservar os contratos
 * documentados e ser acompanhadas por testes quando afetarem regras de negócio.
 *
 * @module src/core/learning/learningEngine
 */

function normalizeOutcome(value) {
  const outcome = String(value || '').trim().toLowerCase();
  if (['won', 'fechado', 'ganho', 'success'].includes(outcome)) return 'won';
  if (['lost', 'perdido', 'sem_interesse', 'failure'].includes(outcome)) return 'lost';
  return 'open';
}

function buildLearningSummary(events = []) {
  const rows = Array.isArray(events) ? events : [];
  const grouped = new Map();
  for (const event of rows) {
    const segment = String(event.segment || 'geral').trim().toLowerCase();
    const strategy = String(event.strategy || 'não informada').trim().toLowerCase();
    const key = `${segment}::${strategy}`;
    const current = grouped.get(key) || { segment, strategy, total: 0, won: 0, lost: 0, open: 0 };
    current.total += 1;
    current[normalizeOutcome(event.outcome)] += 1;
    grouped.set(key, current);
  }
  return [...grouped.values()]
    .map((item) => ({ ...item, winRate: item.total ? Math.round((item.won / item.total) * 100) : 0 }))
    .sort((a, b) => b.winRate - a.winRate || b.total - a.total);
}

function recommendStrategy(events = [], segment = '') {
  const normalizedSegment = String(segment || '').trim().toLowerCase();
  const summary = buildLearningSummary(events)
    .filter((item) => !normalizedSegment || item.segment === normalizedSegment || item.segment === 'geral');
  return summary[0] || { segment: normalizedSegment || 'geral', strategy: 'consultiva', total: 0, won: 0, lost: 0, open: 0, winRate: 0 };
}

module.exports = { buildLearningSummary, recommendStrategy, normalizeOutcome };
