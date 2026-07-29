/**
 * @fileoverview Controlador principal da interface do usuário: autenticação, CRM, campanhas e relatórios.
 *
 * Responsabilidade delimitada conforme a arquitetura descrita em
 * `docs/ARQUITETURA.md`. Alterações neste arquivo devem preservar os contratos
 * documentados e ser acompanhadas por testes quando afetarem regras de negócio.
 *
 * @module public/app
 */

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

function createDeviceId() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return `device-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function readStoredUser() {
  try { return JSON.parse(localStorage.getItem('currentUser') || 'null'); }
  catch { localStorage.removeItem('currentUser'); return null; }
}

const deviceId = localStorage.getItem('deviceId') || createDeviceId();
localStorage.setItem('deviceId', deviceId);

const form = document.querySelector('#form');
const results = document.querySelector('#results');
const statusBox = document.querySelector('#status');
const loadSaved = document.querySelector('#loadSaved');
const authCard = document.querySelector('#authCard');
const dashboard = document.querySelector('#dashboard');
const publicIntro = document.querySelector('#publicIntro');
const sessionBar = document.querySelector('#sessionBar');
const sessionUserName = document.querySelector('#sessionUserName');
const sessionPlanName = document.querySelector('#sessionPlanName');
// -----------------------------------------------------------------------------
// Referências da interface e estado da sessão
// -----------------------------------------------------------------------------
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
const onboardingBox = document.querySelector('#onboardingBox');
const historyList = document.querySelector('#historyList');
const historyAlertsList = document.querySelector('#historyAlertsList');
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
const agendaSummary = document.querySelector('#agendaSummary');
const commercialIntelligenceSummary = document.querySelector('#commercialIntelligenceSummary');
const commercialIntelligenceAdvice = document.querySelector('#commercialIntelligenceAdvice');
const leadDetailPanel = document.querySelector('#leadDetailPanel');
const reportSummary = document.querySelector('#reportSummary');
const reportFunnel = document.querySelector('#reportFunnel');
const reportRecommendations = document.querySelector('#reportRecommendations');
const reportSegments = document.querySelector('#reportSegments');
const reportStalled = document.querySelector('#reportStalled');
const overviewRevenueChart = document.querySelector('#overviewRevenueChart');
const overviewContactChart = document.querySelector('#overviewContactChart');
const overviewProposalChart = document.querySelector('#overviewProposalChart');
const overviewProspectingChart = document.querySelector('#overviewProspectingChart');
const overviewConversionChart = document.querySelector('#overviewConversionChart');
const overviewPipelineExecutive = document.querySelector('#overviewPipelineExecutive');
const overviewRefreshButton = document.querySelector('#overviewRefreshButton');
const proposalSummary = document.querySelector('#proposalSummary');
const proposalList = document.querySelector('#proposalList');
const customerSummary = document.querySelector('#customerSummary');
const customerList = document.querySelector('#customerList');
const customerRecommendations = document.querySelector('#customerRecommendations');
const customerGrowthSummary = document.querySelector('#customerGrowthSummary');
const customerGrowthList = document.querySelector('#customerGrowthList');

const v23Greeting = document.querySelector('#v23Greeting');
const v23FocusText = document.querySelector('#v23FocusText');
const v23FocusButton = document.querySelector('#v23FocusButton');
const v23Metrics = document.querySelector('#v23Metrics');
const v23ActionRadar = document.querySelector('#v23ActionRadar');
const v23DailyPlan = document.querySelector('#v23DailyPlan');
const v23Pipeline = document.querySelector('#v23Pipeline');
const v23Timeline = document.querySelector('#v23Timeline');
const v23LastUpdate = document.querySelector('#v23LastUpdate');
const v23RefreshButton = document.querySelector('#v23RefreshButton');
const v22CopilotForm = document.querySelector('#v22CopilotForm');
const v22CopilotQuestion = document.querySelector('#v22CopilotQuestion');
const v22CopilotAnswer = document.querySelector('#v22CopilotAnswer');
const v23CopilotMessages = document.querySelector('#v23CopilotMessages');
const v23CopilotClear = document.querySelector('#v23CopilotClear');

let authToken = localStorage.getItem('authToken') || '';
let currentUser = readStoredUser();
let lastLeads = [];
const approachHistory = {};

const PIPELINE = [
  { key: 'NOVO', label: 'Novo lead', hint: 'Encontrado, ainda sem contato' },
  { key: 'CONTATADO', label: 'Contato realizado', hint: 'WhatsApp, ligação ou e-mail enviado' },
  { key: 'INTERESSADO', label: 'Interesse', hint: 'Respondeu ou pediu mais detalhes' },
  { key: 'REUNIAO', label: 'Reunião', hint: 'Diagnóstico ou conversa agendada' },
  { key: 'PROPOSTA', label: 'Proposta enviada', hint: 'Orçamento ou reunião encaminhada' },
  { key: 'FECHADO', label: 'Fechado', hint: 'Virou cliente' },
  { key: 'SEM_INTERESSE', label: 'Perdido', hint: 'Sem interesse ou descartado' }
];

// -----------------------------------------------------------------------------
// Inicialização e autenticação
// -----------------------------------------------------------------------------
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

    forgotPasswordLink.disabled = true;
    try {
      statusBox.innerHTML = '<p class="loading">Enviando instruções de recuperação...</p>';
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await readJson(response);
      if (!response.ok) throw new Error(data.error || 'Erro ao solicitar recuperação.');

      const developmentLink = data.developmentResetUrl
        ? `<p><a href="${escapeAttr(data.developmentResetUrl)}">Abrir link de desenvolvimento</a></p>`
        : '';
      statusBox.innerHTML = `<p>${escapeHtml(data.message)}</p>${developmentLink}`;
    } catch (error) {
      showError(error.message);
    } finally {
      forgotPasswordLink.disabled = false;
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

  if (results) {
    results.innerHTML = '';
    results.hidden = true;
  }
  if (statusBox) statusBox.innerHTML = '<p>Você saiu da conta com segurança.</p>';

  showAuth();
  window.history.replaceState({}, document.title, '/app');
  window.scrollTo({ top: 0, behavior: 'smooth' });
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
    await loadCommercialIntelligence();
  await loadV23Cockpit();
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
  document.body.classList.remove('is-authenticated');
  if (publicIntro) publicIntro.hidden = false;
  if (sessionBar) sessionBar.hidden = true;
  authCard.hidden = false;
  dashboard.hidden = true;
}

async function showDashboard() {
  document.body.classList.add('is-authenticated');
  if (publicIntro) publicIntro.hidden = true;
  authCard.hidden = true;
  dashboard.hidden = false;
  if (sessionBar) sessionBar.hidden = false;
  if (sessionUserName) sessionUserName.textContent = currentUser?.name || 'Usuário';
  if (sessionPlanName) sessionPlanName.textContent = `Plano ${String(currentUser?.planName || currentUser?.plan || 'Teste gratuito')}`;
  if (statusBox) statusBox.innerHTML = '';
  welcome.textContent = `Olá, ${currentUser?.name || 'usuário'}`;
  planInfo.innerHTML = `<strong>Plano ${String(currentUser?.planName || currentUser?.plan || 'TESTE GRATUITO').toUpperCase()}</strong><span>${currentUser?.plan === 'trial' ? '10 leads totais' : `${currentUser?.dailyLeadLimit || 10} leads/dia`}</span>`;
  if (currentUser?.role === 'admin') addAdminShortcut();

  renderOnboarding();
  await refreshUsage();
  await renderPlans();
  await refreshStats();
  await loadSavedLeads(false, { renderCards: false });
  await loadExecutiveOverview();
  await loadHistory();
  await loadV23Cockpit();
  await loadV23CopilotHistory();
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

  if (view === 'inteligencia') { loadV23Cockpit(); loadV23CopilotHistory(); }
  if (view === 'crm') carregarLeadsCRM();
  if (view === 'dashboard') { loadSavedLeads(false, { renderCards: false }); loadExecutiveOverview(); }
  if (view === 'historico') loadHistory();
  if (view === 'planos') renderPlans();
  if (view === 'agenda') loadAgenda();
  if (view === 'relatorios') loadCommercialReport();
  if (view === 'propostas') loadProposals();
  if (view === 'clientes') loadCustomers();
  if (view === 'campanhas') { loadAutomationActions(); loadFollowups(); }
}

// -----------------------------------------------------------------------------
// Cliente HTTP autenticado e tratamento uniforme de respostas
// -----------------------------------------------------------------------------
async function apiFetch(url, options = {}) {
  const headers = { ...(options.headers || {}) };
  if (options.body && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      ...headers,
      Authorization: `Bearer ${authToken}`
    }
  });

  if (response.status === 401) {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    authToken = '';
    currentUser = null;
    showAuth();
    if (statusBox) statusBox.innerHTML = '<p class="error">Sua sessão expirou. Faça login novamente.</p>';
  }

  return response;
}

async function readJson(response) {
  const text = await response.text();
  if (!text) throw new Error('O servidor respondeu vazio. Verifique o terminal do npm run dev.');
  try { return JSON.parse(text); }
  catch { throw new Error(`Resposta inválida do servidor (${response.status}). Confira o terminal do backend.`); }
}

function overviewStatusLabel(status) {
  return ({ NOVO: 'Novos', CONTATADO: 'Contatados', INTERESSADO: 'Interessados', REUNIAO: 'Reuniões', PROPOSTA: 'Propostas', FECHADO: 'Fechados', SEM_INTERESSE: 'Recusados' })[String(status || '').toUpperCase()] || status;
}

/** Ordem canônica usada pelas visualizações executivas do funil. */
const OVERVIEW_PIPELINE_STAGES = Object.freeze([
  { status: 'NOVO', label: 'Novos', icon: 'users' },
  { status: 'CONTATADO', label: 'Contatados', icon: 'phone' },
  { status: 'INTERESSADO', label: 'Interessados', icon: 'message' },
  { status: 'REUNIAO', label: 'Reuniões', icon: 'calendar' },
  { status: 'PROPOSTA', label: 'Propostas', icon: 'document' },
  { status: 'FECHADO', label: 'Fechados', icon: 'check' },
  { status: 'SEM_INTERESSE', label: 'Recusados', icon: 'close' }
]);

/**
 * Retorna um ícone SVG enxuto e acessível sem depender de biblioteca externa.
 * Os caminhos são decorativos; o rótulo textual de cada etapa permanece a
 * fonte de verdade para leitores de tela.
 */
function overviewStageIcon(name) {
  const paths = {
    users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
    phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.69 2.8a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.33 1.84.56 2.8.69A2 2 0 0 1 22 16.92z"/>',
    message: '<path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z"/><path d="M8 9h8M8 13h5"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/>',
    document: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h6"/>',
    check: '<circle cx="12" cy="12" r="10"/><path d="m8 12 2.5 2.5L16 9"/>',
    close: '<circle cx="12" cy="12" r="10"/><path d="m15 9-6 6M9 9l6 6"/>'
  };
  return `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${paths[name] || paths.document}</svg>`;
}

function getOverviewStage(funnel, status) {
  const row = (Array.isArray(funnel) ? funnel : []).find((item) => String(item.status || '').toUpperCase() === status);
  return { status, total: Number(row?.total || 0), percentage: Number(row?.percentage || 0) };
}

function renderProspectingPipeline(container, funnel = []) {
  if (!container) return;

  const stages = OVERVIEW_PIPELINE_STAGES.map((stage) => ({
    ...stage,
    ...getOverviewStage(funnel, stage.status)
  }));
  const activeStages = stages.filter((stage) => stage.status !== 'SEM_INTERESSE');
  const rejectedStage = stages.find((stage) => stage.status === 'SEM_INTERESSE') || {
    status: 'SEM_INTERESSE', label: 'Recusados', icon: 'close', total: 0, percentage: 0
  };
  const baseTotal = Math.max(1, activeStages.reduce((sum, stage) => sum + stage.total, 0) + rejectedStage.total);
  const maxVolume = Math.max(1, ...activeStages.map((stage) => stage.total));
  const visualFloors = [100, 82, 68, 54, 42, 30];

  const layers = activeStages.map((stage, index) => {
    const relativeVolume = Math.round((stage.total / maxVolume) * 100);
    const visualWidth = Math.min(100, Math.max(visualFloors[index] || 30, 26 + Math.round(relativeVolume * .74)));
    const mobileWidth = Math.max(72, visualWidth);
    const isEmpty = stage.total === 0;
    return `
      <article
        class="funnel-layer${isEmpty ? ' is-empty' : ''}"
        data-status="${stage.status}"
        style="--funnel-width:${visualWidth}%;--funnel-mobile-width:${mobileWidth}%"
        aria-label="${escapeAttr(stage.label)}: ${stage.total} oportunidade(s), ${stage.percentage}% da base"
      >
        <div class="funnel-layer__shape">
          <span class="funnel-layer__index">${String(index + 1).padStart(2, '0')}</span>
          <i>${overviewStageIcon(stage.icon)}</i>
          <div class="funnel-layer__label">
            <strong>${escapeHtml(stage.label)}</strong>
            <small>${stage.percentage}% da base</small>
          </div>
          <div class="funnel-layer__value">
            <strong>${stage.total}</strong>
            <small>lead${stage.total === 1 ? '' : 's'}</small>
          </div>
        </div>
      </article>`;
  }).join('');

  const progressed = activeStages.slice(1).reduce((sum, stage) => sum + stage.total, 0);
  const openOpportunities = activeStages.filter((stage) => !['NOVO', 'FECHADO'].includes(stage.status)).reduce((sum, stage) => sum + stage.total, 0);
  const closed = activeStages.find((stage) => stage.status === 'FECHADO')?.total || 0;
  const dominantStage = [...activeStages].sort((a, b) => b.total - a.total)[0] || activeStages[0];

  const distributionRows = stages.map((stage) => {
    const width = stage.total > 0 ? Math.max(4, Math.round((stage.total / maxVolume) * 100)) : 0;
    return `
      <li data-status="${stage.status}">
        <i>${overviewStageIcon(stage.icon)}</i>
        <div>
          <span><strong>${escapeHtml(stage.label)}</strong><b>${stage.total}</b></span>
          <div class="funnel-distribution__track"><span style="width:${width}%"></span></div>
        </div>
        <small>${stage.percentage}%</small>
      </li>`;
  }).join('');

  container.innerHTML = `
    <div class="prospecting-funnel">
      <section class="funnel-chart-card" aria-label="Funil atual de prospecção">
        <header class="funnel-chart-card__header">
          <div>
            <span class="funnel-eyebrow">Pipeline atual</span>
            <strong>Da descoberta ao fechamento</strong>
            <small>A largura organiza as etapas; os números mostram o volume real.</small>
          </div>
          <div class="funnel-total"><strong>${baseTotal}</strong><span>oportunidades</span></div>
        </header>

        <div class="funnel-stack">${layers}</div>

        <aside class="funnel-rejected" aria-label="Oportunidades recusadas">
          <i>${overviewStageIcon(rejectedStage.icon)}</i>
          <div><strong>${escapeHtml(rejectedStage.label)}</strong><span>Saíram do fluxo comercial</span></div>
          <b>${rejectedStage.total}</b>
          <small>${rejectedStage.percentage}% da base</small>
        </aside>
      </section>

      <aside class="funnel-insights-card">
        <header>
          <span class="funnel-eyebrow">Leitura executiva</span>
          <strong>Saúde do funil</strong>
          <small>Distribuição das oportunidades em cada decisão comercial.</small>
        </header>

        <div class="funnel-kpis">
          <article><span>Avançaram</span><strong>${progressed}</strong><small>${Math.round((progressed / baseTotal) * 100)}% da base</small></article>
          <article><span>Em negociação</span><strong>${openOpportunities}</strong><small>entre contato e proposta</small></article>
          <article><span>Fechados</span><strong>${closed}</strong><small>${Math.round((closed / baseTotal) * 100)}% da base</small></article>
        </div>

        <div class="funnel-highlight">
          <span>Maior concentração</span>
          <strong>${escapeHtml(dominantStage?.label || 'Sem dados')}</strong>
          <small>${dominantStage?.total || 0} oportunidade(s) aguardando ação.</small>
        </div>

        <ul class="funnel-distribution">${distributionRows}</ul>
      </aside>
    </div>`;
}

function buildConversionStages(summary = {}, funnel = []) {
  const counts = Object.fromEntries(OVERVIEW_PIPELINE_STAGES.map((stage) => [stage.status, getOverviewStage(funnel, stage.status).total]));
  const total = Math.max(0, Number(summary.totalLeads || 0));
  const contacted = Math.max(0, Number(summary.contacted || 0));
  const interested = counts.INTERESSADO + counts.REUNIAO + counts.PROPOSTA + counts.FECHADO;
  const meetings = counts.REUNIAO + counts.PROPOSTA + counts.FECHADO;
  const proposals = counts.PROPOSTA + counts.FECHADO;
  const closed = counts.FECHADO;
  const rate = (value, base) => base > 0 ? Math.min(100, Math.round((value / base) * 100)) : 0;
  return [
    { label: 'Novos → Contatados', value: contacted, base: total, rate: rate(contacted, total) },
    { label: 'Contatados → Interessados', value: interested, base: contacted, rate: rate(interested, contacted) },
    { label: 'Interessados → Reuniões', value: meetings, base: interested, rate: rate(meetings, interested) },
    { label: 'Reuniões → Propostas', value: proposals, base: meetings, rate: rate(proposals, meetings) },
    { label: 'Propostas → Fechados', value: closed, base: proposals, rate: rate(closed, proposals) }
  ];
}

function renderConversionAnalytics(container, summary = {}, funnel = []) {
  if (!container) return;
  const stages = buildConversionStages(summary, funnel);
  const total = Math.max(0, Number(summary.totalLeads || 0));
  const contacted = Math.max(0, Number(summary.contacted || 0));
  const proposals = Math.max(0, Number(summary.proposals || 0));
  const closed = Math.max(0, Number(summary.closed || 0));
  const proposalReach = proposals + closed;
  const ticketAverage = closed > 0 ? Number(summary.closedRevenue || 0) / closed : 0;
  const percent = (value, base) => base > 0 ? Math.min(100, Math.round((value / base) * 100)) : 0;

  const kpis = [
    { icon: 'users', label: 'Taxa de contato', value: `${Number(summary.contactRate || 0)}%`, detail: `${contacted} de ${total} leads`, note: 'Primeira abordagem realizada' },
    { icon: 'document', label: 'Taxa de propostas', value: `${percent(proposalReach, contacted)}%`, detail: `${proposalReach} de ${contacted} contatos`, note: 'Chegaram à proposta' },
    { icon: 'check', label: 'Taxa de fechamento', value: `${percent(closed, proposalReach)}%`, detail: `${closed} de ${proposalReach} propostas`, note: 'Conversão em cliente' },
    { icon: 'chart', label: 'Ticket médio', value: formatMoney(ticketAverage), detail: 'Receita média por negócio', note: closed ? `${closed} fechamento(s)` : 'Sem fechamento registrado' }
  ];

  const chartIcon = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19V9M10 19V5M16 19v-8M22 19V2"/></svg>';
  const kpiMarkup = kpis.map((item) => `
    <article class="conversion-kpi">
      <i>${item.icon === 'chart' ? chartIcon : overviewStageIcon(item.icon)}</i>
      <span>${escapeHtml(item.label)}</span>
      <strong>${escapeHtml(item.value)}</strong>
      <small>${escapeHtml(item.detail)}</small>
      <em>${escapeHtml(item.note)}</em>
    </article>`).join('');

  const stageMarkup = stages.map((stage) => `
    <article class="conversion-stage-row">
      <div class="conversion-stage-row__head"><strong>${escapeHtml(stage.label)}</strong><span>${stage.value} de ${stage.base}</span></div>
      <div class="conversion-stage-row__meter" aria-label="${escapeAttr(stage.label)}: ${stage.rate}%"><span style="width:${stage.rate}%"></span><b>${stage.rate}%</b></div>
    </article>`).join('');

  container.innerHTML = `
    <div class="conversion-analytics">
      <div class="conversion-kpi-grid">${kpiMarkup}</div>
      <section class="conversion-stage-panel">
        <div class="conversion-stage-panel__heading">
          <div><strong>Conversão por etapa do pipeline</strong><span>Eficiência entre cada decisão comercial.</span></div>
          <div class="conversion-legend"><i></i> conversão <i></i> perda</div>
        </div>
        <div class="conversion-stage-list">${stageMarkup}</div>
      </section>
      <footer class="conversion-summary-strip">
        <div><i>${overviewStageIcon('users')}</i><span>Total de oportunidades</span><strong>${total}</strong></div>
        <div><i>${chartIcon}</i><span>Receita potencial</span><strong>${escapeHtml(formatMoney(summary.estimatedPipelineRevenue || 0))}</strong></div>
        <div><i>${overviewStageIcon('calendar')}</i><span>Atualização</span><strong>Dados atuais</strong></div>
      </footer>
    </div>`;
}

function renderHorizontalBars(container, rows, { valueFormatter = (value) => String(value), empty = 'Sem dados suficientes.' } = {}) {
  if (!container) return;
  const safeRows = Array.isArray(rows) ? rows : [];
  const max = Math.max(...safeRows.map((row) => Number(row.value || 0)), 1);
  container.innerHTML = safeRows.some((row) => Number(row.value || 0) > 0) ? safeRows.map((row) => {
    const value = Number(row.value || 0);
    const width = value ? Math.max(4, Math.round((value / max) * 100)) : 0;
    return `<article class="executive-bar-row"><div><strong>${escapeHtml(row.label)}</strong><small>${escapeHtml(row.detail || '')}</small></div><div class="executive-bar-track"><span style="width:${width}%"></span></div><b>${escapeHtml(valueFormatter(value))}</b></article>`;
  }).join('') : `<p class="meta">${escapeHtml(empty)}</p>`;
}

function renderColumnChart(container, rows, { valueFormatter = (value) => String(value), empty = 'Sem dados para exibir.' } = {}) {
  if (!container) return;
  const safeRows = Array.isArray(rows) ? rows : [];
  const max = Math.max(...safeRows.map((row) => Number(row.value || 0)), 1);
  if (!safeRows.some((row) => Number(row.value || 0) > 0)) {
    container.innerHTML = `<p class="meta">${escapeHtml(empty)}</p>`;
    return;
  }
  container.innerHTML = `<div class="column-chart">${safeRows.map((row) => {
    const value = Number(row.value || 0);
    const height = value ? Math.max(8, Math.round((value / max) * 100)) : 3;
    return `<article class="column-chart-item" title="${escapeAttr(row.label)}: ${escapeAttr(valueFormatter(value))}"><div class="column-chart-value">${escapeHtml(valueFormatter(value))}</div><div class="column-chart-track"><span style="height:${height}%;--mobile-bar:${height}%"></span></div><strong>${escapeHtml(row.label)}</strong><small>${escapeHtml(row.detail || '')}</small></article>`;
  }).join('')}</div>`;
}

function renderRevenueStageCards(container, rows) {
  if (!container) return;
  const safeRows = Array.isArray(rows) ? rows : [];
  container.innerHTML = safeRows.length ? safeRows.map((row) => `
    <article class="revenue-stage-card">
      <small>${escapeHtml(row.label)}</small>
      <strong>${escapeHtml(formatMoney(row.value || 0))}</strong>
      <span>${escapeHtml(row.detail || '')}</span>
    </article>
  `).join('') : '<p class="meta">Sem dados suficientes para calcular ganhos.</p>';
}

function renderDonut(container, segments, centerLabel, centerValue) {
  if (!container) return;
  const safe = (Array.isArray(segments) ? segments : []).map((item) => ({ ...item, value: Math.max(0, Number(item.value || 0)) }));
  const total = safe.reduce((sum, item) => sum + item.value, 0);
  let cursor = 0;
  const palette = ['#2563eb', '#06b6d4', '#22c55e', '#f59e0b', '#ef4444'];
  const stops = safe.map((item, index) => {
    const start = total ? (cursor / total) * 360 : 0;
    cursor += item.value;
    const end = total ? (cursor / total) * 360 : 360;
    return `${palette[index % palette.length]} ${start}deg ${end}deg`;
  });
  container.innerHTML = `<div class="donut-chart" style="background:conic-gradient(${stops.join(',') || '#e2e8f0 0deg 360deg'})"><div><strong>${escapeHtml(centerValue)}</strong><span>${escapeHtml(centerLabel)}</span></div></div><div class="donut-legend">${safe.map((item,index)=>`<span><i style="background:${palette[index%palette.length]}"></i><b>${escapeHtml(item.label)}</b><em>${item.value}</em></span>`).join('')}</div>`;
}

// -----------------------------------------------------------------------------
// Dashboard executivo e indicadores comerciais
// -----------------------------------------------------------------------------
async function loadExecutiveOverview() {
  if (!authToken || !overviewRevenueChart) return;
  overviewRevenueChart.innerHTML = '<p class="loading">Atualizando indicadores...</p>';
  try {
    const [reportResponse, leadsResponse] = await Promise.all([
      apiFetch('/api/reports/commercial'),
      apiFetch('/api/leads')
    ]);
    const report = await readJson(reportResponse);
    const leads = await readJson(leadsResponse);
    if (!reportResponse.ok) throw new Error(report.error || 'Erro ao carregar indicadores.');
    if (!leadsResponse.ok) throw new Error(leads.error || 'Erro ao carregar leads.');
    renderExecutiveOverview(report, Array.isArray(leads) ? leads : []);
  } catch (error) {
    overviewRevenueChart.innerHTML = `<p class="error">${escapeHtml(error.message)}</p>`;
  }
}

function renderExecutiveOverview(report = {}, leads = []) {
  const summary = report.summary || {};
  const funnel = Array.isArray(report.funnel) ? report.funnel : [];
  const weights = { NOVO: .08, CONTATADO: .16, INTERESSADO: .34, REUNIAO: .46, PROPOSTA: .58, FECHADO: 1, SEM_INTERESSE: 0 };
  const revenueByStage = funnel.map((item) => {
    const matching = leads.filter((lead) => normalizeStatus(lead.status) === item.status);
    const value = matching.reduce((sum, lead) => sum + estimateTicket(lead.ticketEstimado) * (weights[item.status] || 0), 0);
    return { label: overviewStatusLabel(item.status), value: Math.round(value), detail: `${Number(item.total || 0)} oportunidade(s)` };
  });
  renderRevenueStageCards(overviewRevenueChart, revenueByStage);
  renderProspectingPipeline(overviewProspectingChart, funnel);

  const contacted = Number(summary.contacted || 0);
  const notContacted = Math.max(0, Number(summary.totalLeads || 0) - contacted);
  renderDonut(overviewContactChart, [{ label: 'Contatados', value: contacted }, { label: 'Não contatados', value: notContacted }], 'taxa de contato', `${Number(summary.contactRate || 0)}%`);

  const accepted = Number(summary.closed || 0);
  const rejected = leads.filter((lead) => normalizeStatus(lead.status) === 'SEM_INTERESSE').length;
  const negotiating = Number(summary.proposals || 0);
  renderDonut(overviewProposalChart, [{ label: 'Em negociação', value: negotiating }, { label: 'Aceitas', value: accepted }, { label: 'Recusadas', value: rejected }], 'propostas', `${negotiating + accepted + rejected}`);

  renderConversionAnalytics(overviewConversionChart, summary, funnel);

  if (overviewPipelineExecutive) {
    overviewPipelineExecutive.innerHTML = funnel.map((item) => {
      const stage = revenueByStage.find((row) => row.label === overviewStatusLabel(item.status));
      return `<article class="overview-pipeline-card"><small>${escapeHtml(overviewStatusLabel(item.status))}</small><strong>${Number(item.total || 0)}</strong><span>${Number(item.percentage || 0)}% da base</span><b>${formatMoney(stage?.value || 0)}</b></article>`;
    }).join('') || '<p class="meta">Sem dados no pipeline.</p>';
  }
}

if (overviewRefreshButton) overviewRefreshButton.addEventListener('click', loadExecutiveOverview);
window.loadExecutiveOverview = loadExecutiveOverview;

async function refreshStats() {
  if (!statsBox) return;

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



const OPERATIONAL_HISTORY_STORAGE_KEY = 'leadhunter:operational-history';
const OPERATIONAL_HISTORY_LIMIT = 80;

/**
 * Recupera o histórico operacional salvo no navegador atual.
 * O armazenamento contém somente textos e identificadores já enviados pela API.
 */
function readOperationalHistory() {
  try {
    const items = JSON.parse(localStorage.getItem(OPERATIONAL_HISTORY_STORAGE_KEY) || '[]');
    return Array.isArray(items) ? items : [];
  } catch {
    localStorage.removeItem(OPERATIONAL_HISTORY_STORAGE_KEY);
    return [];
  }
}

/**
 * Armazena novos alertas e orientações sem duplicar a mesma ocorrência.
 * O registro é movido para a tela Histórico, mantendo o Plano de ação enxuto.
 */
function recordOperationalHistory(cockpitData) {
  const generatedAt = cockpitData?.generatedAt || new Date().toISOString();
  const alerts = Array.isArray(cockpitData?.alerts) ? cockpitData.alerts : [];
  const advice = Array.isArray(cockpitData?.managerAdvice) ? cockpitData.managerAdvice : [];
  const current = readOperationalHistory();
  const nextEntries = [
    ...alerts.map((item) => ({
      type: 'alert',
      leadId: item.leadId ? String(item.leadId) : '',
      title: item.leadName || 'Oportunidade',
      message: item.reason || item.action || 'Requer atenção',
      createdAt: generatedAt
    })),
    ...advice.map((message) => ({
      type: 'advice',
      leadId: '',
      title: 'Orientação',
      message: String(message || ''),
      createdAt: generatedAt
    }))
  ].filter((entry) => entry.message);

  const known = new Set(current.map((entry) => `${entry.type}|${entry.leadId}|${entry.title}|${entry.message}`));
  const additions = nextEntries.filter((entry) => {
    const signature = `${entry.type}|${entry.leadId}|${entry.title}|${entry.message}`;
    if (known.has(signature)) return false;
    known.add(signature);
    return true;
  });

  if (!additions.length) return;

  try {
    localStorage.setItem(
      OPERATIONAL_HISTORY_STORAGE_KEY,
      JSON.stringify([...additions, ...current].slice(0, OPERATIONAL_HISTORY_LIMIT))
    );
  } catch {
    // Falha de storage não interfere na operação principal do cockpit.
  }
}

/** Renderiza alertas e orientações dentro da tela Histórico. */
function renderOperationalHistory() {
  if (!historyAlertsList) return;
  const entries = readOperationalHistory();
  historyAlertsList.innerHTML = entries.length ? entries.map((entry) => `
    <article class="history-item operational-history-item ${entry.type === 'advice' ? 'is-advice' : 'is-alert'}">
      <div>
        <span class="operational-history-type">${entry.type === 'advice' ? 'Orientação' : 'Alerta operacional'}</span>
        <strong>${escapeHtml(entry.title || 'Registro comercial')}</strong>
        <p>${escapeHtml(entry.message || '')}</p>
        <small>${formatDate(entry.createdAt)}</small>
      </div>
      ${entry.leadId ? `<button type="button" class="secondary mini" data-history-alert-lead="${escapeAttr(entry.leadId)}">Abrir lead</button>` : ''}
    </article>`).join('') : '<p class="meta">Nenhum alerta ou orientação foi registrado ainda.</p>';

  historyAlertsList.querySelectorAll('[data-history-alert-lead]').forEach((button) => {
    button.addEventListener('click', () => openLeadDetail(button.dataset.historyAlertLead));
  });
}

async function loadHistory() {
  renderOperationalHistory();
  if (!historyList || !authToken) return;

  try {
    const response = await apiFetch('/api/leads');
    const leads = await readJson(response);
    if (!response.ok) throw new Error(leads.error || 'Erro ao carregar histórico.');

    const contactedStatuses = new Set(['CONTATADO', 'INTERESSADO', 'REUNIAO', 'PROPOSTA', 'FECHADO', 'SEM_INTERESSE']);
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
            <button type="button" class="secondary" onclick="focusLead(${jsArg(leadId)})">Abrir no CRM</button>
            <button type="button" class="secondary" onclick="scheduleFollowup(${jsArg(leadId)})">Agendar retorno</button>
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

  if (dashboardInsights && !dashboardInsights.dataset.aiLoaded) {
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
          <button type="button" class="secondary" onclick="openLeadDetail(${jsArg(leadId)})">Abrir ficha</button>
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

// -----------------------------------------------------------------------------
// CRM visual, pipeline Kanban e detalhamento de leads
// -----------------------------------------------------------------------------
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
    <article class="kanban-card" data-lead-id="${escapeAttr(leadId)}" draggable="true" onclick="openLeadDetail(${jsArg(leadId)})" ondragstart="dragLead(event, ${jsArg(leadId)})" title="Clique para abrir a ficha do lead">
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
      ${whatsapp ? `<a href="${escapeAttr(whatsapp)}" target="_blank" onclick="recordContact(${jsArg(leadId)})">WhatsApp</a>` : ''}
    </div>
    <div class="links">
      <button type="button" class="secondary" onclick="updateStatus(${jsArg(leadId)},'CONTATADO')">Contato feito</button>
      <button type="button" class="secondary" onclick="updateStatus(${jsArg(leadId)},'INTERESSADO')">Interessado</button>
      <button type="button" class="secondary" onclick="updateStatus(${jsArg(leadId)},'REUNIAO')">Reunião</button>
      <button type="button" class="secondary" onclick="updateStatus(${jsArg(leadId)},'PROPOSTA')">Proposta</button>
      <button type="button" class="secondary" onclick="generateApproach(${jsArg(leadId)}, 'new', 'generic')">🧠 Consultor IA</button>
      <button type="button" class="secondary" onclick="generateProposal(${jsArg(leadId)})">📄 Gerar proposta</button>
      <button type="button" class="secondary" onclick="closeAsCustomer(${jsArg(leadId)})">✅ Fechar cliente</button>
      <button type="button" class="secondary" onclick="markAsLost(${jsArg(leadId)})">Perdido</button>
      <button type="button" class="secondary" onclick="scheduleFollowup(${jsArg(leadId)})">Agendar retorno</button>
    </div>
    <section class="reply-workflow card-panel soft">
      <h4>Resposta recebida</h4>
      <p class="meta">Cole a mensagem do lead. A análise registra a interação, atualiza a etapa do funil e apresenta o próximo passo.</p>
      <label class="reply-label">Mensagem do lead<textarea id="reply-modal-${escapeAttr(leadId)}" placeholder="Ex.: Tenho interesse. Quanto custa?"></textarea></label>
      <button type="button" class="secondary" onclick="analyzeReply(${jsArg(leadId)}, 'modal')">Analisar e atualizar funil</button>
      <div id="analysis-modal-${escapeAttr(leadId)}" class="analysis" aria-live="polite"></div>
    </section>
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
            ${['NOVO','CONTATADO','INTERESSADO','REUNIAO','PROPOSTA','FECHADO','SEM_INTERESSE'].map((status) => `<option ${status === normalizeStatus(lead.status) ? 'selected' : ''}>${status}</option>`).join('')}
          </select>
        </label>
        <label>Tags<input id="tags-${escapeAttr(leadId)}" value="${escapeAttr(tags)}" placeholder="ex: urgente, site ruim" /></label>
        <label class="check"><input id="fav-${escapeAttr(leadId)}" type="checkbox" ${lead.favorito ? 'checked' : ''} /> Favorito</label>
      </div>
      <label>Notas comerciais<textarea id="notes-${escapeAttr(leadId)}" placeholder="Ex: respondeu rápido, pedir orçamento, retornar sexta...">${escapeHtml(lead.notas || '')}</textarea></label>
      <div class="links">
        <button type="button" class="secondary" onclick="saveLeadMeta(${jsArg(leadId)})">Salvar CRM</button>
        <button type="button" class="approach-btn" onclick="generateApproach(${jsArg(leadId)}, 'new', 'generic')">🧠 Consultor IA</button>
        <button type="button" class="secondary" onclick="generateCampaign(${jsArg(leadId)})">Sequência</button>
        <button type="button" class="secondary" onclick="generateProposal(${jsArg(leadId)})">Gerar proposta</button>
        <button type="button" class="secondary" onclick="closeAsCustomer(${jsArg(leadId)})">Fechar cliente</button>
        <button type="button" class="secondary" onclick="scheduleFollowup(${jsArg(leadId)})">Agendar follow-up</button>
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
          ${whatsapp ? `<a href="${escapeAttr(whatsapp)}" target="_blank" onclick="recordContact(${jsArg(leadId)})">WhatsApp pronto</a>` : ''}
          <button type="button" class="copy" onclick='copyApproach(${jsArg(leadId)})'>Copiar mensagem</button>
        </div>
        <label class="reply-label">Resposta recebida do lead<textarea id="reply-${escapeAttr(leadId)}" placeholder="Cole aqui a resposta recebida."></textarea></label>
        <button type="button" class="secondary" onclick="analyzeReply(${jsArg(leadId)}, 'card')">Analisar resposta</button>
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

// -----------------------------------------------------------------------------
// Estratégia, abordagem e análise de respostas comerciais
// -----------------------------------------------------------------------------
async function generateApproach(leadId, mode = 'new', channel = 'generic') {
  const outputs = [
    document.getElementById(`approach-${leadId}`),
    document.getElementById(`approach-modal-${leadId}`)
  ].filter(Boolean);

  outputs.forEach((output) => {
    output.textContent = `Analisando lead, histórico e peça comercial (${channelLabel(channel)})...`;
  });

  try {
    const response = await apiFetch('/api/gerar-abordagem', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        leadId,
        mode,
        channel,
        regenerateKey: `${mode}-${channel}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
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

    statusBox.innerHTML = `<p>${escapeHtml(channelLabel(data.channel || channel))} gerado com ${escapeHtml(engineLabel(data))} e estratégia ${escapeHtml(data.strategy?.name || 'comercial')}.</p>`;
  } catch (error) {
    outputs.forEach((output) => {
      output.textContent = error.message;
    });
    showError(error.message);
  }
}


