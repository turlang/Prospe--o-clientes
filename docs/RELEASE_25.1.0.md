# Release 25.1.0 — Planos dinâmicos e persistentes

## Objetivo

Corrigir a divergência entre os planos editados no painel administrativo e os
valores exibidos na landing page.

## Correções principais

- contrato público de planos com `priceLabel`, `displayPrice`, preço numérico e período;
- resposta `/api/plans` sem cache intermediário;
- atualização automática da landing ao recuperar foco, trocar de aba ou receber evento do Admin;
- publicação imediata entre abas por `BroadcastChannel` e evento de `localStorage`;
- persistência da configuração no MongoDB para sobreviver a deploys e reinicializações do Render;
- fallback JSON mantido apenas para desenvolvimento local e contingência;
- revisão de configuração retornada pelo painel administrativo e pela API pública.

## Compatibilidade

As regras de cobrança continuam usando o mesmo catálogo central. O Trial mantém
10 leads totais, sem possibilidade de alteração administrativa.
