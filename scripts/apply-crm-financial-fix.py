from pathlib import Path


def replace_once(path, old, new, already_present):
    file = Path(path)
    text = file.read_text(encoding='utf-8')
    if already_present in text:
        return
    if old not in text:
        raise SystemExit(f'Bloco esperado não encontrado em {path}')
    file.write_text(text.replace(old, new, 1), encoding='utf-8')


replace_once(
    'src/services/crmAdvancedService.js',
    """function normalizeMoney(value) {
  if (typeof value === 'number') return Number.isFinite(value) ? Math.max(0, value) : 0;
  const text = String(value || '').trim();
  if (!text) return 0;
  const normalized = text
    .replace(/R\$/gi, '')
    .replace(/\s+/g, '')
    .replace(/\.(?=\d{3}(?:\D|$))/g, '')
    .replace(',', '.');
  const number = Number(normalized.replace(/[^0-9.-]/g, ''));
  return Number.isFinite(number) ? Math.max(0, number) : 0;
}
""",
    """function parseMoneyToken(value) {
  let text = String(value || '').trim().replace(/[^0-9.,]/g, '');
  if (!text) return 0;

  const lastComma = text.lastIndexOf(',');
  const lastDot = text.lastIndexOf('.');

  if (lastComma >= 0 && lastDot >= 0) {
    if (lastComma > lastDot) text = text.replace(/\./g, '').replace(',', '.');
    else text = text.replace(/,/g, '');
  } else if (lastComma >= 0) {
    const decimalDigits = text.length - lastComma - 1;
    text = decimalDigits > 0 && decimalDigits <= 2
      ? text.replace(/\./g, '').replace(',', '.')
      : text.replace(/,/g, '');
  } else if (lastDot >= 0) {
    const dotCount = (text.match(/\./g) || []).length;
    const decimalDigits = text.length - lastDot - 1;
    if (dotCount > 1 || decimalDigits === 3) text = text.replace(/\./g, '');
  }

  const number = Number(text);
  return Number.isFinite(number) ? Math.max(0, number) : 0;
}

function normalizeMoney(value) {
  if (typeof value === 'number') return Number.isFinite(value) ? Math.max(0, value) : 0;
  const text = String(value || '').trim();
  if (!text) return 0;

  const tokens = text.match(/\d[\d.,]*/g) || [];
  const amounts = tokens.map(parseMoneyToken).filter((amount) => Number.isFinite(amount) && amount >= 0);
  if (!amounts.length) return 0;

  const isRange = amounts.length >= 2 && /(?:\bentre\b.*\be\b|\b(?:a|até|ate)\b|[-–—])/i.test(text);
  if (isRange) return Math.round(((amounts[0] + amounts[1]) / 2) * 100) / 100;

  return amounts[0];
}
""",
    'function parseMoneyToken(value)'
)

replace_once(
    'public/assets/dashboard/app.js',
    "function estimateTicket(value) { const text = String(value || '0').replace(/\\./g, '').replace(',', '.'); const match = text.match(/\\d+(?:\\.\\d+)?/); return match ? Number(match[0]) : 0; }",
    """function parseUiMoneyToken(value) {
  let text = String(value || '').trim().replace(/[^0-9.,]/g, '');
  if (!text) return 0;
  const lastComma = text.lastIndexOf(',');
  const lastDot = text.lastIndexOf('.');
  if (lastComma >= 0 && lastDot >= 0) {
    text = lastComma > lastDot ? text.replace(/\./g, '').replace(',', '.') : text.replace(/,/g, '');
  } else if (lastComma >= 0) {
    const decimals = text.length - lastComma - 1;
    text = decimals > 0 && decimals <= 2 ? text.replace(/\./g, '').replace(',', '.') : text.replace(/,/g, '');
  } else if (lastDot >= 0) {
    const dots = (text.match(/\./g) || []).length;
    if (dots > 1 || text.length - lastDot - 1 === 3) text = text.replace(/\./g, '');
  }
  const number = Number(text);
  return Number.isFinite(number) ? Math.max(0, number) : 0;
}
function estimateTicket(value) {
  if (typeof value === 'number') return Number.isFinite(value) ? Math.max(0, value) : 0;
  const text = String(value || '').trim();
  const amounts = (text.match(/\d[\d.,]*/g) || []).map(parseUiMoneyToken).filter(Number.isFinite);
  if (!amounts.length) return 0;
  const isRange = amounts.length >= 2 && /(?:\bentre\b.*\be\b|\b(?:a|até|ate)\b|[-–—])/i.test(text);
  return isRange ? (amounts[0] + amounts[1]) / 2 : amounts[0];
}""",
    'function parseUiMoneyToken(value)'
)

