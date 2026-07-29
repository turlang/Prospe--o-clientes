## 25.8.0 — Funil profissional de prospecção

- substitui o gráfico de colunas de Níveis de prospecção por um funil visual responsivo;
- separa oportunidades recusadas como saída lateral do fluxo comercial;
- adiciona leitura executiva com avanço, negociação, fechamento e distribuição por etapa;
- mantém contagens e percentuais alimentados pelos dados reais do relatório;
- atualiza o cache-busting dos assets para 25.8.0.

## 25.7.2 — Limpeza da interface e histórico operacional

- Removidos os cards de IA e upgrade da sidebar.
- Alertas e orientações movidos para Histórico.
- Resumo de planos do Admin alinhado em uma única linha.

## 25.7.2 — Correção estrutural do Admin e Plano de Ação

- move IA Comercial para dentro da Visão executiva do painel administrativo;
- remove a seção isolada de IA Comercial do menu;
- incorpora Alertas e orientação ao mesmo card do Plano de ação de hoje;
- remove o quadro independente de Alertas e orientação;
- mantém Saúde do pipeline em uma única ocorrência na Visão geral;
- adiciona testes de regressão para impedir reintrodução das duplicidades.

## 25.7.0 — IA Comercial no Admin e radar no plano de ação

- adiciona ao painel administrativo um card seguro de status do provedor de IA, modelo e configuração, sem expor chaves;
- incorpora o radar operacional ao Plano de ação de hoje, com gargalo, prioridade e recomendação;
- mantém os gráficos existentes exclusivamente na Visão geral, evitando duplicação;
- atualiza o cache-busting dos assets para 25.7.0.

## 25.6.0 — Correção de cache, landing e analytics publicados

- corrige o estado ativo invisível na tela Fluxo da landing;
- atualiza o versionamento dos assets do dashboard, Admin e recuperação de senha;
- força revalidação de CSS e JavaScript após deploy;
- garante que os componentes profissionais de pipeline e conversão substituam os gráficos legados;
- mantém dados, regras comerciais e APIs sem alterações incompatíveis.

## 25.5.0 — Fluxo editorial e analytics executivo

- Tela **Fluxo** redesenhada com título equilibrado, seletor compacto, radar operacional e conteúdo sem áreas vazias.
- Landing React e fallback estático receberam a mesma composição para impedir divergência no Render.
- Gráfico **Níveis de prospecção** substituído por pipeline profissional com eixo, etapas, ícones e versão mobile em barras horizontais.
- **Indicadores de conversão** agora combinam KPIs, conversão por etapa e resumo executivo de oportunidades e receita potencial.
- Cálculos de conversão usam dados reais do relatório comercial e não fabricam comparação histórica.
- Novos componentes não dependem de biblioteca externa de gráficos e mantêm acessibilidade e responsividade.
- Adicionados testes de regressão específicos para analytics e sete etapas canônicas do funil.

## 25.4.0 — Correção completa de diagramação

- Cinco telas reorganizadas com a mesma régua visual.
- Tipografia reduzida e hierarquia mais clara.
- Fluxo ganhou trilha operacional para eliminar área vazia.
- Ferramentas ganharam fila de oportunidades e preview mais informativo.
- Público ganhou leitura comercial compacta e indicador de aderência.
- Planos agora aparecem em três cards comparáveis no desktop e por botões no mobile.
- Landing continua sem scroll e sincronizada com os planos do Admin.

# Changelog

## 25.3.0 — Landing em tela única sem scroll

- Documento público fixado em `100dvh`, sem rolagem vertical ou horizontal da página.
- Navegação por botões entre Início, Como funciona, Ferramentas, Para quem é e Planos.
- Abas acessíveis no desktop, barra inferior no mobile e controles sequenciais.
- Seletores internos atualizam etapas, ferramentas, públicos e planos sem recarregar a página.
- Hash e histórico do navegador preservam a tela ativa sem deslocar o documento.
- Planos dinâmicos do Admin permanecem sincronizados por `GET /api/plans`.
- React e contingência estática receberam o mesmo comportamento interativo.
- Testes de regressão verificam viewport, ausência de overflow e troca de painéis.

