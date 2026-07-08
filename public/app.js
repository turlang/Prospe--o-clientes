/**
 * SaaS comercial
 * -----------------------------------------------------------------------------
 * Evolução da ferramenta para um produto com cara de SaaS:
 * - Dashboard executivo.
 * - CRM Kanban com atualização de status.
 * - Lead Score visual.
 * - Geração de abordagem comercial por lead.
 * - Histórico de atividades do lead.
 * - Preparação visual para planos Free/Pro.
 */

const deviceId = localStorage.getItem('deviceId') || crypto.randomUUID();
localStorage.setItem('deviceId', deviceId);

const form = document.querySelector('#form');
const results = document.querySelector('#results');
const statusBox = document.querySelector('#status');
const loadSaved = document.querySelector('#loadSaved');
const authCard = document.querySelector('#authCard');
const dashboard = document.querySelector('#dashboard');
const loginForm = document.querySelector('#loginForm');
const registerForm = document.querySelector('#registerForm');
const logoutButton = document.querySelector('#logout');
const exportCsv = document.querySelector('#exportCsv');
const welcome = document.querySelector('#welcome');
const planInfo = document.querySelector('#planInfo');
const usageBox = document.querySelector('#usageBox');
const aiStatusBox = document.querySelector('#aiStatusBox');
const plansGrid = document.querySelector('#plansGrid');
const statsBox = document.querySelector('#stats');
const executiveStats = document.querySelector('#executiveStats');
const onboardingBox = document.querySelector('#onboardingBox');
const historyList = document.querySelector('#historyList');
const activityTimeline = document.querySelector('#activityTimeline');
const systemMetrics = document.querySelector('#systemMetrics');
const followupList = document.querySelector('#followupList');
const automationSummary = document.querySelector('#automationSummary');
const automationActions = document.querySelector('#automationActions');
const kanbanBoard = document.querySelector('#kanbanBoard');
const filterStatus = document.querySelector('#filterStatus');
const filterFavorite = document.querySelector('#filterFavorite');
const searchLead = document.querySelector('#searchLead');
const dashboardFunnel = document.querySelector('#dashboardFunnel');
const dashboardInsights = document.querySelector('#dashboardInsights');
const agendaList = document.querySelector('#agendaList');
const leadDetailPanel = document.querySelector('#leadDetailPanel');

let authToken = localStorage.getItem('authToken') || '';
let currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
let lastLeads = [];
const approachHistory = {};

const PIPELINE = [
  { key: 'NOVO', label: 'Novo lead', hint: 'Encontrado, ainda sem contato' },
  { key: 'CONTATADO', label: 'Contato realizado', hint: 'WhatsApp, ligação ou e-mail enviado' },
  { key: 'INTERESSADO', label: 'Interesse', hint: 'Respondeu ou pediu mais detalhes' },
  { key: 'PROPOSTA', label: 'Proposta enviada', hint: 'Orçamento ou reunião encaminhada' },
  { key: 'FECHADO', label: 'Fechado', hint: 'Virou cliente' },
  { key: 'SEM_INTERESSE', label: 'Perdido', hint: 'Sem interesse ou descartado' }
];

bootAuth();
showPaymentReturnMessage();

document.querySelectorAll('.nav-btn').forEach((button) => {
  button.addEventListener('click', () => switchView(button.dataset.view));
});

loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  await authRequest('/api/auth/login', {
    email: document.querySelector('#loginEmail').value,
    password: document.querySelector('#loginPassword').value
  });
});

const forgotPasswordLink = document.querySelector('#forgotPasswordLink');
if (forgotPasswordLink) {
  forgotPasswordLink.addEventListener('click', async (event) => {
    event.preventDefault();

    const email = document.querySelector('#loginEmail').value.trim();

    if (!email) {
      showError('Informe seu e-mail no campo de login para solicitar a recuperação.');
      return;
    }

    try {
      statusBox.innerHTML = '<p class="loading">Enviando instruções de recuperação...</p>';
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await readJson(response);
      if (!response.ok) throw new Error(data.error || 'Erro ao solicitar recuperação.');

      statusBox.innerHTML = `<p>${escapeHtml(data.message)}</p>`;
    } catch (error) {
      showError(error.message);
    }
  });
}

registerForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  await authRequest('/api/auth/register', {
    name: document.querySelector('#registerName').value,
    email: document.querySelector('#registerEmail').value,
    password: document.querySelector('#registerPassword').value,
    deviceId
  });
});

logoutButton.addEventListener('click', () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('currentUser');

  authToken = '';
  currentUser = null;
  lastLeads = [];

  if (dashboard) dashboard.hidden = true;
  if (authCard) authCard.hidden = false;
  if (results) {
    results.innerHTML = '';
    results.hidden = true;
  }
  if (statusBox) statusBox.innerHTML = '';

  window.location.replace('/');
});

exportCsv.addEventListener('click', async () => {
  try {
    const response = await apiFetch('/api/export.csv');
    if (!response.ok) throw new Error('Erro ao exportar CSV.');
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'leads-prospeccao.csv';
    link.click();
    URL.revokeObjectURL(url);
  } catch (error) {
    const isLimit = String(error.message || '').includes('Limite') || String(error.message || '').includes('teste gratuito');
    const extra = isLimit
      ? '<div class="limit-alert">Seu teste terminou ou o limite foi atingido. Redirecionando para Planos...</div>'
      : '';
    showError(error.message + extra);
    if (isLimit) {
      switchView('planos');
      await renderPlans();
    }
  }
});

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  results.innerHTML = '';
  statusBox.innerHTML = '<p class="loading">Buscando leads reais e auditando oportunidades comerciais...</p>';

  const payload = {
    segmento: document.querySelector('#segmento').value,
    regiao: document.querySelector('#regiao').value,
    limite: document.querySelector('#limite').value,
    auditarSites: document.querySelector('#auditarSites').checked
  };

  try {
    const response = await apiFetch('/api/prospectar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await readJson(response);
    if (!response.ok) throw new Error(data.error);
    lastLeads = data.leads || [];
    renderList(lastLeads, `${data.total} oportunidades encontradas e ranqueadas.`);
    renderKanban(lastLeads);
    renderExecutiveStats(lastLeads);
    renderActivityTimeline(lastLeads);
    renderOnboarding();
    await refreshStats();
    await refreshUsage();
    await loadHistory();
  } catch (error) {
    showError(error.message);
  }
});

loadSaved.addEventListener('click', async (event) => {
  event.preventDefault();
  await window.forceLoadSavedLeads();
});
filterStatus.addEventListener('change', () => carregarLeadsCRM());
filterFavorite.addEventListener('change', () => carregarLeadsCRM());
searchLead.addEventListener('input', debounce(() => carregarLeadsCRM(), 350));

async function authRequest(url, payload) {
  statusBox.innerHTML = '<p class="loading">Validando acesso...</p>';
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Device-Id': deviceId
      },
      body: JSON.stringify(payload)
    });
    const data = await readJson(response);
    if (!response.ok) throw new Error(data.error);

    authToken = data.token;
    currentUser = data.user;
    localStorage.setItem('authToken', authToken);
    localStorage.setItem('currentUser', JSON.stringify(currentUser));

    if (currentUser?.role === 'admin') {
      statusBox.innerHTML = '<p>Login administrativo realizado. Abrindo painel master...</p>';
      window.location.replace('/admin');
      return;
    }

    await showDashboard();
    statusBox.innerHTML = '<p>Login realizado com sucesso.</p>';
  } catch (error) {
    showError(error.message);
  }
}

function bootAuth() {
  const params = new URLSearchParams(window.location.search);
  const wantsUserDashboard = params.get('adminDashboard') === '1';

  if (authToken && currentUser?.role === 'admin' && !wantsUserDashboard) {
    window.location.replace('/admin');
    return;
  }

  if (authToken && currentUser) {
    showDashboard();

    if (currentUser?.role === 'admin') {
      addAdminShortcut();
      window.history.replaceState({}, document.title, '/app');
    }

    return;
  }

  showAuth();
}

function showAuth() {
  authCard.hidden = false;
  dashboard.hidden = true;
}

