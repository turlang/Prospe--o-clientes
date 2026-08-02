# Release 26.2.0 — Higienização estrutural real

- Removido conteúdo acidental do DevBurger e seus artefatos de React/Prisma/PostgreSQL.
- Removidas duplicatas antigas de backend, páginas públicas e componentes React inacessíveis.
- Repositório protegido por verificação arquitetural e teste de regressão de higiene.
- Dados, APIs e regras comerciais preservados.

---

## 24.1.0 — Landing comercial e painel mobile

- Redesenho comercial da landing React, com explicação clara do produto, cards de ferramentas, fluxo de uso e planos.
- Barra de sessão autenticada com botão único de logout.
- Ocultação da apresentação e dos formulários de autenticação durante a sessão.
- Logout local, reabrindo o formulário em `/app`.
- Gráficos em barras horizontais e cards responsivos para telas pequenas.

# Release 24.0.1 — Responsividade do painel

## Corrigido

- dashboard autenticado adaptado para 320–720 px;
- remoção da rolagem horizontal do documento;
- rolagem isolada para Kanban, pipeline e menu;
- cabeçalhos, botões, cards e gráficos com largura fluida;
- estado `hidden` protegido contra regras de layout grid.

---

# Release 24.0.0 — Landing React

## Interface pública

- nova landing page desenvolvida em React;
- layout responsivo com navegação móvel;
- demonstração visual do dashboard comercial;
- cards de recursos, processo comercial, públicos atendidos e FAQ interativo;
- planos carregados dinamicamente pela API pública;
- build isolado em `public/landing-react`, sem substituir o painel autenticado.

## Deploy

O Render executa `npm install && npm run build`. O build do Vite gera os arquivos públicos antes do comando `npm start`.

---

# Release 23.9.2 — Recuperação de senha

## Corrigido

- envio de e-mail obrigatório e verificável em produção;
- configuração explícita do Resend no Render;
- URL pública correta no link de redefinição;
- remoção de tokens quando o envio falha;
- suporte ao fluxo local de desenvolvimento;
- login imediato após a troca de senha;
- resposta inválida do servidor tratada na página de redefinição.

## Configuração de produção

Defina `PUBLIC_APP_URL`, `RESEND_API_KEY` e `MAIL_FROM`. O remetente deve usar um domínio verificado no Resend.

---

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


## V21.5 — Crescimento pós-venda

A versão 21.5 amplia a aba Clientes para além do fechamento. O sistema agora recomenda ações de indicação, expansão e recorrência para clientes já fechados, ajudando o usuário a gerar novas oportunidades sem depender apenas de prospecção fria.

Principais pontos:
- clientes fechados analisados por tempo desde o fechamento;
- identificação de clientes prontos para pedido de indicação;
- identificação de clientes com potencial de expansão;
- geração de mensagens prontas para copiar;
- registro das ações na timeline do lead.


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

## V21.2 — Central de propostas comerciais

- Adicionada nova aba **Propostas**.
- Criado endpoint `/api/proposals/generate` para gerar proposta a partir do lead.
- Criado endpoint `/api/proposals/summary` para acompanhar propostas geradas.
- Propostas ficam registradas na timeline do lead e movem o status para `PROPOSTA`.
- Incluídos testes do serviço de propostas.

## V21.0 — Assistente Comercial Inteligente

A V21 transforma o CRM em um copiloto comercial que orienta o vendedor sobre onde agir primeiro.

### Adicionado

- Priorização dinâmica de leads com base em score, status, tempo sem interação e tarefas pendentes.
- Próxima melhor ação por lead: primeiro contato, follow-up, proposta, ligação, pós-venda ou arquivamento.
- Detecção de oportunidades em risco, como proposta sem retorno, lead novo parado e interessado sem próximo passo.
- Resumo executivo no dashboard com leads ativos, alta prioridade, riscos e leads sem tarefa.
- Orientações de gerente comercial para ajudar o usuário a decidir o foco do dia.
- Endpoint `/api/commercial-intelligence/summary`.
- Endpoint `/api/commercial-intelligence/objection`.
- Testes automatizados para o motor de inteligência comercial.