## 25.2.0 — Identidade Signal Engine

- Nova identidade visual baseada em radar de oportunidades e central comercial.
- Hero, ferramentas, público, planos e CTA redesenhados.
- Fallback estático equivalente ao React para impedir retorno da landing antiga.
- Diagnóstico correto da origem do artefato público.
- Planos dinâmicos do Admin preservados.


## 25.1.0 — Planos dinâmicos e persistentes

- Corrige preços zerados na landing por incompatibilidade entre `priceLabel` e `price`.
- Publica alterações do Admin sem cache e com sincronização entre abas.
- Persiste o catálogo de planos no MongoDB para sobreviver a deploys do Render.
- Adiciona revisão pública da configuração e testes de regressão.

## 25.0.0 — Higienização arquitetural e landing resiliente

- Corrigida a causa que mantinha a landing antiga em produção: o pacote não continha o artefato React e o servidor servia um fallback obsoleto.
- Landing React/Tailwind reorganizada por funcionalidades, com hero escuro, produto visível, cards, público e planos.
- Adicionado artefato público versionado e contingência estática equivalente.
- Build de produção bloqueia falhas do React com `STRICT_REACT_BUILD=true`.
- Backend reorganizado em domínio, serviços, repositórios, integrações, infraestrutura e rotas.
- Páginas e assets públicos separados por contexto.
- Adicionados padrões de código, verificação arquitetural, validação documental e regressões de deploy.
- Dados existentes preservados e 143 testes aprovados.

## [24.1.0] - 2026-07-28

### Alterado
- Landing React convertida em site comercial compacto e explicativo.
- Painel autenticado ganhou barra de sessão e logout sem redirecionamento.
- Gráficos executivos adaptados para mobile sem cortes horizontais.

## 24.0.1 — Painel móvel corrigido

- Eliminada a largura fixa/intrínseca que fazia o dashboard ultrapassar telas de 412 px.
- Cards, gráficos, cabeçalhos e formulários agora respeitam a largura disponível.
- Kanban, pipeline e menu lateral usam rolagem horizontal interna somente quando necessário.
- Navegação móvel transformada em faixa horizontal compacta.
- Corrigida a regra `[hidden]` para impedir que componentes `display: grid` reapareçam indevidamente.
- Adicionado teste de regressão responsiva.

## 24.0.0 — Landing page React e nova identidade visual

- Migrada a página pública para React com build dedicado pelo Vite.
- Criada nova identidade visual responsiva, com hero comercial, dashboard demonstrativo, recursos, fluxo, planos e FAQ interativo.
- Planos da landing agora são carregados de `/api/plans`, acompanhando as alterações feitas pelo administrador.
- Mantidos separados o frontend público React e o painel autenticado legado para reduzir risco de regressão.
- O Render passou a executar `npm run build` antes de iniciar o servidor.
- Adicionado fallback da landing anterior para desenvolvimento quando o bundle React ainda não foi gerado.
- Fixada a versão Node.js 20.20.2 para compatibilidade com o pipeline de frontend.

## 23.9.2 — Recuperação de senha funcional e observável

- Corrigido o falso sucesso quando o provedor de e-mail não estava configurado em produção.
- Adicionadas as variáveis `RESEND_API_KEY` e `MAIL_FROM` ao Blueprint do Render.
- Links de redefinição agora usam a URL pública real e ignoram `localhost` em produção.
- O envio via Resend ganhou timeout, texto alternativo, idempotência e mensagens de erro operacionais.
- Tokens não enviados são removidos e links anteriores só são invalidados após o novo envio ser confirmado.
- O modo JSON local passou a permitir redefinição de senha durante o desenvolvimento.
- Corrigida a invalidação de uma sessão criada no mesmo segundo da troca de senha.
- A tela de login informa o sucesso após a redefinição e evita solicitações duplicadas.