async function showDashboard() {
  authCard.hidden = true;
  dashboard.hidden = false;
  welcome.textContent = `Olá, ${currentUser?.name || 'usuário'}`;
  planInfo.innerHTML = `<strong>Plano ${String(currentUser?.planName || currentUser?.plan || 'TESTE GRATUITO').toUpperCase()}</strong><span>${currentUser?.plan === 'trial' ? '10 leads totais' : `${currentUser?.dailyLeadLimit || 10} leads/dia`}</span>`;
  if (currentUser?.role === 'admin') addAdminShortcut();

  renderOnboarding();
  await refreshUsage();
  await refreshAiStatus();
  await renderPlans();
  await refreshStats();
  await loadSavedLeads(false, { renderCards: false });
  await loadHistory();
}


function addAdminShortcut() {
  if (document.querySelector('#adminShortcut')) return;

  const button = document.createElement('button');
  button.id = 'adminShortcut';
  button.type = 'button';
  button.className = 'secondary full';
  button.textContent = 'Painel Master';
  button.addEventListener('click', () => window.location.replace('/admin'));

  const nav = document.querySelector('.sidebar nav');
  if (nav) nav.prepend(button);
}

function switchView(view) {
  document.querySelectorAll('.nav-btn').forEach((button) => button.classList.toggle('active', button.dataset.view === view));
  document.querySelectorAll('.view').forEach((section) => section.classList.remove('active-view'));

  const target = document.querySelector(`#view-${view}`);
  if (!target) return;

  target.classList.add('active-view');

  // Resultado de prospecção só aparece na aba Prospectar.
  // CRM, Histórico e Campanhas têm seus próprios containers.
  if (results) results.hidden = view !== 'prospectar';

  if (view === 'crm') carregarLeadsCRM();
  if (view === 'dashboard') loadSavedLeads(false, { renderCards: false });
  if (view === 'historico') loadHistory();
  if (view === 'planos') renderPlans();
  if (view === 'agenda') loadAgenda();
  if (view === 'campanhas') { loadAutomationActions(); loadFollowups(); }
}

function apiFetch(url, options = {}) {
  const headers = { ...(options.headers || {}) };
  if (options.body && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  return fetch(url, {
    ...options,
    headers: {
      ...headers,
      Authorization: `Bearer ${authToken}`
    }
  });
}

async function readJson(response) {
  const text = await response.text();
  if (!text) throw new Error('O servidor respondeu vazio. Verifique o terminal do npm run dev.');
  try { return JSON.parse(text); }
  catch { throw new Error(`Resposta inválida do servidor (${response.status}). Confira o terminal do backend.`); }
}

async function refreshStats() {
  try {
    const response = await apiFetch('/api/dashboard/stats');
    const stats = await readJson(response);
    if (!response.ok) throw new Error(stats.error);
    statsBox.innerHTML = `
      <article><span>📈</span><strong>${stats.total || 0}</strong><small>Leads salvos</small></article>
      <article><span>🔥</span><strong>${stats.quentes || 0}</strong><small>Oportunidades quentes</small></article>
      <article><span>📨</span><strong>${stats.contatados || 0}</strong><small>Contatados</small></article>
      <article><span>💰</span><strong>${stats.fechados || 0}</strong><small>Fechados</small></article>
    `;
  } catch {
    statsBox.innerHTML = '';
  }
}


async function refreshAiStatus() {
  if (!aiStatusBox) return;

  try {
    const response = await apiFetch('/api/ai/status');
    const data = await readJson(response);
    if (!response.ok) throw new Error(data.error || 'Erro ao consultar IA.');

    const isExternal = data.provider && data.provider !== 'local' && data.configured;
    aiStatusBox.innerHTML = `
      <small>IA Comercial</small>
      <strong>${isExternal ? '🟢 ' : '🟡 '}${escapeHtml(data.providerLabel || 'Motor Local')}</strong>
      <span>${escapeHtml(data.model || 'local')}</span>
      <em>${escapeHtml(data.reason || '')}</em>
    `;
  } catch {
    aiStatusBox.innerHTML = '<small>IA Comercial</small><strong>🟡 Motor Local</strong><span>Status indisponível</span>';
  }
}

async function loadHistory() {
  if (!historyList || !authToken) return;

  try {
    const response = await apiFetch('/api/leads');
    const leads = await readJson(response);
    if (!response.ok) throw new Error(leads.error || 'Erro ao carregar histórico.');

    const contactedStatuses = new Set(['CONTATADO', 'INTERESSADO', 'PROPOSTA', 'FECHADO', 'SEM_INTERESSE']);
    const contactedLeads = (Array.isArray(leads) ? leads : [])
      .filter((lead) => {
        const status = normalizeStatus(lead.status);
        const interactions = Array.isArray(lead.interacoes) ? lead.interacoes : [];
        return contactedStatuses.has(status) || interactions.some((item) => {
          const tipo = String(item.tipo || '').toUpperCase();
          return tipo.includes('STATUS') || tipo.includes('RESPOSTA') || tipo.includes('FOLLOWUP') || tipo.includes('CONTATO');
        });
      })
      .sort((a, b) => {
        const lastA = Array.isArray(a.interacoes) && a.interacoes.length ? a.interacoes[a.interacoes.length - 1]?.data : a.coletadoEm;
        const lastB = Array.isArray(b.interacoes) && b.interacoes.length ? b.interacoes[b.interacoes.length - 1]?.data : b.coletadoEm;
        return new Date(lastB || 0) - new Date(lastA || 0);
      });

    historyList.innerHTML = contactedLeads.length ? contactedLeads.map((lead) => {
      const leadId = getLeadId(lead);
      const interactions = Array.isArray(lead.interacoes) ? lead.interacoes : [];
      const last = interactions.length ? interactions[interactions.length - 1] : null;
      return `
        <article class="history-item contact-history-item">
          <div>
            <strong>${escapeHtml(lead.nome || 'Lead sem nome')}</strong>
            <p class="meta">${escapeHtml(lead.telefone || 'Telefone não informado')} · Status: ${escapeHtml(normalizeStatus(lead.status))}</p>
            <p>${escapeHtml(last?.proximoPasso || last?.status || last?.tipo || 'Contato registrado no funil comercial.')}</p>
            <small>${formatDate(last?.data || lead.coletadoEm)}</small>
          </div>
          <div class="actions-row compact">
            <button type="button" class="secondary" onclick="focusLead('${escapeAttr(leadId)}')">Abrir no CRM</button>
            <button type="button" class="secondary" onclick="scheduleFollowup('${escapeAttr(leadId)}')">Agendar retorno</button>
          </div>
        </article>
      `;
    }).join('') : '<p class="meta">Nenhum histórico de contato ainda. Quando você marcar um lead como CONTATADO, INTERESSADO, PROPOSTA ou FECHADO, ele aparecerá aqui.</p>';
  } catch (error) {
    historyList.innerHTML = `<p class="error">${escapeHtml(error.message)}</p>`;
  }
}

function repeatSearch(segmento, regiao, limite) {
  switchView('prospectar');
  document.querySelector('#segmento').value = segmento;
  document.querySelector('#regiao').value = regiao;
  document.querySelector('#limite').value = String(limite || 10);
  statusBox.innerHTML = '<p>Busca preenchida. Clique em Prospectar para executar novamente.</p>';
}

async function loadSavedLeads(showLoading = true, options = {}) {
  const { renderCards = true } = options;

  if (showLoading) {
    statusBox.innerHTML = '<p class="loading">Carregando leads salvos...</p>';
  }

  try {
    const params = new URLSearchParams();

    if (filterStatus.value) {
      params.set('status', filterStatus.value);
    }

    if (filterFavorite.checked) {
      params.set('favorito', 'true');
    }

    if (searchLead.value.trim()) {
      params.set('q', searchLead.value.trim());
    }

    const queryString = params.toString();
    const response = await apiFetch(`/api/leads${queryString ? `?${queryString}` : ''}`);
    const leads = await readJson(response);

    if (!response.ok) {
      throw new Error(leads.error || 'Erro ao carregar leads salvos.');
    }

    lastLeads = Array.isArray(leads) ? leads : [];

    if (renderCards) {
      results.hidden = false;
      renderList(lastLeads, `${lastLeads.length} leads carregados.`);
    } else {
      results.hidden = true;
    }
    renderExecutiveStats(lastLeads);
    renderDashboardExtras(lastLeads);
    renderKanban(lastLeads);
    renderActivityTimeline(lastLeads);
    renderOnboarding();

    await refreshStats();

    if (showLoading) {
      statusBox.innerHTML = `<p>${lastLeads.length} leads carregados com sucesso.</p>`;
    }
  } catch (error) {
    showError(error.message);
  }
}

function countByStatus(leads) {
  const base = PIPELINE.reduce((acc, item) => ({ ...acc, [item.key]: 0 }), {});
  (Array.isArray(leads) ? leads : []).forEach((lead) => {
    const status = normalizeStatus(lead.status);
    base[status] = Number(base[status] || 0) + 1;
  });
  return base;
}

function getLastInteraction(lead) {
  const interactions = Array.isArray(lead?.interacoes) ? lead.interacoes : [];
  return interactions.length ? interactions[interactions.length - 1] : null;
}

function daysSince(value) {
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) return null;
  return Math.floor((Date.now() - date.getTime()) / 86400000);
}

