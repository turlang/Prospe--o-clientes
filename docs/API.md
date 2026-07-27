# Catálogo da API

## Convenções

- Base local: `http://localhost:3000`.
- Rotas autenticadas usam `Authorization: Bearer <token>`.
- Corpos são enviados em JSON, salvo exportações CSV.
- Erros seguem preferencialmente `{ "error": "mensagem" }`.
- Este catálogo apresenta caminhos completos da versão 23.7.1.

## Endpoints

| Método | Caminho | Acesso | Módulo |
|---|---|---|---|
| `GET` | `/` | Pública | `src/routes/systemRoutes.js` |
| `GET` | `/admin` | Pública | `src/routes/adminRoutes.js` |
| `GET` | `/api/admin/audit-logs` | Administrador | `src/routes/adminRoutes.js` |
| `GET` | `/api/admin/overview` | Administrador | `src/routes/adminRoutes.js` |
| `GET` | `/api/admin/payments` | Administrador | `src/routes/adminRoutes.js` |
| `GET` | `/api/admin/plans` | Administrador | `src/routes/adminRoutes.js` |
| `PATCH` | `/api/admin/plans/:id` | Administrador | `src/routes/adminRoutes.js` |
| `GET` | `/api/admin/security` | Administrador | `src/routes/adminRoutes.js` |
| `DELETE` | `/api/admin/security/:id` | Administrador | `src/routes/adminRoutes.js` |
| `POST` | `/api/admin/security/clear` | Administrador | `src/routes/adminRoutes.js` |
| `GET` | `/api/admin/users` | Administrador | `src/routes/adminRoutes.js` |
| `PATCH` | `/api/admin/users/:id` | Administrador | `src/routes/adminRoutes.js` |
| `GET` | `/api/agenda/summary` | Autenticada | `src/routes/commercialRoutes.js` |
| `GET` | `/api/ai/status` | Autenticada | `src/routes/systemRoutes.js` |
| `POST` | `/api/analisar-resposta` | Autenticada | `src/routes/leadRoutes.js` |
| `POST` | `/api/auditar-site` | Autenticada | `src/routes/leadRoutes.js` |
| `POST` | `/api/auth/forgot-password` | Pública | `src/authRoutes.js` |
| `POST` | `/api/auth/login` | Pública | `src/authRoutes.js` |
| `GET` | `/api/auth/me` | Autenticada | `src/authRoutes.js` |
| `POST` | `/api/auth/register` | Pública | `src/authRoutes.js` |
| `POST` | `/api/auth/reset-password` | Pública | `src/authRoutes.js` |
| `POST` | `/api/automations/followup-sequence` | Autenticada | `src/routes/commercialRoutes.js` |
| `GET` | `/api/automations/next-actions` | Autenticada | `src/routes/commercialRoutes.js` |
| `POST` | `/api/billing/checkout` | Autenticada | `src/routes/billingRoutes.js` |
| `GET` | `/api/billing/status` | Autenticada | `src/routes/billingRoutes.js` |
| `POST` | `/api/billing/sync` | Autenticada | `src/routes/billingRoutes.js` |
| `GET` | `/api/billing/usage` | Autenticada | `src/routes/billingRoutes.js` |
| `POST` | `/api/billing/webhook` | Pública | `src/routes/billingRoutes.js` |
| `POST` | `/api/campaigns/sequence` | Autenticada | `src/routes/commercialRoutes.js` |
| `POST` | `/api/campaigns/smart-sequence` | Autenticada | `src/routes/commercialRoutes.js` |
| `GET` | `/api/campaigns/summary` | Autenticada | `src/routes/commercialRoutes.js` |
| `POST` | `/api/commercial-intelligence/objection` | Autenticada | `src/routes/commercialRoutes.js` |
| `GET` | `/api/commercial-intelligence/summary` | Autenticada | `src/routes/commercialRoutes.js` |
| `POST` | `/api/customer-growth/expansion` | Autenticada | `src/routes/commercialRoutes.js` |
| `POST` | `/api/customer-growth/referral` | Autenticada | `src/routes/commercialRoutes.js` |
| `GET` | `/api/customer-growth/summary` | Autenticada | `src/routes/commercialRoutes.js` |
| `POST` | `/api/customers/close` | Autenticada | `src/routes/commercialRoutes.js` |
| `POST` | `/api/customers/lost` | Autenticada | `src/routes/commercialRoutes.js` |
| `GET` | `/api/customers/summary` | Autenticada | `src/routes/commercialRoutes.js` |
| `GET` | `/api/dashboard/stats` | Autenticada | `src/routes/leadRoutes.js` |
| `GET` | `/api/diagnostico-env` | Administrador | `src/routes/systemRoutes.js` |
| `GET` | `/api/export.csv` | Autenticada | `src/routes/leadRoutes.js` |
| `GET` | `/api/followups` | Autenticada | `src/routes/commercialRoutes.js` |
| `POST` | `/api/followups` | Autenticada | `src/routes/commercialRoutes.js` |
| `PATCH` | `/api/followups/:id/done` | Autenticada | `src/routes/commercialRoutes.js` |
| `POST` | `/api/gerar-abordagem` | Autenticada | `src/routes/leadRoutes.js` |
| `GET` | `/api/health` | Pública | `src/routes/systemRoutes.js` |
| `GET` | `/api/historico-buscas` | Autenticada | `src/routes/leadRoutes.js` |
| `GET` | `/api/leads` | Autenticada | `src/routes/leadRoutes.js` |
| `PATCH` | `/api/leads/meta` | Autenticada | `src/routes/leadRoutes.js` |
| `POST` | `/api/leads/status` | Autenticada | `src/routes/leadRoutes.js` |
| `GET` | `/api/metrics` | Administrador | `src/routes/systemRoutes.js` |
| `GET` | `/api/plans` | Pública | `src/routes/systemRoutes.js` |
| `POST` | `/api/proposals/generate` | Autenticada | `src/routes/commercialRoutes.js` |
| `GET` | `/api/proposals/summary` | Autenticada | `src/routes/commercialRoutes.js` |
| `POST` | `/api/prospectar` | Autenticada | `src/routes/leadRoutes.js` |
| `GET` | `/api/reports/commercial` | Autenticada | `src/routes/commercialRoutes.js` |
| `GET` | `/api/reports/commercial.csv` | Autenticada | `src/routes/commercialRoutes.js` |
| `GET` | `/api/testar-google` | Administrador | `src/routes/systemRoutes.js` |
| `GET` | `/api/v22/command-center` | Autenticada | `src/routes/commercialRoutes.js` |
| `POST` | `/api/v22/copilot` | Autenticada | `src/routes/commercialRoutes.js` |
| `GET` | `/api/v23/cockpit` | Autenticada | `src/core/routes/salesOsRoutes.js` |
| `GET` | `/api/v23/copilot/briefing` | Autenticada | `src/core/routes/salesOsRoutes.js` |
| `POST` | `/api/v23/copilot/chat` | Autenticada | `src/core/routes/salesOsRoutes.js` |
| `DELETE` | `/api/v23/copilot/history` | Autenticada | `src/core/routes/salesOsRoutes.js` |
| `GET` | `/api/v23/copilot/history` | Autenticada | `src/core/routes/salesOsRoutes.js` |
| `GET` | `/api/v23/snapshot` | Autenticada | `src/core/routes/salesOsRoutes.js` |
| `GET` | `/api/v23/status` | Autenticada | `src/core/routes/salesOsRoutes.js` |
| `GET` | `/app` | Pública | `src/routes/systemRoutes.js` |
| `GET` | `/landing.html` | Pública | `src/routes/systemRoutes.js` |

## Códigos de estado usuais

| Código | Significado |
|---|---|
| 200 | Operação concluída |
| 201 | Recurso criado |
| 400 | Entrada inválida |
| 401 | Sessão ausente ou inválida |
| 403 | Acesso negado ou limite atingido |
| 404 | Recurso inexistente |
| 409 | Conflito de regra de negócio |
| 429 | Limite de requisições excedido |
| 500 | Falha interna não exposta em produção |
