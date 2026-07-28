/**
 * @fileoverview Landing page comercial do LeadHunter Pro em React.
 * Explica o produto, apresenta suas ferramentas e carrega os planos da API.
 */
import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  BarChart3,
  Building2,
  CalendarClock,
  Check,
  ChevronDown,
  ClipboardList,
  FileText,
  Gauge,
  Layers3,
  Menu,
  MessageSquareText,
  Radar,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  WandSparkles,
  X,
  Zap
} from 'lucide-react';

const fallbackPlans = [
  {
    id: 'trial',
    name: 'Teste Gratuito',
    priceLabel: 'R$ 0',
    features: ['10 leads totais para experimentar', 'CRM Kanban básico', 'Abordagens comerciais por templates', 'Follow-ups manuais']
  },
  {
    id: 'pro',
    name: 'Pro',
    priceLabel: 'R$ 59/mês',
    features: ['500 leads por dia', 'Dashboard executivo', 'Histórico completo', 'Campanhas e follow-ups']
  },
  {
    id: 'agency',
    name: 'Agência',
    priceLabel: 'R$ 199/mês',
    features: ['Até 5.000 leads por dia', 'Uso para times e agências', 'Pipeline comercial avançado', 'Preparado para white label']
  }
];

const toolCards = [
  {
    icon: Search,
    title: 'Prospecção por região',
    text: 'Encontre empresas por segmento, cidade ou bairro e transforme a busca em uma lista comercial organizada.',
    preview: <><span>Clínicas</span><span>São Paulo</span><b>Encontrar leads</b></>
  },
  {
    icon: Gauge,
    title: 'Lead Score',
    text: 'Priorize oportunidades usando sinais comerciais, presença digital e potencial de abordagem.',
    preview: <><strong>92</strong><small>Alta prioridade</small><i /></>
  },
  {
    icon: WandSparkles,
    title: 'Abordagem assistida',
    text: 'Crie mensagens e argumentos mais relevantes com base no contexto de cada empresa.',
    preview: <><small>Mensagem sugerida</small><p>“Identifiquei uma oportunidade…”</p></>
  },
  {
    icon: Layers3,
    title: 'CRM Kanban',
    text: 'Mova leads entre etapas e acompanhe contato, interesse, reunião, proposta e fechamento.',
    preview: <><span>Novo · 12</span><span>Contato · 7</span><span>Proposta · 3</span></>
  },
  {
    icon: Sparkles,
    title: 'Central de Inteligência',
    text: 'Receba prioridades, alertas e próximos passos para começar o dia sabendo onde agir.',
    preview: <><small>Prioridade do dia</small><strong>Retomar 4 propostas</strong></>
  },
  {
    icon: CalendarClock,
    title: 'Agenda e follow-up',
    text: 'Registre tarefas e mantenha o próximo contato visível para não perder oportunidades.',
    preview: <><span>Hoje</span><strong>5 ações</strong><small>2 urgentes</small></>
  },
  {
    icon: FileText,
    title: 'Propostas e clientes',
    text: 'Organize propostas comerciais e acompanhe oportunidades que avançaram para clientes.',
    preview: <><span>Em negociação</span><strong>R$ 8.400</strong></>
  },
  {
    icon: BarChart3,
    title: 'Relatórios comerciais',
    text: 'Visualize conversão, pipeline, receita potencial e desempenho sem depender de planilhas.',
    preview: <><i style={{ height: '42%' }} /><i style={{ height: '68%' }} /><i style={{ height: '88%' }} /><i style={{ height: '64%' }} /></>
  }
];

const workflow = [
  ['01', Target, 'Defina o público', 'Escolha segmento e região para direcionar sua prospecção.'],
  ['02', Search, 'Encontre empresas', 'Gere leads e veja os principais dados comerciais disponíveis.'],
  ['03', MessageSquareText, 'Prepare o contato', 'Use score, diagnóstico e abordagem para iniciar a conversa.'],
  ['04', TrendingUp, 'Avance no funil', 'Registre respostas, follow-ups, propostas e resultados.']
];

const faqs = [
  ['O que é o LeadHunter Pro?', 'É uma plataforma SaaS de prospecção comercial que reúne busca de empresas, lead score, abordagem assistida, CRM, agenda, propostas e relatórios.'],
  ['O sistema envia mensagens automaticamente?', 'Não. Ele ajuda a preparar abordagens e organizar follow-ups, mas o usuário revisa e decide quando realizar cada contato.'],
  ['Preciso instalar alguma coisa?', 'Não. O sistema funciona diretamente no navegador e pode ser acessado pelo computador ou celular.'],
  ['Posso começar sem pagar?', 'Sim. O plano gratuito oferece uma quantidade inicial de leads para testar o fluxo antes de contratar outro plano.']
];

function usePlans() {
  const [plans, setPlans] = useState(fallbackPlans);

  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/plans', { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error('Não foi possível carregar os planos.');
        return response.json();
      })
      .then((payload) => {
        if (Array.isArray(payload) && payload.length) setPlans(payload);
      })
      .catch((error) => {
        if (error.name !== 'AbortError') console.warn('[landing] Planos padrão em uso.', error.message);
      });
    return () => controller.abort();
  }, []);

  return plans;
}

