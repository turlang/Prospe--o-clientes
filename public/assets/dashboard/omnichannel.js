/**
 * @fileoverview Interface da Central de Conversas omnichannel.
 *
 * Injeta a view de conversas e o controle explícito de Start/Stop do outbound
 * no painel autenticado, consumindo exclusivamente endpoints protegidos.
 *
 * @module public/assets/dashboard/omnichannel
 */

(() => {
  'use strict';

  const state = {
    conversations: [],
    leads: [],
    selectedId: '',
    detail: null,
    loading: false,
    searchTimer: null,
    automation: null,
    automationRuntime: null,
    outboundSummary: {}
  };

  const STATUS_LABELS = Object.freeze({
    open: 'Em atendimento',
    waiting_lead: 'Aguardando lead',
    waiting_human: 'Aguardando humano',
    resolved: 'Resolvida',
    archived: 'Arquivada'
  });

  const CHANNEL_LABELS = Object.freeze({
    demo: 'Demonstração',
    whatsapp: 'WhatsApp',
    email: 'E-mail',
    instagram: 'Instagram',
    webchat: 'Chat do site'
  });

  function escapeHtml(value) {
    return String(value ?? '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  function formatDate(value) {
    if (!value) return 'Sem registro';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'Data inválida';
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }

  function initials(name) {
    return String(name || 'Lead')
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() || '')
      .join('') || 'L';
  }

  async function request(url, options = {}) {
    const headers = { ...(options.headers || {}) };
    const token = localStorage.getItem('authToken') || '';
    if (token) headers.Authorization = `Bearer ${token}`;
    if (options.body && !headers['Content-Type']) headers['Content-Type'] = 'application/json';

    const response = await fetch(url, { ...options, headers });
    const text = await response.text();
    let data = {};
    if (text) {
      try { data = JSON.parse(text); }
      catch { throw new Error(`Resposta inválida do servidor (${response.status}).`); }
    }
    if (!response.ok) throw new Error(data.error || `Falha na requisição (${response.status}).`);
    return data;
  }

  function injectStylesheet() {
    if (document.querySelector('#omnichannelStyles')) return;
    const link = document.createElement('link');
    link.id = 'omnichannelStyles';
    link.rel = 'stylesheet';
    link.href = '/assets/dashboard/omnichannel.css?v=27.0.0';
    document.head.append(link);
  }

  function injectNavigation() {
    if (document.querySelector('[data-view="conversas"]')) return;
    const list = document.querySelector('.nav-list');
    if (!list) return;

    const item = document.createElement('li');
    item.innerHTML = '<button class="nav-btn" type="button" data-view="conversas">Conversas <span id="omniNavBadge" class="omni-nav-badge"></span></button>';
    const crmItem = document.querySelector('[data-view="crm"]')?.closest('li');
    crmItem?.after(item);
    if (!crmItem) list.append(item);

    item.querySelector('button')?.addEventListener('click', () => {
      activateView();
      loadWorkspace();
    });
  }

  function injectOutboundControl() {
    if (document.querySelector('#outboundAutomationControl')) return;
    const campaigns = document.querySelector('#view-campanhas');
    if (!campaigns) return;

    const header = campaigns.querySelector('.dashboard-header');
    const panel = document.createElement('section');
    panel.id = 'outboundAutomationControl';
    panel.className = 'card-panel';
    panel.setAttribute('aria-label', 'Controle da automação de contatos');
    panel.innerHTML = `
      <div class="section-title">
        <div>
          <p class="tag dark">Controle de envio</p>
          <h3>Automação pós-prospecção</h3>
          <p class="meta">A prospecção prepara os contatos e a fila. Nenhum envio automático começa até você clicar em <strong>Iniciar contatos</strong>.</p>
        </div>
        <div class="actions-row">
          <button id="outboundStartButton" type="button">Iniciar contatos</button>
          <button id="outboundStopButton" type="button" class="secondary">Parar</button>
        </div>
      </div>
      <div id="outboundAutomationStatus" class="info-grid" aria-live="polite"></div>
      <p id="outboundAutomationHint" class="meta"></p>
    `;

    if (header) header.after(panel);
    else campaigns.prepend(panel);

    const headline = campaigns.querySelector('.dashboard-header .meta');
    if (headline) {
      headline.textContent = 'Crie cadências e prepare a fila após a prospecção. O envio automático só começa quando você aciona o Start abaixo.';
    }

    const infoCards = campaigns.querySelectorAll('.info-grid article');
    if (infoCards[2]) {
      infoCards[2].innerHTML = '<strong>Como funciona o envio?</strong><span>O sistema prepara os contatos, mas só inicia a execução automática depois do seu Start. Você pode parar a qualquer momento.</span>';
    }
  }

  function injectView() {
    if (document.querySelector('#view-conversas')) return;
    const workspace = document.querySelector('.workspace');
    if (!workspace) return;

    const view = document.createElement('section');
    view.id = 'view-conversas';
    view.className = 'view omni-view';
    view.innerHTML = `
      <div class="dashboard-header card-panel omni-heading">
        <div>
          <p class="tag dark">Omnichannel</p>
          <h2>Central de Conversas</h2>
          <p class="meta">Mensagens vinculadas ao CRM, histórico por contato, notas internas e transferência entre IA e atendimento humano.</p>
        </div>
        <div class="omni-heading__actions">
          <button id="omniRefresh" type="button" class="secondary">Atualizar</button>
          <button id="omniCreateToggle" type="button">Nova conversa</button>
        </div>
      </div>

      <section id="omniCreatePanel" class="card-panel omni-panel" aria-label="Criar conversa">
        <div class="section-title">
          <h3>Nova conversa</h3>
          <p class="meta">O canal de demonstração permite validar o fluxo sem enviar mensagens externas.</p>
        </div>
        <form id="omniCreateForm" class="omni-create-grid">
          <label>Lead
            <select id="omniLeadSelect" required><option value="">Carregando leads...</option></select>
          </label>
          <label>Canal
            <select id="omniChannelSelect">
              <option value="demo">Demonstração</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="email">E-mail</option>
              <option value="instagram">Instagram</option>
              <option value="webchat">Chat do site</option>
            </select>
          </label>
          <label>Atendimento
            <select id="omniHandlerSelect">
              <option value="hybrid">IA + humano</option>
              <option value="human">Humano</option>
              <option value="ai">IA</option>
            </select>
          </label>
          <label class="wide">Mensagem inicial recebida
            <textarea id="omniInitialMessage" maxlength="4000" placeholder="Ex.: Olá, gostaria de saber mais sobre o serviço."></textarea>
          </label>
          <div class="wide actions-row">
            <button type="submit">Criar conversa</button>
            <button id="omniCreateCancel" type="button" class="secondary">Cancelar</button>
          </div>
        </form>
        <p class="omni-demo-banner">Demonstração: nenhuma mensagem sai do LeadHunter.</p>
      </section>

      <section id="omniSummary" class="omni-summary" aria-label="Resumo da caixa de entrada"></section>

      <section class="card-panel omni-toolbar" aria-label="Filtros de conversas">
        <input id="omniSearch" type="search" placeholder="Buscar lead, telefone ou mensagem" />
        <select id="omniStatusFilter">
          <option value="">Todos os status</option>
          ${Object.entries(STATUS_LABELS).map(([value, label]) => `<option value="${value}">${label}</option>`).join('')}
        </select>
        <select id="omniChannelFilter">
          <option value="">Todos os canais</option>
          ${Object.entries(CHANNEL_LABELS).map(([value, label]) => `<option value="${value}">${label}</option>`).join('')}
        </select>
        <label class="check"><input id="omniUnreadFilter" type="checkbox" /> Somente não lidas</label>
      </section>

      <section class="omni-layout">
        <aside class="card-panel omni-column">
          <div class="omni-column__header"><div><h3>Caixa de entrada</h3><p id="omniListCount" class="meta">0 conversas</p></div></div>
          <div id="omniNotice"></div>
          <div id="omniConversationList" class="omni-list" aria-live="polite"></div>
        </aside>

        <section class="card-panel omni-column omni-thread">
          <div id="omniThreadHeader" class="omni-thread__top"></div>
          <div id="omniMessages" class="omni-messages" aria-live="polite"></div>
          <form id="omniComposer" class="omni-composer">
            <textarea id="omniMessageInput" maxlength="4000" placeholder="Escreva uma resposta..." disabled></textarea>
            <div class="omni-composer__actions">
              <button id="omniSendButton" type="submit" disabled>Enviar</button>
              <button id="omniDemoInbound" type="button" class="secondary" disabled>Simular entrada</button>
            </div>
          </form>
        </section>

        <aside id="omniDetail" class="card-panel omni-column omni-detail"></aside>
      </section>
    `;

    const history = document.querySelector('#view-historico');
    workspace.insertBefore(view, history || null);
  }

  function activateView() {
    document.querySelectorAll('.nav-btn').forEach((button) => {
      button.classList.toggle('active', button.dataset.view === 'conversas');
    });
    document.querySelectorAll('.view').forEach((view) => view.classList.remove('active-view'));
    document.querySelector('#view-conversas')?.classList.add('active-view');
    const results = document.querySelector('#results');
    if (results) results.hidden = true;
  }

  function setNotice(message = '', type = '') {
    const box = document.querySelector('#omniNotice');
    if (!box) return;
    box.innerHTML = message ? `<div class="omni-${type || 'loading'}">${escapeHtml(message)}</div>` : '';
  }

  function setOutboundHint(message = '', type = '') {
    const hint = document.querySelector('#outboundAutomationHint');
    if (!hint) return;
    hint.textContent = message;
    hint.dataset.state = type;
  }

  function renderSummary(summary = {}) {
    const values = [
      ['Total', summary.total],
      ['Em atendimento', summary.open],
      ['Não lidas', summary.unread],
      ['Aguardando humano', summary.waitingHuman],
      ['Resolvidas hoje', summary.resolvedToday]
    ];
    const container = document.querySelector('#omniSummary');
    if (container) {
      container.innerHTML = values.map(([label, value]) => `<article><small>${escapeHtml(label)}</small><strong>${Number(value || 0)}</strong></article>`).join('');
    }
    const badge = document.querySelector('#omniNavBadge');
    if (badge) badge.textContent = Number(summary.unread || 0) > 0 ? String(summary.unread) : '';
  }

  function renderAutomation(payload = {}) {
    state.automation = payload.item || null;
    state.automationRuntime = payload.runtime || null;
    state.outboundSummary = payload.summary || {};

    const running = state.automation?.status === 'RUNNING';
    const runtime = state.automationRuntime || {};
    const summary = state.outboundSummary || {};
    const container = document.querySelector('#outboundAutomationStatus');

    if (container) {
      const values = [
        ['Status', running ? 'ATIVO' : 'PARADO'],
        ['Prontos na fila', Number(summary.PENDING || 0)],
        ['Aguardando revisão', Number(summary.PENDING_REVIEW || 0)],
        ['Enviados', Number(summary.SENT || 0)]
      ];
      container.innerHTML = values.map(([label, value]) => `<article><strong>${escapeHtml(label)}</strong><span>${escapeHtml(value)}</span></article>`).join('');
    }

    const startButton = document.querySelector('#outboundStartButton');
    const stopButton = document.querySelector('#outboundStopButton');
    if (startButton) startButton.disabled = running || (state.automationRuntime !== null && !runtime.ready);
    if (stopButton) stopButton.disabled = !running;

    if (running) {
      setOutboundHint('Automação ativa. Novos jobs elegíveis podem ser processados pelo worker. Use Parar para interromper novos envios.', 'running');
      return;
    }

    if (state.automationRuntime === null) {
      setOutboundHint('Carregando estado da automação...', 'loading');
      return;
    }

    if (!runtime.ready) {
      const reasons = [];
      if (!runtime.workerEnabled) reasons.push('worker outbound desativado');
      if (!runtime.liveSend) reasons.push('envio real ainda bloqueado no servidor');
      if (!runtime.afterProspecting) reasons.push('fila pós-prospecção desativada');
      if (!runtime.providerStatus?.ok) reasons.push('WhatsApp Cloud API não configurada/validada');
      setOutboundHint(`Start bloqueado até o ambiente estar pronto: ${reasons.join('; ') || 'valide o canal de envio'}.`, 'blocked');
      return;
    }

    setOutboundHint('Tudo pronto. A fila pode receber leads após a prospecção; clique em Iniciar contatos para começar os envios elegíveis.', 'ready');
  }

  async function loadAutomation() {
    try {
      renderAutomation(await request('/api/omnichannel/outbound/automation'));
    } catch (error) {
      state.automation = null;
      state.automationRuntime = null;
      state.outboundSummary = {};
      renderAutomation({});
      setOutboundHint(error.message, 'error');
    }
  }

  async function startAutomation() {
    const button = document.querySelector('#outboundStartButton');
    if (button) button.disabled = true;
    setOutboundHint('Iniciando automação...', 'loading');

    try {
      const result = await request('/api/omnichannel/outbound/automation/start', {
        method: 'POST',
        body: JSON.stringify({ mode: 'autonomous', channel: 'whatsapp' })
      });
      renderAutomation(result);
      const released = Number(result.releasedPendingReview || 0);
      setOutboundHint(
        released > 0
          ? `Automação iniciada. ${released} contato(s) elegível(is) que aguardavam revisão foram liberados para a fila.`
          : 'Automação iniciada. Os contatos elegíveis da fila já podem ser processados.',
        'running'
      );
    } catch (error) {
      setOutboundHint(error.message, 'error');
      await loadAutomation();
    }
  }

  async function stopAutomation() {
    const button = document.querySelector('#outboundStopButton');
    if (button) button.disabled = true;
    setOutboundHint('Parando automação...', 'loading');

    try {
      const result = await request('/api/omnichannel/outbound/automation/stop', { method: 'POST' });
      renderAutomation(result);
      setOutboundHint('Automação parada. A prospecção continua preparando a fila, mas nenhum novo job desta conta será enviado até um novo Start.', 'stopped');
    } catch (error) {
      setOutboundHint(error.message, 'error');
      await loadAutomation();
    }
  }

  function renderLeadOptions() {
    const select = document.querySelector('#omniLeadSelect');
    if (!select) return;
    select.innerHTML = '<option value="">Selecione um lead</option>' + state.leads.map((lead) => `
      <option value="${escapeHtml(lead.id)}" data-phone="${escapeHtml(lead.phone || '')}">
        ${escapeHtml(lead.name)}${lead.segment ? ` — ${escapeHtml(lead.segment)}` : ''}
      </option>
    `).join('');
  }

  function renderConversationList() {
    const container = document.querySelector('#omniConversationList');
    const count = document.querySelector('#omniListCount');
    if (!container) return;
    if (count) count.textContent = `${state.conversations.length} conversa(s)`;

    if (!state.conversations.length) {
      container.innerHTML = '<div class="omni-empty">Nenhuma conversa encontrada.</div>';
      return;
    }

    container.innerHTML = state.conversations.map((conversation) => {
      const lead = conversation.leadId || {};
      const unread = Number(conversation.unreadCount || 0);
      return `
        <button class="omni-conversation${state.selectedId === conversation._id ? ' is-active' : ''}" type="button" data-conversation-id="${escapeHtml(conversation._id)}">
          <span class="omni-avatar">${escapeHtml(initials(lead.name))}</span>
          <span class="omni-conversation__copy">
            <strong>${escapeHtml(lead.name || 'Lead sem nome')}</strong>
            <span>${escapeHtml(conversation.lastMessagePreview || 'Conversa sem mensagens')}</span>
            <small>${escapeHtml(CHANNEL_LABELS[conversation.channel] || conversation.channel)} · ${escapeHtml(formatDate(conversation.lastMessageAt || conversation.updatedAt))}</small>
          </span>
          ${unread ? `<span class="omni-unread">${unread}</span>` : '<span></span>'}
        </button>
      `;
    }).join('');

    container.querySelectorAll('[data-conversation-id]').forEach((button) => {
      button.addEventListener('click', () => selectConversation(button.dataset.conversationId));
    });
  }

  function renderEmptyThread() {
    const header = document.querySelector('#omniThreadHeader');
    const messages = document.querySelector('#omniMessages');
    const detail = document.querySelector('#omniDetail');
    if (header) header.innerHTML = '<div><h3>Nenhuma conversa selecionada</h3><p>Abra um atendimento na caixa de entrada.</p></div>';
    if (messages) messages.innerHTML = '<div class="omni-empty">O histórico completo aparecerá aqui.</div>';
    if (detail) detail.innerHTML = '<div class="omni-empty">Dados do lead, status e notas internas aparecerão aqui.</div>';
    setComposerState(false, false);
  }

  function setComposerState(enabled, demo) {
    const input = document.querySelector('#omniMessageInput');
    const send = document.querySelector('#omniSendButton');
    const inbound = document.querySelector('#omniDemoInbound');
    if (input) input.disabled = !enabled;
    if (send) send.disabled = !enabled;
    if (inbound) {
      inbound.disabled = !enabled || !demo;
      inbound.hidden = !demo;
    }
  }

  function renderThread() {
    const payload = state.detail;
    if (!payload?.conversation) {
      renderEmptyThread();
      return;
    }

    const conversation = payload.conversation;
    const lead = conversation.leadId || {};
    const header = document.querySelector('#omniThreadHeader');
    const messages = document.querySelector('#omniMessages');
    const archived = conversation.status === 'archived';

    if (header) {
      header.innerHTML = `
        <div>
          <h3>${escapeHtml(lead.name || 'Lead sem nome')}</h3>
          <p><span class="omni-status-dot"></span>${escapeHtml(CHANNEL_LABELS[conversation.channel] || conversation.channel)} · ${escapeHtml(conversation.normalizedPhone || lead.phone || lead.email || 'sem contato')}</p>
        </div>
        <span class="tag dark">${escapeHtml(STATUS_LABELS[conversation.status] || conversation.status)}</span>
      `;
    }

    if (messages) {
      const items = Array.isArray(payload.messages) ? payload.messages : [];
      messages.innerHTML = items.length ? items.map((message) => `
        <article class="omni-message omni-message--${escapeHtml(message.direction)}">
          <p>${escapeHtml(message.text)}</p>
          <footer><span>${escapeHtml(message.authorType)}</span><span>${escapeHtml(formatDate(message.createdAt || message.sentAt || message.receivedAt))}</span><span>${escapeHtml(message.status)}</span></footer>
        </article>
      `).join('') : '<div class="omni-empty">Conversa criada sem mensagens.</div>';
      messages.scrollTop = messages.scrollHeight;
    }

    setComposerState(!archived, conversation.channel === 'demo');
    renderDetail();
  }

  function renderDetail() {
    const container = document.querySelector('#omniDetail');
    const conversation = state.detail?.conversation;
    if (!container || !conversation) return;
    const lead = conversation.leadId || {};
    const notes = Array.isArray(conversation.internalNotes) ? [...conversation.internalNotes].reverse() : [];

    container.innerHTML = `
      <section class="omni-detail-card">
        <h4>Lead vinculado</h4>
        <div class="omni-detail-grid">
          <span>Nome</span><strong>${escapeHtml(lead.name || 'Não informado')}</strong>
          <span>Segmento</span><strong>${escapeHtml(lead.segment || 'Não informado')}</strong>
          <span>Etapa no CRM</span><strong>${escapeHtml(lead.status || 'NOVO')}</strong>
          <span>Score</span><strong>${Number(lead.score || 0)}</strong>
          <span>Contato</span><strong>${escapeHtml(conversation.normalizedPhone || lead.phone || lead.email || 'Não informado')}</strong>
        </div>
      </section>

      <section class="omni-detail-card">
        <h4>Controle do atendimento</h4>
        <label>Status
          <select id="omniDetailStatus">
            ${Object.entries(STATUS_LABELS).map(([value, label]) => `<option value="${value}"${conversation.status === value ? ' selected' : ''}>${escapeHtml(label)}</option>`).join('')}
          </select>
        </label>
        <label>Responsável
          <select id="omniDetailHandler">
            <option value="hybrid"${conversation.handledBy === 'hybrid' ? ' selected' : ''}>IA + humano</option>
            <option value="human"${conversation.handledBy === 'human' ? ' selected' : ''}>Humano</option>
            <option value="ai"${conversation.handledBy === 'ai' ? ' selected' : ''}>IA</option>
          </select>
        </label>
        ${conversation.channel === 'demo' ? '<p class="omni-demo-banner">Modo demonstração: nenhuma mensagem real é enviada.</p>' : '<p class="meta">O envio real depende da configuração do provedor do canal.</p>'}
      </section>

      <section class="omni-detail-card">
        <h4>Notas internas</h4>
        <form id="omniNoteForm">
          <textarea id="omniNoteText" maxlength="1200" placeholder="Contexto para o próximo atendimento" required></textarea>
          <button type="submit" class="secondary">Salvar nota</button>
        </form>
        <div class="omni-detail-grid" style="margin-top:.75rem">
          ${notes.length ? notes.slice(0, 6).map((note) => `<div><strong>${escapeHtml(note.text)}</strong><span>${escapeHtml(formatDate(note.createdAt))}</span></div>`).join('') : '<span>Nenhuma nota interna.</span>'}
        </div>
      </section>
    `;

    document.querySelector('#omniDetailStatus')?.addEventListener('change', (event) => updateSelected({ status: event.target.value }));
    document.querySelector('#omniDetailHandler')?.addEventListener('change', (event) => updateSelected({ handledBy: event.target.value }));
    document.querySelector('#omniNoteForm')?.addEventListener('submit', saveNote);
  }

  async function loadSummary() {
    try { renderSummary(await request('/api/omnichannel/summary')); }
    catch (error) { renderSummary({}); setNotice(error.message, 'error'); }
  }

  async function loadLeads() {
    try {
      const data = await request('/api/omnichannel/leads');
      state.leads = Array.isArray(data.items) ? data.items : [];
      renderLeadOptions();
    } catch (error) {
      state.leads = [];
      renderLeadOptions();
      setNotice(error.message, 'error');
    }
  }

  function buildConversationQuery() {
    const params = new URLSearchParams();
    const q = document.querySelector('#omniSearch')?.value.trim();
    const status = document.querySelector('#omniStatusFilter')?.value;
    const channel = document.querySelector('#omniChannelFilter')?.value;
    const unreadOnly = document.querySelector('#omniUnreadFilter')?.checked;
    if (q) params.set('q', q);
    if (status) params.set('status', status);
    if (channel) params.set('channel', channel);
    if (unreadOnly) params.set('unreadOnly', 'true');
    return params;
  }

  async function loadConversations({ preserveSelection = true } = {}) {
    if (state.loading) return;
    state.loading = true;
    setNotice('Carregando conversas...', 'loading');

    try {
      const data = await request(`/api/omnichannel/conversations?${buildConversationQuery().toString()}`);
      state.conversations = Array.isArray(data.items) ? data.items : [];
      if (!preserveSelection || !state.conversations.some((item) => item._id === state.selectedId)) {
        state.selectedId = state.conversations[0]?._id || '';
      }
      renderConversationList();
      setNotice('');
      if (state.selectedId) await selectConversation(state.selectedId, { markRead: false });
      else {
        state.detail = null;
        renderEmptyThread();
      }
    } catch (error) {
      state.conversations = [];
      renderConversationList();
      renderEmptyThread();
      setNotice(error.message, 'error');
    } finally {
      state.loading = false;
    }
  }

  async function selectConversation(id, options = {}) {
    state.selectedId = String(id || '');
    renderConversationList();
    if (!state.selectedId) return;

    try {
      state.detail = await request(`/api/omnichannel/conversations/${encodeURIComponent(state.selectedId)}`);
      renderThread();
      const unread = Number(state.detail.conversation?.unreadCount || 0);
      if (unread > 0 && options.markRead !== false) {
        await request(`/api/omnichannel/conversations/${encodeURIComponent(state.selectedId)}/read`, { method: 'PATCH' });
        state.detail.conversation.unreadCount = 0;
        const listed = state.conversations.find((item) => item._id === state.selectedId);
        if (listed) listed.unreadCount = 0;
        renderConversationList();
        await loadSummary();
      }
    } catch (error) {
      setNotice(error.message, 'error');
    }
  }

  async function createConversation(event) {
    event.preventDefault();
    const select = document.querySelector('#omniLeadSelect');
    const option = select?.selectedOptions?.[0];
    if (!select?.value) return setNotice('Selecione um lead do CRM.', 'error');

    try {
      const result = await request('/api/omnichannel/conversations', {
        method: 'POST',
        body: JSON.stringify({
          leadId: select.value,
          phone: option?.dataset.phone || '',
          channel: document.querySelector('#omniChannelSelect')?.value || 'demo',
          handledBy: document.querySelector('#omniHandlerSelect')?.value || 'hybrid',
          initialMessage: document.querySelector('#omniInitialMessage')?.value || ''
        })
      });
      state.selectedId = result.conversation?._id || '';
      document.querySelector('#omniCreatePanel')?.classList.remove('is-open');
      document.querySelector('#omniCreateForm')?.reset();
      await Promise.all([loadSummary(), loadConversations()]);
      setNotice(result.created ? 'Conversa criada.' : result.message || 'Conversa existente aberta.');
    } catch (error) {
      setNotice(error.message, 'error');
    }
  }

  async function sendMessage(event) {
    event.preventDefault();
    const field = document.querySelector('#omniMessageInput');
    const text = field?.value.trim();
    if (!state.selectedId || !text) return;

    try {
      await request(`/api/omnichannel/conversations/${encodeURIComponent(state.selectedId)}/messages`, {
        method: 'POST',
        body: JSON.stringify({ text, providerId: 'demo' })
      });
      field.value = '';
      await Promise.all([loadSummary(), loadConversations(), selectConversation(state.selectedId, { markRead: false })]);
      setNotice('Mensagem registrada. O provedor demo não realizou envio externo.');
    } catch (error) {
      setNotice(error.message, 'error');
    }
  }

  async function simulateInbound() {
    if (!state.selectedId) return;
    const text = window.prompt('Digite a mensagem simulada do lead:');
    if (!text?.trim()) return;

    try {
      await request(`/api/omnichannel/conversations/${encodeURIComponent(state.selectedId)}/demo-inbound`, {
        method: 'POST',
        body: JSON.stringify({ text })
      });
      await Promise.all([loadSummary(), loadConversations(), selectConversation(state.selectedId, { markRead: false })]);
      setNotice('Mensagem recebida no ambiente demonstrativo.');
    } catch (error) {
      setNotice(error.message, 'error');
    }
  }

  async function updateSelected(updates) {
    if (!state.selectedId) return;
    try {
      await request(`/api/omnichannel/conversations/${encodeURIComponent(state.selectedId)}`, {
        method: 'PATCH',
        body: JSON.stringify(updates)
      });
      await Promise.all([loadSummary(), loadConversations(), selectConversation(state.selectedId, { markRead: false })]);
      setNotice('Atendimento atualizado.');
    } catch (error) {
      setNotice(error.message, 'error');
    }
  }

  async function saveNote(event) {
    event.preventDefault();
    const field = document.querySelector('#omniNoteText');
    const text = field?.value.trim();
    if (!state.selectedId || !text) return;

    try {
      await request(`/api/omnichannel/conversations/${encodeURIComponent(state.selectedId)}/notes`, {
        method: 'POST',
        body: JSON.stringify({ text })
      });
      field.value = '';
      await selectConversation(state.selectedId, { markRead: false });
      setNotice('Nota interna salva.');
    } catch (error) {
      setNotice(error.message, 'error');
    }
  }

  async function loadWorkspace() {
    await Promise.all([loadSummary(), loadLeads(), loadAutomation()]);
    await loadConversations();
  }

  function bindEvents() {
    document.querySelector('#omniRefresh')?.addEventListener('click', loadWorkspace);
    document.querySelector('#omniCreateToggle')?.addEventListener('click', () => document.querySelector('#omniCreatePanel')?.classList.toggle('is-open'));
    document.querySelector('#omniCreateCancel')?.addEventListener('click', () => document.querySelector('#omniCreatePanel')?.classList.remove('is-open'));
    document.querySelector('#omniCreateForm')?.addEventListener('submit', createConversation);
    document.querySelector('#omniComposer')?.addEventListener('submit', sendMessage);
    document.querySelector('#omniDemoInbound')?.addEventListener('click', simulateInbound);
    document.querySelector('#omniStatusFilter')?.addEventListener('change', () => loadConversations({ preserveSelection: false }));
    document.querySelector('#omniChannelFilter')?.addEventListener('change', () => loadConversations({ preserveSelection: false }));
    document.querySelector('#omniUnreadFilter')?.addEventListener('change', () => loadConversations({ preserveSelection: false }));
    document.querySelector('#omniSearch')?.addEventListener('input', () => {
      clearTimeout(state.searchTimer);
      state.searchTimer = setTimeout(() => loadConversations({ preserveSelection: false }), 320);
    });
    document.querySelector('#outboundStartButton')?.addEventListener('click', startAutomation);
    document.querySelector('#outboundStopButton')?.addEventListener('click', stopAutomation);
    document.querySelector('[data-view="campanhas"]')?.addEventListener('click', loadAutomation);
  }

  function initialize() {
    injectStylesheet();
    injectNavigation();
    injectOutboundControl();
    injectView();
    bindEvents();
    renderSummary({});
    renderAutomation({});
    renderEmptyThread();
    if (localStorage.getItem('authToken')) loadAutomation();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize, { once: true });
  } else {
    initialize();
  }
})();