function renderDashboardExtras(leads) {
  leads = Array.isArray(leads) ? leads : [];
  const counts = countByStatus(leads);
  if (dashboardFunnel) {
    const max = Math.max(...Object.values(counts), 1);
    dashboardFunnel.innerHTML = PIPELINE.map((step) => {
      const value = counts[step.key] || 0;
      const width = Math.max(6, Math.round((value / max) * 100));
      return `
        <article class="funnel-row">
          <div><strong>${escapeHtml(step.label)}</strong><small>${escapeHtml(step.hint)}</small></div>
          <div class="funnel-meter"><span style="width:${width}%"></span></div>
          <b>${value}</b>
        </article>
      `;
    }).join('');
  }

  if (dashboardInsights) {
    const hot = leads.filter((lead) => Number(lead.score || 0) >= 80).slice(0, 3);
    const stalled = leads.filter((lead) => {
      const last = getLastInteraction(lead);
      const age = daysSince(last?.data || lead.coletadoEm);
      return age !== null && age >= 7 && !['FECHADO','SEM_INTERESSE'].includes(normalizeStatus(lead.status));
    }).slice(0, 3);
    const items = [
      ...hot.map((lead) => ({ type: 'Lead quente', lead, message: 'Priorize contato ainda hoje.' })),
      ...stalled.map((lead) => ({ type: 'Parado', lead, message: 'Sem atividade recente; agende follow-up.' }))
    ];
    dashboardInsights.innerHTML = items.length ? items.map((item) => {
      const leadId = getLeadId(item.lead);
      return `
        <article class="history-item">
          <div><strong>${escapeHtml(item.type)}: ${escapeHtml(item.lead.nome || 'Lead')}</strong><p>${escapeHtml(item.message)}</p><small>Status: ${escapeHtml(normalizeStatus(item.lead.status))}</small></div>
          <button type="button" class="secondary" onclick="openLeadDetail('${escapeAttr(leadId)}')">Abrir ficha</button>
        </article>
      `;
    }).join('') : '<p class="meta">Nenhuma prioridade crítica. Continue prospectando ou movendo leads no CRM.</p>';
  }
}

function renderExecutiveStats(leads) {
  if (!executiveStats) return;
  leads = Array.isArray(leads) ? leads : [];
  const total = leads.length;
  const hot = leads.filter((lead) => Number(lead.score || 0) >= 80).length;
  const contacted = leads.filter((lead) => ['CONTATADO', 'INTERESSADO', 'REUNIAO', 'PROPOSTA', 'FECHADO'].includes(normalizeStatus(lead.status))).length;
  const proposals = leads.filter((lead) => normalizeStatus(lead.status) === 'PROPOSTA').length;
  const closed = leads.filter((lead) => normalizeStatus(lead.status) === 'FECHADO').length;
  const potential = leads.reduce((sum, lead) => sum + estimateTicket(lead.ticketEstimado), 0);
  const contactRate = total ? Math.round((contacted / total) * 100) : 0;
  const closeRate = total ? Math.round((closed / total) * 100) : 0;

  executiveStats.innerHTML = `
    <article><small>Leads no CRM</small><strong>${total}</strong><span>Base comercial salva</span></article>
    <article><small>Alta prioridade</small><strong>${hot}</strong><span>Score acima de 80</span></article>
    <article><small>Taxa de contato</small><strong>${contactRate}%</strong><span>${contacted} contatos iniciados</span></article>
    <article><small>Propostas</small><strong>${proposals}</strong><span>em negociação</span></article>
    <article><small>Clientes fechados</small><strong>${closed}</strong><span>${closeRate}% de conversão geral</span></article>
    <article><small>Potencial estimado</small><strong>${formatMoney(potential)}</strong><span>Somatório aproximado</span></article>
  `;
}

function renderKanban(leads) {
  if (!kanbanBoard) return;
  leads = Array.isArray(leads) ? leads : [];
  const grouped = PIPELINE.reduce((acc, column) => ({ ...acc, [column.key]: [] }), {});
  leads.forEach((lead) => {
    const status = normalizeStatus(lead.status);
    grouped[status] = grouped[status] || [];
    grouped[status].push(lead);
  });

  kanbanBoard.innerHTML = PIPELINE.map((column) => `
    <section class="kanban-column" data-status="${column.key}" ondragover="allowDrop(event)" ondrop="dropLead(event, '${column.key}')">
      <header><div><strong>${column.label}</strong><small>${column.hint}</small></div><span>${grouped[column.key].length}</span></header>
      <div class="kanban-list">
        ${grouped[column.key].map(renderKanbanCard).join('') || '<p class="empty small">Sem leads nesta etapa.</p>'}
      </div>
    </section>
  `).join('');
}

function renderKanbanCard(lead) {
  const leadId = getLeadId(lead);
  return `
    <article class="kanban-card" draggable="true" onclick="openLeadDetail('${escapeAttr(leadId)}')" ondragstart="dragLead(event, '${escapeAttr(leadId)}')" title="Clique para abrir a ficha do lead">
      <strong>${escapeHtml(lead.nome)}</strong>
      <p>${escapeHtml(lead.segmentoComercial || lead.tipo || 'Segmento não informado')}</p>
      <div class="score-line"><span>${scoreStars(lead.score)}</span><b>${lead.score || 0}/100</b></div>
    </article>
  `;
}

function allowDrop(event) { event.preventDefault(); }
function dragLead(event, leadId) { event.dataTransfer.setData('text/plain', leadId); }
async function dropLead(event, status) {
  event.preventDefault();
  const leadId = event.dataTransfer.getData('text/plain');
  if (!leadId) return;
  try {
    await markStatus(leadId, status);
    statusBox.innerHTML = `<p>Status atualizado para ${escapeHtml(status)}.</p>`;
    await carregarLeadsCRM();
  } catch (error) {
    showError(error.message);
  }
}

function ensureLeadModal() {
  let modal = document.querySelector('#leadModal');
  if (modal) return modal;

  modal = document.createElement('div');
  modal.id = 'leadModal';
  modal.className = 'lead-modal';
  modal.hidden = true;
  modal.innerHTML = `
    <div class="lead-modal-backdrop" onclick="closeLeadModal()"></div>
    <section class="lead-modal-card card-panel" role="dialog" aria-modal="true" aria-labelledby="leadModalTitle">
      <button type="button" class="modal-close" onclick="closeLeadModal()" aria-label="Fechar ficha do lead">×</button>
      <div id="leadModalContent"></div>
    </section>
  `;
  document.body.appendChild(modal);
  return modal;
}

function closeLeadModal() {
  const modal = document.querySelector('#leadModal');
  if (modal) modal.hidden = true;
  document.body.classList.remove('modal-open');
}

