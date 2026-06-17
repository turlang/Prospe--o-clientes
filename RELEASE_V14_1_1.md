# Release v14.1.1 — Correção do redirect admin

## Problema

O frontend verificava `currentUser.role === "admin"`, mas o backend não enviava o campo `role` na resposta de login.

## Correção

A função `publicUser()` agora retorna:

```json
{
  "role": "admin"
}
```

quando o usuário possui esse campo no MongoDB.

## Validação

1. Faça logout.
2. Faça login com o usuário admin.
3. Deve redirecionar automaticamente para `/admin`.