function Brand() {
  return (
    <a className="brand" href="#inicio" aria-label="LeadHunter Pro - início">
      <span className="brand-mark"><Radar size={21} /></span>
      <span><strong>LeadHunter</strong><small>PRO</small></span>
    </a>
  );
}

function Header() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <header className="site-header">
      <div className="shell header-inner">
        <Brand />
        <nav className={open ? 'main-nav open' : 'main-nav'} aria-label="Navegação principal">
          <a href="#produto" onClick={close}>O produto</a>
          <a href="#ferramentas" onClick={close}>Ferramentas</a>
          <a href="#planos" onClick={close}>Planos</a>
          <a href="#duvidas" onClick={close}>Dúvidas</a>
          <a className="login-link" href="/app" onClick={close}>Entrar</a>
          <a className="button small" href="/app" onClick={close}>Começar grátis <ArrowRight size={16} /></a>
        </nav>
        <button className="menu-button" type="button" aria-label="Abrir menu" onClick={() => setOpen((value) => !value)}>{open ? <X /> : <Menu />}</button>
      </div>
    </header>
  );
}

function ProductPreview() {
  return (
    <div className="product-preview" aria-label="Prévia do painel LeadHunter Pro">
      <div className="preview-bar"><span><i /><i /><i /></span><small>Operação comercial</small><b>Ao vivo</b></div>
      <div className="preview-body">
        <aside><Radar /><Gauge /><Target /><Layers3 /><BarChart3 /></aside>
        <div className="preview-content">
          <div className="preview-heading"><div><small>Visão geral</small><strong>Seu radar comercial</strong></div><button type="button" tabIndex="-1">Nova busca</button></div>
          <div className="preview-metrics">
            <article><small>Leads</small><strong>1.284</strong><span>+18%</span></article>
            <article><small>Oportunidades</small><strong>186</strong><span>14,5%</span></article>
            <article><small>Em contato</small><strong>47</strong><span>9 novas</span></article>
          </div>
          <div className="preview-grid">
            <article className="mini-pipeline"><div><small>Pipeline comercial</small><strong>R$ 32.450</strong></div><span style={{ '--size': '92%' }}>Novos</span><span style={{ '--size': '68%' }}>Contato</span><span style={{ '--size': '43%' }}>Proposta</span><span style={{ '--size': '24%' }}>Fechados</span></article>
            <article className="mini-priority"><small>Próxima oportunidade</small><div><b>AC</b><span><strong>Academia Central</strong><em>Score 92</em></span></div><p>Boa aderência ao perfil e oportunidade clara de abordagem.</p></article>
          </div>
        </div>
      </div>
    </div>
  );
}

function Hero() {
  return (
    <section className="hero shell" id="inicio">
      <div className="hero-copy">
        <span className="eyebrow"><Sparkles size={15} /> Prospecção, CRM e inteligência comercial</span>
        <h1>Encontre clientes e organize todo o processo de venda em um só lugar.</h1>
        <p>O LeadHunter Pro é uma plataforma para freelancers, pequenas empresas e agências encontrarem oportunidades, prepararem abordagens e acompanharem cada lead até o fechamento.</p>
        <div className="hero-actions">
          <a className="button primary" href="/app">Criar conta gratuita <ArrowRight size={18} /></a>
          <a className="button secondary" href="#ferramentas">Ver ferramentas</a>
        </div>
        <div className="hero-proof"><span><Check /> 10 leads para testar</span><span><Check /> Sem instalação</span><span><Check /> CRM integrado</span></div>
      </div>
      <ProductPreview />
    </section>
  );
}

function ProductSummary() {
  return (
    <section className="product-summary shell" id="produto">
      <div className="summary-copy">
        <span className="section-kicker">O que o projeto resolve</span>
        <h2>Uma operação comercial completa sem juntar várias ferramentas.</h2>
        <p>Em vez de procurar empresas em um lugar, anotar contatos em outro e controlar follow-ups em planilhas, o LeadHunter centraliza o fluxo comercial.</p>
      </div>
      <div className="summary-cards">
        <article><span><Search /></span><strong>Encontre</strong><p>Descubra empresas com potencial por segmento e região.</p></article>
        <article><span><WandSparkles /></span><strong>Aborde</strong><p>Use contexto, diagnóstico e mensagens para iniciar conversas melhores.</p></article>
        <article><span><TrendingUp /></span><strong>Converta</strong><p>Acompanhe pipeline, tarefas, propostas e próximos passos.</p></article>
      </div>
    </section>
  );
}

