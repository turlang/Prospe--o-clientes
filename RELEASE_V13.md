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
