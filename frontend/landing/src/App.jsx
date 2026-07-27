/**
 * @fileoverview Landing page pública do LeadHunter Pro em React.
 * Consome os planos configuráveis da API e mantém toda a navegação acessível.
 */
import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  BriefcaseBusiness,
  Building2,
  Check,
  ChevronDown,
  CircleCheck,
  ClipboardCheck,
  Clock3,
  Crosshair,
  Database,
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

const benefits = [
  {
    icon: Search,
    title: 'Busca orientada',
    text: 'Escolha segmento e região para montar listas comerciais mais objetivas, sem começar do zero.'
  },
  {
    icon: Gauge,
    title: 'Prioridade por score',
    text: 'Compare sinais comerciais e concentre esforço nas empresas com melhor potencial de abordagem.'
  },
  {
    icon: MessageSquareText,
    title: 'Abordagem guiada',
    text: 'Receba sugestões de mensagens mais humanas e adequadas ao contexto de cada oportunidade.'
  },
  {
    icon: Layers3,
    title: 'CRM visual',
    text: 'Acompanhe cada lead do primeiro contato até a proposta, sem perder o histórico da conversa.'
  },
  {
    icon: Clock3,
    title: 'Follow-up organizado',
    text: 'Registre o próximo passo e mantenha a rotina comercial ativa no momento certo.'
  },
  {
    icon: BarChart3,
    title: 'Visão executiva',
    text: 'Entenda volume, avanço do funil e ações pendentes em uma visão simples e direta.'
  }
];

const steps = [
  { number: '01', icon: Crosshair, title: 'Defina o alvo', text: 'Selecione o nicho, a cidade e os critérios que fazem sentido para sua oferta.' },
  { number: '02', icon: Radar, title: 'Encontre oportunidades', text: 'Gere uma lista organizada e veja os dados úteis para iniciar a prospecção.' },
  { number: '03', icon: WandSparkles, title: 'Prepare a abordagem', text: 'Use diagnóstico e contexto para criar uma conversa comercial mais relevante.' },
  { number: '04', icon: TrendingUp, title: 'Avance no funil', text: 'Registre respostas, agende follow-ups e acompanhe cada próximo passo.' }
];

const audiences = [
  { icon: BriefcaseBusiness, label: 'Freelancers', text: 'Mais constância para encontrar e abordar novos clientes.' },
  { icon: Building2, label: 'Pequenas empresas', text: 'Uma operação comercial simples sem depender de planilhas espalhadas.' },
  { icon: Users, label: 'Agências', text: 'Mais volume, organização e visibilidade sobre as oportunidades do time.' }
];

const faqs = [
  {
    question: 'O LeadHunter envia mensagens automaticamente?',
    answer: 'Não. A plataforma ajuda a construir abordagens e organizar follow-ups, mas você revisa e decide quando realizar cada contato.'
  },
  {
    question: 'Preciso instalar alguma coisa?',
    answer: 'Não. O sistema funciona no navegador. Basta criar sua conta e acessar o painel.'
  },
  {
    question: 'Posso começar sem pagar?',
    answer: 'Sim. O plano de teste oferece uma quantidade inicial de leads para você conhecer o fluxo antes de contratar.'
  },
  {
    question: 'Os planos exibidos são atualizados pelo painel administrativo?',
    answer: 'Sim. A landing page consulta a API do próprio sistema, então preço, limites e benefícios acompanham as configurações publicadas pelo administrador.'
  }
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
      <span className="brand-mark"><Radar size={22} strokeWidth={2.4} /></span>
      <span className="brand-copy"><strong>LeadHunter</strong><small>PRO</small></span>
    </a>
  );
}

function Header() {
  const [open, setOpen] = useState(false);

  const closeMenu = () => setOpen(false);

  return (
    <header className="site-header">
      <div className="header-inner">
        <Brand />
        <nav className={`main-nav ${open ? 'is-open' : ''}`} aria-label="Navegação principal">
          <a href="#recursos" onClick={closeMenu}>Recursos</a>
          <a href="#como-funciona" onClick={closeMenu}>Como funciona</a>
          <a href="#planos" onClick={closeMenu}>Planos</a>
          <a href="#faq" onClick={closeMenu}>Dúvidas</a>
          <a className="nav-login" href="/app" onClick={closeMenu}>Entrar</a>
          <a className="button button-small" href="/app" onClick={closeMenu}>Começar grátis <ArrowRight size={16} /></a>
        </nav>
        <button
          className="menu-button"
          type="button"
          aria-label={open ? 'Fechar menu' : 'Abrir menu'}
          aria-expanded={open}
          onClick={() => setOpen((current) => !current)}
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>
    </header>
  );
}

