const adminToken = localStorage.getItem('authToken') || '';
const adminStats = document.querySelector('#adminStats');
const adminUsers = document.querySelector('#adminUsers');
const adminPayments = document.querySelector('#adminPayments');
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
    `;

    renderUsers(data.recentUsers || []);
    renderPayments(data.recentPayments || []);
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
      <thead><tr><th>Usuário</th><th>Plano</th><th>Status</th><th>Role</th><th>Expira</th><th>Ações</th></tr></thead>
      <tbody>
        ${users.map((user) => `
          <tr>
            <td><strong>${escapeHtml(user.name)}</strong><br><small>${escapeHtml(user.email)}</small></td>
            <td>${escapeHtml(user.plan)}<br><small>${user.dailyLeadLimit || 0} leads/dia</small></td>
            <td>${user.isActive ? 'Ativo' : 'Suspenso'}<br><small>${escapeHtml(user.subscriptionStatus)}</small></td>
            <td>${escapeHtml(user.role || 'user')}</td>
            <td>${date(user.planExpiresAt)}</td>
            <td>
              <div class="admin-actions">
                <button type="button" onclick="updateUser('${user.id}', { plan: 'pro' })">Pro</button>
                <button type="button" onclick="updateUser('${user.id}', { plan: 'agency' })">Agência</button>
                <button type="button" class="secondary" onclick="updateUser('${user.id}', { plan: 'trial' })">Trial</button>
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
      <thead><tr><th>Data</th><th>Plano</th><th>Status</th><th>Valor</th><th>Pagamento</th></tr></thead>
      <tbody>
        ${payments.map((payment) => `
          <tr>
            <td>${date(payment.createdAt)}</td>
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

loadAdmin();