### Objetivo

Reduzir confusão operacional e transformar o sistema em um assistente que recomenda a ação comercial mais útil, em vez de apenas armazenar informações.

## 20.9.0 - Agenda comercial inteligente

- Nova visão de agenda operacional agrupando tarefas atrasadas, para hoje, próximos 7 dias, futuras e concluídas.
- Criado endpoint `/api/agenda/summary` para entregar resumo executivo da agenda comercial.
- Adicionado serviço `commercialAgendaService` com regras testáveis de prioridade, urgência e próxima melhor ação.
- Interface da agenda ganhou cartões de resumo e botão para abrir a ficha do lead diretamente da tarefa.

## V20.6 — Prompt Engine Comercial

- Criado `src/services/commercialPromptEngine.js` para montar briefing comercial antes da chamada de IA.
- O prompt agora considera perfil do lead, maturidade digital, oportunidade, estratégia, canal, modo de geração e memória comercial.
- A IA passa a receber regras explícitas para evitar clichês, propaganda agressiva e informações inventadas.
- `Gerar outra versão` agora envia instruções para mudar abertura, argumento e CTA, evitando repetição da abordagem anterior.
- `Melhorar esta abordagem` usa a mensagem anterior como base para uma versão mais específica e natural.
- Cada abordagem gerada é registrada na timeline do lead como `ABORDAGEM_IA_GERADA` ou `ABORDAGEM_GERADA`.
- Frontend atualizado para exibir checklist de qualidade quando o provedor retornar esse campo.
- Testes adicionados para o Prompt Engine Comercial.

## V20.5 — Groq como provedor recomendado de IA

- Adicionado suporte ao GroqCloud via `GROQ_API_KEY`.
- `AI_PROVIDER=auto` agora prioriza Groq, depois Gemini, depois OpenAI e por fim motor local.
- README e `.env.example` atualizados com configuração de Render para Groq.
- Erros técnicos de IA agora são convertidos em mensagens mais amigáveis para o usuário final.
- Mantido fallback local para o CRM continuar funcionando mesmo se a IA externa estiver indisponível.

# Release Notes

## V20.3 — Gemini e IA Comercial transparente

- Adicionado suporte ao Google Gemini como provedor principal de IA generativa.
- Mantido suporte a OpenAI e fallback local.
- Criado endpoint `/api/ai/status` para informar provedor, modelo e motivo do modo ativo.
- Adicionado painel lateral de status da IA Comercial.
- Cada abordagem agora mostra explicitamente se foi gerada por Gemini, OpenAI, fallback local ou motor local.
- Atualizados README e `.env.example` com instruções para configurar no Render.

# Release Notes — LeadHunter Pro

Histórico consolidado das versões antigas. Os arquivos `RELEASE_V*.md` foram unificados aqui para manter a raiz do projeto limpa.


---

## RELEASE.V10

# Release v10.0.0 — Produção

Versão validada para uso em produção com Render + MongoDB Atlas.

## Validado

- Landing page pública.
- Cadastro em produção.
- Login em produção.
- JWT.
- MongoDB Atlas conectado.
- Health check público.
- Planos Trial, Pro e Agência.
- Trial de 10 leads.
- Bloqueio após limite.
- Prospecção.
- CRM.
- Kanban.
- Histórico.
- Campanhas.
- Follow-ups.
- Exportação CSV.
- Botão Carregar leads.
- Botão Sair no topo.
- Deploy Render.
- Correção DNS para MongoDB Atlas via `DNS_SERVERS`.

## Variáveis obrigatórias no Render