function openLeadDetail(leadId) {
  const lead = (Array.isArray(lastLeads) ? lastLeads : []).find((item) => String(getLeadId(item)) === String(leadId));
  const modal = ensureLeadModal();
  const content = modal.querySelector('#leadModalContent');

  if (!lead) {
    content.innerHTML = '<h3 id="leadModalTitle">Detalhe do lead</h3><p class="meta">Carregue o CRM e selecione um lead.</p>';
    modal.hidden = false;
    document.body.classList.add('modal-open');
    return;
  }

  const interactions = Array.isArray(lead.interacoes) ? lead.interacoes.slice().reverse() : [];
  const whatsapp = makeWhatsAppLink(lead);
  content.innerHTML = `
    <div class="lead-detail-head">
      <div><p class="tag dark">${escapeHtml(normalizeStatus(lead.status))}</p><h3 id="leadModalTitle">${escapeHtml(lead.nome || 'Lead')}</h3><p class="meta">${escapeHtml(lead.segmentoComercial || lead.tipo || 'Segmento não informado')}</p></div>
      <span class="score-badge">${Number(lead.score || 0)}/100</span>
    </div>
    <div class="detail-grid">
      <p><strong>Telefone</strong><span>${escapeHtml(lead.telefone || 'Não informado')}</span></p>
      <p><strong>Endereço</strong><span>${escapeHtml(lead.endereco || 'Não informado')}</span></p>
      <p><strong>Ticket</strong><span>${escapeHtml(lead.ticketEstimado || '-')}</span></p>
      <p><strong>Probabilidade</strong><span>${escapeHtml(lead.probabilidade || '-')}</span></p>
    </div>
    <div class="links">
      ${lead.site ? `<a href="${escapeAttr(lead.site)}" target="_blank" rel="noopener">Site</a>` : ''}
      ${lead.maps ? `<a href="${escapeAttr(lead.maps)}" target="_blank" rel="noopener">Maps</a>` : ''}
      ${whatsapp ? `<a href="${escapeAttr(whatsapp)}" target="_blank" onclick="markStatus('${escapeAttr(leadId)}','CONTATADO')">WhatsApp</a>` : ''}
    </div>
    <div class="links">
      <button type="button" class="secondary" onclick="updateStatus('${escapeAttr(leadId)}','CONTATADO')">Contato feito</button>
      <button type="button" class="secondary" onclick="updateStatus('${escapeAttr(leadId)}','INTERESSADO')">Interessado</button>
      <button type="button" class="secondary" onclick="updateStatus('${escapeAttr(leadId)}','PROPOSTA')">Proposta</button>
      <button type="button" class="secondary" onclick="generateApproach('${escapeAttr(leadId)}', 'new')">🧠 Gerar melhor abordagem</button>
      <button type="button" class="secondary" onclick="scheduleFollowup('${escapeAttr(leadId)}')">Agendar retorno</button>
    </div>
    <pre id="approach-modal-${escapeAttr(leadId)}" class="msg crm-approach-output"></pre>
    <section class="timeline detail-timeline">
      <h4>Timeline</h4>
      ${interactions.length ? interactions.map((item) => `<article class="timeline-item"><span></span><div><strong>${escapeHtml(item.tipo || item.intencao || 'Atividade')}</strong><p>${escapeHtml(item.proximoPasso || item.status || item.mensagem || '')}</p><small>${formatDate(item.data)}</small></div></article>`).join('') : '<p class="meta">Ainda não há atividades registradas.</p>'}
    </section>
    <label>Notas atuais<textarea readonly>${escapeHtml(lead.notas || 'Sem notas comerciais.')}</textarea></label>
  `;

  if (leadDetailPanel) {
    leadDetailPanel.innerHTML = `<h3>Ficha aberta</h3><p class="meta">A ficha de ${escapeHtml(lead.nome || 'lead')} está aberta em popup. Clique em outro card para trocar.</p>`;
  }

  modal.hidden = false;
  document.body.classList.add('modal-open');
}

window.openLeadDetail = openLeadDetail;
window.closeLeadModal = closeLeadModal;

function focusLead(leadId) {
  switchView('crm');
  setTimeout(() => {
    const card = document.querySelector(`[data-lead-id="${CSS.escape(leadId)}"]`);
    if (card) {
      card.scrollIntoView({ behavior: 'smooth', block: 'center' });
      openLeadDetail(leadId);
      card.classList.add('pulse');
      setTimeout(() => card.classList.remove('pulse'), 1600);
    }
  }, 100);
}

function renderActivityTimeline(leads) {
  if (!activityTimeline) return;
  leads = Array.isArray(leads) ? leads : [];
  const activities = leads.flatMap((lead) => {
    const interacoes = Array.isArray(lead.interacoes) ? lead.interacoes : [];
    return interacoes.map((item) => ({ ...item, leadNome: lead.nome }));
  }).sort((a, b) => new Date(b.data || 0) - new Date(a.data || 0)).slice(0, 8);

  activityTimeline.innerHTML = activities.length ? activities.map((item) => `
    <article class="timeline-item">
      <span></span>
      <div><strong>${escapeHtml(item.leadNome)}</strong><p>${escapeHtml(item.tipo || item.intencao || 'Atividade')} · ${escapeHtml(item.status || item.proximoPasso || '')}</p><small>${formatDate(item.data)}</small></div>
    </article>
  `).join('') : '<p class="meta">As próximas atividades aparecerão aqui quando você mover leads no funil ou analisar respostas.</p>';
}

function renderList(leads, message) {
  statusBox.innerHTML = `<p>${escapeHtml(message)}</p>`;
  if (!results) return;
  results.hidden = false;
  results.innerHTML = leads.length ? leads.map(renderLead).join('') : '<p class="empty">Nenhum lead encontrado.</p>';
}