## 23.9.1 — Correção de inicialização no Render

- Corrigida a injeção do middleware `simpleRateLimit` em `commercialRoutes`.
- Removido o índice duplicado de `PasswordReset.expiresAt`, preservando o índice TTL.
- Adicionado teste de regressão que instancia `createApp` e registra todas as rotas.

## 23.9.0 — Reinicialização administrativa segura do banco

- Adicionada zona de perigo no painel administrativo com prévia de exclusões.
- Implementada reinicialização para MongoDB e armazenamento JSON local.
- A operação remove pesquisas, leads, tarefas, uso, pagamentos, segurança, conversas do copiloto, auditoria anterior e usuários comuns.
- Todas as contas com função `admin` são preservadas.
- A execução exige autenticação administrativa, senha atual, frase exata de confirmação e confirmação final no navegador.
- Reinicializações concorrentes são bloqueadas.
- Usuários comuns são removidos por último para preservar acesso administrativo em caso de falha intermediária.
- Criado recibo de auditoria após a limpeza.
- Adicionados testes de domínio, persistência local, MongoDB simulado, autorização e interface.

## 23.8.0 — Motor de inteligência comercial e automação de funil

- Implementado `commercialFunnelEngine` com abordagem hiper-humana para WhatsApp.
- Adicionada sanitização obrigatória de jargões e palavras estrangeiras.
- Adicionada auditoria de WhatsApp, telefone, e-mail e redes sociais.
- A saída da abordagem passa a incluir mensagem, contatos e próxima ação.
- Respostas positivas criam tarefa automática de diagnóstico.
- Pedidos de preço sugerem valor a partir de R$ 300 e conversa de 10 a 15 minutos.
- Propostas criam acompanhamento automático e fechamentos concluem tarefas pendentes.
- Tarefas automáticas são idempotentes e não substituem tarefas manuais.
- Interface atualizada com três blocos operacionais.
- Próxima ação exibe acesso direto à agenda comercial do dashboard.
- Criação local de tarefas idempotentes passou a ser atômica sob escrita concorrente.
- Adicionados testes específicos de linguagem, canais, tarefas e integração de rota.

## [23.7.1] - 2026-07-27

### Corrigido
- Corrigido o desaparecimento de leads após o registro de uma resposta recebida.
- Estados internos `RESPONDEU`, `QUALIFICANDO` e `PERDIDO` agora são convertidos para etapas canônicas visíveis.
- A etapa `REUNIAO` passou a existir no Kanban, filtros, relatórios, cockpit e inteligência comercial.
- A resposta recebida agora pode ser registrada diretamente na ficha em popup do CRM.
- A interface atualiza imediatamente o card, a timeline, os indicadores e informa a transição realizada.
- Respostas não podem rebaixar automaticamente oportunidades que já estão em `REUNIAO` ou `PROPOSTA`.
- O clique no WhatsApp registra o primeiro contato sem rebaixar leads já avançados.

### Testes
- Adicionados testes do vocabulário do funil, análise de respostas, rota HTTP e regressão visual.
- Suíte completa: 110 testes aprovados.

## [23.7.0] - 2026-07-27

### Refatorado
- Separado o bootstrap (`server.js`) da composição Express (`app.js`).
- Adotado o padrão Application Factory para permitir testes sem abrir porta HTTP.
- Distribuídas as rotas entre sistema, cobrança, leads, administração e operações comerciais.
- Extraídas políticas financeiras puras para `domain/billingPolicy.js`.
- Removida exportação duplicada do motor de campanhas.

### Documentado
- Adicionados cabeçalhos `@fileoverview` em todos os módulos JavaScript.
- Adicionados contratos JSDoc de domínio e comentários de seções no frontend legado.
- Criados relatório acadêmico, requisitos, catálogo da API, plano de testes, matriz de rastreabilidade e ADRs.
- Adicionado guia de contribuição e padrão de comentários.

