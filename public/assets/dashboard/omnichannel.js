/**
 * @fileoverview Interface da Central de Conversas omnichannel.
 *
 * O módulo é carregado depois do controlador principal, injeta a nova view sem
 * duplicar a navegação e consome somente endpoints autenticados do backend.
 * Dados dinâmicos são escapados antes de qualquer interpolação em HTML.
 *
 * @module public/assets/dashboard/omnichannel
 */

(() => {
  'use strict';

  const state = {
    conversations: [],
    leads: [],
    selectedId: '',
    selected: null,
    loading: false,
    filters: { q: '', status: '', channel: '', unreadOnly: false }
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

  function formatDate(value, includeTime = true) {
    if (!value) return 'Sem registro';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'Data inválida';
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: includeTime ? undefined : 'numeric',
      hour: includeTime ? '2-digit' : undefined,
      minute: includeTime ? '2-digit' : undefined
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

  function getToken() {
    return localStorage.getItem('authToken') || '';
  }

  async function request(url, options = {}) {
    const headers = { ...(options.headers || {}), Authorization: `Bearer ${getToken()}` };
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
    link.href = '/assets/dashboard/omnichannel.css?v=26.2.0';
    document.head.append(link);
  }

  function injectNavigation() {
    if (document.querySelector('[data-view="conversas"]')) return;
    const crmButton = document.querySelector('[data-view="crm"]');
    const navList = document.querySelector('.nav-list');
    if (!navList) return;

    const item = document.createElement('li');
    item.innerHTML = '<button class="nav-btn" type="button" data-view="conversas">Conversas <span id="omniNavBadge" class="omni-nav-badge"></span></button>';
    if (crmButton?.closest('li')?.nextSibling) {
      navList.insertBefore(item, crmButton.closest('li').nextSibling);
    } else {
      navList.append(item);
    }

    item.querySelector('button')?.addEventListener('click', () => {
      activateView();
      loadWorkspace();
    });
  }

  function injectView() {
    if (document.querySelector('#view-conversas')) return;
    const workspace = document.querySelector('.workspace');
    if (!workspace) return;

    const section = document.createElement('section');
    section.id = 'view-conversas';
    section.className = 'view omni-view';
    section.innerHTML = `
      <div class="dashboard-header card-panel omni-heading">
        <div>
          <p class="tag dark">Omnichannel</p>
          <h2>Central de Conversas</h2>
          <p class="meta">Mensagens vinculadas ao lead, histórico completo, notas internas e transferência entre IA e atendimento humano.</p>
        </div>
        <div class="omni-heading__actions">
          <button id="omniRefresh" type="button" class="secondary">Atualizar</button>
          <button id="omniCreateToggle" type="button">Nova conversa</button>
        </div>
      </div>

      <section id="omniCreatePanel" class="card-panel omni-panel" aria-label="Criar conversa demonstrativa">
        <div class="section-title">
          <h3>Nova conversa</h3>
          <p class="meta">Use o canal de demonstração para testar a caixa de entrada sem enviar mensagens reais.</p>
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
          <label>Telefone
            <input id="omniPhoneInput" inputmode="tel" placeholder="5511999999999" />
          </label>
          <label class="wide">Mensagem inicial recebida
            <textarea id="omniInitialMessage" maxlength="4000" placeholder="Ex.: Olá, gostaria de saber mais sobre o serviço."></textarea>
          </label>
          <div class="wide actions-row">
            <button type="submit">Criar conversa</button>
            <button id="omniCreateCancel" type="button" class="secondary">Cancelar</button>
          </div>
        </form>
        <p class="omni-demo-banner">No canal Demonstração, nenhuma mensagem sai do LeadHunter. Canais reais serão ativados somente após configuração e teste do provedor.</p>
      </section>

      <section id="omniSummary" class="omni-summary" aria-label="Resumo da caixa de entrada"></section>

      <section class="card-panel omni-toolbar" aria-label="Filtros de conversas">
        <input id="omniSearch" type="search" placeholder="Buscar lead, telefone ou mensagem" />
        <select id="omniStatusFilter">
          <option value="">Todos os status</option>
          <option value="open">Em atendimento</option>
          <option value="waiting_lead">Aguardando lead</option>
          <option value="waiting_human">Aguardando humano</option>
          <option value="resolved">Resolvidas</option>
          <option value="archived">Arquivadas</option>
        </select>
        <select id="omniChannelFilter">
          <option value="">Todos os canais</option>
          <option value="demo">Demonstração</option>
          <option value="whatsapp">WhatsApp</option>
          <option value="email">E-mail</option>
          <option value="instagram">Instagram</option>
          <option value="webchat">Chat do site</option>
        </select>
        <label class="check"><input id="omniUnreadFilter" type="checkbox" /> Somente não lidas</label>
      </section>

      <section class="omni-layout">
        <aside class="card-panel omni-column">
          <div class="omni-column__header"><div><h3>Caixa de entrada</h3><p class="meta" id="omniListCount">0 conversas</p></div></div>
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

    const historyView = document.querySelector('#view-historico');
    workspace.insertBefore(section, historyView || null);
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

  function renderSummary(summary = {}) {
    const container = document.querySelector('#omniSummary');
    if (!container) return;
    const cards = [
      ['Total', summary.total || 0],
      ['Em atendimento', summary.open || 0],
      ['Não lidas', summary.unread || 0],
      ['Aguardando humano', summary.waitingHuman || 0],
      ['Resolvidas hoje', summary.resolvedToday || 0]
    ];
    container.innerHTML = cards.map(([label, value]) => `<article><small>${escapeHtml(label)}</small><strong>${Number(value || 0)}</strong></article>`).join('');
    const badge = document.querySelector('#omniNavBadge');
    if (badge) badge.textContent = Number(summary.unread || 0) > 0 ? String(summary.unread) : '';
  }

  function renderLeadOptions() {
    const select = document.querySelector('#omniLeadSelect');
    if (!select) return;
    select.innerHTML = '<option value="">Selecione um lead</option>' + state.leads.map((lead) => `
      <option value="${escapeHtml(lead.id)}" data-phone="${escapeHtml(lead.phone)}">
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
      container.innerHTML = '<div class="omni-empty">Nenhuma conversa encontrada para os filtros atuais.</div>';
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

  function renderEmptyThread(message = 'Selecione uma conversa para abrir o histórico.') {
    const header = document.querySelector('#omniThreadHeader');
    const messages = document.querySelector('#omniMessages');
    const input = document.querySelector('#omniMessageInput');
    const send = document.querySelector('#omniSendButton');
    const inbound = document.querySelector('#omniDemoInbound');
    if (header) header.innerHTML = '<div><h3>Nenhuma conversa selecionada</h3><p>Abra um atendimento na caixa de entrada.</p></div>';
    if (messages) messages.innerHTML = `<div class="omni-empty">${escapeHtml(message)}</div>`;
    if (input) input.disabled = true;
    if (send) send.disabled = true;
    if (inbound) inbound.disabled = true;
    const detail = document.querySelector('#omniDetail');
    if (detail) detail.innerHTML = '<div class="omni-empty">Os dados do lead e controles do atendimento aparecerão aqui.</div>';
  }

  function renderThread() {
    const payload = state.selected;
    if (!payload?.conversation) {
      renderEmptyThread();
      return;
    }

    const conversation = payload.conversation;
    const lead = conversation.leadId || {};
    const header = document.querySelector('#omniThreadHeader');
    const messages = document.querySelector('#omniMessages');
    const input = document.querySelector('#omniMessageInput');
    const send = document.querySelector('#omniSendButton');
    const inbound = document.querySelector('#omniDemoInbound');

    if (header) {
      header.innerHTML = `
        <div>
          <h3>${escapeHtml(lead.name || 'Lead sem nome')}</h3>
          <p><span class="omni-status-dot"></span>${escapeHtml(CHANNEL_LABELS[conversation.channel] || conversation.channel)} · ${escapeHtml(conversation.normalizedPhone || lead.phone || 'sem telefone')}</p>
        </div>
        <span class="tag dark">${escapeHtml(STATUS_LABELS[conversation.status] || conversation.status)}</span>
      `;
    }

    if (messages) {
      if (!payload.messages?.length) {
        messages.innerHTML = '<div class="omni-empty">Conversa criada, mas ainda não possui mensagens.</div>';
      } else {
        messages.innerHTML = payload.messages.map((message) => `
          <article class="omni-message omni-message--${escapeHtml(message.direction)}">
            <p>${escapeHtml(message.text)}</p>
            <footer><span>${escapeHtml(message.authorType)}</span><span>${escapeHtml(formatDate(message.createdAt || message.sentAt || message.receivedAt))}</span><span>${escapeHtml(message.status)}</span></footer>
          </article>
        `).join('');
        messages.scrollTop = messages.scrollHeight;
      }
    }

    const archived = conversation.status === 'archived';
    if (input) input.disabled = archived;
    if (send) send.disabled = archived;
    if (inbound) {
      inbound.disabled = archived || conversation.channel !== 'demo';
      inbound.hidden = conversation.channel !== 'demo';
    }

    renderDetail();
  }

  function renderDetail() {
    const detail = document.querySelector('#omniDetail');
    const payload = state.selected;
    if (!detail || !payload?.conversation) return;
    const conversation = payload.conversation;
    const lead = conversation.leadId || {};
    const notes = Array.isArray(conversation.internalNotes) ? [...conversation.internalNotes].reverse() : [];

    detail.innerHTML = `
      <section class="omni-detail-card">
        <h4>Lead vinculado</h4>
        <div class="omni-detail-grid">
          <span>Nome</span><strong>${escapeHtml(lead.name || 'Sem nome')}</strong>
          <span>Segmento</span><strong>${escapeHtml(lead.segment || 'Não informado')}</strong>
          <span>Etapa do CRM</span><strong>${escapeHtml(lead.status || 'NOVO')}</strong>
          <span>Score</span><strong>${Number(lead.score || 0)}</strong>
          <span>Contato</span><strong>${escapeHtml(conversation.normalizedPhone || lead.phone || lead.email || 'Não informado')}</strong>
        </div>
      </section>

      <section class="omni-detail-card">
        <h4>Controle do atendimento</h4>
        <label>Status
          <select id="omniConversationStatus">
            ${Object.entries(STATUS_LABELS).map(([value, label]) => `<option value="${value}"${conversation.status === value ? ' selected' : ''}>${escapeHtml(label)}</option>`).join('')}
          </select>
        </label>
        <label>Responsável
          <select id="omniHandledBy">
            <option value="hybrid"${conversation.handledBy === 'hybrid' ? ' selected' : ''}>IA + humano</option>
            <option value="human"${conversation.handledBy === 'human' ? ' selected' : ''}>Atendimento humano</option>
            <option value="ai"${conversation.handledBy === 'ai' ? ' selected' : ''}>Agente de IA</option>
          </select>
        </label>
      </section>

      <section class="omni-detail-card">
        <h4>Notas internas</h4>
        <form id="omniNoteForm">
          <textarea id="omniNoteInput" maxlength="1200" placeholder="Informação visível somente para a equipe"></textarea>
          <button type="submit" class="secondary">Salvar nota</button>
        </form>
        <div class="omni-detail-grid" id="omniNotesList">
          ${notes.length ? notes.map((note) => `<div><strong>${escapeHtml(note.text)}</strong><span>${escapeHtml(formatDate(note.createdAt))}</span></div>`).join('') : '<span>Nenhuma nota interna.</span>'}
        </div>
      </section>

      ${conversation.channel === 'demo' ? '<p class="omni-demo-banner">Canal demonstrativo: envios e entradas permanecem dentro do sistema.</p>' : ''}
    `;

    detail.querySelector('#omniConversationStatus')?.addEventListener('change', async (event) => {
      await updateSelected({ status: event.target.value });
    });
    detail.querySelector('#omniHandledBy')?.addEventListener('change', async (event) => {
      await updateSelected({ handledBy: event.target.value });
    });
    detail.querySelector('#omniNoteForm')?.addEventListener('submit', saveNote);
  }

  function setListLoading(message = 'Carregando conversas...') {
    const container = document.querySelector('#omniConversationList');
    if (container) container.innerHTML = `<div class="omni-loading">${escapeHtml(message)}</div>`;
  }

  function showWorkspaceError(error) {
    const container = document.querySelector('#omniConversationList');
    if (container) container.innerHTML = `<div class="omni-error">${escapeHtml(error.message || error)}</div>`;
  }

  async function loadSummary() {
    const summary = await request('/api/omnichannel/summary');
    renderSummary(summary);
  }

  async function loadLeads() {
    const data = await request('/api/omnichannel/leads')}
          </select>
        </label>
        <label>Responsável
          <select id="omniDetailHandler">
            <option value="hybrid"${conversation.handledBy === 'hybrid' ? ' selected' : ''}>Híbrido</option>
            <option value="human"${conversation.handledBy === 'human' ? ' selected' : ''}>Humano</option>
            <option value="ai"${conversation.handledBy === 'ai' ? ' selected' : ''}>IA</option>
          </select>
        </label>
        ${conversation.channel === 'demo' ? '<p class="omni-demo-banner">Modo demonstração: nenhuma mensagem real é enviada.</p>' : '<p class="meta">O provedor real deste canal será ativado nas próximas fases.</p>'}
      </section>

      <section class="omni-detail-card">
        <h4>Nota interna</h4>
        <form id="omniNoteForm">
          <textarea id="omniNoteText" maxlength="1200" placeholder="Registre contexto para o próximo atendimento." required></textarea>
          <button type="submit">Salvar nota</button>
        </form>
        <div class="omni-detail-grid" style="margin-top:.75rem">
          ${notes.length ? notes.slice(0, 5).map((note) => `<div><strong>${escapeHtml(note.text)}</strong><span>${escapeHtml(formatDate(note.createdAt))}</span></div>`).join('') : '<span>Nenhuma nota interna.</span>'}
        </div>
      </section>
    `;

    document.querySelector('#omniDetailStatus')?.addEventListener('change', (event) => updateSelected({ status: event.target.value }));
    document.querySelector('#omniDetailHandler')?.addEventListener('change', (event) => updateSelected({ handledBy: event.target.value }));
    document.querySelector('#omniNoteForm')?.addEventListener('submit', saveNote);
  }

  async function loadSummary() {
    try {
      renderSummary(await request('/api/omnichannel/summary'));
    } catch (error) {
      renderSummary({});
      setNotice(error.message, 'error');
    }
  }

  async.selected.conversation.unreadCount = 0;
        const listItem = state.conversations.find((item) => item._id === id);
        if (listItem) listItem.unreadCount = 0;
        await loadSummary();
) {
      state.leads = [];
      renderLeadOptions();
      setNotice(error.message, 'error');
    }
  }

  function currentFilters() {
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
      const params = currentFilters();
      const data = await request(`/api/omnichannel/conversations?${params.toString()}`);
      state.conversations = Array.isArray(data.items) ? data.items : [];
      if (!preserveSelection || !state.conversations.some((item) => String(item._id) === String(state.selectedId))) {
        state.selectedId = state.conversations[0]?._id || '';
      }
      renderConversationList();
      setNotice('');
      if (state.selectedId) await selectConversation(state.selectedId, { refreshList: false });
      else {
        state.detail = null;
        renderEmptyThread();
        renderDetails(null);
      }
    } catch (error) {
      state.conversations = [];
      renderConversationList();
      setNotice(error.message, 'error');
      renderEmptyThread();
      renderDetails(null);
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
      renderThread(state.detail);
      renderDetails(state.detail);
      if (Number(state.detail.conversation?.unreadCount || 0) > 0) {
        await request(`/api/omnichannel/conversations/${encodeURIComponent(state.selectedId)}/read`, { method: 'PATCH' });
        if (options.refreshList !== false) await Promise.all([loadSummary(), loadConversations()]);
      }
    } catch (error) {
      setNotice(error.message, 'error');
    }
  }

  async function createConversation(event) {
    event.preventDefault();
    const select = document.querySelector('#omniLeadSelect');
    const selectedOption = select?.selectedOptions?.[0];
    const leadId = select?.value || '';
    if (!leadId) {
      setNotice('Selecione um lead do CRM.', 'error');
      return;
    }

    const payload = {
      leadId,
      phone: selectedOption?.dataset.phone || '',
      channel: document.querySelector('#omniChannelSelect')?.value || 'demo',
      handledBy: document.querySelector('#omniHandlerSelect')?.value || 'hybrid',
      initialMessage: document.querySelector('#omniInitialMessage')?.value || ''
    };

    try {
      const result = await request('/api/omnichannel/conversations', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      state.selectedId = result.conversation?._id || '';
      document.querySelector('#omniCreaten      window.alert(error.message);
    }
  }

  function bindEvents() {
    document.querySelector('#omniRefresh')?.addEventListener('click', loadWorkspace);
    document.querySelector('#omniCreateToggle')?.addEventListener('click', () => {
      document.querySelector('#omniCreatePanel')?.classList.toggle('is-open');
    });
    document.querySelector('#omniCreateCancel')?.addEventListener('click', () => {
      document.querySelector('#omniCreatePanel')?.classList.remove('is-open');
    });
    document.querySelector('#omniCreateForm')?.addEventListener('submit', createConversation);
    document.querySelector('#omniComposer')?.addEventListener('submit', sendMessage);
    document {
      await request(`/api/omnichannel/conversations/${encodeURIComponent(state.selectedId)}/messages`, {
        method: 'POST',
        body: JSON.stringify({ text, providerId: 'demo' })
      });
      field.value = '';
      setNotice('Mensagem registrada. O provedor demo não realizou envio externo.');
      await Promise.all([loadSummary(), loadConversations(), selectConversation(state.selectedId, { refreshList: false })]);
    } catch (error) {
      setNotice(error.message, 'error');
    }
  }

  async function simulateInbound() {
    if (!state.selectedId) return;
    const text = window.prompt('Digite a mensagem que o lead enviaria no modo demonstração:');
    if (!text?.trim()) return;

    try {
      await request(`/api/omnichannel/conversations/${encodeURIComponent(state.selectedId)}/demo-inbound`, {
        method: 'POST',
        body: JSON.stringify({ text })
      });
      setNotice('Mensagem recebida no ambiente demonstrativo.');
      await Promise.all([loadSummary(), loadConversations(), selectConversation(state.selectedId, { refreshList: false })]);
    } catch (error) {\Filter')?.addEventListener('change', (event) => {
      state.filters.unreadOnly = event.target.checked;
      loadConversations({ preserveSelection: false }).catch(showWorkspaceError);
    });
  }

  function initialize() {
    injectStylesheet();
    injectNavigation();
    injectView();
    bindEvents();
    renderSummary({});
    renderEmptyThread();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize, { once: true });
  } else {
    initialize();
  }
})();