```env
NODE_ENV=production
REQUIRE_MONGODB=true
DNS_SERVERS=8.8.8.8,1.1.1.1
JWT_SECRET=sua_chave
MONGODB_URI=sua_string_atlas
GOOGLE_PLACES_API_KEY=sua_chave_google
PUBLIC_APP_URL=https://seu-app.onrender.com
```

## Testes pós-deploy

```text
/api/health
/api/plans
cadastro
login
prospecção
CRM
exportação CSV
```


## Patch v10 — Rota inicial corrigida

- `/` abre a landing page.
- `/app` abre o sistema.
- `express.static` configurado com `{ index: false }` para não abrir `index.html` automaticamente.


---

## RELEASE.V11

# Release v11.0.0 — Mercado Pago Real

## Incluído

- Checkout Pro real do Mercado Pago.
- Redirecionamento automático para pagamento.
- Webhook em `/api/billing/webhook`.
- Consulta real do pagamento no Mercado Pago.
- Upgrade automático para Pro ou Agência quando o pagamento for aprovado.
- Auditoria de pagamentos em collection `payments`.
- Endpoint `/api/billing/status`.
- Retorno visual em `/app?pagamento=sucesso`, `/app?pagamento=pendente` e `/app?pagamento=falha`.

## Variáveis obrigatórias no Render

```env
MERCADO_PAGO_PUBLIC_KEY=APP_USR-...
MERCADO_PAGO_ACCESS_TOKEN=APP_USR-...
PUBLIC_APP_URL=https://prospe-o-clientes.onrender.com
MERCADO_PAGO_SUCCESS_URL=https://prospe-o-clientes.onrender.com/app?pagamento=sucesso
MERCADO_PAGO_FAILURE_URL=https://prospe-o-clientes.onrender.com/app?pagamento=falha
MERCADO_PAGO_PENDING_URL=https://prospe-o-clientes.onrender.com/app?pagamento=pendente
MERCADO_PAGO_WEBHOOK_URL=https://prospe-o-clientes.onrender.com/api/billing/webhook
```

## Teste

1. Faça login.
2. Abra Planos.
3. Clique em Ativar Pro.
4. Conclua o checkout.
5. Aguarde o webhook atualizar o plano.
6. Verifique o usuário no MongoDB Atlas.


---

## RELEASE.V11.1

# Release v11.1.0 — Ajuste visual compacto

## Objetivo

Reduzir a sensação de zoom exagerado no dashboard e na landing/app em telas desktop e notebook.

## Alterações

- Redução visual aproximada de 15% a 20% em telas desktop.
- Sidebar mais estreita.
- Cards de métricas menores.
- Kanban mais compacto.
- Espaçamentos internos reduzidos.
- Hero do app menos alto.
- Inputs e botões com altura menor.
- Mantida a responsividade para celular.

## Rotas mantidas

- `/` abre a landing page.
- `/app` abre o sistema.
- `/api/health` health check.


---

## RELEASE.V11.2

# Release v11.2.0 — Fechamento da Fase 12

## Objetivo

Fechar os pontos pendentes do fluxo de pagamento antes do Painel Master.

## Ajustes

- Webhook Mercado Pago mais robusto.
- Sincronização manual/automática em `/api/billing/sync`.
- Retorno do Mercado Pago agora sincroniza `payment_id` quando disponível.
- Status do pagamento passa a ser reconciliado no MongoDB.
- Pagamento aprovado atualiza o documento existente em `payments`.
- Usuário ativo recebe:
  - `plan: pro` ou `agency`
  - `subscriptionStatus: active`
  - `dailyLeadLimit`
  - `planActivatedAt`
  - `planExpiresAt`
- Pagamentos cancelados, recusados, estornados ou chargeback retornam o usuário para trial/expired.
- Verificação de expiração do plano ao consultar uso/status.
- Evita recriar checkout para plano igual ou inferior quando o usuário já está ativo.

## Endpoints

