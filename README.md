# LeadHunter Pro

SaaS de prospecção comercial, geração de leads, CRM, pipeline de vendas e gestão de assinaturas para pequenos negócios, vendedores, autônomos e agências.

## Visão geral

O LeadHunter Pro foi criado para ajudar negócios a organizar a prospecção comercial, controlar leads, acompanhar oportunidades e transformar contatos em vendas.

O projeto demonstra construção de uma aplicação SaaS com autenticação, CRM, planos, integração de pagamento, painel administrativo e regras de segurança anti-abuso.

## Principais funcionalidades

- Cadastro e login de usuários.
- CRM de leads.
- Pipeline comercial.
- Histórico de prospecções.
- Exportação CSV.
- Planos Trial, Pro e Agência.
- Integração com Mercado Pago.
- Painel administrativo.
- Controle de assinaturas.
- Limite de uso por plano.
- Segurança anti-abuso.
- Bloqueio de e-mails temporários.
- Auditoria de tentativas.
- Limite de cadastros por IP.

## Stack

### Back-end

- Node.js
- Express
- MongoDB Atlas
- Mongoose
- JWT
- Helmet
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

## Arquitetura resumida

```text
src/
  server.js
  db.js
  routes/
  models/
  services/

public/
  index.html
  app.js
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

## Variáveis de ambiente

```env
DATABASE_URL=
JWT_SECRET=
PUBLIC_APP_URL=
MERCADO_PAGO_PUBLIC_KEY=
MERCADO_PAGO_ACCESS_TOKEN=
REGISTER_IP_DAILY_LIMIT=3
```

## Painel administrativo

Acesso:

```text
/admin
```

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
- Uso controlado por plano.

## Diferenciais técnicos

- Produto com proposta comercial clara.
- CRM funcional.
- Controle de planos e assinaturas.
- Integração com pagamento real.
- Backend com MongoDB e autenticação JWT.
- Painel administrativo.
- Regras anti-abuso.

## Status

Projeto em estágio avançado para demonstração comercial, validação de mercado e portfólio profissional.

## Próximas melhorias

- Adicionar screenshots ao README.
- Criar vídeo curto de demonstração.
- Melhorar testes automatizados.
- Criar documentação de API.
- Adicionar métricas de conversão e funil.
- Melhorar onboarding do usuário.

## Posicionamento no portfólio

Este projeto deve ser apresentado como um case Full Stack SaaS com foco em vendas, CRM, assinatura, pagamentos e gestão comercial.
