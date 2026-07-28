import {
  BarChart3,
  Bot,
  BriefcaseBusiness,
  Building2,
  Code2,
  Layers3,
  Radar,
  Search,
  Send,
  Sparkles,
  Target,
  Workflow
} from 'lucide-react';

export const fallbackPlans = [
  {
    id: 'trial',
    name: 'Teste Gratuito',
    priceLabel: 'R$ 0',
    description: 'Para validar o fluxo antes de crescer.',
    features: ['10 leads totais para experimentar', 'CRM Kanban básico', 'Abordagens comerciais por templates', 'Follow-ups manuais']
  },
  {
    id: 'pro',
    name: 'Pro',
    priceLabel: 'R$ 59/mês',
    description: 'Para freelancers com rotina comercial ativa.',
    features: ['500 leads por dia', 'Dashboard executivo', 'Histórico completo', 'Campanhas e follow-ups']
  },
  {
    id: 'agency',
    name: 'Agência',
    priceLabel: 'R$ 199/mês',
    description: 'Para equipes, agências e operações em escala.',
    features: ['Até 5.000 leads por dia', 'Uso para times e agências', 'Pipeline comercial avançado', 'Preparado para white label']
  }
];

export const coreFeatures = [
  {
    icon: Radar,
    title: 'Varredura Inteligente',
    text: 'Encontra negócios locais sem site ou com presença digital fraca, filtrados por nicho e região.',
    accent: 'from-cyan-400 to-blue-500',
    stat: 'Leads qualificados por região'
  },
  {
    icon: Search,
    title: 'Diagnóstico Web',
    text: 'Identifica sinais de oportunidade para sites, landing pages, sistemas e automações.',
    accent: 'from-blue-500 to-indigo-500',
    stat: 'Prioridade baseada em evidências'
  },
  {
    icon: Bot,
    title: 'Abordagem com IA',
    text: 'Gera mensagens comerciais humanizadas, contextualizadas e prontas para revisão.',
    accent: 'from-violet-500 to-fuchsia-500',
    stat: 'Argumentos focados no problema do lead'
  },
  {
    icon: Layers3,
    title: 'CRM Kanban',
    text: 'Organiza contatos, follow-ups, propostas e fechamentos em um funil visual simples.',
    accent: 'from-emerald-400 to-teal-500',
    stat: 'Nenhuma oportunidade esquecida'
  }
];

export const audience = [
  { icon: Code2, title: 'Desenvolvedores', text: 'Crie uma rotina comercial para vender sites, sistemas e integrações.' },
  { icon: BriefcaseBusiness, title: 'Freelancers', text: 'Troque a prospecção improvisada por um processo claro e repetível.' },
  { icon: Building2, title: 'Agências', text: 'Aumente o volume de oportunidades e distribua prioridades para o time.' },
  { icon: Workflow, title: 'Especialistas em automação', text: 'Encontre empresas com gargalos que podem ser resolvidos com IA e automações.' }
];

export const showcase = [
  { icon: Target, title: 'Lead Score', text: 'Priorize empresas com maior chance de precisar da sua solução.' },
  { icon: Sparkles, title: 'Copiloto comercial', text: 'Receba próximos passos, riscos e sugestões de abordagem.' },
  { icon: Send, title: 'Follow-ups', text: 'Planeje o próximo contato e mantenha o funil em movimento.' },
  { icon: BarChart3, title: 'Relatórios', text: 'Acompanhe conversão, pipeline e potencial de receita.' }
];