```text
POST /api/billing/checkout
POST /api/billing/webhook
POST /api/billing/sync
GET  /api/billing/status
```

## Validação

1. Ativar Pro.
2. Pagar pelo Mercado Pago.
3. Voltar para `/app?pagamento=sucesso`.
4. Confirmar usuário como `plan: pro`.
5. Confirmar `payments.status: approved`.


---

## RELEASE.V11.2.1

# Release v11.2.1 — Estabilização de sessão e plano

## Correções

- Botão Sair limpa sessão e volta imediatamente para a landing page.
- Não precisa mais apertar F5 após logout.
- Retorno de pagamento limpa a URL após sincronização.
- Sincronização de plano após pagamento reforçada.
- Sidebar atualiza plano/limite após login e retorno do Mercado Pago.

## Validação

1. Faça login.
2. Clique em Sair.
3. Deve voltar para `/` imediatamente.
4. Faça login novamente.
5. O plano deve aparecer correto na sidebar.


---

## RELEASE.V13

# Release v13.0.0 — Painel Master Admin

## Incluído

- Rota `/admin`.
- Página `public/admin.html`.
- Script `public/admin.js`.
- Campo `role` no usuário.
- Middleware `requireAdmin`.
- Endpoint `/api/admin/overview`.
- Endpoint `/api/admin/users`.
- Endpoint `/api/admin/payments`.
- Alteração manual de plano.
- Suspender/reativar usuário.
- Promover/remover administrador.
- Métricas de usuários e receita aprovada.

## Como liberar o primeiro admin

No MongoDB Atlas, edite seu usuário principal e adicione:

```json
"role": "admin"
```

Depois acesse:

```text
https://seu-app.onrender.com/admin
```


---

## RELEASE.V14

# Release v14.0.0 — Segurança e Anti-abuso

## Incluído

- Proteção contra criação indefinida de usuários.
- Limite de cadastros por IP em 24h.
- 1 teste gratuito por dispositivo.
- Bloqueio de domínios de e-mail temporários.
- Registro de tentativas permitidas e bloqueadas na collection `trialguards`.
- Campos `deviceId` e `registrationIp` no usuário.
- `REGISTER_IP_DAILY_LIMIT=3`.
- Painel Admin com seção de Segurança e Anti-abuso.

## Como funciona

- Cada navegador recebe um `deviceId` salvo no `localStorage`.
- No cadastro, o frontend envia esse `deviceId`.
- O backend bloqueia novo trial se o dispositivo já tiver usado o teste.
- O backend limita o número de contas por IP em 24h.
- O backend bloqueia domínios de e-mail descartáveis conhecidos.

## Variável de ambiente

```env
REGISTER_IP_DAILY_LIMIT=3
```


---

## RELEASE.V14.1

# Release v14.1.0 — UX Admin

## Ajuste principal

Administradores agora são enviados automaticamente para o Painel Master.

## Fluxo

- Usuário comum faz login → permanece em `/app`
- Usuário admin faz login → redireciona para `/admin`
- Admin logado tentando abrir `/app` → redireciona para `/admin`

## Validação

1. Faça logout.
2. Faça login com usuário que possui `"role": "admin"`.
3. O sistema deve abrir `/admin` automaticamente.


---

## RELEASE.V14.1.1

# Release v14.1.1 — Correção do redirect admin

## Problema

O frontend verificava `currentUser.role === "admin"`, mas o backend não enviava o campo `role` na resposta de login.

## Correção

A função `publicUser()` agora retorna:

```json
{
  "role": "admin"
}
```

quando o usuário possui esse campo no MongoDB.

## Validação

1. Faça logout.
2. Faça login com o usuário admin.
3. Deve redirecionar automaticamente para `/admin`.


---

## RELEASE.V15

# Release v15.0.0 — Recuperação de Senha

## Incluído

