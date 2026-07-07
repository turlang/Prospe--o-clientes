# Release V18.1 — Correção de abas e resultados

## Correção principal

- Corrige o comportamento em que a lista de leads/buscas aparecia em todas as abas.
- A listagem global `#results` agora aparece apenas na aba **Prospectar**.
- A aba **CRM** usa sua própria área `#crmLoadedLeads`.
- O Dashboard carrega dados para estatísticas, Kanban e timeline sem exibir a lista completa de resultados.
- Atualizado o cache-buster do `app.js` para forçar o navegador a carregar a versão corrigida.

## Validação

Executado:

```bash
npm run check
```

Resultado esperado: 16 testes aprovados.
