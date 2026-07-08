# Release V19.1 — Correção dos botões do CRM

## Correção principal

Os botões do painel, CRM, campanhas, WhatsApp, ficha do lead, follow-up e ações rápidas voltaram a funcionar.

## Causa

A Release V19 ativou CSP no Helmet, mas o frontend ainda usa alguns handlers inline (`onclick`). O navegador bloqueava esses eventos.

## Ajuste

A CSP continua ativa, mas `script-src` agora permite `unsafe-inline` temporariamente para preservar compatibilidade com o frontend atual.

## Próximo passo técnico

Migrar gradualmente os handlers inline para `addEventListener`/delegação de eventos e remover `unsafe-inline` depois.
