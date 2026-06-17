# Release v14.1.0 — UX Admin

## Ajuste principal

Administradores agora são enviados automaticamente para o Painel Master.

## Fluxo

- Usuário comum faz login → permanece em `/app`
- Usuário admin faz login → redireciona para `/admin`
- Admin logado tentando abrir `/app` → redireciona para `/admin`

## Validação

1. Faça logout.
2. Faça login com usuário que possui `"role": "admin"`.
3. O sistema deve abrir `/admin` automaticamente.