app = Path('public/assets/dashboard/app.js')
text = app.read_text(encoding='utf-8')
text = text.replace(
    '${formatMoney(Number(lead.contractValue || lead.ticketEstimado || 0))}',
    '${formatMoney(estimateTicket(lead.contractValue || lead.ticketEstimado || 0))}'
)
text = text.replace(
    '${formatMoney(Number(lead.monthlyRecurringRevenue || 0))}/mês',
    '${formatMoney(estimateTicket(lead.monthlyRecurringRevenue || 0))}/mês'
)
text = text.replace(
    'class="secondary mini" onclick="openLeadDetail',
    'class="secondary mini crm-open-button" onclick="openLeadDetail'
)
app.write_text(text, encoding='utf-8')

css = Path('public/assets/dashboard/css/40-views.css')
text = css.read_text(encoding='utf-8')
if '.crm-open-button {' not in text:
    needle = '.crm-table td small { color: var(--text-muted); }\n'
    addition = """.crm-table td small { color: var(--text-muted); }
.crm-table th:nth-child(4),
.crm-table td:nth-child(4) { min-width: 220px; }
.crm-table th:last-child,
.crm-table td:last-child { width: 86px; min-width: 86px; text-align: center; }
.crm-open-button { min-width: 68px; white-space: nowrap; word-break: normal; }
"""
    if needle not in text:
        raise SystemExit('Ponto de inserção CSS não encontrado')
    text = text.replace(needle, addition, 1)
css.write_text(text, encoding='utf-8')

service_tests = Path('tests/crmAdvancedService.test.js')
text = service_tests.read_text(encoding='utf-8')
if 'faixas monetárias usam o ponto médio' not in text:
    anchor = "test('previsão inclui receita ponderada, MRR e progresso de metas', () => {\n"
    addition = """test('faixas monetárias usam o ponto médio sem concatenar os extremos', () => {
  const config = createDefaultCrmConfiguration();
  const forecast = buildForecast([
    { status: 'NOVO', pipelineId: 'sales', ticketEstimado: 'R$ 3.000 a R$ 15.000' },
    { status: 'CONTATADO', pipelineId: 'sales', ticketEstimado: 'R$ 800 a R$ 5.000' }
  ], config, new Date('2026-08-15T12:00:00.000Z'));

  assert.equal(forecast.pipelineRevenue, 11900);
  assert.equal(forecast.weightedRevenue, 1184);
});

"""
    if anchor not in text:
        raise SystemExit('Ponto de inserção do teste financeiro não encontrado')
    text = text.replace(anchor, addition + anchor, 1)
service_tests.write_text(text, encoding='utf-8')

frontend_tests = Path('tests/crmMilestone2Frontend.test.js')
text = frontend_tests.read_text(encoding='utf-8')
if 'lista do CRM trata faixas monetárias' not in text:
    text += """

test('lista do CRM trata faixas monetárias e preserva o botão de ação', () => {
  assert.match(js, /function estimateTicket/);
  assert.match(js, /isRange/);
  assert.match(js, /crm-open-button/);
  assert.match(css, /\.crm-open-button/);
});
"""
frontend_tests.write_text(text, encoding='utf-8')