### Qualidade
- Adicionado `npm run check:docs`.
- Atualizados testes estruturais para a nova arquitetura.
- Validação final: 95 arquivos JavaScript, 97 testes e paridade de 57 endpoints.

## 23.6.1 — Correção de engenharia, segurança e estabilidade

### Corrigido
- Dashboard não quebra quando o bloco legado `#stats` não existe.
- Recuperação de senha voltou a ter acionamento visível na tela de login.
- Saúde do pipeline V23 voltou a ser renderizada no cockpit.
- Cópia de abordagens, respostas e propostas não injeta conteúdo dinâmico em handlers HTML.
- Escritas em JSON local passam a ser atômicas e serializadas, evitando corrupção por concorrência.
- Probabilidade comercial `MÉDIA` e identificador de redes sociais foram corrigidos.
- HTML duplicado em sequências de follow-up foi removido.

### Segurança
- Checkout simulado é proibido em produção.
- Sincronização de pagamento valida o proprietário e o valor/moeda do plano.
- Identificadores de pagamento são validados antes da consulta ao Mercado Pago.
- Auditoria de sites bloqueia SSRF contra localhost, redes privadas e redirecionamentos inseguros.
- Autenticação verifica usuário ativo a cada requisição e invalida sessões após troca de senha.
- Recuperação de senha usa consumo atômico do token e respostas sem enumeração de conta.
- Produção exige MongoDB; dados locais não podem ser usados como fallback.
- CORS, payload JSON, limites de requisição e mensagens de erro foram endurecidos.
- Dados locais sensíveis foram removidos da distribuição e `data/*.json` passou a ser ignorado pelo Git.

### Qualidade
- Adicionado verificador recursivo de sintaxe para todo o JavaScript.
- Adicionados testes de regressão para frontend, cobrança, SSRF e armazenamento concorrente.

## 23.5.0 — Visão Geral Analítica e UX Comercial

- Visão Geral passa a abrir antes da Central de Inteligência e exibe somente gráficos executivos.
- Novos gráficos de potencial de ganhos, níveis de prospecção, contatos, propostas e conversão.
- CRM simplificado para conter apenas o pipeline e seus filtros essenciais.
- Agenda restrita a leads que já receberam o primeiro contato.
- Relatórios com funil e recomendações em cards, desempenho por segmento em gráfico e listas com rolagem interna.
- Sidebar corrigida para evitar sobreposição entre uso diário, status da IA e menu.

# V22.0.0 — CRM Autônomo

- Central de Inteligência Comercial com plano diário.
- Copiloto comercial com Groq/Gemini/OpenAI e fallback local.
- Saúde do pipeline, gargalos e previsão ponderada de receita.
- Endpoints `/api/v22/command-center` e `/api/v22/copilot`.


## 21.5.0 — Crescimento pós-venda

### Adicionado
- Módulo de crescimento pós-venda na aba Clientes.
- Identificação de clientes prontos para indicação, expansão e recorrência.
- Mensagem de pedido de indicação para clientes fechados.
- Mensagem de expansão/upsell em linguagem simples.
- Endpoints `/api/customer-growth/summary`, `/api/customer-growth/referral` e `/api/customer-growth/expansion`.
- Testes do serviço `customerGrowthService`.


## V21.4 — Carteira de clientes e pós-venda

- Adicionada aba **Clientes** para acompanhar fechamentos e carteira ativa.
- Criados endpoints `/api/customers/summary`, `/api/customers/close` e `/api/customers/lost`.
- Leads podem ser marcados como **FECHADO** diretamente da ficha ou da central de propostas.
- Cada cliente recebe plano simples de onboarding e próxima melhor ação.
- Resumo exibe clientes fechados, receita fechada, ticket médio e pipeline aberto.
- Adicionados testes do serviço de carteira de clientes.


## V21.3 — Propostas comerciais com IA