function DashboardPreview() {
  return (
    <div className="dashboard-shell" aria-label="Prévia visual do painel comercial">
      <div className="dashboard-topbar">
        <div className="window-dots"><span /><span /><span /></div>
        <div className="dashboard-title"><span className="status-dot" /> Operação comercial ativa</div>
        <span className="dashboard-period">Últimos 30 dias</span>
      </div>

      <div className="dashboard-layout">
        <aside className="dashboard-sidebar" aria-hidden="true">
          <span className="sidebar-logo"><Radar size={18} /></span>
          <span className="sidebar-item active"><Gauge size={17} /></span>
          <span className="sidebar-item"><Target size={17} /></span>
          <span className="sidebar-item"><Users size={17} /></span>
          <span className="sidebar-item"><BarChart3 size={17} /></span>
        </aside>

        <div className="dashboard-content">
          <div className="dashboard-heading">
            <div><small>Bom dia</small><strong>Seu radar comercial</strong></div>
            <button type="button" tabIndex="-1"><Search size={15} /> Nova busca</button>
          </div>

          <div className="metric-grid">
            <article><span className="metric-icon blue"><Search size={17} /></span><small>Leads mapeados</small><strong>1.284</strong><em>+18% este mês</em></article>
            <article><span className="metric-icon green"><Target size={17} /></span><small>Oportunidades</small><strong>186</strong><em>14,5% qualificados</em></article>
            <article><span className="metric-icon violet"><MessageSquareText size={17} /></span><small>Em contato</small><strong>47</strong><em>9 respostas novas</em></article>
          </div>

          <div className="dashboard-lower">
            <article className="funnel-card">
              <div className="card-heading"><div><small>Pipeline</small><strong>Funil comercial</strong></div><span>68% ativo</span></div>
              <div className="funnel-bars">
                <div><span>Novos</span><i style={{ '--bar': '92%' }} /><b>128</b></div>
                <div><span>Contato</span><i style={{ '--bar': '68%' }} /><b>74</b></div>
                <div><span>Proposta</span><i style={{ '--bar': '43%' }} /><b>31</b></div>
                <div><span>Fechados</span><i style={{ '--bar': '24%' }} /><b>12</b></div>
              </div>
            </article>

            <article className="opportunity-card">
              <div className="card-heading"><div><small>Prioridade</small><strong>Próxima oportunidade</strong></div><Sparkles size={17} /></div>
              <div className="company-row"><span className="company-avatar">AC</span><div><strong>Academia Central</strong><small>Serviços fitness · São Paulo</small></div><b>92</b></div>
              <p>Boa aderência ao perfil e presença digital com pontos claros de melhoria.</p>
              <button type="button" tabIndex="-1">Ver oportunidade <ArrowRight size={14} /></button>
            </article>
          </div>
        </div>
      </div>
      <span className="floating-note note-one"><CircleCheck size={15} /> Follow-up agendado</span>
      <span className="floating-note note-two"><TrendingUp size={15} /> Score atualizado</span>
    </div>
  );
}

function Hero() {
  return (
    <section className="hero section-shell" id="inicio">
      <div className="hero-glow hero-glow-one" />
      <div className="hero-glow hero-glow-two" />
      <div className="hero-copy">
        <div className="eyebrow"><Sparkles size={15} /> Inteligência comercial para negócios que querem crescer</div>
        <h1>Transforme busca por clientes em uma <span>rotina de vendas.</span></h1>
        <p>Encontre empresas com potencial, entenda onde estão as melhores oportunidades e conduza cada contato em um CRM feito para ser simples.</p>
        <div className="hero-actions">
          <a className="button button-primary" href="/app">Começar gratuitamente <ArrowRight size={19} /></a>
          <a className="button button-ghost" href="#como-funciona"><span className="play-dot"><Zap size={15} /></span> Ver como funciona</a>
        </div>
        <div className="hero-trust">
          <div className="avatar-stack"><span>F</span><span>A</span><span>P</span><span>+</span></div>
          <div><strong>Feito para vender serviços</strong><small>Freelancers, pequenas empresas e agências.</small></div>
        </div>
      </div>
      <div className="hero-visual"><DashboardPreview /></div>
    </section>
  );
}

function TrustStrip() {
  return (
    <section className="trust-strip" aria-label="Principais capacidades">
      <div className="section-shell trust-inner">
        <span><Radar size={18} /> Prospecção local</span>
        <span><Gauge size={18} /> Lead score</span>
        <span><Layers3 size={18} /> CRM Kanban</span>
        <span><MessageSquareText size={18} /> Abordagens guiadas</span>
        <span><Clock3 size={18} /> Follow-ups</span>
      </div>
    </section>
  );
}

function SectionHeading({ tag, title, text, align = 'left' }) {
  return (
    <div className={`section-heading ${align === 'center' ? 'center' : ''}`}>
      <span className="section-tag">{tag}</span>
      <h2>{title}</h2>
      {text ? <p>{text}</p> : null}
    </div>
  );
}

