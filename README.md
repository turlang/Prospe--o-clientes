# LeadHunter Pro

Sistema SaaS para prospecção comercial, geração de leads, CRM e gestão de assinaturas.

## Funcionalidades

- Cadastro e Login
- CRM de Leads
- Pipeline Comercial
- Exportação CSV
- Planos Trial, Pro e Agência
- Integração Mercado Pago
- Painel Administrativo
- Controle de Assinaturas
- Segurança Anti-Abuso

## Tecnologias

### Backend
- Node.js
- Express
- MongoDB Atlas
- JWT
- Mongoose

### Frontend
- HTML
- CSS
- JavaScript

### Infraestrutura
- Render
- MongoDB Atlas
- Mercado Pago

## Instalação

```bash
npm install
npm run dev
```

Aplicação:

```text
http://localhost:3000
```

## Variáveis de Ambiente

```env
DATABASE_URL=
JWT_SECRET=

PUBLIC_APP_URL=

MERCADO_PAGO_PUBLIC_KEY=
MERCADO_PAGO_ACCESS_TOKEN=

REGISTER_IP_DAILY_LIMIT=3
```

## Painel Administrativo

Acesse:

```text
/admin
```

Usuário administrador:

```json
{
  "role": "admin"
}
```

## Segurança

- Limite de cadastros por IP
- Trial único por dispositivo
- Bloqueio de e-mails temporários
- Auditoria de tentativas

## Estrutura

```text
src/
public/
README.md
CHANGELOG.md
ROADMAP.md
```

## Licença

Projeto privado.
