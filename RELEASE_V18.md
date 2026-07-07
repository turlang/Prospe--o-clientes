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