- Propostas agora usam o mesmo AI Provider Manager das abordagens (Groq, Gemini, OpenAI ou fallback local).
- Adicionado prompt específico para proposta comercial simples, humana e sem linguagem técnica.
- A proposta gerada pela IA inclui diagnóstico, solução recomendada, entregáveis, referência comercial, próximo passo e mensagem pronta para envio.
- Quando a IA estiver indisponível, o sistema usa automaticamente uma proposta local e informa o motor utilizado.
- Novos testes para prompt de proposta com IA e normalização do retorno do provedor.

## 21.2.0 — Central de propostas comerciais

- Adicionada nova aba **Propostas**.
- Criado endpoint `/api/proposals/generate` para gerar proposta a partir do lead.
- Criado endpoint `/api/proposals/summary` para acompanhar propostas geradas.
- Propostas ficam registradas na timeline do lead e movem o status para `PROPOSTA`.
- Incluídos testes do serviço de propostas.

## 21.0.0 - Assistente Comercial Inteligente

- Adicionado serviço `commercialIntelligenceService` para priorização dinâmica de leads.
- Novo endpoint `/api/commercial-intelligence/summary` com próxima melhor ação, oportunidades em risco e orientação de gerente comercial.
- Novo endpoint `/api/commercial-intelligence/objection` para resposta consultiva a objeções comuns.
- Dashboard agora exibe Assistente Comercial Inteligente com leads ativos, alta prioridade, riscos e próximos passos.
- Adicionados testes automatizados da inteligência comercial V21.

## 20.9.0 - Agenda comercial inteligente

- Nova visão de agenda operacional agrupando tarefas atrasadas, para hoje, próximos 7 dias, futuras e concluídas.
- Criado endpoint `/api/agenda/summary` para entregar resumo executivo da agenda comercial.
- Adicionado serviço `commercialAgendaService` com regras testáveis de prioridade, urgência e próxima melhor ação.
- Interface da agenda ganhou cartões de resumo e botão para abrir a ficha do lead diretamente da tarefa.

## 20.5.0

### Adicionado
- Suporte ao provedor Groq para geração de abordagens comerciais.
- Variáveis `GROQ_API_KEY` e `GROQ_MODEL` no `.env.example`.

### Alterado
- Provedor recomendado de IA passa a ser Groq.
- Modo `AI_PROVIDER=auto` prioriza Groq antes de Gemini/OpenAI.
- Erros técnicos de IA são apresentados de forma amigável ao usuário.

# Changelog

## 24.0.0 — Landing page React e nova identidade visual

- Migrada a página pública para React com build dedicado pelo Vite.
- Criada nova identidade visual responsiva, com hero comercial, dashboard demonstrativo, recursos, fluxo, planos e FAQ interativo.
- Planos da landing agora são carregados de `/api/plans`, acompanhando as alterações feitas pelo administrador.
- Mantidos separados o frontend público React e o painel autenticado legado para reduzir risco de regressão.
- O Render passou a executar `npm run build` antes de iniciar o servidor.
- Adicionado fallback da landing anterior para desenvolvimento quando o bundle React ainda não foi gerado.
- Fixada a versão Node.js 20.20.2 para compatibilidade com o pipeline de frontend.

## 23.9.2 — Recuperação de senha funcional e observável

- Corrigido o falso sucesso quando o provedor de e-mail não estava configurado em produção.
- Adicionadas as variáveis `RESEND_API_KEY` e `MAIL_FROM` ao Blueprint do Render.
- Links de redefinição agora usam a URL pública real e ignoram `localhost` em produção.
- O envio via Resend ganhou timeout, texto alternativo, idempotência e mensagens de erro operacionais.
- Tokens não enviados são removidos e links anteriores só são invalidados após o novo envio ser confirmado.
- O modo JSON local passou a permitir redefinição de senha durante o desenvolvimento.
- Corrigida a invalidação de uma sessão criada no mesmo segundo da troca de senha.
- A tela de login informa o sucesso após a redefinição e evita solicitações duplicadas.

## 20.3.0 — Gemini e transparência da IA

