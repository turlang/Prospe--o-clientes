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