function channelLabel(channel = 'generic') {
  const labels = {
    generic: 'Abordagem inicial',
    whatsapp: 'Mensagem de WhatsApp',
    email: 'E-mail comercial',
    call: 'Roteiro de ligação',
    objection: 'Tratamento de objeção',
    followup: 'Follow-up',
    proposal: 'Convite para diagnóstico'
  };
  return labels[String(channel || 'generic').toLowerCase()] || 'Peça comercial';
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

function renderCommercialContactStatus(status = {}) {
  const whatsapp = status.whatsapp || {};
  const phone = status.telefone || {};
  const email = status.email || {};
  const networks = Array.isArray(status.redesSociais) ? status.redesSociais : [];
  const restrictions = Array.isArray(status.restricoes) ? status.restricoes : [];

  return `
    <div class="commercial-contact-status">
      <p><strong>Canal prioritário:</strong> ${escapeHtml(status.orientacao || 'Revisar os contatos disponíveis.')}</p>
      <ul>
        <li><strong>WhatsApp:</strong> ${whatsapp.disponivel ? 'caminho disponível para tentativa' : 'não localizado'}${whatsapp.verificadoAtivo ? ' e confirmado' : ' — atividade não confirmada automaticamente'}</li>
        <li><strong>Telefone:</strong> ${phone.disponivel ? escapeHtml(phone.tipoProvavel || 'disponível') : 'não localizado'}</li>
        <li><strong>E-mail:</strong> ${email.disponivel ? escapeHtml(email.endereco || 'disponível') : 'não localizado'}</li>
        <li><strong>Outras vias:</strong> ${networks.length ? networks.map((item) => escapeHtml(item.plataforma || 'rede social')).join(', ') : 'não localizadas'}</li>
      </ul>
      ${restrictions.length ? `<p class="meta">${restrictions.map(escapeHtml).join(' ')}</p>` : ''}
    </div>`;
}

function renderCommercialNextAction(action = {}, automaticTask = null) {
  const task = automaticTask || action.task || null;
  return `
    <div class="commercial-next-action">
      <p><strong>Etapa atual:</strong> ${escapeHtml(action.etapaAtual || '-')}</p>
      <p><strong>Ação:</strong> ${escapeHtml(action.acao || 'Revisar o próximo passo.')}</p>
      <p>${escapeHtml(action.descricao || '')}</p>
      ${action.valorReferencia ? `<p><strong>Valor de referência:</strong> ${escapeHtml(action.valorReferencia)}</p>` : ''}
      ${action.agendamentoMinutos ? `<p><strong>Conversa sugerida:</strong> ${Number(action.agendamentoMinutos)} minutos</p>` : ''}
      ${task ? `<p class="task-created"><strong>${task.created === false ? 'Tarefa já existente' : 'Tarefa criada'}:</strong> ${escapeHtml(task.title || action.acao || '')}</p>` : ''}
      ${action.agendaUrl ? `<a class="agenda-link" href="${escapeAttr(action.agendaUrl)}" target="_blank" rel="noopener">Abrir agenda comercial</a>` : ''}
    </div>`;
}

function renderPracticalDiagnosis(diagnosis = {}) {
  const points = Array.isArray(diagnosis.pontos) ? diagnosis.pontos : [];
  if (!points.length) return '';
  return `
    <details class="practical-diagnosis">
      <summary>Diagnóstico prático para enviar após o aceite</summary>
      ${points.map((point) => `<article><strong>${escapeHtml(point.achado || '')}</strong><p>${escapeHtml(point.impacto || '')}</p><small>${escapeHtml(point.solucao || '')}</small></article>`).join('')}
    </details>`;
}

function renderSalesApproach(data, leadId = '') {
  const diagnostics = data.diagnostics || {};
  const tags = Array.isArray(diagnostics.opportunityTags) ? diagnostics.opportunityTags : [];
  const followUps = Array.isArray(data.followUps) ? data.followUps : [];
  const explanation = Array.isArray(data.explanation) ? data.explanation : [];
  const qualityChecklist = Array.isArray(data.qualityChecklist) ? data.qualityChecklist : [];
  const commercialEngine = data.commercialEngine || {};
  const contactStatus = data.statusContatos || commercialEngine.statusContatos || {};
  const nextAction = data.proximaAcaoFunil || commercialEngine.proximaAcaoFunil || {};
  const diagnosis = data.diagnosticoPratico || commercialEngine.diagnosticoPratico || {};
  const suggestedMessage = data.mensagemAbordagemSugerida || commercialEngine.mensagemAbordagemSugerida || data.abordagem || '';

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

      <section class="commercial-engine-output">
        <article>
          <h4>1. Mensagem de Abordagem Sugerida</h4>
          <pre class="msg strategy-message">${escapeHtml(suggestedMessage)}</pre>
          <button type="button" class="copy" onclick="copyNearestText(this, '.strategy-message')">Copiar para WhatsApp</button>
        </article>
        <article>
          <h4>2. Status de Contatos</h4>
          ${renderCommercialContactStatus(contactStatus)}
        </article>
        <article>
          <h4>3. Próxima Ação no Funil</h4>
          ${renderCommercialNextAction(nextAction, data.automaticTask)}
        </article>
        ${renderPracticalDiagnosis(diagnosis)}
      </section>

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
      ${qualityChecklist.length ? `<p class="meta"><strong>Qualidade:</strong> ${qualityChecklist.map(escapeHtml).join(' · ')}</p>` : ''}

      <div class="approach-actions">
        ${leadId ? `<button type="button" class="secondary" onclick="generateApproach(${jsArg(leadId)},'variant',${jsArg(data.channel || 'generic')})">🔄 Outra versão</button>` : ''}
        ${leadId ? `<button type="button" class="secondary" onclick="generateApproach(${jsArg(leadId)},'improve',${jsArg(data.channel || 'generic')})">✨ Melhorar</button>` : ''}
      </div>

      ${leadId ? `
        <h4>Gerar para outro canal</h4>
        <div class="channel-actions">
          <button type="button" class="secondary" onclick="generateApproach(${jsArg(leadId)},'new','whatsapp')">📱 WhatsApp</button>
          <button type="button" class="secondary" onclick="generateApproach(${jsArg(leadId)},'new','email')">📧 E-mail</button>
          <button type="button" class="secondary" onclick="generateApproach(${jsArg(leadId)},'new','call')">📞 Ligação</button>
          <button type="button" class="secondary" onclick="generateApproach(${jsArg(leadId)},'followup','followup')">🔁 Follow-up</button>
          <button type="button" class="secondary" onclick="generateApproach(${jsArg(leadId)},'new','objection')">🛡️ Objeção</button>
          <button type="button" class="secondary" onclick="generateApproach(${jsArg(leadId)},'new','proposal')">🎯 Diagnóstico</button>
        </div>
      ` : ''}

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

function applyLeadUpdate(updatedLead) {
  if (!updatedLead) return;
  const updatedId = getLeadId(updatedLead);
  const index = lastLeads.findIndex((lead) => String(getLeadId(lead)) === String(updatedId));

  if (index >= 0) lastLeads[index] = updatedLead;
  else lastLeads.push(updatedLead);

  window.lastLeads = lastLeads;
  renderKanban(lastLeads);
  renderDashboardExtras(lastLeads);
  renderExecutiveStats(lastLeads);
  renderActivityTimeline(lastLeads);
}

function renderReplyAnalysis(data, leadId) {
  const analysis = data.analysis || {};
  const transition = data.transition || {};
  const transitionText = transition.changed
    ? `Lead movido de ${transition.from} para ${transition.to}.`
    : `Lead mantido em ${transition.to || analysis.status}.`;
  const nextAction = data.proximaAcaoFunil || data.commercialEngine?.proximaAcaoFunil || {};
  const task = data.automaticTask || null;

  return `
    <div class="reply-analysis-result">
      <p><strong>Intenção:</strong> ${escapeHtml(analysis.intent || '-')}</p>
      <p><strong>Movimentação:</strong> ${escapeHtml(transitionText)}</p>
      <p><strong>Próximo passo:</strong> ${escapeHtml(nextAction.descricao || analysis.proximoPasso || '-')}</p>
      ${task ? `<p class="task-created"><strong>${task.created === false ? 'Tarefa mantida' : 'Tarefa criada automaticamente'}:</strong> ${escapeHtml(task.title || '')}</p>` : ''}
      ${analysis.respostaSugerida ? `<p class="msg">${escapeHtml(analysis.respostaSugerida)}</p><button type="button" class="copy" onclick="copyNearestText(this, '.msg')">Copiar retorno</button>` : ''}
      ${task ? '' : `<button type="button" class="secondary" onclick="scheduleFollowup(${jsArg(leadId)})">Agendar próximo passo</button>`}
    </div>`;
}

async function analyzeReply(leadId, scope = 'card') {
  const prefix = scope === 'modal' ? 'modal-' : '';
  const textarea = document.getElementById(`reply-${prefix}${leadId}`);
  const output = document.getElementById(`analysis-${prefix}${leadId}`);
  const resposta = textarea?.value?.trim() || '';

  if (!output) {
    showError('A área de análise da resposta não foi encontrada. Reabra a ficha do lead.');
    return;
  }

  if (!resposta) {
    output.innerHTML = '<p class="error">Cole a resposta recebida antes de analisar.</p>';
    textarea?.focus();
    return;
  }

  output.innerHTML = '<p class="loading">Analisando resposta e atualizando o funil...</p>';

  try {
    const response = await apiFetch('/api/analisar-resposta', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ leadId, resposta })
    });
    const data = await readJson(response);
    if (!response.ok) throw new Error(data.error || 'Erro ao analisar resposta.');

    applyLeadUpdate(data.lead);
    const resultHtml = renderReplyAnalysis(data, leadId);

    if (scope === 'modal') {
      openLeadDetail(leadId);
      const refreshedOutput = document.getElementById(`analysis-modal-${leadId}`);
      if (refreshedOutput) refreshedOutput.innerHTML = resultHtml;
    } else {
      output.innerHTML = resultHtml;
    }

    if (statusBox) {
      const transition = data.transition || {};
      statusBox.innerHTML = `<p>${escapeHtml(transition.changed
        ? `Resposta registrada. Lead movido para ${transition.to}.`
        : `Resposta registrada. Lead mantido em ${transition.to || data.analysis?.status}.`)}</p>`;
    }

    await Promise.allSettled([refreshStats(), loadHistory(), loadFollowups(), loadAgenda()]);
  } catch (error) {
    output.innerHTML = `<p class="error">${escapeHtml(error.message)}</p>`;
  }
}