### Adicionado
- Suporte a Google Gemini via `AI_PROVIDER=gemini`, `GEMINI_API_KEY` e `GEMINI_MODEL`.
- Endpoint autenticado `/api/ai/status` para mostrar qual motor está ativo.
- Status visual da IA Comercial na lateral do dashboard.
- Identificação do motor usado em cada abordagem: Gemini, OpenAI, fallback local ou motor local.
- Testes automatizados para seleção de provedor e status do Gemini.

### Alterado
- Camada de IA agora usa um gerenciador de provedores com modo `auto`, `gemini`, `openai` ou `local`.
- Documentação e `.env.example` atualizados com configuração para Render.

## 20.0.0 — CRM Comercial Inteligente — Sprint 1

### Adicionado
- Motor de Estratégias Comerciais em `src/services/salesStrategyEngine.js`.
- Botão de abordagem agora gera diagnóstico, estratégia recomendada, mensagem pronta e sequência de follow-ups.
- Documentação consolidada em `docs/RELEASE_NOTES.md`, `docs/ROADMAP.md` e `docs/ARQUITETURA.md`.
- Testes automatizados do motor de estratégias comerciais.

### Alterado
- Mensagens de abordagem deixam de ser genéricas e passam a considerar site, WhatsApp, presença social, score e segmento do lead.
- README atualizado para apontar para a nova documentação consolidada.

### Removido
- Arquivos antigos `RELEASE_V*.md` da raiz, agora consolidados em `docs/RELEASE_NOTES.md`.


## v16.1.2 - Refinamento de Acessibilidade Admin

### Melhorado
- Link "Abrir dashboard" com `aria-label` e foco visível.
- Classe `.sr-only` reforçada com `!important`.
- Botões administrativos com `aria-label`.
- Tabelas do Admin com `<caption>`.
- Cabeçalhos de tabela com `scope="col"` e `scope="row"`.

---


## v16.1.1 - Landing Acessível e SEO

### Melhorado
- Navegação da landing com `nav`, `ul` e `li`.
- `aria-label` no menu principal.
- Landmark `main` com `id="conteudo-principal"`.
- CTA principal com `aria-label`.
- FAQ e rodapé com rótulos acessíveis.
- Metadados SEO e Open Graph.
- Alt text automático em imagens sem descrição.

---


## v16.1.0 - Acessibilidade e Semântica

### Melhorado
- Labels associados aos inputs com `for` e `id`.
- Botões de formulário com `type` explícito.
- Navegação principal com `nav`, `ul` e `li`.
- Regiões de status com `aria-live`.
- Autocomplete em campos de login, cadastro e senha.
- Estilo de foco visível para teclado.
- Labels acessíveis em campos administrativos.

---


## v16.0.0 - Automações Comerciais

### Adicionado
- Sequência automática de follow-ups por lead.
- Endpoint `/api/automations/followup-sequence`.
- Endpoint `/api/automations/next-actions`.
- Próximas ações sugeridas.
- Priorização automática de leads quentes.
- Agenda com prioridade e tipo de automação.
- Botão "Automatizar sequência" nos leads.
- Nova área "Automações comerciais" em Campanhas.

---


## v15.1.0 - Correções Admin e Anti-Abuso

### Corrigido
- Admin não fica mais preso no Painel Master.
- Botão "Abrir dashboard" abre `/app?adminDashboard=1`.
- Dashboard comum mostra atalho para voltar ao Painel Master quando o usuário é admin.
- Painel de segurança permite remover registro bloqueado.
- Painel de segurança permite limpar registros por e-mail.
- Promoção para admin limpa registros anti-abuso do usuário.

---



## v15.0.0 - Recuperação de Senha

### Adicionado
- Fluxo "Esqueci minha senha".
- Endpoint `/api/auth/forgot-password`.
- Endpoint `/api/auth/reset-password`.
- Página `reset-password.html`.
- Tokens temporários com expiração de 30 minutos.
- Bloqueio de token já utilizado.
- Collection `passwordresets`.
- Log seguro do link de recuperação no Render para validação inicial.