function renderLead(lead) {
  const leadId = getLeadId(lead);
  const whatsapp = makeWhatsAppLink(lead);
  const problemas = (lead.dores || []).slice(0, 4).map((item) => `<li>${escapeHtml(item)}</li>`).join('');
  const servicos = (lead.servicos || [lead.servico]).filter(Boolean).slice(0, 4).map((item) => `<li>${escapeHtml(item)}</li>`).join('');
  const audit = lead.auditoriaSite || {};
  const interacoes = Array.isArray(lead.interacoes) ? lead.interacoes.slice(-4).reverse() : [];
  const tags = Array.isArray(lead.tags) ? lead.tags.join(', ') : '';
  const score = Number(lead.score || 0);

  return `
    <article class="lead ${scoreClass(score)}" data-lead-id="${escapeAttr(leadId)}">
      <header>
        <div>
          <h3>${lead.favorito ? '⭐ ' : ''}${escapeHtml(lead.nome)}</h3>
          <p class="meta">${escapeHtml(lead.endereco || 'Endereço não informado')}</p>
        </div>
        <div class="score-card"><span>${scoreStars(score)}</span><strong>${score}/100</strong><small>${scoreLabel(score)}</small></div>
      </header>

      <div class="metrics">
        <span><strong>${escapeHtml(lead.probabilidade || '-')}</strong><small>Fechamento</small></span>
        <span><strong>${escapeHtml(lead.ticketEstimado || '-')}</strong><small>Ticket estimado</small></span>
        <span><strong>${escapeHtml(normalizeStatus(lead.status))}</strong><small>Status CRM</small></span>
      </div>

      <div class="lead-crm-box">
        <label>Status
          <select id="status-${escapeAttr(leadId)}">
            ${['NOVO','CONTATADO','INTERESSADO','PROPOSTA','FECHADO','SEM_INTERESSE'].map((status) => `<option ${status === normalizeStatus(lead.status) ? 'selected' : ''}>${status}</option>`).join('')}
          </select>
        </label>
        <label>Tags<input id="tags-${escapeAttr(leadId)}" value="${escapeAttr(tags)}" placeholder="ex: urgente, site ruim" /></label>
        <label class="check"><input id="fav-${escapeAttr(leadId)}" type="checkbox" ${lead.favorito ? 'checked' : ''} /> Favorito</label>
      </div>
      <label>Notas comerciais<textarea id="notes-${escapeAttr(leadId)}" placeholder="Ex: respondeu rápido, pedir orçamento, retornar sexta...">${escapeHtml(lead.notas || '')}</textarea></label>
      <div class="links">
        <button type="button" class="secondary" onclick="saveLeadMeta('${escapeAttr(leadId)}')">Salvar CRM</button>
        <button type="button" class="approach-btn" onclick="generateApproach('${escapeAttr(leadId)}', 'new')">🧠 Gerar melhor abordagem</button>
        <button type="button" class="secondary" onclick="generateCampaign('${escapeAttr(leadId)}')">Sequência</button>
        <button type="button" class="secondary" onclick="scheduleFollowup('${escapeAttr(leadId)}')">Agendar follow-up</button>
      </div>

      <p><strong>Telefone:</strong> ${escapeHtml(lead.telefone || 'Não informado')}</p>
      <p><strong>Segmento:</strong> ${escapeHtml(lead.segmentoComercial || lead.tipo || 'Geral')}</p>

      <details open><summary>Diagnóstico comercial</summary><ul>${problemas || '<li>Sem problemas graves detectados automaticamente.</li>'}</ul></details>
      <details><summary>Serviços sugeridos</summary><ul>${servicos || '<li>Diagnóstico personalizado.</li>'}</ul></details>
      ${audit.analisado ? renderAuditSummary(audit) : ''}

      <section class="conversation">
        <h4>Primeiro contato sugerido</h4>
        <p id="approach-${escapeAttr(leadId)}" class="msg">${escapeHtml(lead.abordagem || 'Clique em gerar abordagem para criar uma mensagem personalizada.')}</p>
        <div class="links">
          ${lead.site ? `<a href="${escapeAttr(lead.site)}" target="_blank">Site</a>` : ''}
          ${lead.maps ? `<a href="${escapeAttr(lead.maps)}" target="_blank">Google Maps</a>` : ''}
          ${whatsapp ? `<a href="${escapeAttr(whatsapp)}" target="_blank" onclick="markStatus('${escapeAttr(leadId)}','CONTATADO')">WhatsApp pronto</a>` : ''}
          <button type="button" class="copy" onclick='copyText(document.getElementById("approach-${escapeAttr(leadId)}").innerText)'>Copiar mensagem</button>
        </div>
        <label class="reply-label">Resposta recebida do lead<textarea id="reply-${escapeAttr(leadId)}" placeholder="Cole aqui a resposta recebida."></textarea></label>
        <button type="button" class="secondary" onclick="analyzeReply('${escapeAttr(leadId)}')">Analisar resposta</button>
        <div id="analysis-${escapeAttr(leadId)}" class="analysis"></div>
      </section>

      ${interacoes.length ? `<details><summary>Histórico deste lead</summary><ul>${interacoes.map((item) => `<li><strong>${escapeHtml(item.tipo || item.intencao)}:</strong> ${escapeHtml(item.proximoPasso || item.status || '')}</li>`).join('')}</ul></details>` : ''}
      <p class="meta">Fonte: ${escapeHtml(lead.fonte || '')}</p>
    </article>
  `;
}

async function saveLeadMeta(leadId) {
  const status = document.getElementById(`status-${leadId}`)?.value || 'NOVO';
  const favorito = document.getElementById(`fav-${leadId}`)?.checked || false;
  const tags = (document.getElementById(`tags-${leadId}`)?.value || '').split(',').map((tag) => tag.trim()).filter(Boolean);
  const notas = document.getElementById(`notes-${leadId}`)?.value || '';
  try {
    await markStatus(leadId, status);
    const response = await apiFetch('/api/leads/meta', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ leadId, favorito, tags, notas })
    });
    const data = await readJson(response);
    if (!response.ok) throw new Error(data.error);
    statusBox.innerHTML = '<p>Lead atualizado no CRM.</p>';
    await loadSavedLeads(false);
  } catch (error) { showError(error.message); }
}