async function markStatus(leadId, status) {
  const response = await apiFetch('/api/leads/status', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ leadId, status }) });
  const data = await readJson(response);
  if (!response.ok) throw new Error(data.error || 'Erro ao atualizar status.');
  return data;
}

async function recordContact(leadId) {
  try {
    const currentLead = lastLeads.find((lead) => String(getLeadId(lead)) === String(leadId));
    const currentStatus = normalizeStatus(currentLead?.status);
    const targetStatus = currentStatus === 'NOVO' ? 'CONTATADO' : currentStatus;
    const updatedLead = await markStatus(leadId, targetStatus);
    applyLeadUpdate(updatedLead);
    if (statusBox) statusBox.innerHTML = '<p>Primeiro contato registrado no funil.</p>';
    await Promise.allSettled([refreshStats(), loadHistory()]);
  } catch (error) {
    showError(`O canal foi aberto, mas o contato não pôde ser registrado: ${error.message}`);
  }
}

window.recordContact = recordContact;
window.analyzeReply = analyzeReply;

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(String(text || ''));
    if (statusBox) statusBox.innerHTML = '<p>Mensagem copiada.</p>';
  } catch {
    showError('Não foi possível copiar automaticamente. Selecione o texto e copie manualmente.');
  }
}
function copyNearestText(button, selector) {
  const container = button?.closest('.strategy-output, .proposal-output, .proposal-card, [id^="analysis-"]') || button?.parentElement?.parentElement;
  const output = container?.querySelector(selector);
  if (!output) return showError('Mensagem não encontrada para copiar.');
  return copyText(output.innerText || output.textContent);
}
function copyApproach(leadId) {
  const output = document.getElementById(`approach-${leadId}`) || document.getElementById(`approach-modal-${leadId}`);
  if (!output) return showError('Mensagem não encontrada para copiar.');
  const message = output.querySelector('.strategy-message');
  return copyText((message || output).innerText || (message || output).textContent);
}
// -----------------------------------------------------------------------------
// Funções puras de formatação, segurança de saída e apoio à interface
// -----------------------------------------------------------------------------
/** Retorna a chave estável usada para localizar o lead no CRM. */
function getLeadId(lead) {
  return String(lead.placeId || lead.nome || '').replace(/'/g, '');
}
/** Cria uma URL do WhatsApp sem interpolar dados não codificados. */
function makeWhatsAppLink(lead) {
  const phone = String(lead.telefone || '').replace(/\D/g, '');
  if (!phone) return '';

  const normalized = phone.startsWith('55') ? phone : `55${phone}`;
  const message = encodeURIComponent(lead.abordagem || '');
  return `https://wa.me/${normalized}?text=${message}`;
}
/** Mapeia a pontuação para a classe visual do cartão. */
function scoreClass(score) {
  if (score >= 80) return 'hot';
  if (score >= 65) return 'warm';
  return '';
}
function scoreStars(score = 0) { const filled = Math.max(1, Math.min(5, Math.round(Number(score || 0) / 20))); return '★★★★★'.slice(0, filled) + '☆☆☆☆☆'.slice(0, 5 - filled); }
function scoreLabel(score = 0) { if (score >= 85) return 'Excelente oportunidade'; if (score >= 70) return 'Boa oportunidade'; if (score >= 50) return 'Médio potencial'; return 'Baixa prioridade'; }
function normalizeStatus(status) {
  const value = String(status || '').trim().toUpperCase();
  const aliases = {
    CONTACTADO: 'CONTATADO',
    RESPONDEU: 'INTERESSADO',
    QUALIFICANDO: 'INTERESSADO',
    QUALIFICADO: 'INTERESSADO',
    REUNIAO_AGENDADA: 'REUNIAO',
    NEGOCIACAO: 'PROPOSTA',
    GANHO: 'FECHADO',
    CLIENTE: 'FECHADO',
    PERDIDO: 'SEM_INTERESSE',
    RECUSADO: 'SEM_INTERESSE'
  };
  const canonical = aliases[value] || value;
  return PIPELINE.some((item) => item.key === canonical) ? canonical : 'NOVO';
}
function estimateTicket(value) { const text = String(value || '0').replace(/\./g, '').replace(',', '.'); const match = text.match(/\d+(?:\.\d+)?/); return match ? Number(match[0]) : 0; }
/** Formata valores monetários conforme a localidade brasileira. */
function formatMoney(value) {
  return Number(value || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0
  });
}
/** Exibe uma mensagem escapada na região de estado da interface. */
function showError(message) {
  statusBox.innerHTML = `<p class="error">${escapeHtml(message)}</p>`;
}
function escapeHtml(value) { return String(value || '').replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#039;', '"': '&quot;' }[char])); }
function escapeAttr(value) { return escapeHtml(value).replace(/`/g, '&#096;'); }
function jsArg(value) { return escapeHtml(JSON.stringify(String(value ?? ''))).replace(/`/g, '&#096;'); }
function formatDate(value) { if (!value) return '-'; return new Date(value).toLocaleString('pt-BR'); }
/** Limita a frequência de execução de uma função acionada pela interface. */
function debounce(fn, wait) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), wait);
  };
}


