# Release v11.2.0 — Fechamento da Fase 12

## Objetivo

Fechar os pontos pendentes do fluxo de pagamento antes do Painel Master.

## Ajustes

- Webhook Mercado Pago mais robusto.
- Sincronização manual/automática em `/api/billing/sync`.
- Retorno do Mercado Pago agora sincroniza `payment_id` quando disponível.
- Status do pagamento passa a ser reconciliado no MongoDB.
- Pagamento aprovado atualiza o documento existente em `payments`.
- Usuário ativo recebe:
  - `plan: pro` ou `agency`
  - `subscriptionStatus: active`
  - `dailyLeadLimit`
  - `planActivatedAt`
  - `planExpiresAt`
- Pagamentos cancelados, recusados, estornados ou chargeback retornam o usuário para trial/expired.
- Verificação de expiração do plano ao consultar uso/status.
- Evita recriar checkout para plano igual ou inferior quando o usuário já está ativo.

## Endpoints

```text
POST /api/billing/checkout
POST /api/billing/webhook
POST /api/billing/sync
GET  /api/billing/status
```

## Validação

1. Ativar Pro.
2. Pagar pelo Mercado Pago.
3. Voltar para `/app?pagamento=sucesso`.
4. Confirmar usuário como `plan: pro`.
5. Confirmar `payments.status: approved`.
