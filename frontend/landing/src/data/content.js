/**
 * @fileoverview Conteúdo comercial estruturado da landing page.
 *
 * Manter o conteúdo fora dos componentes reduz duplicação, facilita revisão de
 * copy e permite que os componentes permaneçam focados em apresentação.
 *
 * @module landing/data/content
 */

import {
  Bot,
  BriefcaseBusiness,
  Building2,
  ChartNoAxesCombined,
  Code2,
  Globe2,
  KanbanSquare,
  MapSearch,
  MessageSquareText,
  Radar,
  Route,
  Sparkles,
  UsersRound,
  Workflow
} from 'lucide-react';

export const HERO_PROOF_ITEMS = Object.freeze([
  '10 leads para testar',
  'Sem cartão de crédito',
  'CRM integrado'
]);

export const WORKFLOW_STEPS = Object.freeze([
  {
    icon: MapSearch,
    title: 'Varredura inteligente',
    text: 'Encontre negócios locais sem site ou com presença digital fraca.'
  },
  {
    icon: Globe2,
    title: 'Diagnóstico web',
    text: 'Identifique demanda para páginas, sistemas, automações e agentes de IA.'
  },
  {
    icon: MessageSquareText,
    title: 'Abordagem com IA',
    text: 'Gere mensagens comerciais contextualizadas, claras e humanizadas.'
  },
  {
    icon: KanbanSquare,
    title: 'CRM Kanban',
    text: 'Organize contatos, follow-ups, propostas e fechamentos no mesmo fluxo.'
  }
]);

export const TOOL_CARDS = Object.freeze([
  {
    icon: Radar,
    eyebrow: 'Descoberta',
    title: 'Radar de oportunidades',
    text: 'Busque empresas por nicho e região e receba uma lista pronta para qualificação.',
    metric: '186 oportunidades'
  },
  {
    icon: ChartNoAxesCombined,
    eyebrow: 'Priorização',
    title: 'Lead Score',
    text: 'Ordene empresas pelo potencial comercial e concentre energia nos melhores contatos.',
    metric: 'Score 0–100'
  },
  {
    icon: Sparkles,
    eyebrow: 'Inteligência',
    title: 'Copiloto comercial',
    text: 'Receba contexto, argumento sugerido e próxima ação para cada oportunidade.',
    metric: 'Ação recomendada'
  },
  {
    icon: Route,
    eyebrow: 'Execução',
    title: 'Follow-up organizado',
    text: 'Registre tarefas e acompanhe o momento certo de retomar cada negociação.',
    metric: 'Agenda comercial'
  },
  {
    icon: BriefcaseBusiness,
    eyebrow: 'Negociação',
    title: 'Propostas e pipeline',
    text: 'Acompanhe valores, etapas e probabilidade de fechamento sem planilhas paralelas.',
    metric: 'R$ 18,4 mil'
  },
  {
    icon: Workflow,
    eyebrow: 'Visibilidade',
    title: 'Relatórios de conversão',
    text: 'Entenda onde o funil trava e quais ações estão gerando contratos.',
    metric: '+24% no período'
  }
]);

export const AUDIENCES = Object.freeze([
  {
    icon: Code2,
    title: 'Desenvolvedores',
    text: 'Encontre empresas que precisam de sites, sistemas internos e integrações.'
  },
  {
    icon: BriefcaseBusiness,
    title: 'Freelancers',
    text: 'Crie uma rotina comercial previsível sem depender apenas de indicação.'
  },
  {
    icon: Building2,
    title: 'Agências de tecnologia',
    text: 'Organize o time, o volume de leads e as oportunidades em negociação.'
  },
  {
    icon: Bot,
    title: 'Especialistas em automação',
    text: 'Identifique gargalos que podem ser resolvidos com IA e automações.'
  }
]);

export const FALLBACK_PLANS = Object.freeze([
  {
    id: 'trial',
    name: 'Teste Gratuito',
    description: 'Para conhecer o processo completo',
    price: 0,
    billingPeriod: 'sem cobrança',
    featured: false,
    features: ['10 leads totais', 'CRM Kanban', 'Diagnóstico comercial']
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'Para uma rotina comercial ativa',
    price: 59,
    billingPeriod: 'mês',
    featured: true,
    features: ['500 leads por dia', 'Copiloto comercial', 'Campanhas e relatórios']
  },
  {
    id: 'agency',
    name: 'Agência',
    description: 'Para operações com maior volume',
    price: 199,
    billingPeriod: 'mês',
    featured: false,
    features: ['Até 5.000 leads por dia', 'Operação em equipe', 'Pipeline avançado']
  }
]);

export const TRUST_MARKERS = Object.freeze([
  { icon: UsersRound, value: 'Para profissionais tech', label: 'Copy e fluxo especializados' },
  { icon: Radar, value: 'Do lead ao fechamento', label: 'Uma operação comercial completa' }
]);