// -----------------------------------------------------------------------------
// Onboarding, planos, consumo e métricas operacionais
// -----------------------------------------------------------------------------
function renderOnboarding() {
  if (!onboardingBox) return;

  const total = Array.isArray(lastLeads) ? lastLeads.length : 0;
  const contacted = total ? lastLeads.filter((lead) => ['CONTATADO', 'INTERESSADO', 'REUNIAO', 'PROPOSTA', 'FECHADO'].includes(normalizeStatus(lead.status))).length : 0;
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
    plansGrid.innerHTML = `<p class="error">${escapeHtml(error.message)}</p>`;
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
    systemMetrics.innerHTML = `<p class="error">${escapeHtml(error.message)}</p>`;
  }
}

// -----------------------------------------------------------------------------
// Campanhas, automações, tarefas e agenda comercial
// -----------------------------------------------------------------------------
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
    const [nextResponse, campaignResponse] = await Promise.all([
      apiFetch('/api/automations/next-actions'),
      apiFetch('/api/campaigns/summary')
    ]);

    const nextData = await readJson(nextResponse);
    const campaignData = await readJson(campaignResponse);
    if (!nextResponse.ok) throw new Error(nextData.error);
    if (!campaignResponse.ok) throw new Error(campaignData.error);

    if (automationSummary) {
      automationSummary.innerHTML = `
        <article><small>Leads para campanha</small><strong>${campaignData.summary.campaignable}</strong><span>prontos para cadência</span></article>
        <article><small>Alta prioridade</small><strong>${campaignData.summary.highPriority}</strong><span>campanha hoje</span></article>
        <article><small>Leads parados</small><strong>${campaignData.summary.stuck}</strong><span>reativar com cuidado</span></article>
        <article><small>Tarefas de campanha</small><strong>${campaignData.summary.pendingCampaignTasks}</strong><span>pendentes</span></article>
      `;
    }

    const recommendations = (campaignData.recommendations || []).map((item) => `<li>${escapeHtml(item)}</li>`).join('');
    const leads = campaignData.leads || [];

    if (!leads.length) {
      automationActions.innerHTML = `
        <div class="card-panel soft">
          <strong>Sem campanhas sugeridas agora</strong>
          <p class="meta">Prospecte leads ou avance oportunidades no CRM para criar cadências inteligentes.</p>
        </div>
      `;
      return;
    }

    automationActions.innerHTML = `
      <div class="card-panel soft">
        <strong>Orientações do gerente comercial</strong>
        <ul>${recommendations}</ul>
      </div>
      ${leads.map((lead) => `
        <article class="history-item campaign-suggestion">
          <div>
            <strong>${escapeHtml(lead.name)}</strong>
            <p>${escapeHtml(lead.segment)} · ${escapeHtml(lead.status)} · Prioridade ${escapeHtml(lead.priority)}</p>
            <p class="meta">Canal sugerido: ${escapeHtml(lead.recommendedChannel)} · Objetivo: ${escapeHtml(lead.objective)}</p>
            <p>${escapeHtml(lead.reason)}</p>
          </div>
          <div class="actions-row">
            <button type="button" onclick="createSmartCampaign(${jsArg(lead.id)})">Criar campanha IA</button>
            <button type="button" class="secondary" onclick="openLeadDetail(${jsArg(lead.id)})">Ver lead</button>
          </div>
        </article>
      `).join('')}
    `;
  } catch (error) {
    automationActions.innerHTML = `<p class="error">${escapeHtml(error.message)}</p>`;
  }
}

