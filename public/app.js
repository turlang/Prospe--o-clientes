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
const plansGrid = document.querySelector('#plansGrid');
const statsBox = document.querySelector('#stats');
const executiveStats = document.querySelector('#executiveStats');
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

let authToken = localStorage.getItem('authToken') || '';
let currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
let lastLeads = [];

const PIPELINE = [
  { key: 'NOVO', label: 'Novo lead', hint: 'Oportunidade encontrada' },
  { key: 'CONTATADO', label: 'Contato enviado', hint: 'Primeira abordagem feita' },
  { key: 'INTERESSADO', label: 'Respondeu', hint: 'Lead demonstrou interesse' },
  { key: 'PROPOSTA', label: 'Proposta', hint: 'Orçamento ou reunião' },
  { key: 'FECHADO', label: 'Fechado', hint: 'Cliente convertido' }
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
filterStatus.addEventListener('change', loadSavedLeads);
filterFavorite.addEventListener('change', loadSavedLeads);
searchLead.addEventListener('input', debounce(loadSavedLeads, 350));

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

  await refreshUsage();
  await renderPlans();
  await refreshStats();
  await loadSavedLeads(false);
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
  document.querySelector(`#view-${view}`).classList.add('active-view');
  results.hidden = view !== 'prospectar' && view !== 'crm';
  if (view === 'crm' || view === 'dashboard') loadSavedLeads(false);
  if (view === 'historico') loadHistory();
  if (view === 'planos') renderPlans();
  if (view === 'sistema') loadSystemMetrics();
  if (view === 'campanhas') { loadAutomationActions(); loadFollowups(); }
}

function apiFetch(url, options = {}) {
  return fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
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

async function loadHistory() {
  try {
    const response = await apiFetch('/api/historico-buscas');
    const items = await readJson(response);
    if (!response.ok) throw new Error(items.error);
    historyList.innerHTML = items.length ? items.map((item) => `
      <article class="history-item">
        <div>
          <strong>${escapeHtml(item.segmento)}</strong>
          <p class="meta">${escapeHtml(item.regiao)} · ${item.total} leads · ${formatDate(item.criadoEm)}</p>
        </div>
        <button type="button" class="secondary" onclick="repeatSearch('${escapeAttr(item.segmento)}','${escapeAttr(item.regiao)}','${escapeAttr(item.limite)}')">Repetir</button>
      </article>
    `).join('') : '<p class="meta">Nenhuma busca registrada ainda.</p>';
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

async function loadSavedLeads(showLoading = true) {
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

    results.hidden = false;
    renderList(lastLeads, `${lastLeads.length} leads carregados.`);
    renderExecutiveStats(lastLeads);
    renderKanban(lastLeads);
    renderActivityTimeline(lastLeads);

    await refreshStats();

    if (showLoading) {
      statusBox.innerHTML = `<p>${lastLeads.length} leads carregados com sucesso.</p>`;
    }
  } catch (error) {
    showError(error.message);
  }
}

function renderExecutiveStats(leads) {
  const total = leads.length;
  const hot = leads.filter((lead) => Number(lead.score || 0) >= 80).length;
  const contacted = leads.filter((lead) => ['CONTATADO', 'INTERESSADO', 'REUNIAO', 'PROPOSTA', 'FECHADO'].includes(lead.status)).length;
  const potential = leads.reduce((sum, lead) => sum + estimateTicket(lead.ticketEstimado), 0);
  const rate = total ? Math.round((contacted / total) * 100) : 0;

  executiveStats.innerHTML = `
    <article><small>Leads encontrados</small><strong>${total}</strong><span>Base atual do CRM</span></article>
    <article><small>Alta prioridade</small><strong>${hot}</strong><span>Score acima de 80</span></article>
    <article><small>Taxa de contato</small><strong>${rate}%</strong><span>${contacted} contatos iniciados</span></article>
    <article><small>Potencial estimado</small><strong>${formatMoney(potential)}</strong><span>Somatório aproximado</span></article>
  `;
}

function renderKanban(leads) {
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
    <article class="kanban-card" draggable="true" ondragstart="dragLead(event, '${escapeAttr(leadId)}')">
      <strong>${escapeHtml(lead.nome)}</strong>
      <p>${escapeHtml(lead.segmentoComercial || lead.tipo || 'Segmento não informado')}</p>
      <div class="score-line"><span>${scoreStars(lead.score)}</span><b>${lead.score || 0}/100</b></div>
      <button type="button" class="secondary mini" onclick="focusLead('${escapeAttr(leadId)}')">Ver lead</button>
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
    await loadSavedLeads(false);
  } catch (error) {
    showError(error.message);
  }
}

function focusLead(leadId) {
  switchView('crm');
  setTimeout(() => {
    const card = document.querySelector(`[data-lead-id="${CSS.escape(leadId)}"]`);
    if (card) {
      card.scrollIntoView({ behavior: 'smooth', block: 'center' });
      card.classList.add('pulse');
      setTimeout(() => card.classList.remove('pulse'), 1600);
    }
  }, 100);
}

function renderActivityTimeline(leads) {
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
        <button type="button" class="approach-btn" onclick="generateApproach('${escapeAttr(leadId)}')">Gerar abordagem</button>
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

async function generateApproach(leadId) {
  const output = document.getElementById(`approach-${leadId}`);
  if (output) output.textContent = 'Gerando abordagem personalizada...';
  try {
    const response = await apiFetch('/api/gerar-abordagem', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ leadId })
    });
    const data = await readJson(response);
    if (!response.ok) throw new Error(data.error);
    if (output) output.textContent = data.abordagem;
    statusBox.innerHTML = '<p>Abordagem personalizada gerada.</p>';
  } catch (error) {
    if (output) output.textContent = error.message;
    showError(error.message);
  }
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
          <ul>${plan.features.map((feature) => `<li>${feature}</li>`).join('')}</ul>
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

