# LeadHunter Pro

SaaS de prospecção comercial, geração de leads, CRM, pipeline de vendas e gestão de assinaturas para pequenos negócios, vendedores, autônomos e agências.

## Visão geral

O LeadHunter Pro ajuda negócios a organizar a prospecção comercial, controlar leads, acompanhar oportunidades e transformar contatos em vendas.

O projeto demonstra uma aplicação SaaS com autenticação, CRM, planos editáveis, integração de pagamento, painel administrativo, auditoria e regras de segurança anti-abuso.

## Principais funcionalidades

- Cadastro e login de usuários.
- CRM de leads com pipeline Kanban.
- Histórico de prospecções.
- Exportação CSV.
- Planos Trial, Pro e Agência.
- Trial padronizado com **10 leads totais**.
- Integração com Mercado Pago.
- Painel administrativo Master.
- Edição de planos pelo Admin.
- Auditoria de ações administrativas.
- Controle de assinaturas e limites por plano.
- Segurança anti-abuso, bloqueio de e-mails temporários e limite de cadastros por IP.
- Recuperação de senha preparada para envio real por e-mail via Resend.

## Stack

### Back-end

- Node.js
- Express
- MongoDB Atlas
- Mongoose
- JWT
- Helmet com CSP
- CORS
- Mercado Pago

### Front-end

- HTML5
- CSS3
- JavaScript

### Infraestrutura

- Render
- MongoDB Atlas
- Mercado Pago
- Resend para e-mail transacional opcional

## Arquitetura resumida

```text
src/
  server.js
  db.js
  authRoutes.js
  planConfig.js
  planStore.js
  middleware/
  models/
  data/

public/
  index.html
  admin.html
  app.js
  admin.js
  style.css

README.md
CHANGELOG.md
ROADMAP.md
```

## Como executar

```bash
npm install
npm run dev
```

Aplicação local:

```text
http://localhost:3000
```

## Scripts

```bash
npm run check
npm test
```

- `check`: valida sintaxe dos principais arquivos.
- `test`: executa testes automatizados de regras críticas.

## Variáveis de ambiente

```env
PORT=3000
NODE_ENV=development
REQUIRE_MONGODB=true
DNS_SERVERS=8.8.8.8,1.1.1.1
JWT_SECRET=troque-este-segredo-por-uma-chave-grande-e-aleatoria
JWT_EXPIRES_IN=7d
MONGODB_URI=
GOOGLE_PLACES_API_KEY=cole_sua_chave_google_places_aqui
PLACES_PROVIDER=new
ALLOW_INCOMPLETE_CONTACTS=false
AUDIT_WEBSITES=true
PUBLIC_APP_URL=http://localhost:3000
MERCADO_PAGO_PUBLIC_KEY=
MERCADO_PAGO_ACCESS_TOKEN=
MERCADO_PAGO_WEBHOOK_URL=http://localhost:3000/api/billing/webhook
REGISTER_IP_DAILY_LIMIT=3
RESEND_API_KEY=
MAIL_FROM=LeadHunter Pro <noreply@seudominio.com>
```

> Em produção, `JWT_SECRET` é obrigatório. O servidor não aceita mais segredo padrão quando `NODE_ENV=production`.

## Regra oficial do Trial

```text
Teste Gratuito
R$ 0
10 leads totais
CRM Kanban básico
Abordagens comerciais por templates
Follow-ups manuais
Uso único por usuário/dispositivo
```

## Painel administrativo

Acesso:

```text
/admin
```

Recursos do Admin:

- Listar usuários.
- Alterar plano de usuários.
- Suspender ou reativar contas.
- Promover ou remover administradores.
- Editar planos comerciais.
- Ver pagamentos.
- Ver segurança anti-abuso.
- Consultar auditoria administrativa.

Usuário administrador esperado:

```json
{
  "role": "admin"
}
```

## Regras de segurança

- Limite de cadastros por IP.
- Trial único por usuário/dispositivo.
- Bloqueio de e-mails temporários.
- Auditoria de tentativas.
- Auditoria de ações administrativas.
- Uso controlado por plano.
- Rotas de diagnóstico protegidas por autenticação admin.
- CSP ativa pelo Helmet.

## Diferenciais técnicos

- Produto com proposta comercial clara.
- CRM funcional.
- Controle de planos e assinaturas.
- Integração com pagamento real.
- Backend com MongoDB e autenticação JWT.
- Painel administrativo completo.
- Regras anti-abuso.
- Onboarding de uso no dashboard.
- Testes automatizados de regras críticas.

## Status

Projeto em estágio avançado para demonstração comercial, validação de mercado e portfólio profissional.

## Posicionamento no portfólio

Este projeto deve ser apresentado como um case Full Stack SaaS com foco em vendas, CRM, assinatura, pagamentos, segurança, auditoria e gestão comercial.