async function createSmartCampaign(leadId) {
  try {
    statusBox.innerHTML = '<p class="loading">Criando campanha inteligente para este lead...</p>';
    const response = await apiFetch('/api/campaigns/smart-sequence', {
      method: 'POST',
      body: JSON.stringify({
        leadId,
        objective: 'vender serviço tecnológico de forma consultiva',
        createTasks: true
      })
    });

    const data = await readJson(response);
    if (!response.ok) throw new Error(data.error);

    const campaign = data.campaign || {};
    const engine = campaign.source === 'ai'
      ? `${campaign.providerLabel || 'IA'} · ${campaign.model || ''}`
      : (campaign.aiError ? `Fallback local · ${campaign.aiError}` : 'Motor Local');

    const steps = (campaign.steps || []).map((step) => `
      <article class="campaign-step">
        <strong>D+${step.day} — ${escapeHtml(step.title)}</strong>
        <small>${escapeHtml(step.channel)} · ${escapeHtml(step.goal || '')}</small>
        <textarea readonly>${escapeHtml(step.message)}</textarea>
      </article>
    `).join('');

    statusBox.innerHTML = `
      <div class="card-panel">
        <p class="tag dark">Campanha criada</p>
        <h3>${escapeHtml(campaign.campaignName || 'Campanha inteligente')}</h3>
        <p class="meta">Motor: ${escapeHtml(engine)}</p>
        <p><strong>Estratégia:</strong> ${escapeHtml(campaign.strategy || '-')}</p>
        <p>${escapeHtml(campaign.reason || '')}</p>
        ${steps}
        <p class="meta">${(data.tasks || []).length} tarefa(s) foram adicionadas à agenda comercial.</p>
      </div>
    `;

    await loadAutomationActions();
    await loadFollowups();
    await loadAgenda();
    statusBox.scrollIntoView({ behavior: 'smooth', block: 'start' });
  } catch (error) {
    showError(error.message);
  }
}