async function completeFollowup(taskId) {
  try {
    const response = await apiFetch(`/api/followups/${taskId}/done`, { method: 'PATCH' });
    const data = await readJson(response);
    if (!response.ok) throw new Error(data.error);
    await loadFollowups();
  } catch (error) {
    showError(error.message);
  }
}




// Botão Carregar do CRM - implementação independente e visível.
async function carregarLeadsCRM() {
  const target = document.querySelector('#crmLoadedLeads') || document.querySelector('#results');
  const token = localStorage.getItem('authToken');

  console.log('[CRM] carregarLeadsCRM acionado');

  if (!target) {
    alert('Área de listagem do CRM não encontrada.');
    return;
  }

  if (!token) {
    target.innerHTML = '<p class="error">Sessão expirada. Faça login novamente.</p>';
    return;
  }

  target.hidden = false;
  target.innerHTML = '<p class="loading">Carregando leads salvos...</p>';

  try {
    const status = document.querySelector('#filterStatus')?.value || '';
    const favorite = document.querySelector('#filterFavorite')?.checked || false;
    const query = document.querySelector('#searchLead')?.value?.trim() || '';

    const params = new URLSearchParams();

    if (status) params.set('status', status);
    if (favorite) params.set('favorito', 'true');
    if (query) params.set('q', query);

    const response = await fetch(`/api/leads${params.toString() ? `?${params.toString()}` : ''}`, {
      headers: {
        Authorization: 'Bearer ' + token
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Erro ao carregar leads.');
    }

    const leads = Array.isArray(data) ? data : [];
    window.lastLeads = leads;

    if (!leads.length) {
      target.innerHTML = '<p class="empty-state">Nenhum lead encontrado com os filtros atuais.</p>';
      return;
    }

    target.innerHTML = leads.map((lead) => {
      const leadId = String(lead.placeId || lead.nome || '').replace(/'/g, "\\'");
      const score = Number(lead.score || 0);
      return `
        <article class="lead-card">
          <div class="lead-header">
            <div>
              <h3>${escapeHtml(lead.nome || 'Lead sem nome')}</h3>
              <p class="meta">${escapeHtml(lead.endereco || 'Endereço não informado')}</p>
            </div>
            <span class="score-badge">${score}/100</span>
          </div>

          <p><strong>Status:</strong> ${escapeHtml(lead.status || 'NOVO')}</p>
          <p><strong>Telefone:</strong> ${escapeHtml(lead.telefone || 'Não informado')}</p>
          <p><strong>Site:</strong> ${lead.site ? `<a href="${escapeAttr(lead.site)}" target="_blank" rel="noopener">Abrir site</a>` : 'Não informado'}</p>

          <div class="links">
            <button type="button" class="secondary" onclick="updateStatus('${leadId}', 'CONTATADO')">Marcar contatado</button>
            <button type="button" class="secondary" onclick="generateApproach('${leadId}')">Gerar abordagem</button>
            <button type="button" class="secondary" onclick="scheduleFollowup('${leadId}')">Agendar follow-up</button>
          </div>
        </article>
      `;
    }).join('');

    const statusBox = document.querySelector('#status');
    if (statusBox) {
      statusBox.innerHTML = `<p>${leads.length} leads carregados no CRM.</p>`;
    }

    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  } catch (error) {
    target.innerHTML = `<p class="error">${escapeHtml(error.message)}</p>`;
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
