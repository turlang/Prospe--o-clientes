/**
 * @fileoverview Controlador do painel administrativo para usuários, planos, auditoria e pagamentos.
 *
 * Responsabilidade delimitada conforme a arquitetura descrita em
 * `docs/ARQUITETURA.md`. Alterações neste arquivo devem preservar os contratos
 * documentados e ser acompanhadas por testes quando afetarem regras de negócio.
 *
 * @module public/admin
 */

// -----------------------------------------------------------------------------
// Estado administrativo e inicialização
// -----------------------------------------------------------------------------
const adminToken = localStorage.getItem('authToken') || '';
const adminStats = document.querySelector('#adminStats');
const adminUsers = document.querySelector('#adminUsers');
const adminPayments = document.querySelector('#adminPayments');
const adminSecurity = document.querySelector('#adminSecurity');
const adminPlans = document.querySelector('#adminPlans');
const adminAudit = document.querySelector('#adminAudit');
const adminStatus = document.querySelector('#adminStatus');
const adminSearch = document.querySelector('#adminSearch');
const revenueChart = document.querySelector('#revenueChart');
const planChart = document.querySelector('#planChart');
const usageChart = document.querySelector('#usageChart');
const growthChart = document.querySelector('#growthChart');

if (!adminToken) {
  window.location.replace('/app');
}

document.querySelector('#adminLogout').addEventListener('click', () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('currentUser');
  window.location.replace('/');
});

document.querySelector('#adminReloadBtn').addEventListener('click', loadAdmin);
document.querySelector('#adminSearchBtn').addEventListener('click', () => loadUsers(adminSearch.value));
document.querySelector('#adminClearSearchBtn').addEventListener('click', () => { adminSearch.value = ''; loadUsers(); });
adminSearch.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') loadUsers(adminSearch.value);
});

