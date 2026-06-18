# Release v16.0.0 — Automações Comerciais

## Incluído

- Sequência automática de follow-ups por lead.
- Priorização automática de leads quentes.
- Próximas ações sugeridas.
- Agenda de follow-ups com prioridade.
- Botão **Automatizar sequência** nos leads.
- Nova área na aba **Campanhas**.

## Endpoints

```text
POST /api/automations/followup-sequence
GET  /api/automations/next-actions
```

## Validação

1. Faça login.
2. Busque/carregue leads.
3. Clique em **Automatizar sequência** em um lead.
4. Abra **Campanhas**.
5. Confira as próximas ações e a agenda de follow-ups.