---




 c227331657d57b2b56a41444b3d5ed6f277556f3
## v14.1.1 - Correção do redirect admin

### Corrigido
- Resposta de login/cadastro agora envia `role`.
- Frontend consegue identificar `role: "admin"` imediatamente após login.
- Admin é redirecionado corretamente para `/admin`.

---





 7019867f0aae28feca9d3d3415d07b05bbff440a
 c227331657d57b2b56a41444b3d5ed6f277556f3
## v14.1.0 - UX Admin

### Corrigido
- Usuário administrador é redirecionado automaticamente para `/admin` após login.
- Admin logado que tentar abrir `/app` é enviado para o Painel Master.
- Botão do painel admin renomeado para "Abrir dashboard".

---


## v14.0.0 - Segurança e Anti-Abuso

### Adicionado
- Limite de cadastros por IP
- Trial único por dispositivo
- Bloqueio de e-mails temporários
- TrialGuard
- Painel de Segurança

---

## v13.0.0 - Painel Master Admin

### Adicionado
- Painel Administrativo
- Gestão de usuários
- Gestão de pagamentos
- Promoção para admin
- Suspensão de usuários

---

## v11.2.1 - Estabilização

### Corrigido
- Logout sem F5
- Sincronização de plano
- Limpeza de cache

---

## v11.2.0 - Pagamentos Automáticos

### Adicionado
- Webhook Mercado Pago
- Sincronização de pagamentos
- Atualização automática de plano

---

## v11.1.0 - UI Compacta

### Melhorado
- Layout 20% mais compacto
- Sidebar otimizada
- Cards menores

---

## v11.0.0 - Mercado Pago Real

### Adicionado
- Checkout Pro
- Pagamentos reais
- Assinaturas

---

## v10.0.0

### Base SaaS
- Login
- Cadastro
- CRM
- Dashboard
- MongoDB Atlas
- Render

---

## v20.7.0 - Tom comercial humanizado para IA

### Alterado
- Prompt Engine passou a orientar a IA a atuar como vendedor consultivo de serviços tecnológicos, não como técnico.
- Abordagens agora evitam jargões como SEO, funil, conversão, landing page, CRM e automação quando o lead não conhece tecnologia.
- Benefícios foram traduzidos para linguagem simples: mais chamadas no WhatsApp, mais agendamentos, mais pedidos, mais orçamentos e mais confiança.
- Motor local recebeu mensagens de fallback mais humanas e próximas do dono do negócio.

### Testes
- Adicionados testes garantindo prompt em linguagem simples e ausência de termos técnicos no fallback local.

## 20.8.0 - Consultor IA Multicanal

### Adicionado
- Geração de peças comerciais por canal: WhatsApp, e-mail, roteiro de ligação, follow-up, objeção e convite para diagnóstico.
- Botões rápidos no resultado do Consultor IA para alternar o canal sem sair do lead.
- Prompt Engine com regras específicas por canal.

### Alterado
- O motor local agora adapta a mensagem ao canal quando a IA externa estiver indisponível.

## 21.1.0 - Relatórios Comerciais Gerenciais

### Adicionado
- Nova aba **Relatórios** com visão gerencial do funil comercial.
- Endpoint `GET /api/reports/commercial` com métricas de conversão, receita prevista, ranking de segmentos e leads parados.
- Endpoint `GET /api/reports/commercial.csv` para exportar relatório comercial.
- Serviço `commercialReportService` com testes automatizados.

### Melhorado
- Dashboard comercial passa a ter uma visão complementar para gestão e análise, além da operação diária do CRM.

## 21.6.0 - Campanhas Comerciais Inteligentes

### Adicionado
- Serviço `campaignAutomationService` para criar campanhas comerciais revisáveis por lead.
- Endpoint `GET /api/campaigns/summary` com leads prontos para campanha, prioridade e recomendações.
- Endpoint `POST /api/campaigns/smart-sequence` para gerar cadência com IA ou fallback local.
- Criação automática de tarefas da campanha na agenda comercial, sem envio automático de mensagens.
- Aba **Campanhas** reorganizada para mostrar leads prontos para cadência e botões de criação de campanha.

