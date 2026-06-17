# CHANGELOG

## v14.1.1 - Correção do redirect admin

### Corrigido
- Resposta de login/cadastro agora envia `role`.
- Frontend consegue identificar `role: "admin"` imediatamente após login.
- Admin é redirecionado corretamente para `/admin`.

---


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