- Botão **Esqueci minha senha** na tela de login.
- Geração de token seguro.
- Token com expiração de 30 minutos.
- Página `/reset-password.html`.
- Redefinição de senha com `bcrypt`.
- Token inutilizado após o uso.
- Collection `passwordresets`.
- Contador de resets no painel de segurança.

## Validação

1. Na tela de login, preencha o e-mail.
2. Clique em **Esqueci minha senha**.
3. No Render Logs, procure por `[PASSWORD_RESET_LINK]`.
4. Abra o link.
5. Defina uma nova senha.
6. Faça login com a nova senha.

## Observação

O envio por e-mail real está preparado como próxima melhoria.
Nesta versão, o link é exibido nos logs do Render para validação segura.


---

## RELEASE.V15.1

# Release v15.1.0 — Correções Admin e Anti-Abuso

## Problemas corrigidos

### Admin preso no Painel Master

Agora o admin pode:

- Entrar automaticamente em `/admin`.
- Clicar em **Abrir dashboard** e acessar `/app?adminDashboard=1`.
- Usar o dashboard comum.
- Voltar ao Painel Master pelo botão **Painel Master** no menu.

### Registro BLOCKED no anti-abuso

Agora o painel de segurança possui ações para:

- Remover registro individual.
- Limpar registros por e-mail.
- Limpar registros anti-abuso automaticamente quando um usuário é promovido para admin.

## Validação

1. Faça login como admin.
2. Confirme que abre `/admin`.
3. Clique em **Abrir dashboard**.
4. Confirme que abre o dashboard comum.
5. Volte pelo botão **Painel Master**.
6. Na seção Segurança, clique em **Remover** ou **Limpar e-mail** em um registro bloqueado.


---

## RELEASE.V16

# Release v16.0.0 — Automações Comerciais

## Incluído

- Sequência automática de follow-ups por lead.
- Priorização automática de leads quentes.
- Próximas ações sugeridas.
- Agenda de follow-ups com prioridade.
- Botão **Automatizar sequência** nos leads.
- Nova área na aba **Campanhas**.

## Endpoints

```text
POST /api/automations/followup-sequence
GET  /api/automations/next-actions
```

## Validação

1. Faça login.
2. Busque/carregue leads.
3. Clique em **Automatizar sequência** em um lead.
4. Abra **Campanhas**.
5. Confira as próximas ações e a agenda de follow-ups.


---

## RELEASE.V16.1

# Release v16.1.0 — Acessibilidade e Semântica

## Aplicado

- Uso de `label for` associado ao `id` dos inputs.
- `type="submit"` explícito nos botões de formulário.
- Menu principal com estrutura `nav > ul > li > button`.
- Regiões dinâmicas com `aria-live`.
- `autocomplete` em campos de e-mail, senha e nome.
- Foco visível para navegação por teclado.
- Melhorias semânticas no admin e reset de senha.

## Objetivo

Melhorar acessibilidade, usabilidade e organização semântica do HTML sem alterar a lógica principal do sistema.


---

## RELEASE.V16.1.1

# Release v16.1.1 — Landing Acessível e SEO

## Aplicado

- Navegação da landing convertida para lista semântica.
- `aria-label="Menu principal"` no menu.
- `main id="conteudo-principal"`.
- CTA principal com `aria-label`.
- FAQ e footer com rótulos acessíveis.
- Metadados SEO e Open Graph.
- `alt` em imagens sem texto alternativo.

## Objetivo

Melhorar acessibilidade, SEO e estrutura semântica da landing sem alterar o visual principal.


---

## RELEASE.V16.1.2

# Release v16.1.2 — Refinamento de Acessibilidade Admin

## Aplicado

- Link **Abrir dashboard** com `aria-label`.
- Foco visível reforçado no link principal do Admin.
- `.sr-only` atualizada com padrão acessível.
- Botões de busca/atualização com `aria-label`.
- Botões dinâmicos do Admin com rótulos acessíveis.
- Tabelas com `<caption>`.
- Cabeçalhos de coluna e linha com `scope`.