function Tools() {
  return (
    <section className="section tools-section" id="ferramentas">
      <div className="shell">
        <div className="section-heading">
          <span className="section-kicker">Ferramentas do sistema</span>
          <h2>Recursos visíveis, úteis e conectados ao mesmo funil.</h2>
          <p>Conheça as principais áreas que fazem parte da plataforma.</p>
        </div>
        <div className="tools-grid">
          {toolCards.map(({ icon: Icon, title, text, preview }, index) => (
            <article className="tool-card" key={title}>
              <div className="tool-top"><span className="tool-icon"><Icon /></span><small>0{index + 1}</small></div>
              <h3>{title}</h3>
              <p>{text}</p>
              <div className={`tool-preview preview-${index + 1}`}>{preview}</div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Workflow() {
  return (
    <section className="section workflow-section">
      <div className="shell workflow-layout">
        <div className="section-heading left">
          <span className="section-kicker">Como funciona</span>
          <h2>Da busca ao fechamento em quatro passos.</h2>
          <p>O sistema organiza a rotina sem substituir a decisão comercial do usuário.</p>
          <a className="text-link" href="/app">Acessar o painel <ArrowRight size={17} /></a>
        </div>
        <div className="workflow-list">
          {workflow.map(([number, Icon, title, text]) => (
            <article key={number}><span className="workflow-number">{number}</span><span className="workflow-icon"><Icon /></span><div><h3>{title}</h3><p>{text}</p></div></article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Pricing() {
  const plans = usePlans();
  const orderedPlans = useMemo(() => {
    const order = { trial: 0, pro: 1, agency: 2 };
    return [...plans].sort((a, b) => (order[a.id] ?? 99) - (order[b.id] ?? 99));
  }, [plans]);

  return (
    <section className="section pricing-section" id="planos">
      <div className="shell">
        <div className="section-heading centered">
          <span className="section-kicker">Planos</span>
          <h2>Comece gratuitamente e aumente o volume quando precisar.</h2>
          <p>Os valores e benefícios são carregados diretamente da configuração do sistema.</p>
        </div>
        <div className="pricing-grid">
          {orderedPlans.map((plan) => {
            const featured = plan.id === 'pro';
            const features = Array.isArray(plan.features) && plan.features.length ? plan.features : fallbackPlans.find((item) => item.id === plan.id)?.features || [];
            return (
              <article className={featured ? 'price-card featured' : 'price-card'} key={plan.id}>
                {featured && <span className="popular"><Sparkles size={14} /> Mais escolhido</span>}
                <div className="price-head"><span>{plan.id === 'trial' ? <Zap /> : plan.id === 'agency' ? <Users /> : <TrendingUp />}</span><div><h3>{plan.name}</h3><small>{plan.id === 'trial' ? 'Para conhecer o sistema' : plan.id === 'agency' ? 'Para operações em escala' : 'Para uma rotina comercial ativa'}</small></div></div>
                <strong className="price-value">{plan.priceLabel || 'Consulte'}</strong>
                <a className={featured ? 'button primary' : 'button outline'} href="/app">{plan.id === 'trial' ? 'Começar grátis' : 'Escolher plano'} <ArrowRight size={17} /></a>
                <ul>{features.map((feature) => <li key={feature}><Check size={16} /> {feature}</li>)}</ul>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Audience() {
  return (
    <section className="audience-strip">
      <div className="shell audience-inner">
        <div><span><Users /></span><strong>Freelancers</strong><small>Mais constância para prospectar.</small></div>
        <div><span><Building2 /></span><strong>Pequenas empresas</strong><small>Processo comercial sem planilhas soltas.</small></div>
        <div><span><ClipboardList /></span><strong>Agências</strong><small>Volume, organização e acompanhamento.</small></div>
      </div>
    </section>
  );
}

function Faq() {
  const [open, setOpen] = useState(0);
  return (
    <section className="section faq-section shell" id="duvidas">
      <div className="section-heading left"><span className="section-kicker">Dúvidas frequentes</span><h2>O essencial antes de começar.</h2><p>O plano gratuito permite conhecer o fluxo usando o navegador.</p></div>
      <div className="faq-list">
        {faqs.map(([question, answer], index) => (
          <article className={open === index ? 'faq-item open' : 'faq-item'} key={question}>
            <button type="button" onClick={() => setOpen(open === index ? -1 : index)}><span>{question}</span><ChevronDown /></button>
            <div><p>{answer}</p></div>
          </article>
        ))}
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section className="final-cta shell">
      <div><span className="section-kicker">Pronto para testar?</span><h2>Transforme prospecção em uma rotina comercial organizada.</h2><p>Crie sua conta, encontre os primeiros leads e acompanhe tudo pelo painel.</p></div>
      <a className="button light" href="/app">Acessar o LeadHunter <ArrowRight size={18} /></a>
    </section>
  );
}

function Footer() {
  return (
    <footer className="site-footer">
      <div className="shell footer-inner"><div><Brand /><p>Plataforma SaaS de prospecção, CRM e inteligência comercial.</p></div><nav><a href="#produto">Produto</a><a href="#ferramentas">Ferramentas</a><a href="#planos">Planos</a><a href="/app">Entrar</a></nav><span className="security"><ShieldCheck /> Autenticação protegida pelo backend</span></div>
      <div className="shell footer-bottom"><span>© {new Date().getFullYear()} LeadHunter Pro</span><span>Feito para vender serviços com mais organização.</span></div>
    </footer>
  );
}

export default function App() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <ProductSummary />
        <Tools />
        <Workflow />
        <Audience />
        <Pricing />
        <Faq />
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}