function adminFetch(url, options = {}) {
  return fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${adminToken}`
    }
  });
}

async function readJson(response) {
  const text = await response.text();
  return text ? JSON.parse(text) : {};
}

function money(value) {
  return Number(value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function number(value, decimals = 0) {
  return Number(value || 0).toLocaleString('pt-BR', { maximumFractionDigits: decimals });
}

function formatPercent(value) {
  return `${Number(value || 0).toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%`;
}

function safeSeries(items, key = 'value') {
  return (Array.isArray(items) ? items : []).map((item) => ({ ...item, [key]: Number(item[key] || 0) }));
}

function lineChart(items, labelKey, valueKey, formatter = number) {
  const data = safeSeries(items, valueKey);
  if (!data.length || data.every((item) => item[valueKey] === 0)) return '<div class="chart-empty">Ainda não há dados suficientes.</div>';
  const width = 720; const height = 220; const padX = 42; const padY = 24;
  const max = Math.max(...data.map((item) => item[valueKey]), 1);
  const points = data.map((item, index) => {
    const x = padX + (index * (width - padX * 2)) / Math.max(data.length - 1, 1);
    const y = height - padY - (item[valueKey] / max) * (height - padY * 2);
    return { x, y, item };
  });
  const polyline = points.map((point) => `${point.x},${point.y}`).join(' ');
  const area = `${padX},${height-padY} ${polyline} ${width-padX},${height-padY}`;
  const labels = points.filter((_, index) => index % Math.max(Math.ceil(points.length / 6), 1) === 0 || index === points.length - 1).map((point) => `<text x="${point.x}" y="213" text-anchor="middle" fill="#71869f" font-size="10">${escapeHtml(shortLabel(point.item[labelKey]))}</text>`).join('');
  const dots = points.map((point) => `<circle cx="${point.x}" cy="${point.y}" r="3.5" fill="#38bdf8"><title>${escapeHtml(String(point.item[labelKey]))}: ${escapeHtml(formatter(point.item[valueKey]))}</title></circle>`).join('');
  return `<svg class="chart-svg" viewBox="0 0 ${width} ${height}" role="img"><defs><linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#38bdf8" stop-opacity=".38"/><stop offset="1" stop-color="#38bdf8" stop-opacity=".02"/></linearGradient></defs><line x1="${padX}" y1="${height-padY}" x2="${width-padX}" y2="${height-padY}" stroke="#20364e"/><polygon points="${area}" fill="url(#chartFill)"/><polyline points="${polyline}" fill="none" stroke="#38bdf8" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>${dots}${labels}</svg>`;
}

function barChart(items, labelKey, valueKey, formatter = number) {
  const data = safeSeries(items, valueKey);
  if (!data.length || data.every((item) => item[valueKey] === 0)) return '<div class="chart-empty">Ainda não há dados suficientes.</div>';
  const width=720, height=220, padX=35, padY=27, gap=12;
  const max=Math.max(...data.map((item)=>item[valueKey]),1);
  const barWidth=Math.max(12,(width-padX*2-gap*(data.length-1))/data.length);
  const bars=data.map((item,index)=>{const h=(item[valueKey]/max)*(height-padY*2);const x=padX+index*(barWidth+gap);const y=height-padY-h;return `<rect x="${x}" y="${y}" width="${barWidth}" height="${h}" rx="6" fill="#22c55e"><title>${escapeHtml(String(item[labelKey]))}: ${escapeHtml(formatter(item[valueKey]))}</title></rect><text x="${x+barWidth/2}" y="213" text-anchor="middle" fill="#71869f" font-size="10">${escapeHtml(shortLabel(item[labelKey]))}</text>`}).join('');
  return `<svg class="chart-svg" viewBox="0 0 ${width} ${height}" role="img"><line x1="${padX}" y1="${height-padY}" x2="${width-padX}" y2="${height-padY}" stroke="#20364e"/>${bars}</svg>`;
}

function donutChart(items) {
  const data=safeSeries(items,'value'); const total=data.reduce((sum,item)=>sum+item.value,0);
  if (!total) return '<div class="chart-empty">Nenhum usuário cadastrado.</div>';
  const colors=['#38bdf8','#22c55e','#a78bfa']; let offset=0;
  const circles=data.map((item,index)=>{const portion=item.value/total;const dash=portion*251.2;const circle=`<circle cx="110" cy="110" r="40" fill="none" stroke="${colors[index%colors.length]}" stroke-width="24" stroke-dasharray="${dash} ${251.2-dash}" stroke-dashoffset="${-offset}" transform="rotate(-90 110 110)"><title>${escapeHtml(item.label)}: ${item.value}</title></circle>`;offset+=dash;return circle}).join('');
  const legend=data.map((item,index)=>`<span><i style="background:${colors[index%colors.length]}"></i>${escapeHtml(item.label)}: <strong>${item.value}</strong></span>`).join('');
  return `<svg class="chart-svg" viewBox="0 0 220 220" role="img">${circles}<text x="110" y="105" text-anchor="middle" fill="#94a3b8" font-size="12">Usuários</text><text x="110" y="128" text-anchor="middle" fill="#fff" font-size="24" font-weight="800">${total}</text></svg><div class="legend">${legend}</div>`;
}

function shortLabel(value) {
  const text=String(value || '');
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text.slice(8,10)+'/'+text.slice(5,7);
  if (/^\d{4}-\d{2}$/.test(text)) return text.slice(5,7)+'/'+text.slice(2,4);
  return text.length>10?text.slice(0,9)+'…':text;
}

function renderAdminCharts(charts) {
  revenueChart.innerHTML = barChart(charts.revenueMonthly, 'month', 'value', money);
  planChart.innerHTML = donutChart(charts.planDistribution);
  usageChart.innerHTML = lineChart(charts.usageDaily, 'day', 'count', number);
  growthChart.innerHTML = barChart(charts.userGrowthMonthly, 'month', 'value', number);
}

function date(value) {
  return value ? new Date(value).toLocaleString('pt-BR') : '-';
}

function escapeHtml(value) {
  return String(value || '').replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#039;', '"': '&quot;' }[char]));
}

function jsArg(value) {
  return escapeHtml(JSON.stringify(String(value ?? ''))).replace(/`/g, '&#096;');
}


function showStatus(message, isError = false) {
  adminStatus.innerHTML = `<p class="${isError ? 'error' : ''}">${escapeHtml(message)}</p>`;
}

async function loadAdmin() {
  try {
    const response = await adminFetch('/api/admin/overview');
    const data = await readJson(response);
    if (!response.ok) throw new Error(data.error || 'Erro ao carregar painel.');

    adminStats.innerHTML = `
      <article class="admin-card"><small>Usuários ativos</small><strong>${data.users.active}</strong><span>${data.users.new30d || 0} novos nos últimos 30 dias</span></article>
      <article class="admin-card"><small>Assinantes pagos</small><strong>${data.users.paid || 0}</strong><span>${formatPercent(data.business?.paidConversionRate)} de conversão da base</span></article>
      <article class="admin-card"><small>MRR estimado</small><strong>${money(data.payments.mrr)}</strong><span>Receita mensal recorrente atual</span></article>
      <article class="admin-card"><small>Receita aprovada</small><strong>${money(data.payments.revenue)}</strong><span>${data.payments.approved} pagamentos confirmados</span></article>
      <article class="admin-card"><small>Leads em 30 dias</small><strong>${number(data.usage?.leads30d)}</strong><span>${number(data.usage?.searches30d)} pesquisas executadas</span></article>
      <article class="admin-card"><small>Usuários engajados</small><strong>${number(data.usage?.activeUsers30d)}</strong><span>Média de ${number(data.usage?.averagePerActiveUser, 1)} leads por usuário ativo</span></article>
      <article class="admin-card"><small>Taxa de ativação</small><strong>${formatPercent(data.business?.activationRate)}</strong><span>Usuários que avançaram no produto</span></article>
      <article class="admin-card"><small>Ticket por assinante</small><strong>${money(data.payments.arpu)}</strong><span>Receita aprovada por cliente pago</span></article>
    `;

    renderAdminCharts(data.charts || {});
    renderUsers(data.recentUsers || []);
    renderPayments(data.recentPayments || []);
    await loadSecurity();
    await loadPlans();
    await loadAuditLogs();
    showStatus('Painel carregado.');
  } catch (error) {
    showStatus(error.message, true);
    if (String(error.message).includes('restrito')) setTimeout(() => window.location.replace('/app'), 1500);
  }
}

async function loadUsers(q = '') {
  try {
    const response = await adminFetch(`/api/admin/users${q ? `?q=${encodeURIComponent(q)}` : ''}`);
    const users = await readJson(response);
    if (!response.ok) throw new Error(users.error || 'Erro ao buscar usuários.');
    renderUsers(users);
  } catch (error) {
    showStatus(error.message, true);
  }
}

function renderUsers(users) {
  adminUsers.innerHTML = `
    <table class="admin-table">
      <caption>Lista de usuários cadastrados e ações administrativas</caption>
      <thead><tr><th scope="col">Usuário</th><th scope="col">Plano</th><th scope="col">Status</th><th scope="col">Role</th><th scope="col">Expira</th><th scope="col">Ações</th></tr></thead>
      <tbody>
        ${users.map((user) => `
          <tr>
            <th scope="row"><strong>${escapeHtml(user.name)}</strong><br><small>${escapeHtml(user.email)}</small></th>
            <td>${escapeHtml(user.plan)}<br><small>${user.dailyLeadLimit || 0} leads/dia</small></td>
            <td>${user.isActive ? 'Ativo' : 'Suspenso'}<br><small>${escapeHtml(user.subscriptionStatus)}</small></td>
            <td>${escapeHtml(user.role || 'user')}</td>
            <td>${date(user.planExpiresAt)}</td>
            <td>
              <div class="admin-actions">
                <button type="button" aria-label="Alterar plano de ${escapeHtml(user.email)} para Pro" onclick="updateUser(${jsArg(user.id)}, { plan: 'pro' })">Pro</button>
                <button type="button" aria-label="Alterar plano de ${escapeHtml(user.email)} para Agência" onclick="updateUser(${jsArg(user.id)}, { plan: 'agency' })">Agência</button>
                <button type="button" class="secondary" aria-label="Alterar plano de ${escapeHtml(user.email)} para Trial" onclick="updateUser(${jsArg(user.id)}, { plan: 'trial' })">Trial</button>
                <button type="button" class="secondary" onclick="updateUser(${jsArg(user.id)}, { isActive: ${!user.isActive} })">${user.isActive ? 'Suspender' : 'Ativar'}</button>
                <button type="button" class="secondary" onclick="updateUser(${jsArg(user.id)}, { role: '${user.role === 'admin' ? 'user' : 'admin'}' })">${user.role === 'admin' ? 'Remover admin' : 'Admin'}</button>
              </div>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

function renderPayments(payments) {
  adminPayments.innerHTML = `
    <table class="admin-table">
      <caption>Últimos pagamentos registrados no sistema</caption>
      <thead><tr><th scope="col">Data</th><th scope="col">Plano</th><th scope="col">Status</th><th scope="col">Valor</th><th scope="col">Pagamento</th></tr></thead>
      <tbody>
        ${payments.map((payment) => `
          <tr>
            <th scope="row">${date(payment.createdAt)}</th>
            <td>${escapeHtml(payment.plan)}</td>
            <td>${escapeHtml(payment.status)}</td>
            <td>${money(payment.amount)}</td>
            <td><small>${escapeHtml(payment.paymentId || payment.preferenceId || payment.id)}</small></td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

async function updateUser(id, payload) {
  try {
    const response = await adminFetch(`/api/admin/users/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await readJson(response);
    if (!response.ok) throw new Error(data.error || 'Erro ao atualizar usuário.');

    showStatus('Usuário atualizado.');
    await loadAdmin();
  } catch (error) {
    showStatus(error.message, true);
  }
}

async function loadPlans() {
  if (!adminPlans) return;

  try {
    const response = await adminFetch('/api/admin/plans');
    const plans = await readJson(response);
    if (!response.ok) throw new Error(plans.error || 'Erro ao carregar planos.');

    adminPlans.innerHTML = `<div class="plan-editor">${plans.map(renderPlanEditor).join('')}</div>`;
  } catch (error) {
    adminPlans.innerHTML = `<p class="error">${escapeHtml(error.message)}</p>`;
  }
}

function renderPlanEditor(plan) {
  const features = Array.isArray(plan.features) ? plan.features.join('\n') : '';
  const isTrial = plan.id === 'trial';
  const lockHint = isTrial
    ? '<p class="meta">O Trial é fixo por regra comercial: 10 leads totais e uso único por usuário/dispositivo.</p>'
    : '';
  const disabled = isTrial ? 'disabled' : '';

  return `
    <article>
      <h3>${escapeHtml(plan.name)}</h3>
      ${lockHint}
      <label>Nome<input id="plan-name-${plan.id}" value="${escapeHtml(plan.name)}" ${disabled} /></label>
      <label>Preço<input id="plan-price-${plan.id}" value="${escapeHtml(plan.priceLabel || '')}" ${disabled} /></label>
      <label>Limite diário<input id="plan-daily-${plan.id}" type="number" min="0" value="${Number(plan.dailyLeadLimit || 0)}" ${disabled} /></label>
      <label>Limite total<input id="plan-total-${plan.id}" type="number" min="0" placeholder="vazio = ilimitado" value="${plan.totalLeadLimit === null || plan.totalLeadLimit === undefined ? '' : Number(plan.totalLeadLimit)}" ${disabled} /></label>
      <label>Dias de validade<input id="plan-duration-${plan.id}" type="number" min="0" value="${Number(plan.durationDays || 0)}" ${disabled} /></label>
      <label>Benefícios<textarea id="plan-features-${plan.id}" ${disabled}>${escapeHtml(features)}</textarea></label>
      ${isTrial ? '<button type="button" disabled>Trial fixo</button>' : `<button type="button" onclick="savePlan(${jsArg(plan.id)})">Salvar plano</button>`}
    </article>
  `;
}

async function savePlan(id) {
  try {
    const payload = {
      name: document.querySelector(`#plan-name-${id}`).value,
      priceLabel: document.querySelector(`#plan-price-${id}`).value,
      dailyLeadLimit: Number(document.querySelector(`#plan-daily-${id}`).value || 0),
      totalLeadLimit: document.querySelector(`#plan-total-${id}`).value,
      durationDays: Number(document.querySelector(`#plan-duration-${id}`).value || 0),
      features: document.querySelector(`#plan-features-${id}`).value.split('\n').map((item) => item.trim()).filter(Boolean)
    };

    const response = await adminFetch(`/api/admin/plans/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await readJson(response);
    if (!response.ok) throw new Error(data.error || 'Erro ao salvar plano.');

    showStatus('Plano atualizado.');
    await loadPlans();
    await loadAuditLogs();
  } catch (error) {
    showStatus(error.message, true);
  }
}

async function loadAuditLogs() {
  if (!adminAudit) return;

  try {
    const response = await adminFetch('/api/admin/audit-logs');
    const logs = await readJson(response);
    if (!response.ok) throw new Error(logs.error || 'Erro ao carregar auditoria.');

    adminAudit.innerHTML = logs.length ? `
      <table class="admin-table">
        <caption>Últimas ações executadas no painel administrativo</caption>
        <thead><tr><th scope="col">Data</th><th scope="col">Ação</th><th scope="col">Alvo</th><th scope="col">IP</th></tr></thead>
        <tbody>
          ${logs.map((log) => `
            <tr>
              <th scope="row">${date(log.createdAt)}</th>
              <td>${escapeHtml(log.action)}</td>
              <td><small>${escapeHtml(log.targetUserId || '-')}</small></td>
              <td><small>${escapeHtml(log.ip || '-')}</small></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    ` : '<p class="meta">Nenhuma ação administrativa registrada ainda.</p>';
  } catch (error) {
    adminAudit.innerHTML = `<p class="error">${escapeHtml(error.message)}</p>`;
  }
}

async function loadSecurity() {
  if (!adminSecurity) return;

  try {
    const response = await adminFetch('/api/admin/security');
    const data = await readJson(response);
    if (!response.ok) throw new Error(data.error || 'Erro ao carregar segurança.');

    adminSecurity.innerHTML = `
      <div class="admin-grid">
        <article class="admin-card"><small>Trials liberados</small><strong>${data.allowed}</strong></article>
        <article class="admin-card"><small>Bloqueios</small><strong>${data.blocked}</strong></article>
        <article class="admin-card"><small>Reset de senha</small><strong>${data.passwordResets || 0}</strong></article>
      </div>
      <table class="admin-table">
        <caption>Registros recentes de segurança e anti-abuso</caption>
        <thead><tr><th scope="col">Data</th><th scope="col">E-mail</th><th scope="col">IP</th><th scope="col">Status</th><th scope="col">Role</th><th scope="col">Motivo</th><th scope="col">Ações</th></tr></thead>
        <tbody>
          ${(data.recent || []).map((item) => `
            <tr>
              <th scope="row">${date(item.createdAt)}</th>
              <td>${escapeHtml(item.email)}</td>
              <td><small>${escapeHtml(item.ip)}</small></td>
              <td>${escapeHtml(item.status)}</td>
              <td>${escapeHtml(item.userRole || 'none')}</td>
              <td>${escapeHtml(item.reason)}</td>
              <td>
                <div class="admin-actions">
                  <button type="button" class="secondary" aria-label="Remover registro de segurança de ${escapeHtml(item.email)}" onclick="deleteSecurityRecord(${jsArg(item.id)})">Remover</button>
                  <button type="button" class="secondary" aria-label="Limpar registros de segurança do e-mail ${escapeHtml(item.email)}" onclick="clearSecurityByEmail(${jsArg(item.email)})">Limpar e-mail</button>
                </div>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  } catch (error) {
    adminSecurity.innerHTML = `<p class="error">${escapeHtml(error.message)}</p>`;
  }
}

async function deleteSecurityRecord(id) {
  try {
    const response = await adminFetch(`/api/admin/security/${id}`, { method: 'DELETE' });
    const data = await readJson(response);
    if (!response.ok) throw new Error(data.error || 'Erro ao remover registro.');

    showStatus('Registro de segurança removido.');
    await loadSecurity();
    await loadAuditLogs();
  } catch (error) {
    showStatus(error.message, true);
  }
}

async function clearSecurityByEmail(email) {
  try {
    const response = await adminFetch('/api/admin/security/clear', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });

    const data = await readJson(response);
    if (!response.ok) throw new Error(data.error || 'Erro ao limpar registros.');

    showStatus(`${data.deletedCount || 0} registro(s) removido(s).`);
    await loadSecurity();
    await loadAuditLogs();
  } catch (error) {
    showStatus(error.message, true);
  }
}

loadAdmin();