## Objetivo

Melhorar acessibilidade do Painel Master para leitores de tela e navegação por teclado.


---

## RELEASE.V17

# Release V17 — Hardening SaaS, Planos Editáveis e Auditoria

## Correções aplicadas

- Trial padronizado em todo o sistema para 10 leads totais.
- `src/data/plans.json` alinhado com `src/planConfig.js`.
- README atualizado com `MONGODB_URI`, `RESEND_API_KEY`, `MAIL_FROM` e demais variáveis reais.
- `JWT_SECRET` padrão bloqueado quando `NODE_ENV=production`.
- Helmet agora usa CSP ativa em vez de `contentSecurityPolicy: false`.
- Rotas `/api/diagnostico-env` e `/api/testar-google` agora exigem autenticação e perfil Admin.
- Painel Admin ganhou editor de planos comerciais.
- Alterações administrativas passam a ser registradas em `AdminAuditLog`.
- Painel Admin ganhou visualização de auditoria.
- Recuperação de senha agora envia e-mail real via Resend quando `RESEND_API_KEY` estiver configurada; em desenvolvimento mantém fallback por log.
- Dashboard ganhou onboarding de primeiros passos.
- Adicionados testes automatizados com `node:test`.
- Middleware de logger e rate limit extraídos para `src/middleware/`.

## Validação

Executado com sucesso:

```bash
npm run check
```

Resultado:

- `node --check src/server.js`
- `node --check public/app.js`
- `node --check public/admin.js`
- `node --check src/db.js`
- `node --test tests/*.test.js`
- 7 testes aprovados


---

## RELEASE.V18

# Release V18 — Modularização, Segurança e Auditoria

## Entrega

Esta versão consolida o LeadHunter Pro como um SaaS mais organizado, seguro e pronto para evolução comercial.

## Principais alterações

- Modularização parcial do `server.js`:
  - `src/services/billingService.js`
  - `src/services/adminAuditService.js`
  - `src/services/emailService.js`
  - `src/middleware/admin.js`
- Trial mantido como regra fixa e oficial:
  - R$ 0
  - 10 leads totais
  - uso único por usuário/dispositivo
- Segurança reforçada:
  - `JWT_SECRET` obrigatório em produção
  - CSP ativa pelo Helmet
  - rotas de diagnóstico protegidas por autenticação admin
- Planos comerciais editáveis pelo Admin, com Trial bloqueado para preservar a regra comercial.
- Auditoria administrativa para alterações de usuários, segurança e planos.
- Recuperação de senha com integração preparada para Resend.
- Testes automatizados ampliados para arquitetura, billing, e-mail, planos e segurança.

## Validação

```bash
npm run check
```

Resultado esperado:

```text
16 testes aprovados
```


---

## RELEASE.V18.1

# Release V18.1 — Correção de abas e resultados

## Correção principal

- Corrige o comportamento em que a lista de leads/buscas aparecia em todas as abas.
- A listagem global `#results` agora aparece apenas na aba **Prospectar**.
- A aba **CRM** usa sua própria área `#crmLoadedLeads`.
- O Dashboard carrega dados para estatísticas, Kanban e timeline sem exibir a lista completa de resultados.
- Atualizado o cache-buster do `app.js` para forçar o navegador a carregar a versão corrigida.

## Validação

Executado:

```bash
npm run check
```

Resultado esperado: 16 testes aprovados.


---

## RELEASE.V19

# Release V19 — CRM profissional e agenda comercial

## Objetivo

Evoluir o produto de uma ferramenta de prospecção para uma experiência mais próxima de um CRM comercial profissional.

## Principais melhorias