async function scheduleFollowup(leadId) {
  try {
    const lead = (Array.isArray(lastLeads) ? lastLeads : []).find((item) => String(getLeadId(item)) === String(leadId));
    if (lead && normalizeStatus(lead.status) === 'NOVO') {
      throw new Error('Faça e registre o primeiro contato antes de agendar um retorno.');
    }
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
          : `<button type="button" class="secondary" onclick="completeFollowup(${jsArg(task.id)})">Marcar como concluído</button>`
        }
      </article>
    `).join('');
  } catch (error) {
    followupList.innerHTML = `<p class="error">${escapeHtml(error.message)}</p>`;
  }
}

async function loadAgenda() {
  if (!agendaList || !authToken) return;
  agendaList.innerHTML = '<p class="loading">Carregando agenda comercial...</p>';
  if (agendaSummary) agendaSummary.innerHTML = '';

  try {
    const [response, leadsResponse] = await Promise.all([
      apiFetch('/api/agenda/summary'),
      apiFetch('/api/leads')
    ]);
    const data = await readJson(response);
    const leads = await readJson(leadsResponse);
    if (!response.ok) throw new Error(data.error || 'Erro ao carregar agenda.');
    if (!leadsResponse.ok) throw new Error(leads.error || 'Erro ao validar contatos da agenda.');

    const contactedIds = new Set((Array.isArray(leads) ? leads : [])
      .filter((lead) => normalizeStatus(lead.status) !== 'NOVO')
      .map((lead) => String(getLeadId(lead))));
    const filteredGroups = Object.fromEntries(Object.entries(data.groups || {}).map(([key, tasks]) => [
      key,
      (Array.isArray(tasks) ? tasks : []).filter((task) => !task.leadId || contactedIds.has(String(task.leadId)))
    ]));
    const allTasks = Object.values(filteredGroups).flat();
    const filteredSummary = {
      overdue: (filteredGroups.overdue || []).length,
      today: (filteredGroups.today || []).length,
      upcoming: (filteredGroups.upcoming || []).length,
      highPriority: allTasks.filter((task) => !task.done && String(task.priority || '').toUpperCase() === 'ALTA').length,
      nextTask: allTasks.find((task) => !task.done) || null
    };
    renderAgendaSummary(filteredSummary);
    renderAgendaGroups(filteredGroups);
  } catch (error) {
    agendaList.innerHTML = `<p class="error">${escapeHtml(error.message)}</p>`;
  }
}

function renderAgendaSummary(summary) {
  if (!agendaSummary) return;
  const nextTask = summary.nextTask;
  agendaSummary.innerHTML = `
    <article><small>Atrasadas</small><strong>${Number(summary.overdue || 0)}</strong><span>exigem ação imediata</span></article>
    <article><small>Hoje</small><strong>${Number(summary.today || 0)}</strong><span>tarefas para executar agora</span></article>
    <article><small>Próximos 7 dias</small><strong>${Number(summary.upcoming || 0)}</strong><span>retornos para manter aquecido</span></article>
    <article><small>Alta prioridade</small><strong>${Number(summary.highPriority || 0)}</strong><span>foco comercial principal</span></article>
    <article class="wide"><small>Próxima melhor ação</small><strong>${nextTask ? escapeHtml(nextTask.title || 'Follow-up comercial') : 'Nenhuma ação pendente'}</strong><span>${nextTask ? `${escapeHtml(nextTask.leadName || 'Lead')} · ${formatDate(nextTask.dueAt)}` : 'Abra um lead no CRM e agende um follow-up.'}</span></article>
  `;
}

function renderAgendaGroups(groups) {
  const sections = [
    { key: 'overdue', title: 'Atrasadas', empty: 'Nenhuma tarefa atrasada.', tone: 'danger' },
    { key: 'today', title: 'Para hoje', empty: 'Nenhuma tarefa para hoje.', tone: 'today' },
    { key: 'upcoming', title: 'Próximos 7 dias', empty: 'Nenhum retorno nos próximos dias.', tone: 'upcoming' },
    { key: 'later', title: 'Mais tarde', empty: 'Nenhuma tarefa futura distante.', tone: 'later' },
    { key: 'completed', title: 'Concluídas recentes', empty: 'Nenhuma tarefa concluída ainda.', tone: 'done' }
  ];

  const hasAny = sections.some((section) => Array.isArray(groups[section.key]) && groups[section.key].length);
  if (!hasAny) {
    agendaList.innerHTML = '<p class="meta">Nenhuma tarefa disponível. A agenda só começa depois que o primeiro contato com o lead for registrado.</p>';
    return;
  }

  agendaList.innerHTML = sections.map((section) => {
    const tasks = Array.isArray(groups[section.key]) ? groups[section.key] : [];
    return `
      <section class="agenda-group ${section.tone}">
        <header><h4>${section.title}</h4><span>${tasks.length}</span></header>
        ${tasks.length ? tasks.map(renderAgendaTask).join('') : `<p class="meta">${section.empty}</p>`}
      </section>
    `;
  }).join('');
}

function renderAgendaTask(task) {
  const due = new Date(task.dueAt);
  const validDate = !Number.isNaN(due.getTime());
  const dateLabel = validDate ? due.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }) : '--';
  const timeLabel = validDate ? due.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '--:--';
  const priority = escapeHtml(task.priority || 'MÉDIA');
  const done = Boolean(task.done);

  return `
    <article class="agenda-item ${done ? 'done' : ''}">
      <div class="agenda-date"><strong>${dateLabel}</strong><span>${timeLabel}</span></div>
      <div class="agenda-content">
        <h4>${escapeHtml(task.title || 'Follow-up comercial')}</h4>
        <p>${escapeHtml(task.leadName || 'Lead')}</p>
        <small>Prioridade: ${priority} · ${escapeHtml(task.automationType || 'MANUAL')}</small>
        <p>${escapeHtml(task.message || '')}</p>
      </div>
      <div class="agenda-actions">
        ${task.leadId ? `<button type="button" class="secondary" onclick="openLeadDetail(${jsArg(task.leadId)})">Ver lead</button>` : ''}
        ${done ? '<span class="tag dark">Concluído</span>' : `<button type="button" onclick="completeFollowup(${jsArg(task.id)})">Concluir</button>`}
      </div>
    </article>
  `;
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



// -----------------------------------------------------------------------------
// Inteligência comercial, relatórios, propostas e sucesso do cliente
// -----------------------------------------------------------------------------
async function loadCommercialIntelligence() {
  if (!authToken || (!commercialIntelligenceSummary && !commercialIntelligenceAdvice && !dashboardInsights)) return;

  try {
    const response = await apiFetch('/api/commercial-intelligence/summary');
    const data = await readJson(response);
    if (!response.ok) throw new Error(data.error || 'Erro ao carregar inteligência comercial.');

    renderCommercialIntelligence(data);
  } catch (error) {
    if (commercialIntelligenceAdvice) {
      commercialIntelligenceAdvice.innerHTML = `<p class="error">${escapeHtml(error.message)}</p>`;
    }
  }
}

function renderCommercialIntelligence(data) {
  const summary = data.summary || {};
  if (commercialIntelligenceSummary) {
    commercialIntelligenceSummary.innerHTML = `
      <article><small>Leads ativos</small><strong>${Number(summary.activeLeads || 0)}</strong><span>em andamento no funil</span></article>
      <article><small>Alta prioridade</small><strong>${Number(summary.highPriority || 0)}</strong><span>merecem ação primeiro</span></article>
      <article><small>Em risco</small><strong>${Number(summary.atRisk || 0)}</strong><span>podem esfriar ou perder timing</span></article>
      <article><small>Sem próximo passo</small><strong>${Number(summary.noNextStep || 0)}</strong><span>precisam de tarefa agendada</span></article>
    `;
  }

  if (commercialIntelligenceAdvice) {
    const advice = Array.isArray(data.managerAdvice) ? data.managerAdvice : [];
    commercialIntelligenceAdvice.innerHTML = advice.length ? advice.map((text) => `
      <article class="history-item manager-advice">
        <div><strong>Orientação do gerente comercial</strong><p>${escapeHtml(text)}</p></div>
      </article>
    `).join('') : '<p class="meta">Nenhuma orientação crítica neste momento.</p>';
  }

  if (dashboardInsights) {
    dashboardInsights.dataset.aiLoaded = 'true';
    const actions = Array.isArray(data.nextActions) ? data.nextActions : [];
    dashboardInsights.innerHTML = actions.length ? actions.map((item) => `
      <article class="history-item priority-${escapeAttr(String(item.priority || '').toLowerCase())}">
        <div>
          <strong>${escapeHtml(item.priority || 'MÉDIA')} · ${escapeHtml(item.leadName || 'Lead')}</strong>
          <p>${escapeHtml(item.action || 'Revisar oportunidade')}</p>
          <small>${escapeHtml(item.reason || '')}${item.risk ? ` · Risco: ${escapeHtml(item.risk)}` : ''}</small>
        </div>
        <button type="button" class="secondary" onclick="openLeadDetail(${jsArg(item.leadId)})">Abrir ficha</button>
      </article>
    `).join('') : '<p class="meta">Nenhuma ação urgente. Continue prospectando ou agendando follow-ups.</p>';
  }
}

window.loadCommercialIntelligence = loadCommercialIntelligence;

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


async function loadCommercialReport() {
  if (!authToken || !reportSummary) return;
  reportSummary.innerHTML = '<p class="loading">Carregando relatório comercial...</p>';
  try {
    const response = await apiFetch('/api/reports/commercial');
    const data = await readJson(response);
    if (!response.ok) throw new Error(data.error || 'Erro ao carregar relatório comercial.');
    renderCommercialReport(data);
  } catch (error) {
    reportSummary.innerHTML = `<p class="error">${escapeHtml(error.message)}</p>`;
  }
}

function renderCommercialReport(data = {}) {
  const summary = data.summary || {};
  if (reportSummary) {
    reportSummary.innerHTML = `
      <article><small>Leads totais</small><strong>${Number(summary.totalLeads || 0)}</strong><span>base comercial</span></article>
      <article><small>Taxa de contato</small><strong>${Number(summary.contactRate || 0)}%</strong><span>${Number(summary.contacted || 0)} contatados</span></article>
      <article><small>Receita prevista</small><strong>${formatMoney(summary.estimatedPipelineRevenue || 0)}</strong><span>estimativa ponderada</span></article>
      <article><small>Leads parados</small><strong>${Number(summary.stalledLeads || 0)}</strong><span>precisam de ação</span></article>
    `;
  }

  if (reportFunnel) {
    const funnel = Array.isArray(data.funnel) ? data.funnel : [];
    reportFunnel.innerHTML = funnel.length ? funnel.map((item) => `
      <button type="button" class="report-metric-card funnel-click-card" data-funnel-status="${escapeAttr(item.status)}">
        <small>${escapeHtml(overviewStatusLabel(item.status))}</small>
        <strong>${Number(item.total || 0)}</strong>
        <span>${Number(item.percentage || 0)}% do funil</span>
        <div class="mini-card-meter"><span style="width:${Math.min(100, Number(item.percentage || 0))}%"></span></div>
        <em>Ver leads desta etapa</em>
      </button>
    `).join('') : '<p class="meta">Sem dados de funil.</p>';
    reportFunnel.querySelectorAll('[data-funnel-status]').forEach((button) => {
      button.addEventListener('click', () => openFunnelLeads(button.dataset.funnelStatus));
    });
  }

  if (reportRecommendations) {
    const recommendations = Array.isArray(data.recommendations) ? data.recommendations : [];
    reportRecommendations.innerHTML = recommendations.length ? recommendations.map((text, index) => `
      <article class="recommendation-card"><span>${index + 1}</span><div><strong>Recomendação gerencial</strong><p>${escapeHtml(text)}</p></div></article>
    `).join('') : '<p class="meta">Nenhuma recomendação no momento.</p>';
  }

  if (reportSegments) {
    const rows = Array.isArray(data.bySegment) ? data.bySegment : [];
    const maxRevenue = Math.max(...rows.map((item) => Number(item.estimatedRevenue || 0)), 1);
    reportSegments.innerHTML = rows.length ? rows.map((item) => {
      const width = Math.max(4, Math.round((Number(item.estimatedRevenue || 0) / maxRevenue) * 100));
      return `<article class="segment-chart-row"><div><strong>${escapeHtml(item.name)}</strong><small>${Number(item.contacted || 0)} contatos · ${Number(item.proposals || 0)} propostas · ${Number(item.closed || 0)} fechados</small></div><div class="segment-chart-track"><span style="width:${width}%"></span></div><b>${formatMoney(item.estimatedRevenue || 0)}</b></article>`;
    }).join('') : '<p class="meta">Ainda não há segmentos suficientes para análise.</p>';
  }

  if (reportStalled) {
    const stalled = Array.isArray(data.stalledLeads) ? data.stalledLeads : [];
    reportStalled.innerHTML = stalled.length ? stalled.map((item) => `
      <article class="history-item">
        <div>
          <strong>${escapeHtml(item.leadName)}</strong>
          <p>${escapeHtml(item.reason)} · ${Number(item.daysWithoutInteraction || 0)} dia(s) sem interação</p>
          <small>Status: ${escapeHtml(item.status)}</small>
        </div>
        <button type="button" class="secondary" onclick="openLeadDetail(${jsArg(item.leadId)})">Abrir ficha</button>
      </article>
    `).join('') : '<p class="meta">Nenhum lead parado encontrado.</p>';
  }
}

async function openFunnelLeads(status) {
  try {
    const response = await apiFetch(`/api/leads?status=${encodeURIComponent(status)}`);
    const leads = await readJson(response);
    if (!response.ok) throw new Error(leads.error || 'Erro ao carregar leads da etapa.');
    const rows = Array.isArray(leads) ? leads : [];
    const known = new Map((Array.isArray(lastLeads) ? lastLeads : []).map((lead) => [String(getLeadId(lead)), lead]));
    rows.forEach((lead) => known.set(String(getLeadId(lead)), lead));
    lastLeads = [...known.values()];

    const modal = ensureLeadModal();
    const content = modal.querySelector('#leadModalContent');
    content.innerHTML = `
      <div class="lead-detail-head"><div><p class="tag dark">Funil por etapa</p><h3 id="leadModalTitle">${escapeHtml(overviewStatusLabel(status))}</h3><p class="meta">${rows.length} lead(s) nesta etapa.</p></div></div>
      <div class="funnel-lead-list">${rows.length ? rows.map((lead) => `
        <article class="funnel-lead-item">
          <div><strong>${escapeHtml(lead.nome || 'Lead')}</strong><p>${escapeHtml(lead.segmentoComercial || lead.tipo || 'Segmento não informado')}</p><small>${escapeHtml(lead.endereco || '')}</small></div>
          <button type="button" class="secondary" data-open-funnel-lead="${escapeAttr(getLeadId(lead))}">Abrir ficha</button>
        </article>`).join('') : '<p class="meta">Nenhum lead encontrado nesta etapa.</p>'}</div>`;
    content.querySelectorAll('[data-open-funnel-lead]').forEach((button) => button.addEventListener('click', () => openLeadDetail(button.dataset.openFunnelLead)));
    modal.hidden = false;
    document.body.classList.add('modal-open');
  } catch (error) {
    showError(error.message);
  }
}
window.openFunnelLeads = openFunnelLeads;

async function downloadCommercialReportCsv() {
  try {
    const response = await apiFetch('/api/reports/commercial.csv');
    if (!response.ok) throw new Error('Erro ao baixar relatório CSV.');
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'relatorio-comercial.csv';
    link.click();
    URL.revokeObjectURL(url);
  } catch (error) {
    showError(error.message);
  }
}

window.loadCommercialReport = loadCommercialReport;
window.downloadCommercialReportCsv = downloadCommercialReportCsv;


async function generateProposal(leadId) {
  const output = document.getElementById(`approach-modal-${leadId}`) || document.getElementById(`approach-${leadId}`) || statusBox;
  const previousProposal = approachHistory[`proposal-${leadId}`] || '';

  output.innerHTML = '<p class="loading">Criando proposta comercial com base no lead e na abordagem consultiva...</p>';

  try {
    const response = await apiFetch('/api/proposals/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        leadId,
        objective: 'vender serviço tecnológico simples para gerar mais contatos e oportunidades',
        previousProposal
      })
    });
    const data = await readJson(response);
    if (!response.ok) throw new Error(data.error || 'Erro ao gerar proposta.');

    approachHistory[`proposal-${leadId}`] = data.proposal?.text || previousProposal;
    output.innerHTML = renderProposal(data.proposal, data);
    statusBox.innerHTML = `<p>Proposta gerada para ${escapeHtml(data.proposal?.leadName || 'lead')} e lead movido para PROPOSTA.</p>`;

    await carregarLeadsCRM();
    await loadCommercialReport();
    await loadProposals();
  } catch (error) {
    output.textContent = error.message;
    showError(error.message);
  }
}

function renderProposal(proposal = {}, meta = {}) {
  const deliverables = Array.isArray(proposal.deliverables) ? proposal.deliverables : [];
  return `
    <section class="proposal-output">
      <header class="strategy-head">
        <div>
          <small>Proposta comercial</small>
          <strong>${escapeHtml(proposal.title || 'Proposta inicial')}</strong>
        </div>
        <span class="tag">${escapeHtml(meta.providerLabel || proposal.provider || 'Motor Local')}</span>
      </header>
      ${meta.aiError ? `<p class="warning">IA indisponível: ${escapeHtml(meta.aiError)}. Foi usada uma proposta local.</p>` : ''}
      <div class="proposal-block"><strong>Diagnóstico</strong><p>${escapeHtml(proposal.diagnosis || '')}</p></div>
      <div class="proposal-block"><strong>Solução recomendada</strong><p>${escapeHtml(proposal.recommendedSolution || '')}</p></div>
      ${deliverables.length ? `<div class="proposal-block"><strong>O que entregar</strong><ul>${deliverables.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul></div>` : ''}
      <div class="proposal-block"><strong>Referência comercial</strong><p>${escapeHtml(proposal.estimatedRange || 'A definir após diagnóstico')}</p></div>
      <div class="proposal-block"><strong>Próximo passo</strong><p>${escapeHtml(proposal.nextStep || '')}</p></div>
      <h4>Texto completo da proposta</h4>
      <pre class="msg strategy-message">${escapeHtml(proposal.text || '')}</pre>
      <div class="approach-actions">
        <button type="button" class="copy" onclick="copyNearestText(this, '.strategy-message')">Copiar proposta</button>
      </div>
    </section>
  `;
}

async function loadProposals() {
  if (!authToken || !proposalList) return;
  proposalList.innerHTML = '<p class="loading">Carregando propostas comerciais...</p>';
  if (proposalSummary) proposalSummary.innerHTML = '';

  try {
    const response = await apiFetch('/api/proposals/summary');
    const data = await readJson(response);
    if (!response.ok) throw new Error(data.error || 'Erro ao carregar propostas.');

    renderProposalSummary(data.summary || {});
    renderProposalList(data.proposals || []);
  } catch (error) {
    proposalList.innerHTML = `<p class="error">${escapeHtml(error.message)}</p>`;
  }
}

function renderProposalSummary(summary = {}) {
  if (!proposalSummary) return;
  proposalSummary.innerHTML = `
    <article><small>Propostas geradas</small><strong>${Number(summary.generated || 0)}</strong><span>documentos comerciais criados</span></article>
    <article><small>Em proposta</small><strong>${Number(summary.inProposalStage || 0)}</strong><span>negociações abertas</span></article>
    <article><small>Fechados</small><strong>${Number(summary.closed || 0)}</strong><span>clientes convertidos</span></article>
    <article><small>Receita prevista</small><strong>${formatMoney(summary.estimatedRevenue || 0)}</strong><span>em proposta e fechados</span></article>
  `;
}

function renderProposalList(proposals = []) {
  if (!proposalList) return;
  if (!proposals.length) {
    proposalList.innerHTML = '<p class="meta">Nenhuma proposta gerada ainda. Abra um lead no CRM e clique em Gerar proposta.</p>';
    return;
  }

  proposalList.innerHTML = proposals.map((proposal) => `
    <article class="proposal-card">
      <div>
        <strong>${escapeHtml(proposal.title || 'Proposta comercial')}</strong>
        <p>${escapeHtml(proposal.leadName || 'Lead')} · ${escapeHtml(proposal.status || '')}</p>
        <small>${formatDate(proposal.createdAt)} · ${escapeHtml(proposal.provider || 'Motor Local')} · ${escapeHtml(proposal.estimatedRange || '')}</small>
      </div>
      <pre class="msg compact-proposal">${escapeHtml(proposal.text || '')}</pre>
      <div class="agenda-actions">
        <button type="button" class="secondary" onclick="openLeadDetail(${jsArg(proposal.leadId)})">Abrir lead</button>
        <button type="button" class="secondary" onclick="closeAsCustomer(${jsArg(proposal.leadId)})">Marcar fechado</button>
        <button type="button" class="copy" onclick="copyNearestText(this, '.compact-proposal')">Copiar</button>
      </div>
    </article>
  `).join('');
}

window.generateProposal = generateProposal;
window.loadProposals = loadProposals;

async function closeAsCustomer(leadId) {
  const lead = (Array.isArray(lastLeads) ? lastLeads : []).find((item) => String(getLeadId(item)) === String(leadId)) || {};
  const revenue = window.prompt('Valor fechado ou referência comercial:', lead.ticketEstimado || '');
  if (revenue === null) return;
  const note = window.prompt('Observação do fechamento:', 'Cliente fechado. Iniciar onboarding.') || '';

  try {
    const response = await apiFetch('/api/customers/close', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ leadId, revenue, note })
    });
    const data = await readJson(response);
    if (!response.ok) throw new Error(data.error || 'Erro ao marcar cliente como fechado.');

    statusBox.innerHTML = '<p>Cliente marcado como fechado. Carteira atualizada.</p>';
    await carregarLeadsCRM();
    await loadCustomers();
    await loadProposals();
    closeLeadModal();
    switchView('clientes');
  } catch (error) {
    showError(error.message);
  }
}

async function markAsLost(leadId) {
  const reason = window.prompt('Motivo da perda:', 'Sem interesse no momento.') || '';
  if (!reason) return;

  try {
    const response = await apiFetch('/api/customers/lost', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ leadId, reason })
    });
    const data = await readJson(response);
    if (!response.ok) throw new Error(data.error || 'Erro ao marcar oportunidade como perdida.');

    statusBox.innerHTML = '<p>Oportunidade marcada como perdida e funil atualizado.</p>';
    await carregarLeadsCRM();
    closeLeadModal();
  } catch (error) {
    showError(error.message);
  }
}

async function loadCustomers() {
  if (!authToken || !customerList) return;
  customerList.innerHTML = '<p class="loading">Carregando carteira de clientes...</p>';
  if (customerSummary) customerSummary.innerHTML = '';
  if (customerRecommendations) customerRecommendations.innerHTML = '';

  try {
    const response = await apiFetch('/api/customers/summary');
    const data = await readJson(response);
    if (!response.ok) throw new Error(data.error || 'Erro ao carregar clientes.');
    renderCustomerSummary(data.summary || {});
    renderCustomerList(data.customers || []);
    renderCustomerRecommendations(data.recommendations || []);
    await loadCustomerGrowth();
  } catch (error) {
    customerList.innerHTML = `<p class="error">${escapeHtml(error.message)}</p>`;
  }
}

function renderCustomerSummary(summary = {}) {
  if (!customerSummary) return;
  customerSummary.innerHTML = `
    <article><small>Clientes</small><strong>${Number(summary.customers || 0)}</strong><span>fechamentos realizados</span></article>
    <article><small>Receita fechada</small><strong>${formatMoney(summary.totalRevenue || 0)}</strong><span>valor estimado</span></article>
    <article><small>Ticket médio</small><strong>${formatMoney(summary.averageTicket || 0)}</strong><span>por cliente</span></article>
    <article><small>Pipeline aberto</small><strong>${formatMoney(summary.openPipeline || 0)}</strong><span>interessados e propostas</span></article>
  `;
}

function renderCustomerList(customers = []) {
  if (!customerList) return;
  if (!customers.length) {
    customerList.innerHTML = '<p class="meta">Nenhum cliente fechado ainda. Quando uma proposta for aceita, marque o lead como fechado.</p>';
    return;
  }

  customerList.innerHTML = customers.map((customer) => {
    const plan = Array.isArray(customer.onboardingPlan) ? customer.onboardingPlan : [];
    return `
      <article class="proposal-card customer-card">
        <div>
          <strong>${escapeHtml(customer.name || 'Cliente')}</strong>
          <p>${escapeHtml(customer.segment || '')} · ${escapeHtml(customer.ticketLabel || '')}</p>
          <small>Fechado em ${formatDate(customer.closedAt)} · Última interação: ${formatDate(customer.lastInteractionAt)}</small>
        </div>
        <div class="proposal-block"><strong>Próxima melhor ação</strong><p>${escapeHtml(customer.nextBestAction || '')}</p></div>
        ${plan.length ? `<div class="proposal-block"><strong>Plano de onboarding</strong><ul>${plan.map((item) => `<li><strong>${escapeHtml(item.title)}</strong>: ${escapeHtml(item.detail)}</li>`).join('')}</ul></div>` : ''}
        <div class="agenda-actions">
          <button type="button" class="secondary" onclick="openLeadDetail(${jsArg(customer.id)})">Abrir ficha</button>
          ${customer.phone ? `<a class="secondary" href="https://wa.me/${String(customer.phone).replace(/\D/g, '').startsWith('55') ? String(customer.phone).replace(/\D/g, '') : `55${String(customer.phone).replace(/\D/g, '')}`}" target="_blank" rel="noopener">WhatsApp</a>` : ''}
        </div>
      </article>
    `;
  }).join('');
}

function renderCustomerRecommendations(recommendations = []) {
  if (!customerRecommendations) return;
  customerRecommendations.innerHTML = recommendations.length ? recommendations.map((text) => `
    <article class="history-item manager-advice"><div><strong>Recomendação</strong><p>${escapeHtml(text)}</p></div></article>
  `).join('') : '<p class="meta">Nenhuma recomendação no momento.</p>';
}

window.closeAsCustomer = closeAsCustomer;
window.markAsLost = markAsLost;
window.loadCustomers = loadCustomers;


async function loadCustomerGrowth() {
  if (!authToken || !customerGrowthList) return;
  customerGrowthList.innerHTML = '<p class="loading">Analisando indicações e oportunidades de expansão...</p>';
  if (customerGrowthSummary) customerGrowthSummary.innerHTML = '';

  try {
    const response = await apiFetch('/api/customer-growth/summary');
    const data = await readJson(response);
    if (!response.ok) throw new Error(data.error || 'Erro ao carregar crescimento pós-venda.');
    renderCustomerGrowthSummary(data.summary || {});
    renderCustomerGrowthList(data.customers || [], data.recommendations || []);
  } catch (error) {
    customerGrowthList.innerHTML = `<p class="error">${escapeHtml(error.message)}</p>`;
  }
}

function renderCustomerGrowthSummary(summary = {}) {
  if (!customerGrowthSummary) return;
  customerGrowthSummary.innerHTML = `
    <article><small>Clientes</small><strong>${Number(summary.customers || 0)}</strong><span>base fechada</span></article>
    <article><small>Prontos para indicação</small><strong>${Number(summary.referralReady || 0)}</strong><span>após entrega inicial</span></article>
    <article><small>Expansão</small><strong>${Number(summary.expansionReady || 0)}</strong><span>upsell ou recorrência</span></article>
    <article><small>Potencial expansão</small><strong>${formatMoney(summary.estimatedExpansionRevenue || 0)}</strong><span>estimativa conservadora</span></article>
  `;
}

function renderCustomerGrowthList(customers = [], recommendations = []) {
  if (!customerGrowthList) return;
  if (!customers.length) {
    customerGrowthList.innerHTML = '<p class="meta">Quando houver clientes fechados, o sistema sugerirá pedidos de indicação, expansão e ofertas recorrentes.</p>';
    return;
  }

  const recommendationHtml = recommendations.length ? `
    <div class="proposal-block"><strong>Recomendações gerais</strong><ul>${recommendations.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul></div>
  ` : '';

  customerGrowthList.innerHTML = recommendationHtml + customers.map((customer) => {
    const opportunities = Array.isArray(customer.opportunities) ? customer.opportunities.slice(0, 4) : [];
    return `
      <article class="proposal-card customer-growth-card">
        <div>
          <strong>${escapeHtml(customer.name || 'Cliente')}</strong>
          <p>${escapeHtml(customer.segment || '')} · ${escapeHtml(customer.stage || '')}</p>
          <small>${customer.daysSinceClose === null || customer.daysSinceClose === undefined ? 'Fechamento recente' : `${customer.daysSinceClose} dia(s) desde o fechamento`}</small>
        </div>
        <div class="proposal-block"><strong>Próxima ação</strong><p>${escapeHtml(customer.nextAction || '')}</p></div>
        ${opportunities.length ? `<div class="proposal-block"><strong>Oportunidades</strong><ul>${opportunities.map((item) => `<li><strong>${escapeHtml(item.title)}</strong>: ${escapeHtml(item.detail)}</li>`).join('')}</ul></div>` : ''}
        <div class="agenda-actions">
          <button type="button" class="secondary" onclick="requestReferralMessage(${jsArg(customer.id)})">Gerar pedido de indicação</button>
          <button type="button" class="secondary" onclick="requestExpansionMessage(${jsArg(customer.id)})">Gerar expansão</button>
          <button type="button" class="secondary" onclick="openLeadDetail(${jsArg(customer.id)})">Abrir ficha</button>
        </div>
      </article>
    `;
  }).join('');
}

async function requestReferralMessage(leadId) {
  try {
    const response = await apiFetch('/api/customer-growth/referral', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ leadId })
    });
    const data = await readJson(response);
    if (!response.ok) throw new Error(data.error || 'Erro ao gerar pedido de indicação.');
    await copyText(data.message || '');
    statusBox.innerHTML = '<p>Pedido de indicação gerado, copiado e registrado na timeline.</p>';
    await carregarLeadsCRM();
    await loadCustomers();
  } catch (error) {
    showError(error.message);
  }
}

async function requestExpansionMessage(leadId) {
  try {
    const response = await apiFetch('/api/customer-growth/expansion', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ leadId })
    });
    const data = await readJson(response);
    if (!response.ok) throw new Error(data.error || 'Erro ao gerar mensagem de expansão.');
    await copyText(data.message || '');
    statusBox.innerHTML = '<p>Mensagem de expansão gerada, copiada e registrada na timeline.</p>';
    await carregarLeadsCRM();
    await loadCustomers();
  } catch (error) {
    showError(error.message);
  }
}

window.loadCustomerGrowth = loadCustomerGrowth;
window.requestReferralMessage = requestReferralMessage;
window.requestExpansionMessage = requestExpansionMessage;

function showPaymentReturnMessage() {
  const params = new URLSearchParams(window.location.search);
  const status = params.get('pagamento');
  const passwordReset = params.get('passwordReset');
  const paymentId = params.get('payment_id') || params.get('collection_id');

  if (passwordReset === 'success') {
    statusBox.innerHTML = '<p>Senha redefinida com sucesso. Entre com sua nova senha.</p>';
    window.history.replaceState({}, document.title, '/app');
    return;
  }

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


// -----------------------------------------------------------------------------
// Cockpit Sales OS V23 e copiloto comercial
// -----------------------------------------------------------------------------
async function loadV23Cockpit() {
  if (!authToken || !v23Metrics) return;
  if (v23RefreshButton) v23RefreshButton.disabled = true;
  try {
    const response = await apiFetch('/api/v23/cockpit');
    const data = await readJson(response);
    if (!response.ok) throw new Error(data.error || 'Erro ao carregar o Cockpit Comercial.');
    renderV23Cockpit(data);
  } catch (error) {
    v23Metrics.innerHTML = `<p class="error">${escapeHtml(error.message)}</p>`;
  } finally {
    if (v23RefreshButton) v23RefreshButton.disabled = false;
  }
}

function cockpitStageLabel(status = '') {
  const labels = {
    NOVO: 'Novos',
    CONTATADO: 'Contatados',
    INTERESSADO: 'Interessados',
    REUNIAO: 'Reuniões',
    PROPOSTA: 'Propostas',
    FECHADO: 'Fechados',
    SEM_INTERESSE: 'Recusados'
  };
  return labels[String(status || '').toUpperCase()] || String(status || 'pipeline').toLowerCase();
}

/**
 * Incorpora o radar operacional no plano de ação sem duplicar os gráficos da
 * Visão Geral. O componente resume gargalo, prioridade e próxima ação.
 */
function renderV23ActionRadar(data = {}) {
  if (!v23ActionRadar) return;

  const plan = Array.isArray(data.dailyPlan) ? data.dailyPlan : [];
  const firstAction = plan[0] || data.focus || null;
  const bottleneck = data.pipelineHealth?.bottleneck || null;
  const stalled = Math.max(0, Number(bottleneck?.stalled || 0));
  const averageAge = Math.max(0, Number(bottleneck?.averageAge || 0));
  const priorityCount = stalled || Number(data.metrics?.atRisk || data.metrics?.highPriority || plan.length || 0);
  const stageLabel = cockpitStageLabel(bottleneck?.status);
  const hasAttention = priorityCount > 0;

  const headline = stalled > 0
    ? `Você tem ${stalled} lead${stalled === 1 ? '' : 's'} parado${stalled === 1 ? '' : 's'} em ${stageLabel}${averageAge ? ` há, em média, ${averageAge} dias` : ''}.`
    : hasAttention
      ? `Existem ${priorityCount} oportunidade${priorityCount === 1 ? '' : 's'} que merecem atenção comercial hoje.`
      : 'Nenhum gargalo crítico foi identificado no pipeline neste momento.';

  const recommendation = firstAction?.action
    || (hasAttention ? 'Revise os leads de maior prioridade e registre uma próxima ação objetiva.' : 'Mantenha a cadência de prospecção e acompanhe os retornos agendados.');

  v23ActionRadar.innerHTML = `
    <article class="action-radar-card ${hasAttention ? 'is-attention' : 'is-stable'}">
      <header class="action-radar-header">
        <span class="action-radar-kicker"><i aria-hidden="true"></i>Radar operacional</span>
        <span class="action-radar-count">${priorityCount} oportunidade${priorityCount === 1 ? '' : 's'}</span>
      </header>
      <div class="action-radar-alert">
        <span class="action-radar-icon" aria-hidden="true">${hasAttention ? '⚠' : '✓'}</span>
        <div>
          <small>${hasAttention ? 'Atenção prioritária' : 'Operação estável'}</small>
          <strong>${escapeHtml(headline)}</strong>
        </div>
      </div>
      <div class="action-radar-recommendation">
        <small>Próxima ação recomendada</small>
        <p>${escapeHtml(recommendation)}</p>
      </div>
      <button type="button" class="action-radar-button" ${firstAction?.leadId ? `data-open-radar-lead="${escapeAttr(firstAction.leadId)}"` : 'data-focus-action-list="true"'}>
        ${firstAction?.leadId ? 'Abrir lead prioritário' : 'Ver plano de ação'} <span aria-hidden="true">›</span>
      </button>
    </article>`;

  const leadButton = v23ActionRadar.querySelector('[data-open-radar-lead]');
  if (leadButton) leadButton.addEventListener('click', () => openLeadDetail(leadButton.dataset.openRadarLead));

  const focusButton = v23ActionRadar.querySelector('[data-focus-action-list]');
  if (focusButton) focusButton.addEventListener('click', () => {
    const firstPlanButton = v23DailyPlan?.querySelector('button');
    if (firstPlanButton) firstPlanButton.focus();
    else v23DailyPlan?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });
}

function renderV23Cockpit(data) {
  const metrics = data.metrics || {};
  const focus = data.focus || null;
  if (v23Greeting) v23Greeting.textContent = data.greeting || 'Sua operação comercial está atualizada.';
  if (v23LastUpdate) v23LastUpdate.textContent = `Atualizado em ${formatDate(data.generatedAt)}`;

  if (v23FocusText) {
    v23FocusText.textContent = focus
      ? `${focus.leadName}: ${focus.action}. ${focus.reason || ''}`
      : 'Nenhuma ação urgente. Continue prospectando e acompanhando retornos.';
  }
  if (v23FocusButton) {
    v23FocusButton.hidden = !focus?.leadId;
    v23FocusButton.onclick = focus?.leadId ? () => openLeadDetail(String(focus.leadId)) : null;
  }

  v23Metrics.innerHTML = `
    <article><small>Oportunidades ativas</small><strong>${Number(metrics.activeOpportunities || 0)}</strong><span>${Number(metrics.highPriority || 0)} em alta prioridade</span></article>
    <article><small>Follow-ups de hoje</small><strong>${Number(metrics.dueToday || 0)}</strong><span>${Number(metrics.overdueTasks || 0)} atrasados</span></article>
    <article><small>Propostas abertas</small><strong>${Number(metrics.proposals || 0)}</strong><span>${Number(metrics.atRisk || 0)} oportunidades em risco</span></article>
    <article><small>Receita prevista</small><strong>${formatMoney(metrics.weightedRevenue || 0)}</strong><span>${formatMoney(metrics.closedRevenue || 0)} já fechados</span></article>`;

  renderV23ActionRadar(data);

  const plan = Array.isArray(data.dailyPlan) ? data.dailyPlan : [];
  v23DailyPlan.innerHTML = plan.length ? plan.map((item, index) => `
    <article class="cockpit-action priority-${escapeAttr(String(item.priority || '').toLowerCase())}">
      <span class="action-rank">${index + 1}</span>
      <div><strong>${escapeHtml(item.leadName || 'Lead')}</strong><p>${escapeHtml(item.action || '')}</p><small>${escapeHtml(item.reason || item.priority || '')}</small></div>
      <button type="button" class="secondary mini" data-open-lead="${escapeAttr(item.leadId || '')}">Abrir</button>
    </article>`).join('') : '<p class="meta">Nenhuma ação urgente. Continue prospectando.</p>';

  v23DailyPlan.querySelectorAll('[data-open-lead]').forEach((button) => {
    button.addEventListener('click', () => openLeadDetail(button.dataset.openLead));
  });

  const pipeline = Array.isArray(data.pipeline) ? data.pipeline : [];
  if (v23Pipeline) {
    const maxCount = Math.max(1, ...pipeline.map((item) => Number(item.count || 0)));
    v23Pipeline.innerHTML = pipeline.map((stage) => `
      <article class="pipeline-stage-row">
        <div class="pipeline-stage-label"><strong>${escapeHtml(stage.status)}</strong><span>${Number(stage.count || 0)} lead(s)</span></div>
        <div class="pipeline-stage-track"><span style="width:${Math.max(4, Math.round((Number(stage.count || 0) / maxCount) * 100))}%"></span></div>
        <div class="pipeline-stage-value"><strong>${formatMoney(stage.value || 0)}</strong><small>${Number(stage.conversion || 0)}% avanço</small></div>
      </article>`).join('') || '<p class="meta">O pipeline ainda não possui dados.</p>';
  }

  recordOperationalHistory(data);
  renderOperationalHistory();

  const timeline = Array.isArray(data.timeline) ? data.timeline : [];
  v23Timeline.innerHTML = timeline.length ? timeline.slice(0, 12).map((event) => `
    <article class="global-timeline-item">
      <span class="timeline-dot"></span>
      <div><strong>${escapeHtml(event.title || 'Atividade')}</strong><p>${escapeHtml(event.leadName || '')}${event.description ? ` · ${escapeHtml(event.description)}` : ''}</p><small>${formatDate(event.occurredAt)}</small></div>
      ${event.leadId ? `<button type="button" class="ghost-button" data-timeline-lead="${escapeAttr(event.leadId)}" aria-label="Abrir ${escapeAttr(event.leadName || 'lead')}">↗</button>` : ''}
    </article>`).join('') : '<p class="meta">As atividades recentes aparecerão aqui.</p>';
  v23Timeline.querySelectorAll('[data-timeline-lead]').forEach((button) => button.addEventListener('click', () => openLeadDetail(button.dataset.timelineLead)));
}

if (v23RefreshButton) v23RefreshButton.addEventListener('click', loadV23Cockpit);
function renderCopilotMessage(message) {
  if (!v23CopilotMessages) return;
  const role = message.role === 'user' ? 'user' : 'assistant';
  const actions = Array.isArray(message.recommendedActions) ? message.recommendedActions : [];
  const label = role === 'user' ? 'Você' : (message.provider && message.provider !== 'local' ? `Copiloto · ${message.provider}` : 'Copiloto');
  const article = document.createElement('article');
  article.className = `copilot-message ${role}`;
  article.innerHTML = `<div><strong>${escapeHtml(label)}</strong><p>${escapeHtml(message.content || '')}</p>${actions.length ? `<ul>${actions.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>` : ''}<small>${message.createdAt ? formatDate(message.createdAt) : ''}</small></div>`;
  v23CopilotMessages.appendChild(article);
  v23CopilotMessages.scrollTop = v23CopilotMessages.scrollHeight;
}

async function loadV23CopilotHistory() {
  if (!authToken || !v23CopilotMessages) return;
  try {
    const response = await apiFetch('/api/v23/copilot/history?limit=50');
    const data = await readJson(response);
    if (!response.ok) throw new Error(data.error || 'Erro ao carregar a conversa.');
    const messages = Array.isArray(data.messages) ? data.messages : [];
    v23CopilotMessages.innerHTML = '';
    if (!messages.length) {
      renderCopilotMessage({ role: 'assistant', content: 'Olá. Posso analisar seus dados comerciais e indicar prioridades, riscos e próximos passos.' });
      return;
    }
    messages.forEach(renderCopilotMessage);
  } catch (error) {
    v23CopilotMessages.innerHTML = `<p class="error">${escapeHtml(error.message)}</p>`;
  }
}

document.querySelectorAll('[data-copilot-question]').forEach((button) => {
  button.addEventListener('click', () => {
    if (!v22CopilotQuestion) return;
    v22CopilotQuestion.value = button.dataset.copilotQuestion || '';
    v22CopilotQuestion.focus();
  });
});

if (v23CopilotClear) {
  v23CopilotClear.addEventListener('click', async () => {
    if (!window.confirm('Limpar todo o histórico da conversa com o copiloto?')) return;
    try {
      const response = await apiFetch('/api/v23/copilot/history', { method: 'DELETE' });
      const data = await readJson(response);
      if (!response.ok) throw new Error(data.error || 'Não foi possível limpar a conversa.');
      await loadV23CopilotHistory();
    } catch (error) {
      showError(error.message);
    }
  });
}

if (v22CopilotForm) {
  v22CopilotForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const question = v22CopilotQuestion.value.trim();
    if (!question) return;
    renderCopilotMessage({ role: 'user', content: question, createdAt: new Date().toISOString() });
    v22CopilotQuestion.value = '';
    const submitButton = v22CopilotForm.querySelector('button[type="submit"]');
    if (submitButton) submitButton.disabled = true;
    const pending = document.createElement('article');
    pending.className = 'copilot-message assistant loading-message';
    pending.innerHTML = '<div><strong>Copiloto</strong><p class="loading">Analisando o CRM e preparando a recomendação...</p></div>';
    v23CopilotMessages.appendChild(pending);
    v23CopilotMessages.scrollTop = v23CopilotMessages.scrollHeight;
    try {
      const response = await apiFetch('/api/v23/copilot/chat', {
        method: 'POST',
        body: JSON.stringify({ question })
      });
      const data = await readJson(response);
      if (!response.ok) throw new Error(data.error || 'Erro ao consultar o copiloto.');
      pending.remove();
      renderCopilotMessage({
        role: 'assistant',
        content: data.answer || '',
        provider: data.providerLabel || data.provider || 'local',
        recommendedActions: data.recommendedActions || [],
        createdAt: data.message?.createdAt || new Date().toISOString()
      });
    } catch (error) {
      pending.remove();
      renderCopilotMessage({ role: 'assistant', content: `Não consegui concluir a análise: ${error.message}` });
    } finally {
      if (submitButton) submitButton.disabled = false;
      v22CopilotQuestion.focus();
    }
  });
}

window.loadV23Cockpit = loadV23Cockpit;
window.loadV23CopilotHistory = loadV23CopilotHistory;
