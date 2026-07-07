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