- Dashboard executivo com funil comercial visual.
- Indicadores de conversão, propostas, clientes fechados e potencial estimado.
- Painel de prioridades da semana para leads quentes e leads parados.
- CRM com pipeline Kanban real em 6 etapas.
- Ficha lateral do lead com telefone, endereço, links, score, ações e timeline.
- Nova aba Agenda para tarefas comerciais e follow-ups.
- Campanhas mantidas focadas em sequências e retornos comerciais.
- Listagem do CRM preservada para edição detalhada de status, tags, notas e abordagem.

## Fluxo recomendado

1. Prospectar novos leads.
2. Abrir o CRM e mover os leads no pipeline.
3. Abrir a ficha do lead para consultar detalhes e histórico.
4. Agendar follow-ups na Agenda.
5. Acompanhar conversão e prioridades na Visão geral.

## Validação

Executar:

```bash
npm run check
```


---

## RELEASE.V19.1

# Release V19.1 — Correção dos botões do CRM

## Correção principal

Os botões do painel, CRM, campanhas, WhatsApp, ficha do lead, follow-up e ações rápidas voltaram a funcionar.

## Causa

A Release V19 ativou CSP no Helmet, mas o frontend ainda usa alguns handlers inline (`onclick`). O navegador bloqueava esses eventos.

## Ajuste

A CSP continua ativa, mas `script-src` agora permite `unsafe-inline` temporariamente para preservar compatibilidade com o frontend atual.

## Próximo passo técnico

Migrar gradualmente os handlers inline para `addEventListener`/delegação de eventos e remover `unsafe-inline` depois.


---

## RELEASE.V19.2

# Release V19.2 — Correção CSP dos botões

## Correção principal

- Ajustada a configuração do Helmet/CSP para liberar `script-src-attr` durante a fase atual do frontend legado.
- Corrige bloqueio de botões que usam `onclick`, `ondrop` e `ondragstart` no CRM, Campanhas, Agenda e cards de leads.

## Observação técnica

O frontend ainda possui handlers inline em alguns componentes renderizados dinamicamente. A correção definitiva futura é migrar todos para `addEventListener`, mas esta release resolve imediatamente o erro:

```text
Executing inline event handler violates Content Security Policy directive script-src-attr 'none'
```


---

## RELEASE.V19.3

# Release V19.3 — Pipeline compacto e ficha em popup

## Ajustes

- Reduzi a altura visual do pipeline comercial para evitar colunas muito longas na tela.
- Cada coluna do Kanban agora tem rolagem interna quando houver muitos leads.
- Os cards do pipeline ficaram mais compactos e clicáveis.
- Ao clicar em um lead no pipeline, a ficha completa agora abre em popup/modal.
- O painel lateral foi simplificado para orientar o usuário a clicar nos cards.
- O popup mostra telefone, endereço, ticket, probabilidade, links, ações comerciais, abordagem, timeline e notas.

## Validação

```bash
npm run check
```

Resultado: 17 testes aprovados.

## V20.1 — Abordagem com IA opcional e variações reais

- Adicionada integração opcional com IA generativa para criar abordagens mais próximas do lead.
- O botão "Gerar melhor abordagem" agora envia uma chave de regeneração para evitar respostas idênticas.
- O motor local ganhou variações por estratégia e segmento para funcionar mesmo sem API externa.
- A resposta informa se veio de IA generativa, motor local ou fallback local.
- Novas variáveis de ambiente adicionadas ao `.env.example`.

---

## V20.7 — Prompt com tom de vendedor experiente

Esta versão ajusta o comportamento da IA para que a abordagem não fique técnica demais para clientes que não conhecem tecnologia.

### Principais mudanças

- A IA agora recebe instruções para agir como um vendedor consultivo extremamente experiente em serviços tecnológicos.
- O prompt evita linguagem de analista técnico e prioriza conversa simples com donos de pequenos negócios.
- Termos técnicos como SEO, funil, conversão, landing page, automação e CRM devem ser evitados ou traduzidos para benefícios práticos.
- As mensagens passam a falar em resultados compreensíveis para o lead: mais chamadas no WhatsApp, mais agendamentos, mais pedidos, mais orçamentos e mais confiança.
- O motor local também foi humanizado para manter qualidade quando a IA estiver indisponível.

