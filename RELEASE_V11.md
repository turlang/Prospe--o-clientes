# Release v11.0.0 — Mercado Pago Real

## Incluído

- Checkout Pro real do Mercado Pago.
- Redirecionamento automático para pagamento.
- Webhook em `/api/billing/webhook`.
- Consulta real do pagamento no Mercado Pago.
- Upgrade automático para Pro ou Agência quando o pagamento for aprovado.
- Auditoria de pagamentos em collection `payments`.
- Endpoint `/api/billing/status`.
- Retorno visual em `/app?pagamento=sucesso`, `/app?pagamento=pendente` e `/app?pagamento=falha`.

## Variáveis obrigatórias no Render

```env
MERCADO_PAGO_PUBLIC_KEY=APP_USR-...
MERCADO_PAGO_ACCESS_TOKEN=APP_USR-...
PUBLIC_APP_URL=https://prospe-o-clientes.onrender.com
MERCADO_PAGO_SUCCESS_URL=https://prospe-o-clientes.onrender.com/app?pagamento=sucesso
MERCADO_PAGO_FAILURE_URL=https://prospe-o-clientes.onrender.com/app?pagamento=falha
MERCADO_PAGO_PENDING_URL=https://prospe-o-clientes.onrender.com/app?pagamento=pendente
MERCADO_PAGO_WEBHOOK_URL=https://prospe-o-clientes.onrender.com/api/billing/webhook
```

## Teste

1. Faça login.
2. Abra Planos.
3. Clique em Ativar Pro.
4. Conclua o checkout.
5. Aguarde o webhook atualizar o plano.
6. Verifique o usuário no MongoDB Atlas.