function Benefits() {
  return (
    <section className="content-section section-shell" id="recursos">
      <SectionHeading
        tag="Tudo em um só fluxo"
        title="Menos improviso. Mais clareza em cada oportunidade."
        text="O LeadHunter reúne descoberta, análise e acompanhamento para sua prospecção deixar de depender de várias ferramentas desconectadas."
      />
      <div className="benefit-grid">
        {benefits.map(({ icon: Icon, title, text }, index) => (
          <article className={`benefit-card benefit-${index + 1}`} key={title}>
            <span className="benefit-icon"><Icon size={23} /></span>
            <h3>{title}</h3>
            <p>{text}</p>
            <span className="card-link">Entenda o recurso <ArrowRight size={15} /></span>
          </article>
        ))}
      </div>
    </section>
  );
}

function Workflow() {
  return (
    <section className="workflow-section" id="como-funciona">
      <div className="section-shell">
        <SectionHeading
          tag="Como funciona"
          title="Da busca ao próximo passo, sem perder o contexto."
          text="Um processo direto para você dedicar menos tempo à organização e mais tempo às conversas que podem virar negócio."
          align="center"
        />
        <div className="workflow-grid">
          {steps.map(({ number, icon: Icon, title, text }, index) => (
            <article className="workflow-card" key={title}>
              <span className="step-number">{number}</span>
              <span className="workflow-icon"><Icon size={24} /></span>
              <h3>{title}</h3>
              <p>{text}</p>
              {index < steps.length - 1 ? <span className="step-connector"><ArrowRight /></span> : null}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function ResultsPanel() {
  return (
    <section className="results-section section-shell">
      <div className="results-copy">
        <span className="section-tag">Visão comercial</span>
        <h2>Saiba o que merece atenção antes de abrir outra planilha.</h2>
        <p>O painel concentra seus principais indicadores, tarefas e movimentações do funil para que a operação continue avançando.</p>
        <ul className="check-list">
          <li><CircleCheck size={19} /> Histórico centralizado de cada lead</li>
          <li><CircleCheck size={19} /> Próximas ações e tarefas pendentes</li>
          <li><CircleCheck size={19} /> Indicadores para acompanhar evolução</li>
        </ul>
        <a className="text-link" href="/app">Conhecer o painel <ArrowRight size={17} /></a>
      </div>
      <div className="results-card">
        <div className="chart-head"><div><small>Desempenho comercial</small><strong>Evolução das oportunidades</strong></div><span><TrendingUp size={15} /> +24,8%</span></div>
        <div className="chart-area" aria-hidden="true">
          <div className="chart-grid-lines"><i /><i /><i /><i /></div>
          <svg viewBox="0 0 620 240" preserveAspectRatio="none" role="presentation">
            <defs>
              <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#49d7ff" stopOpacity=".35" />
                <stop offset="100%" stopColor="#49d7ff" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path className="chart-fill" d="M0,206 C55,188 78,170 118,180 C164,192 186,134 235,145 C284,156 305,99 357,116 C407,132 435,72 482,89 C527,105 564,46 620,42 L620,240 L0,240 Z" />
            <path className="chart-line" d="M0,206 C55,188 78,170 118,180 C164,192 186,134 235,145 C284,156 305,99 357,116 C407,132 435,72 482,89 C527,105 564,46 620,42" />
            <circle cx="620" cy="42" r="7" />
          </svg>
        </div>
        <div className="chart-labels"><span>Jan</span><span>Fev</span><span>Mar</span><span>Abr</span><span>Mai</span><span>Jun</span></div>
        <div className="mini-insights">
          <div><span className="mini-icon"><ClipboardCheck size={18} /></span><div><small>Follow-ups concluídos</small><strong>84%</strong></div></div>
          <div><span className="mini-icon"><BadgeCheck size={18} /></span><div><small>Leads qualificados</small><strong>186</strong></div></div>
        </div>
      </div>
    </section>
  );
}

function Audience() {
  return (
    <section className="audience-section section-shell">
      <SectionHeading
        tag="Feito para sua operação"
        title="Uma base comercial que acompanha seu ritmo."
        text="Comece sozinho, organize sua rotina e evolua para uma operação com mais volume sem trocar de ferramenta."
        align="center"
      />
      <div className="audience-grid">
        {audiences.map(({ icon: Icon, label, text }) => (
          <article key={label}><span><Icon size={24} /></span><h3>{label}</h3><p>{text}</p></article>
        ))}
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
    <section className="pricing-section" id="planos">
      <div className="section-shell">
        <SectionHeading
          tag="Planos flexíveis"
          title="Comece agora e aumente o volume quando precisar."
          text="Sem complicação para testar. Escolha a estrutura que acompanha sua rotina comercial."
          align="center"
        />
        <div className="pricing-grid">
          {orderedPlans.map((plan) => {
            const featured = plan.id === 'pro';
            return (
              <article className={`price-card ${featured ? 'featured' : ''}`} key={plan.id}>
                {featured ? <span className="popular-label"><Sparkles size={14} /> Mais escolhido</span> : null}
                <div className="price-card-head">
                  <span className="plan-icon">{plan.id === 'trial' ? <Zap /> : plan.id === 'agency' ? <Users /> : <TrendingUp />}</span>
                  <div><h3>{plan.name}</h3><p>{plan.id === 'trial' ? 'Para conhecer o sistema' : plan.id === 'agency' ? 'Para operações com escala' : 'Para manter ritmo comercial'}</p></div>
                </div>
                <div className="price-value"><strong>{plan.priceLabel || 'Consulte'}</strong>{plan.durationDays ? <small>ciclo de {plan.durationDays} dias</small> : <small>sem cobrança</small>}</div>
                <a className={`button ${featured ? 'button-primary' : 'button-price'}`} href="/app">{plan.id === 'trial' ? 'Começar grátis' : 'Escolher plano'} <ArrowRight size={17} /></a>
                <div className="plan-divider" />
                <span className="includes">O plano inclui:</span>
                <ul>
                  {(Array.isArray(plan.features) ? plan.features : []).map((feature) => <li key={feature}><Check size={17} /> {feature}</li>)}
                </ul>
              </article>
            );
          })}
        </div>
        <p className="pricing-note"><ShieldCheck size={16} /> Os planos exibidos refletem a configuração atual do sistema.</p>
      </div>
    </section>
  );
}

function Faq() {
  const [active, setActive] = useState(0);
  return (
    <section className="faq-section section-shell" id="faq">
      <div className="faq-intro">
        <span className="section-tag">Dúvidas frequentes</span>
        <h2>O essencial antes de começar.</h2>
        <p>Ainda ficou alguma dúvida? Entre no sistema e conheça o fluxo usando o plano gratuito.</p>
        <a className="text-link" href="/app">Acessar agora <ArrowRight size={17} /></a>
      </div>
      <div className="faq-list">
        {faqs.map((item, index) => {
          const isOpen = active === index;
          return (
            <article className={`faq-item ${isOpen ? 'open' : ''}`} key={item.question}>
              <button type="button" onClick={() => setActive(isOpen ? -1 : index)} aria-expanded={isOpen}>
                <span>{item.question}</span><ChevronDown size={20} />
              </button>
              <div className="faq-answer"><p>{item.answer}</p></div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section className="final-cta section-shell">
      <div className="cta-glow" />
      <div className="cta-icon"><Radar size={32} /></div>
      <span className="section-tag">Seu próximo cliente pode estar mais perto</span>
      <h2>Organize sua prospecção e comece a agir com mais clareza.</h2>
      <p>Crie sua conta, teste o fluxo e transforme oportunidades em próximos passos comerciais.</p>
      <div className="hero-actions cta-actions">
        <a className="button button-primary" href="/app">Criar conta gratuita <ArrowRight size={19} /></a>
        <a className="button button-ghost-light" href="#recursos">Rever recursos</a>
      </div>
      <div className="cta-proof"><span><Check size={15} /> Acesso pelo navegador</span><span><Check size={15} /> Plano gratuito para testar</span><span><Check size={15} /> CRM integrado</span></div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="site-footer">
      <div className="section-shell footer-grid">
        <div className="footer-brand"><Brand /><p>Prospecção comercial simples, organizada e orientada a oportunidades reais.</p></div>
        <div className="footer-links"><strong>Produto</strong><a href="#recursos">Recursos</a><a href="#como-funciona">Como funciona</a><a href="#planos">Planos</a></div>
        <div className="footer-links"><strong>Acesso</strong><a href="/app">Entrar</a><a href="/app">Criar conta</a><a href="#faq">Dúvidas</a></div>
        <div className="footer-security"><span><ShieldCheck size={20} /></span><div><strong>Operação protegida</strong><small>Autenticação e dados tratados pelo backend do LeadHunter Pro.</small></div></div>
      </div>
      <div className="section-shell footer-bottom"><span>© {new Date().getFullYear()} LeadHunter Pro.</span><span>Feito para transformar prospecção em rotina.</span></div>
    </footer>
  );
}

export default function App() {
  return (
    <>
      <a className="skip-link" href="#conteudo">Pular para o conteúdo</a>
      <Header />
      <main id="conteudo">
        <Hero />
        <TrustStrip />
        <Benefits />
        <Workflow />
        <ResultsPanel />
        <Audience />
        <Pricing />
        <Faq />
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}