async function generateApproach(leadId, mode = 'new') {
  const outputs = [
    document.getElementById(`approach-${leadId}`),
    document.getElementById(`approach-modal-${leadId}`)
  ].filter(Boolean);

  outputs.forEach((output) => {
    output.textContent = 'Gerando melhor abordagem comercial...';
  });

  try {
    const response = await apiFetch('/api/gerar-abordagem', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        leadId,
        regenerateKey: `${mode}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        previousApproach: approachHistory[leadId] || ''
      })
    });
    const data = await readJson(response);
    if (!response.ok) throw new Error(data.error);

    approachHistory[leadId] = data.abordagem || approachHistory[leadId] || '';
    const html = renderSalesApproach(data, leadId);
    outputs.forEach((output) => {
      output.innerHTML = html;
    });

    statusBox.innerHTML = `<p>Melhor abordagem gerada com estratégia ${escapeHtml(data.strategy?.name || 'comercial')}.</p>`;
  } catch (error) {
    outputs.forEach((output) => {
      output.textContent = error.message;
    });
    showError(error.message);
  }
}


function engineLabel(data) {
  if (data.source === 'ai') return `IA ${data.providerLabel || data.provider || 'generativa'}`;
  if (data.source === 'local-fallback') return 'Fallback local';
  return 'Motor local';
}

function renderEngineDetails(data) {
  const status = data.aiStatus || {};
  const provider = data.providerLabel || status.providerLabel || engineLabel(data);
  const model = data.model || status.model || 'local';
  const resolved = data.resolvedModelInfo || status.resolvedModelInfo || null;
  const autoModelNote = resolved?.note ? ` ${resolved.note}` : '';
  const reason = data.source === 'ai'
    ? `Gerado por ${provider}. Modelo usado: ${model}.${autoModelNote}`
    : (status.reason || 'Nenhuma IA externa configurada; foi usado o motor local.');

  return `
    <div class="engine-details">
      <strong>${escapeHtml(engineLabel(data))}</strong>
      <span>${escapeHtml(reason)}</span>
    </div>
  `;
}

function renderSalesApproach(data, leadId = '') {
  const diagnostics = data.diagnostics || {};
  const tags = Array.isArray(diagnostics.opportunityTags) ? diagnostics.opportunityTags : [];
  const followUps = Array.isArray(data.followUps) ? data.followUps : [];
  const explanation = Array.isArray(data.explanation) ? data.explanation : [];

  return `
    <section class="strategy-output">
      <header class="strategy-head">
        <div>
          <small>Estratégia recomendada</small>
          <strong>${escapeHtml(data.strategy?.name || 'Abordagem consultiva')}</strong>
        </div>
        <div class="strategy-badges">
          <span class="tag dark">Prioridade ${escapeHtml(diagnostics.priority || '-')}</span>
          <span class="tag">${engineLabel(data)}</span>
        </div>
      </header>

      ${renderEngineDetails(data)}
      ${data.aiError ? `<p class="warning">IA externa indisponível: ${escapeHtml(data.aiError)}. Usei uma variação local.</p>` : ''}

      <div class="strategy-diagnostics">
        <span>${diagnostics.hasWebsite ? 'Site ✔' : 'Sem site próprio'}</span>
        <span>${diagnostics.hasWhatsapp ? 'WhatsApp/telefone ✔' : 'Contato pouco claro'}</span>
        <span>${diagnostics.hasSocialPresence ? 'Presença social ✔' : 'Social fraco'}</span>
        <span>Score ${Number(diagnostics.score || 0)}/100</span>
      </div>

      ${tags.length ? `<p class="meta"><strong>Oportunidades:</strong> ${tags.map(escapeHtml).join(' · ')}</p>` : ''}
      ${explanation.length ? `<ul class="strategy-reasons">${explanation.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>` : ''}

      <h4>Mensagem pronta para enviar</h4>
      <pre class="msg strategy-message">${escapeHtml(data.abordagem || '')}</pre>
      <div class="approach-actions">
        <button type="button" class="copy" onclick='copyText(${JSON.stringify(data.abordagem || '')})'>Copiar abordagem</button>
        ${leadId ? `<button type="button" class="secondary" onclick="generateApproach('${escapeAttr(leadId)}','variant')">🔄 Gerar outra versão</button>` : ''}
        ${leadId ? `<button type="button" class="secondary" onclick="generateApproach('${escapeAttr(leadId)}','improve')">✨ Melhorar esta abordagem</button>` : ''}
      </div>

      ${followUps.length ? `
        <h4>Sequência sugerida</h4>
        <div class="followup-sequence">
          ${followUps.map((step) => `
            <article>
              <strong>Dia ${Number(step.day || 1)} — ${escapeHtml(step.title || 'Follow-up')}</strong>
              <p>${escapeHtml(step.objective || '')}</p>
              <small>${escapeHtml(step.message || '')}</small>
            </article>
          `).join('')}
        </div>
      ` : ''}
    </section>
  `;
}

function renderAuditSummary(audit) {
  const social = audit.engajamentoSocial || {};
  const redes = Array.isArray(audit.redesSociais) && audit.redesSociais.length
    ? audit.redesSociais.map((item) => `<a href="${escapeAttr(item.urls[0])}" target="_blank">${escapeHtml(item.plataforma)}</a>`).join(' ')
    : '<span>Nenhuma rede detectada</span>';
  return `<div class="audit-grid"><p class="audit"><strong>SEO:</strong> ${audit.seoBasico ?? '-'} | <strong>Responsivo:</strong> ${audit.responsivo ? 'sim' : 'não'} | <strong>WhatsApp:</strong> ${audit.whatsapp ? 'sim' : 'não'} | <strong>Formulário:</strong> ${audit.formulario ? 'sim' : 'não'}</p><section class="social-box"><h4>Redes sociais</h4><p><strong>Nível:</strong> ${escapeHtml(social.nivel || 'Não analisado')} · ${Number(social.score || 0)}/100</p><p class="social-links">${redes}</p></section></div>`;
}

async function analyzeReply(leadId) {
  const textarea = document.getElementById(`reply-${leadId}`);
  const output = document.getElementById(`analysis-${leadId}`);
  const resposta = textarea?.value || '';
  output.innerHTML = '<p class="loading">Analisando resposta...</p>';
  try {
    const response = await apiFetch('/api/analisar-resposta', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ leadId, resposta })
    });
    const data = await readJson(response);
    if (!response.ok) throw new Error(data.error);
    output.innerHTML = `<p><strong>Intenção:</strong> ${escapeHtml(data.analysis.intent)}</p><p><strong>Status:</strong> ${escapeHtml(data.analysis.status)}</p><p><strong>Próximo passo:</strong> ${escapeHtml(data.analysis.proximoPasso)}</p><p class="msg">${escapeHtml(data.analysis.respostaSugerida)}</p><button type="button" class="copy" onclick='copyText(${JSON.stringify(data.analysis.respostaSugerida || '')})'>Copiar retorno</button>`;
    await loadSavedLeads(false);
  } catch (error) { output.innerHTML = `<p class="error">${escapeHtml(error.message)}</p>`; }
}

async function markStatus(leadId, status) {
  const response = await apiFetch('/api/leads/status', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ leadId, status }) });
  const data = await readJson(response);
  if (!response.ok) throw new Error(data.error || 'Erro ao atualizar status.');
  return data;
}

async function copyText(text) { await navigator.clipboard.writeText(text || ''); statusBox.innerHTML = '<p>Mensagem copiada.</p>'; }
function getLeadId(lead) { return String(lead.placeId || lead.nome || '').replace(/'/g, ''); }
function makeWhatsAppLink(lead) { const phone = String(lead.telefone || '').replace(/\D/g, ''); if (!phone) return ''; const normalized = phone.startsWith('55') ? phone : `55${phone}`; return `https://wa.me/${normalized}?text=${encodeURIComponent(lead.abordagem || '')}`; }
function scoreClass(score) { if (score >= 80) return 'hot'; if (score >= 65) return 'warm'; return ''; }
function scoreStars(score = 0) { const filled = Math.max(1, Math.min(5, Math.round(Number(score || 0) / 20))); return '★★★★★'.slice(0, filled) + '☆☆☆☆☆'.slice(0, 5 - filled); }
function scoreLabel(score = 0) { if (score >= 85) return 'Excelente oportunidade'; if (score >= 70) return 'Boa oportunidade'; if (score >= 50) return 'Médio potencial'; return 'Baixa prioridade'; }
function normalizeStatus(status) { if (status === 'REUNIAO') return 'PROPOSTA'; if (status === 'INTERESSADO') return 'INTERESSADO'; return PIPELINE.some((item) => item.key === status) ? status : 'NOVO'; }
function estimateTicket(value) { const text = String(value || '0').replace(/\./g, '').replace(',', '.'); const match = text.match(/\d+(?:\.\d+)?/); return match ? Number(match[0]) : 0; }
function formatMoney(value) { return Number(value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }); }
function showError(message) { statusBox.innerHTML = `<p class="error">${escapeHtml(message)}</p>`; }
function escapeHtml(value) { return String(value || '').replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#039;', '"': '&quot;' }[char])); }
function escapeAttr(value) { return escapeHtml(value).replace(/`/g, '&#096;'); }
function formatDate(value) { if (!value) return '-'; return new Date(value).toLocaleString('pt-BR'); }
function debounce(fn, wait) { let timeout; return (...args) => { clearTimeout(timeout); timeout = setTimeout(() => fn(...args), wait); }; }


function renderOnboarding() {
  if (!onboardingBox) return;

  const total = Array.isArray(lastLeads) ? lastLeads.length : 0;
  const contacted = total ? lastLeads.filter((lead) => ['CONTATADO', 'INTERESSADO', 'PROPOSTA', 'FECHADO'].includes(lead.status)).length : 0;
  const closed = total ? lastLeads.filter((lead) => lead.status === 'FECHADO').length : 0;

  onboardingBox.innerHTML = `
    <div class="section-title">
      <div>
        <p class="tag dark">Primeiros passos</p>
        <h3>Transforme busca em venda</h3>
      </div>
      <button type="button" class="secondary" onclick="switchView('prospectar')">Começar agora</button>
    </div>
    <div class="onboarding-steps">
      <article class="${total ? 'done' : ''}"><strong>1</strong><span>Escolha segmento e região</span></article>
      <article class="${total ? 'done' : ''}"><strong>2</strong><span>Gere e salve leads no CRM</span></article>
      <article class="${contacted ? 'done' : ''}"><strong>3</strong><span>Envie abordagem e mova no funil</span></article>
      <article class="${closed ? 'done' : ''}"><strong>4</strong><span>Feche vendas e acompanhe conversão</span></article>
    </div>
  `;
}

async function refreshUsage() {
  if (!usageBox || !authToken) return;

  try {
    const response = await apiFetch('/api/billing/usage');
    const data = await readJson(response);
    if (!response.ok) throw new Error(data.error);

    const percent = data.dailyLeadLimit
      ? Math.min(100, Math.round((data.usedToday / data.dailyLeadLimit) * 100))
      : 0;

    const isTrial = data.plan?.id === 'trial';
    const label = isTrial
      ? `${data.usedTotal} de ${data.totalLeadLimit} leads do teste usados`
      : `${data.usedToday} de ${data.dailyLeadLimit} leads usados hoje`;
    const used = isTrial ? data.usedTotal : data.usedToday;
    const limit = isTrial ? data.totalLeadLimit : data.dailyLeadLimit;
    const realPercent = limit ? Math.min(100, Math.round((used / limit) * 100)) : percent;

    usageBox.innerHTML = `
      <strong>${isTrial ? 'Teste gratuito' : 'Uso diário'}</strong>
      <span>${label}</span>
      <div class="usage-meter"><span style="width:${realPercent}%"></span></div>
    `;
  } catch {
    usageBox.innerHTML = '<span>Uso diário indisponível.</span>';
  }
}

async function renderPlans() {
  if (!plansGrid || !authToken) return;

  try {
    const response = await apiFetch('/api/plans');
    const plans = await readJson(response);
    if (!response.ok) throw new Error(plans.error);

    const activePlan = String(currentUser?.plan || 'trial').toLowerCase();

    plansGrid.innerHTML = plans.map((plan) => {
      const isTrial = plan.id === 'trial';
      const isActive = plan.id === activePlan;
      const limitLabel = plan.totalLeadLimit
        ? `${plan.totalLeadLimit} leads totais`
        : `${plan.dailyLeadLimit} leads por dia`;

      return `
        <article class="plan-card ${plan.id === 'pro' ? 'featured' : ''}">
          <p class="tag">${plan.name}</p>
          <h3>${plan.name}</h3>
          <div class="plan-price">${plan.priceLabel}</div>
          <p class="meta">${limitLabel}</p>
          <ul>${(plan.features || []).map((feature) => `<li>${escapeHtml(feature)}</li>`).join('')}</ul>
          ${isActive
            ? '<button class="secondary full" disabled>Plano atual</button>'
            : isTrial
              ? '<button class="secondary full" disabled>Teste único por usuário</button>'
              : `<button class="full plan-upgrade-btn" type="button" data-plan="${plan.id}">Ativar ${plan.name}</button>`
          }
        </article>
      `;
    }).join('');

    plansGrid.querySelectorAll('.plan-upgrade-btn').forEach((button) => {
      button.addEventListener('click', () => activatePlan(button.dataset.plan));
    });
  } catch (error) {
    plansGrid.innerHTML = `<p class="error">${error.message}</p>`;
  }
}

async function activatePlan(plan) {
  plan = String(plan || '').trim().toLowerCase();

  if (!['pro', 'agency'].includes(plan)) {
    showError('Plano inválido.');
    return;
  }

  try {
    const response = await fetch('/api/billing/checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + localStorage.getItem('authToken')
      },
      body: JSON.stringify({ plan })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Erro ao ativar plano.');
    }

    if (data.checkoutUrl) {
      statusBox.innerHTML = `<p>${data.message}</p>`;
      window.location.href = data.checkoutUrl;
      return;
    }

    currentUser = {
      ...currentUser,
      plan: data.plan.id,
      planName: data.plan.name,
      priceLabel: data.plan.priceLabel,
      dailyLeadLimit: data.plan.dailyLeadLimit,
      totalLeadLimit: data.plan.totalLeadLimit,
      subscriptionStatus: 'simulated'
    };

    localStorage.setItem('currentUser', JSON.stringify(currentUser));

    await showDashboard();
    switchView('planos');

    statusBox.innerHTML = `<p>${data.message}</p>`;
  } catch (error) {
    showError(error.message);
  }
}

async function loadSystemMetrics() {
  if (!systemMetrics || !authToken) return;

  try {
    const response = await apiFetch('/api/metrics');
    const data = await readJson(response);
    if (!response.ok) throw new Error(data.error);

    systemMetrics.innerHTML = `
      <article class="metric-card">
        <span>Requisições</span>
        <strong>${data.requests.total}</strong>
        <small>Total desde que o servidor iniciou</small>
      </article>
      <article class="metric-card">
        <span>Prospecções</span>
        <strong>${data.requests.prospectar}</strong>
        <small>Buscas realizadas nesta sessão do servidor</small>
      </article>
      <article class="metric-card">
        <span>Erros 500</span>
        <strong>${data.requests.errors}</strong>
        <small>Erros internos registrados</small>
      </article>
      <article class="metric-card">
        <span>Memória</span>
        <strong>${Math.round(data.memory.rss / 1024 / 1024)} MB</strong>
        <small>Uso aproximado do processo Node</small>
      </article>
    `;
  } catch (error) {
    systemMetrics.innerHTML = `<p class="error">${error.message}</p>`;
  }
}

async function generateCampaign(leadId) {
  try {
    const response = await apiFetch('/api/campaigns/sequence', {
      method: 'POST',
      body: JSON.stringify({ leadId, objective: 'vender website personalizado' })
    });

    const data = await readJson(response);
    if (!response.ok) throw new Error(data.error);

    const html = data.sequence.map((item) => `
      <article class="campaign-step">
        <strong>D+${item.day} — ${escapeHtml(item.title)}</strong>
        <small>${escapeHtml(item.channel)}</small>
        <textarea readonly>${escapeHtml(item.message)}</textarea>
      </article>
    `).join('');

    statusBox.innerHTML = `<div class="card-panel"><h3>Sequência comercial sugerida</h3>${html}</div>`;
    statusBox.scrollIntoView({ behavior: 'smooth', block: 'start' });
  } catch (error) {
    showError(error.message);
  }
}


async function startAutomationSequence(leadId) {
  try {
    const response = await apiFetch('/api/automations/followup-sequence', {
      method: 'POST',
      body: JSON.stringify({
        leadId,
        objective: 'vender website personalizado'
      })
    });

    const data = await readJson(response);
    if (!response.ok) throw new Error(data.error);

    statusBox.innerHTML = `<p>Sequência automática criada para ${escapeHtml(data.leadName)} com ${data.tasks.length} follow-ups.</p>`;
    await loadAutomationActions();
    await loadFollowups();
    await loadAgenda();
  } catch (error) {
    showError(error.message);
  }
}

async function loadAutomationActions() {
  if (!automationActions || !authToken) return;

  try {
    const response = await apiFetch('/api/automations/next-actions');
    const data = await readJson(response);
    if (!response.ok) throw new Error(data.error);

    if (automationSummary) {
      automationSummary.innerHTML = `
        <article><small>Follow-ups pendentes</small><strong>${data.summary.pendingTasks}</strong><span>tarefas abertas</span></article>
        <article><small>Vencidos hoje</small><strong>${data.summary.dueToday}</strong><span>ações urgentes</span></article>
        <article><small>Leads quentes</small><strong>${data.summary.hotLeads}</strong><span>alta prioridade</span></article>
      `;
    }

    const items = [...(data.dueTasks || []), ...(data.hotLeads || [])];

    if (!items.length) {
      automationActions.innerHTML = '<p class="meta">Nenhuma ação urgente no momento.</p>';
      return;
    }

    automationActions.innerHTML = items.map((item) => `
      <article class="history-item">
        <strong>${escapeHtml(item.title)}</strong>
        <p>${escapeHtml(item.leadName || 'Lead')}</p>
        <p class="meta">Prioridade: ${escapeHtml(item.priority || 'MÉDIA')}</p>
        ${item.dueAt ? `<p class="meta">Vencimento: ${new Date(item.dueAt).toLocaleString('pt-BR')}</p>` : ''}
        <p>${escapeHtml(item.message || '')}</p>
        ${item.type === 'HOT_LEAD'
          ? `<button type="button" onclick="startAutomationSequence('${escapeAttr(item.leadId)}')">Criar sequência</button>`
          : ''
        }
      </article>
    `).join('');
  } catch (error) {
    automationActions.innerHTML = `<p class="error">${escapeHtml(error.message)}</p>`;
  }
}

async function scheduleFollowup(leadId) {
  try {
    const response = await apiFetch('/api/followups', {
      method: 'POST',
      body: JSON.stringify({
        leadId,
        days: 2,
        title: 'Follow-up comercial',
        message: 'Retomar contato e oferecer diagnóstico rápido.'
      })
    });

    const data = await readJson(response);
    if (!response.ok) throw new Error(data.error);

    statusBox.innerHTML = `<p>Follow-up agendado para ${new Date(data.dueAt).toLocaleDateString('pt-BR')}.</p>`;
    await loadFollowups();
    await loadAgenda();
  } catch (error) {
    showError(error.message);
  }
}

async function loadFollowups() {
  if (!followupList || !authToken) return;

  try {
    const response = await apiFetch('/api/followups');
    const tasks = await readJson(response);
    if (!response.ok) throw new Error(tasks.error);

    if (!tasks.length) {
      followupList.innerHTML = '<p class="meta">Nenhum follow-up agendado ainda.</p>';
      return;
    }

    followupList.innerHTML = tasks.map((task) => `
      <article class="history-item ${task.done ? 'done' : ''}">
        <strong>${escapeHtml(task.title)}</strong>
        <p>${escapeHtml(task.leadName || 'Lead')}</p>
        <p class="meta">Vencimento: ${new Date(task.dueAt).toLocaleString('pt-BR')} · Prioridade: ${escapeHtml(task.priority || 'MÉDIA')} · ${escapeHtml(task.automationType || 'MANUAL')}</p>
        <p>${escapeHtml(task.message || '')}</p>
        ${task.done
          ? '<span class="tag">Concluído</span>'
          : `<button type="button" class="secondary" onclick="completeFollowup('${escapeAttr(task.id)}')">Marcar como concluído</button>`
        }
      </article>
    `).join('');
  } catch (error) {
    followupList.innerHTML = `<p class="error">${error.message}</p>`;
  }
}

async function loadAgenda() {
  if (!agendaList || !authToken) return;
  agendaList.innerHTML = '<p class="loading">Carregando agenda comercial...</p>';
  try {
    const response = await apiFetch('/api/followups');
    const tasks = await readJson(response);
    if (!response.ok) throw new Error(tasks.error || 'Erro ao carregar agenda.');
    const sorted = (Array.isArray(tasks) ? tasks : []).sort((a, b) => new Date(a.dueAt || 0) - new Date(b.dueAt || 0));
    if (!sorted.length) {
      agendaList.innerHTML = '<p class="meta">Nenhuma tarefa comercial agendada. Abra um lead no CRM e clique em Agendar follow-up.</p>';
      return;
    }
    const today = new Date();
    agendaList.innerHTML = sorted.map((task) => {
      const due = new Date(task.dueAt);
      const overdue = !task.done && due < today;
      return `
        <article class="agenda-item ${task.done ? 'done' : ''} ${overdue ? 'overdue' : ''}">
          <div class="agenda-date"><strong>${due.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}</strong><span>${due.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span></div>
          <div><h4>${escapeHtml(task.title || 'Follow-up comercial')}</h4><p>${escapeHtml(task.leadName || 'Lead')}</p><small>Prioridade: ${escapeHtml(task.priority || 'MÉDIA')} · ${escapeHtml(task.automationType || 'MANUAL')}</small><p>${escapeHtml(task.message || '')}</p></div>
          ${task.done ? '<span class="tag dark">Concluído</span>' : `<button type="button" class="secondary" onclick="completeFollowup('${escapeAttr(task.id)}')">Concluir</button>`}
        </article>
      `;
    }).join('');
  } catch (error) {
    agendaList.innerHTML = `<p class="error">${escapeHtml(error.message)}</p>`;
  }
}

window.loadAgenda = loadAgenda;

async function completeFollowup(taskId) {
  try {
    const response = await apiFetch(`/api/followups/${taskId}/done`, { method: 'PATCH' });
    const data = await readJson(response);
    if (!response.ok) throw new Error(data.error);
    await loadFollowups();
    await loadAgenda();
  } catch (error) {
    showError(error.message);
  }
}




// Carrega os leads salvos diretamente no pipeline comercial.
// A aba CRM não exibe mais uma lista duplicada: o pipeline é a visão principal,
// e a ficha completa do lead abre em popup ao clicar em um card.
async function carregarLeadsCRM() {
  const token = localStorage.getItem('authToken');
  const board = document.querySelector('#kanbanBoard');

  console.log('[CRM] carregarLeadsCRM acionado');

  if (!board) {
    alert('Pipeline do CRM não encontrado.');
    return;
  }

  if (!token) {
    board.innerHTML = '<p class="error">Sessão expirada. Faça login novamente.</p>';
    return;
  }

  board.innerHTML = '<p class="loading">Carregando pipeline comercial...</p>';

  try {
    const status = document.querySelector('#filterStatus')?.value || '';
    const favorite = document.querySelector('#filterFavorite')?.checked || false;
    const query = document.querySelector('#searchLead')?.value?.trim() || '';

    const params = new URLSearchParams();
    if (status) params.set('status', status);
    if (favorite) params.set('favorito', 'true');
    if (query) params.set('q', query);

    const response = await fetch(`/api/leads${params.toString() ? `?${params.toString()}` : ''}`, {
      headers: { Authorization: 'Bearer ' + token }
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Erro ao carregar leads.');

    const leads = Array.isArray(data) ? data : [];
    lastLeads = leads;
    window.lastLeads = leads;

    renderKanban(leads);
    renderDashboardExtras(leads);
    renderExecutiveStats(leads);

    const detailPanel = document.querySelector('#leadDetailPanel');
    if (detailPanel) {
      detailPanel.innerHTML = leads.length
        ? '<h3>Ficha do lead</h3><p class="meta">Clique em qualquer card do pipeline para abrir a ficha completa em popup.</p>'
        : '<h3>Ficha do lead</h3><p class="meta">Nenhum lead encontrado com os filtros atuais.</p>';
    }

    const statusBox = document.querySelector('#status');
    if (statusBox) {
      statusBox.innerHTML = `<p>${leads.length} leads carregados no pipeline comercial.</p>`;
    }
  } catch (error) {
    board.innerHTML = `<p class="error">${escapeHtml(error.message)}</p>`;
  }
}
window.carregarLeadsCRM = carregarLeadsCRM;


// crm-carregar-super-listener
document.addEventListener('DOMContentLoaded', () => {
  const button = document.querySelector('#loadSaved');
  if (button) {
    button.addEventListener('click', (event) => {
      event.preventDefault();
      carregarLeadsCRM();
    });
  }
});


async function updateStatus(leadId, status) {
  try {
    await markStatus(leadId, status);
    statusBox.innerHTML = `<p>Status atualizado para ${escapeHtml(status)}.</p>`;
    await carregarLeadsCRM();
    openLeadDetail(leadId);
    await refreshStats();
    await loadHistory();
  } catch (error) {
    showError(error.message);
  }
}

window.updateStatus = updateStatus;


window.loadAgenda = loadAgenda;
window.openLeadDetail = openLeadDetail;
window.closeLeadModal = closeLeadModal;

function showPaymentReturnMessage() {
  const params = new URLSearchParams(window.location.search);
  const status = params.get('pagamento');
  const paymentId = params.get('payment_id') || params.get('collection_id');

  if (!status) return;

  const messages = {
    sucesso: 'Pagamento aprovado ou em processamento. Sincronizando seu plano...',
    pendente: 'Pagamento pendente. Assim que for aprovado, seu plano será atualizado automaticamente.',
    falha: 'Pagamento não aprovado. Você pode tentar novamente pela aba Planos.'
  };

  statusBox.innerHTML = `<p>${escapeHtml(messages[status] || 'Retorno de pagamento recebido.')}</p>`;

  if (status === 'sucesso' || status === 'pendente') {
    setTimeout(async () => {
      try {
        let response;
        let data;

        if (paymentId) {
          response = await apiFetch('/api/billing/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ paymentId })
          });
          data = await readJson(response);
        } else {
          response = await apiFetch('/api/billing/status');
          data = await readJson(response);
        }

        if (response.ok) {
          const source = data.user || data;
          const plan = source.plan || {};

          currentUser = {
            ...currentUser,
            plan: plan.id || source.plan || currentUser?.plan,
            planName: plan.name || source.planName || currentUser?.planName,
            dailyLeadLimit: source.dailyLeadLimit || plan.dailyLeadLimit || currentUser?.dailyLeadLimit,
            totalLeadLimit: source.totalLeadLimit ?? plan.totalLeadLimit ?? currentUser?.totalLeadLimit ?? null,
            subscriptionStatus: source.subscriptionStatus || currentUser?.subscriptionStatus
          };

          localStorage.setItem('currentUser', JSON.stringify(currentUser));

          await showDashboard();
          switchView('planos');
          await refreshUsage();

          if (currentUser.subscriptionStatus === 'active') {
            statusBox.innerHTML = `<p>Pagamento confirmado. Plano ${escapeHtml(currentUser.planName || currentUser.plan)} ativado.</p>`;
          }
        }

        const cleanUrl = window.location.pathname || '/app';
        window.history.replaceState({}, document.title, cleanUrl);
      } catch (error) {
        statusBox.innerHTML = '<p class="error">Pagamento recebido, mas não foi possível sincronizar agora. Faça logout e login novamente em alguns instantes.</p>';
      }
    }, 1200);
  }
}