### Segurança Comercial
- As campanhas continuam manuais: o sistema gera roteiro e tarefas, mas o vendedor revisa e envia.

### Testes
- Adicionados testes para classificação de leads, resumo de campanhas, cadência local, normalização de IA, tarefas e timeline.

## 23.1.0 — Sales OS Core

### Adicionado
- Núcleo `src/core` para separar inteligência, IA, memória, aprendizado e automações.
- Prompt Manager com prompts externos em Markdown.
- AI Provider Manager unificando status e geração estruturada.
- Commercial Intelligence Engine como fachada única para score e próxima melhor ação.
- Sales Memory para eventos comerciais estruturados.
- Learning Engine para medir desempenho de estratégias por segmento.
- Automation Engine para detectar leads sem próximo passo.
- Endpoints autenticados `/api/v23/status` e `/api/v23/snapshot`.

### Alterado
- Versão do produto atualizada para 23.1.0.
- `server.js` passou a montar as rotas do Sales OS Core sem remover as APIs legadas.

## 23.2.0 — Cockpit Comercial

### Adicionado
- Nova Home em formato de cockpit operacional.
- Plano de ação diário priorizado.
- Timeline global de atividades do CRM.
- Pipeline executivo com volume, valor e avanço por etapa.
- Indicadores de oportunidades, tarefas, propostas e receita.
- Endpoint `GET /api/v23/cockpit`.

### Alterado
- Central de Inteligência V22 substituída pelo Cockpit Comercial V23.2.
- Sales OS Core atualizado para a versão 23.2.0.

## [23.3.0] - 2026-07-09
### Adicionado
- Copiloto Comercial IA conectado ao contexto completo do CRM.
- Memória persistente de conversas por usuário em MongoDB ou JSON local.
- Histórico, limpeza de conversa e planejamento comercial diário.
- Context Builder com pipeline, agenda, propostas, alertas, timeline e leads prioritários.
- Endpoints `GET /api/v23/copilot/history`, `DELETE /api/v23/copilot/history`, `GET /api/v23/copilot/briefing` e `POST /api/v23/copilot/chat`.
- Interface de chat com perguntas rápidas e ações recomendadas.


## 23.4.0 — Administração Executiva e Navegação

- Menu lateral com rolagem própria em telas menores.
- Painel Admin redesenhado com visão executiva moderna.
- Métricas de uso, conversão, ativação, MRR, receita e engajamento.
- Gráficos de receita, consumo de leads, crescimento e distribuição de planos.

## 23.6.0

### Alterado
- Potencial de ganhos por etapa passou a usar cards individuais.
- Níveis de prospecção e indicadores de conversão passaram a usar gráficos de colunas.
- Pipeline executivo foi movido da Central de Inteligência para a Visão Geral.
- Pipeline comercial e histórico de contatos receberam rolagem interna.
- Cards do funil nos Relatórios agora abrem os leads da etapa selecionada.

## [24.2.0] - 2026-07-28

### Added
- Landing React modular com Tailwind CSS 4.
- Comunicação voltada a desenvolvedores, freelancers, agências e automação.
- Cards de varredura, diagnóstico web, abordagem com IA e CRM Kanban.
- Container queries para gráficos do dashboard.

### Changed
- Hero, navegação, ferramentas, planos e CTA final redesenhados.
- Cache da folha do painel atualizado.

## 24.3.0

- Hero comercial reconstruído para reduzir peso visual e melhorar leitura em mobile.
- Nova demonstração do dashboard com leads, Lead Score e abordagem com IA.
- Ferramentas apresentadas em composição bento com CRM Kanban.
- Planos e CTA final refinados para maior clareza e conversão.
- Header escuro integrado ao hero e menu mobile ajustado.
