const adminToken = localStorage.getItem('authToken') || '';
const adminStats = document.querySelector('#adminStats');
const adminUsers = document.querySelector('#adminUsers');
const adminPayments = document.querySelector('#adminPayments');
const adminSecurity = document.querySelector('#adminSecurity');
const adminPlans = document.querySelector('#adminPlans');
const adminAudit = document.querySelector('#adminAudit');
const adminStatus = document.querySelector('#adminStatus');
const adminSearch = document.querySelector('#adminSearch');

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

function date(value) {
  return value ? new Date(value).toLocaleString('pt-BR') : '-';
}

function escapeHtml(value) {
  return String(value || '').replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#039;', '"': '&quot;' }[char]));
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
      <article class="admin-card"><small>Usuários</small><strong>${data.users.total}</strong><span>${data.users.active} ativos</span></article>
      <article class="admin-card"><small>Pro</small><strong>${data.users.pro}</strong><span>assinantes Pro</span></article>
      <article class="admin-card"><small>Agência</small><strong>${data.users.agency}</strong><span>assinantes Agência</span></article>
      <article class="admin-card"><small>Receita aprovada</small><strong>${money(data.payments.revenue)}</strong><span>${data.payments.approved} pagamentos</span></article>
      <article class="admin-card"><small>Auditoria</small><strong>${data.audit?.total || 0}</strong><span>ações registradas</span></article>
    `;

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
                <button type="button" aria-label="Alterar plano de ${escapeHtml(user.email)} para Pro" onclick="updateUser('${user.id}', { plan: 'pro' })">Pro</button>
                <button type="button" aria-label="Alterar plano de ${escapeHtml(user.email)} para Agência" onclick="updateUser('${user.id}', { plan: 'agency' })">Agência</button>
                <button type="button" class="secondary" aria-label="Alterar plano de ${escapeHtml(user.email)} para Trial" onclick="updateUser('${user.id}', { plan: 'trial' })">Trial</button>
                <button type="button" class="secondary" onclick="updateUser('${user.id}', { isActive: ${!user.isActive} })">${user.isActive ? 'Suspender' : 'Ativar'}</button>
                <button type="button" class="secondary" onclick="updateUser('${user.id}', { role: '${user.role === 'admin' ? 'user' : 'admin'}' })">${user.role === 'admin' ? 'Remover admin' : 'Admin'}</button>
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
      ${isTrial ? '<button type="button" disabled>Trial fixo</button>' : `<button type="button" onclick="savePlan('${plan.id}')">Salvar plano</button>`}
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
                  <button type="button" class="secondary" aria-label="Remover registro de segurança de ${escapeHtml(item.email)}" onclick="deleteSecurityRecord('${item.id}')">Remover</button>
                  <button type="button" class="secondary" aria-label="Limpar registros de segurança do e-mail ${escapeHtml(item.email)}" onclick="clearSecurityByEmail('${escapeHtml(item.email)}')">Limpar e-mail</button>
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
