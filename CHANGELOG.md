# Changelog

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