### Validação

```bash
npm run check
```

Resultado: 35 testes aprovados.

## V20.8 — Consultor IA Multicanal

- O Consultor IA passou a gerar materiais comerciais por canal.
- Novos formatos: WhatsApp, e-mail, ligação, follow-up, tratamento de objeção e convite para diagnóstico.
- O fallback local também adapta a mensagem ao canal escolhido.
- A interface agora permite gerar outra versão ou melhorar o texto mantendo o canal selecionado.

## V21.1 — Relatórios Comerciais Gerenciais

Esta versão adiciona uma camada de análise gerencial ao CRM:

- relatório comercial consolidado;
- funil por etapa;
- taxa de contato e fechamento;
- receita prevista ponderada pelo estágio do lead;
- ranking de segmentos com maior potencial;
- identificação de leads parados;
- exportação CSV do relatório.

O objetivo é ajudar o usuário a enxergar o negócio como gestor comercial, não apenas como operador de prospecção.

## 21.6.0 — Campanhas Comerciais Inteligentes

- Criada central de campanhas orientada por prioridade comercial.
- Cada lead pode receber uma cadência criada por IA ou fallback local.
- As etapas viram tarefas na agenda comercial.
- O sistema não dispara mensagens automaticamente; tudo exige revisão humana.

## V23.1 — Sales OS Core

A base do CRM foi reorganizada com um núcleo dedicado a inteligência comercial, provedores de IA, prompts, memória, aprendizado e automações. A mudança foi feita de forma compatível com a V22 para evitar regressões.

## V23.2 — Cockpit Comercial

A tela inicial do Sales OS passa a conduzir o trabalho diário do vendedor, reunindo prioridades, métricas, pipeline, alertas, timeline global e acesso ao copiloto em uma única visão.

## V23.3 — Copiloto Comercial IA
- Chat comercial integrado aos dados reais do CRM.
- Memória persistente das conversas.
- Respostas fundamentadas em pipeline, agenda, propostas, campanhas, clientes e timeline.
- Modo coach e planejamento diário.
- Fallback local quando o provedor de IA estiver indisponível.


## V23.4 — Administração Executiva

- Menu lateral com rolagem própria em telas menores.
- Painel Admin redesenhado com visão executiva moderna.
- Métricas de uso, conversão, ativação, MRR, receita e engajamento.
- Gráficos de receita, consumo de leads, crescimento e distribuição de planos.

## V23.6 — Visão Geral gráfica e funil interativo
- Cards de ganhos por etapa.
- Gráficos de prospecção e conversão.
- Pipeline executivo na Visão Geral.
- Rolagem no pipeline comercial e histórico.
- Funil por etapa clicável com acesso aos leads.

## 24.2.0 — Landing SaaS Tech em React + Tailwind

- Landing reposicionada para desenvolvedores, freelancers, agências e automação.
- Hero com mensagem específica para venda de sites, sistemas e IA.
- Componentização da landing em Header, Hero, fluxo, público, ferramentas, planos e CTA.
- Tailwind CSS 4 integrado ao Vite pelo plugin oficial.
- Planos continuam dinâmicos via `/api/plans`.
- Container queries adicionadas ao painel para corrigir gráficos em áreas estreitas.
- Cache da folha do painel atualizado para `v24-2-0-tailwind`.

## 24.3.0 — Hero comercial e demonstração do produto

- Hero reconstruído em duas colunas, com tipografia responsiva e menor peso visual no celular.
- Dashboard demonstrativo com leads recomendados, score e abordagem com IA.
- Fluxo comercial em quatro etapas logo após o hero.
- Ferramentas em composição bento com demonstração do CRM Kanban.
- Planos e CTA final refinados para conversão.
