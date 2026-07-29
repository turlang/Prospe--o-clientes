/**
 * @fileoverview Interatividade da landing estática sem rolagem.
 *
 * A implementação usa DOM seguro, navegação por painéis e revalidação dos
 * planos publicados pelo Admin. Nenhum conteúdo remoto é interpolado em HTML.
 */

(() => {
  'use strict';

  const VIEW_IDS = ['inicio', 'como-funciona', 'ferramentas', 'publico', 'planos'];
  const DEFAULT_VIEW = VIEW_IDS[0];
  const CONFIGURATION_CHANNEL = 'leadhunter:configuration';
  const STORAGE_EVENT_KEY = 'leadhunter:plans-updated';
  const REFRESH_INTERVAL_MS = 30_000;

  const WORKFLOW = [
    { icon: '⌖', label: 'Entrada', title: 'Varredura inteligente', text: 'Encontre negócios locais sem site ou com presença digital fraca.', metric: '186 sinais', outcome: 'Lista qualificada por região e nicho.', bullets: ['Presença digital fraca', 'Ausência de site', 'Baixa conversão local'] },
    { icon: '◎', label: 'Análise', title: 'Diagnóstico web', text: 'Identifique demanda para páginas, sistemas, automações e agentes de IA.', metric: '84% aderência', outcome: 'Problema traduzido em oportunidade de serviço.', bullets: ['Site institucional', 'Sistema interno', 'Automação e IA'] },
    { icon: '✦', label: 'Contato', title: 'Abordagem com IA', text: 'Gere mensagens comerciais contextualizadas, claras e humanizadas.', metric: '3 versões', outcome: 'Mensagem criada com contexto, não com spam genérico.', bullets: ['Tom humanizado', 'Argumento específico', 'CTA comercial objetivo'] },
    { icon: '▦', label: 'Execução', title: 'CRM Kanban', text: 'Organize contatos, follow-ups, propostas e fechamentos no mesmo fluxo.', metric: 'Próxima ação', outcome: 'Negociação acompanhada até proposta e fechamento.', bullets: ['Follow-up', 'Reunião', 'Proposta e ganho'] }
  ];

  const TOOLS = [
    { icon: '⌖', eyebrow: 'Descoberta', title: 'Radar de oportunidades', text: 'Busque empresas por nicho e região e receba uma lista pronta para qualificação.', metric: '186 oportunidades', points: ['Busca por nicho e cidade', 'Priorização automática', 'Lista pronta para CRM'] },
    { icon: '◉', eyebrow: 'Priorização', title: 'Lead Score', text: 'Ordene empresas pelo potencial comercial e concentre energia nos melhores contatos.', metric: 'Score 0–100', points: ['Critérios comerciais', 'Score de 0 a 100', 'Ordem de contato'] },
    { icon: '✦', eyebrow: 'Inteligência', title: 'Copiloto comercial', text: 'Receba contexto, argumento sugerido e próxima ação para cada oportunidade.', metric: 'Ação recomendada', points: ['Resumo do lead', 'Argumento sugerido', 'Próxima ação'] },
    { icon: '↝', eyebrow: 'Execução', title: 'Follow-up organizado', text: 'Registre tarefas e acompanhe o momento certo de retomar cada negociação.', metric: 'Agenda comercial', points: ['Agenda centralizada', 'Alertas de retorno', 'Histórico completo'] },
    { icon: '▦', eyebrow: 'Negociação', title: 'Propostas e pipeline', text: 'Acompanhe valores, etapas e probabilidade de fechamento sem planilhas paralelas.', metric: 'R$ 18,4 mil', points: ['Etapas visíveis', 'Potencial financeiro', 'Propostas organizadas'] },
    { icon: '▥', eyebrow: 'Visibilidade', title: 'Relatórios de conversão', text: 'Entenda onde o funil trava e quais ações estão gerando contratos.', metric: '+24% no período', points: ['Conversão por etapa', 'Motivos de perda', 'Previsão comercial'] }
  ];

  const AUDIENCES = [
    { icon: '</>', title: 'Desenvolvedores', text: 'Encontre empresas que precisam de sites, sistemas internos e integrações.', offer: 'Sites, sistemas internos e integrações', signals: ['Site lento ou antigo', 'Processo manual', 'Ausência de integração'], result: 'Mais projetos com problema técnico claro.' },
    { icon: '▣', title: 'Freelancers', text: 'Crie uma rotina comercial previsível sem depender apenas de indicação.', offer: 'Landing pages, sites e manutenção', signals: ['Negócio sem site', 'Baixa presença local', 'Contato sem conversão'], result: 'Rotina de prospecção sem depender só de indicação.' },
    { icon: '▦', title: 'Agências de tecnologia', text: 'Organize o time, o volume de leads e as oportunidades em negociação.', offer: 'Projetos recorrentes e campanhas', signals: ['Volume de filiais', 'Múltiplos serviços', 'Equipe comercial ativa'], result: 'Pipeline compartilhado e previsibilidade para o time.' },
    { icon: '✦', title: 'Especialistas em automação', text: 'Identifique gargalos que podem ser resolvidos com IA e automações.', offer: 'Agentes, automações e eficiência operacional', signals: ['Atendimento repetitivo', 'Planilhas manuais', 'Follow-up inconsistente'], result: 'Oportunidades ancoradas em economia de tempo e escala.' }
  ];

  const FALLBACK_PLANS = [
    { id: 'trial', name: 'Teste Gratuito', description: 'Para conhecer o processo completo', price: 0, displayPrice: 'R$ 0', billingPeriod: 'sem cobrança', isPaid: false, features: ['10 leads totais', 'CRM Kanban', 'Diagnóstico comercial'] },
    { id: 'pro', name: 'Pro', description: 'Para uma rotina comercial ativa', price: 59, displayPrice: 'R$ 59', billingPeriod: 'mês', isPaid: true, featured: true, features: ['500 leads por dia', 'Copiloto comercial', 'Campanhas e relatórios'] },
    { id: 'agency', name: 'Agência', description: 'Para operações com maior volume', price: 199, displayPrice: 'R$ 199', billingPeriod: 'mês', isPaid: true, features: ['Até 5.000 leads por dia', 'Operação em equipe', 'Pipeline avançado'] }
  ];

  const state = {
    activeView: DEFAULT_VIEW,
    workflowIndex: 0,
    toolIndex: 0,
    audienceIndex: 0,
    plans: FALLBACK_PLANS,
    planIndex: 1,
    usingFallback: true
  };

  const create = (tag, className = '', text = '') => {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text) element.textContent = text;
    return element;
  };

  function normalizeView(candidate) {
    return VIEW_IDS.includes(candidate) ? candidate : DEFAULT_VIEW;
  }

  function setView(viewId, { updateHistory = true } = {}) {
    state.activeView = normalizeView(viewId);
    document.querySelectorAll('[data-view]').forEach((panel) => { panel.hidden = panel.dataset.view !== state.activeView; });
    document.querySelectorAll('[data-view-target]').forEach((button) => button.setAttribute('aria-selected', String(button.dataset.viewTarget === state.activeView)));
    const counter = document.getElementById('viewCounter');
    if (counter) counter.textContent = `${VIEW_IDS.indexOf(state.activeView) + 1} / ${VIEW_IDS.length}`;
    if (updateHistory) window.history.pushState({ viewId: state.activeView }, '', `#${state.activeView}`);
  }

  function moveView(direction) {
    const current = VIEW_IDS.indexOf(state.activeView);
    setView(VIEW_IDS[(current + direction + VIEW_IDS.length) % VIEW_IDS.length]);
  }

  function renderWorkflow() {
    const detail = document.getElementById('workflowDetail');
    if (!detail) return;
    const item = WORKFLOW[state.workflowIndex];
    detail.replaceChildren();

    const topline = create('div', 'workflow-detail__topline');
    const icon = create('div', 'workflow-detail__icon', item.icon);
    const copy = create('div', 'workflow-detail__copy');
    copy.append(create('small', '', item.label), create('h3', '', item.title), create('p', '', item.text), create('strong', '', item.outcome));
    const metric = create('div', 'workflow-detail__metric');
    metric.append(create('span', '', item.metric), create('small', '', 'resultado demonstrativo'));
    topline.append(icon, copy, metric);

    const board = create('div', 'workflow-detail__board');
    WORKFLOW.forEach((step, index) => {
      const node = create('div', 'workflow-node');
      node.dataset.state = index < state.workflowIndex ? 'done' : index === state.workflowIndex ? 'active' : 'next';
      node.append(create('span', '', index < state.workflowIndex ? '✓' : `0${index + 1}`));
      const nodeCopy = create('div');
      nodeCopy.append(create('small', '', index === state.workflowIndex ? 'etapa atual' : index < state.workflowIndex ? 'concluída' : 'próxima'), create('strong', '', step.title), create('p', '', step.text));
      node.append(nodeCopy);
      board.append(node);
    });

    const list = create('ul');
    item.bullets.forEach((bullet) => list.append(create('li', '', `✓ ${bullet}`)));
    const next = create('button', 'workflow-next', 'Próxima etapa →');
    next.type = 'button';
    next.addEventListener('click', () => {
      state.workflowIndex = (state.workflowIndex + 1) % WORKFLOW.length;
      renderWorkflow();
    });
    detail.append(topline, board, list, next);
    document.querySelectorAll('[data-workflow-index]').forEach((button) => button.setAttribute('aria-selected', String(Number(button.dataset.workflowIndex) === state.workflowIndex)));
  }

  function renderTools() {
    const selector = document.getElementById('toolSelector');
    const stage = document.getElementById('toolStage');
    if (!selector || !stage) return;
    selector.replaceChildren();
    TOOLS.forEach((tool, index) => {
      const button = create('button');
      button.type = 'button';
      button.setAttribute('role', 'tab');
      button.setAttribute('aria-selected', String(index === state.toolIndex));
      button.append(create('b', '', tool.icon), create('span', '', tool.title));
      button.addEventListener('click', () => { state.toolIndex = index; renderTools(); });
      selector.append(button);
    });

    const tool = TOOLS[state.toolIndex];
    stage.replaceChildren();
    const visual = create('div', 'tool-stage__visual');
    visual.append(create('span', 'tool-stage__signal', 'LIVE'));
    const metric = create('div', 'tool-stage__metric');
    metric.append(create('small', '', tool.eyebrow), create('strong', '', tool.metric));
    visual.append(metric, create('div', 'tool-stage__orb', tool.icon));
    const queue = create('div', 'tool-stage__queue');
    [['Clínica Horizonte','Score 92','Diagnóstico pronto'],['Atlas Contábil','Score 86','Contato sugerido'],['Nova Forma','Score 81','Adicionar ao CRM']].forEach(([name, score, status], index) => {
      const row = create('div', index === state.toolIndex % 3 ? 'is-highlighted' : '');
      row.append(create('span', '', `0${index + 1}`), create('strong', '', name), create('small', '', `${score} · ${status}`));
      queue.append(row);
    });
    visual.append(queue);
    const bars = create('div', 'tool-stage__bars');
    for (let i = 0; i < 5; i += 1) bars.append(create('i'));
    visual.append(bars);

    const copy = create('div', 'tool-stage__copy');
    copy.append(create('small', '', tool.eyebrow), create('h3', '', tool.title), create('p', '', tool.text));
    const list = create('ul');
    tool.points.forEach((point) => list.append(create('li', '', `✓ ${point}`)));
    const link = create('a', '', 'Usar no sistema ↗');
    link.href = '/app';
    copy.append(list, link);
    stage.append(visual, copy);
  }

  function renderAudiences() {
    const selector = document.getElementById('audienceSelector');
    const stage = document.getElementById('audienceStage');
    if (!selector || !stage) return;
    selector.replaceChildren();
    AUDIENCES.forEach((audience, index) => {
      const button = create('button');
      button.type = 'button';
      button.setAttribute('role', 'tab');
      button.setAttribute('aria-selected', String(index === state.audienceIndex));
      button.append(create('b', '', audience.icon), create('span', '', audience.title));
      button.addEventListener('click', () => { state.audienceIndex = index; renderAudiences(); });
      selector.append(button);
    });

    const audience = AUDIENCES[state.audienceIndex];
    stage.replaceChildren();
    const identity = create('div', 'audience-stage__identity');
    identity.append(create('span', '', audience.icon), create('small', '', 'Perfil selecionado'), create('h3', '', audience.title), create('p', '', audience.text));
    const fit = create('div', 'audience-stage__fit');
    fit.append(create('small', '', 'Aderência comercial'), create('strong', '', 'Alta'));
    const fitBar = create('i'); fitBar.append(create('b')); fit.append(fitBar); identity.append(fit);

    const commercial = create('div', 'audience-stage__commercial');
    const offer = create('div', 'audience-stage__offer');
    offer.append(create('small', '', 'O que você vende'), create('strong', '', audience.offer));
    const signals = create('div', 'audience-stage__signals');
    signals.append(create('small', '', 'Sinais encontrados pelo radar'));
    const list = create('ul');
    audience.signals.forEach((signal) => list.append(create('li', '', `✓ ${signal}`)));
    signals.append(list); commercial.append(offer, signals);

    const result = create('div', 'audience-stage__result');
    result.append(create('b', '', '✦'));
    const resultCopy = create('div');
    resultCopy.append(create('small', '', 'Resultado esperado'), create('strong', '', audience.result));
    result.append(resultCopy);
    stage.append(identity, commercial, result);
  }

  function formatPrice(value) {
    return Number(value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 2 });
  }

  function planFeatures(plan) {
    if (Array.isArray(plan.features) && plan.features.length) return plan.features.slice(0, 5);
    const features = [];
    if (plan.dailyLeadLimit) features.push(`${Number(plan.dailyLeadLimit).toLocaleString('pt-BR')} leads por dia`);
    return [...features, 'CRM Kanban', 'Dashboard comercial'];
  }

  function buildPlanCard(plan, compact = false) {
    const displayPrice = plan.displayPrice || plan.priceLabel || formatPrice(plan.price);
    const billingPeriod = plan.billingPeriod || (plan.isPaid ? 'mês' : 'sem cobrança');
    const isFree = plan.isPaid === false || Number(plan.price || 0) === 0;
    const featured = plan.featured || plan.id === 'pro';
    const card = create('article', 'pricing-card');
    card.dataset.featured = String(featured);

    const header = create('header');
    const titleBox = create('div');
    titleBox.append(create('small', '', isFree ? 'Comece agora' : 'Plano comercial'), create('h3', '', plan.name || 'LeadHunter'));
    header.append(titleBox);
    if (featured) header.append(create('span', '', '✦ Recomendado'));
    card.append(header, create('p', '', plan.description || 'Plano comercial do LeadHunter Pro.'));

    const price = create('div', 'pricing-card__price');
    price.append(create('strong', '', displayPrice), create('span', '', `/${billingPeriod}`));
    card.append(price);

    const list = create('ul');
    planFeatures(plan).slice(0, compact ? 4 : 5).forEach((feature) => list.append(create('li', '', `✓ ${feature}`)));
    card.append(list);
    const action = create('a', 'button button-primary', isFree ? 'Ativar radar grátis →' : 'Escolher plano →');
    action.href = '/app'; card.append(action);
    const footer = create('footer');
    footer.append(create('b', '', '●'), create('span', '', state.usingFallback ? 'Sincronizando configuração…' : 'Publicado pelo Admin'));
    card.append(footer);
    return card;
  }

  function renderPlans() {
    const grid = document.getElementById('pricingGrid');
    const selector = document.getElementById('planSelector');
    const stage = document.getElementById('planStage');
    if (!grid || !selector || !stage || !state.plans.length) return;
    const visiblePlans = state.plans.slice(0, 3);
    state.planIndex = Math.min(state.planIndex, visiblePlans.length - 1);

    grid.replaceChildren();
    visiblePlans.forEach((plan) => grid.append(buildPlanCard(plan)));

    selector.replaceChildren();
    visiblePlans.forEach((plan, index) => {
      const button = create('button');
      button.type = 'button';
      button.setAttribute('role', 'tab');
      button.setAttribute('aria-selected', String(index === state.planIndex));
      button.append(create('span', '', plan.name || `Plano ${index + 1}`));
      if (plan.featured || plan.id === 'pro') button.append(create('small', '', '✦ recomendado'));
      button.addEventListener('click', () => { state.planIndex = index; renderPlans(); });
      selector.append(button);
    });

    stage.replaceChildren(buildPlanCard(visiblePlans[state.planIndex], true));
  }

  async function refreshPlans() {
    try {
      const response = await fetch(`/api/plans?_refresh=${Date.now()}`, { cache: 'no-store', headers: { Accept: 'application/json', 'Cache-Control': 'no-cache' } });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const payload = await response.json();
      const plans = Array.isArray(payload) ? payload : payload?.plans;
      if (!Array.isArray(plans) || !plans.length) throw new Error('Resposta sem planos');
      state.plans = plans.slice(0, 3);
      state.usingFallback = false;
      const recommended = state.plans.findIndex((plan, index) => plan.featured || plan.id === 'pro' || index === 1);
      if (recommended >= 0 && state.planIndex >= state.plans.length) state.planIndex = recommended;
      renderPlans();
    } catch (error) {
      console.warn('[landing] Planos remotos indisponíveis:', error.message);
      renderPlans();
    }
  }

  function initialize() {
    document.querySelectorAll('[data-view-target]').forEach((button) => button.addEventListener('click', (event) => {
      if (button.tagName === 'A') event.preventDefault();
      setView(button.dataset.viewTarget);
    }));
    document.querySelectorAll('[data-workflow-index]').forEach((button) => button.addEventListener('click', () => {
      state.workflowIndex = Number(button.dataset.workflowIndex);
      renderWorkflow();
    }));
    document.getElementById('previousView')?.addEventListener('click', () => moveView(-1));
    document.getElementById('nextView')?.addEventListener('click', () => moveView(1));
    window.addEventListener('hashchange', () => setView(normalizeView(window.location.hash.replace(/^#/, '')), { updateHistory: false }));
    window.addEventListener('popstate', () => setView(normalizeView(window.location.hash.replace(/^#/, '')), { updateHistory: false }));
    window.addEventListener('focus', refreshPlans);
    window.addEventListener('storage', (event) => { if (event.key === STORAGE_EVENT_KEY) refreshPlans(); });
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') refreshPlans(); });

    if ('BroadcastChannel' in window) {
      const channel = new BroadcastChannel(CONFIGURATION_CHANNEL);
      channel.onmessage = (event) => { if (event.data?.type === 'plans-updated') refreshPlans(); };
    }

    setView(normalizeView(window.location.hash.replace(/^#/, '')), { updateHistory: false });
    renderWorkflow();
    renderTools();
    renderAudiences();
    renderPlans();
    refreshPlans();
    window.setInterval(refreshPlans, REFRESH_INTERVAL_MS);
  }

  document.addEventListener('DOMContentLoaded', initialize, { once: true });
})();
