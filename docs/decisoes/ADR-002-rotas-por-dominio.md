# ADR-002 — Separação de rotas por domínio

**Status:** aceita  
**Data:** 27 de julho de 2026

## Contexto

O servidor concentrava páginas, billing, leads, administração e inteligência comercial em aproximadamente 1.579 linhas.

## Decisão

As rotas foram agrupadas em:

- `systemRoutes.js`;
- `billingRoutes.js`;
- `leadRoutes.js`;
- `adminRoutes.js`;
- `commercialRoutes.js`.

Os módulos recebem dependências de forma explícita durante a composição.

## Consequências

A navegação pelo projeto fica orientada ao domínio. O contexto injetado ainda é amplo em alguns módulos; a redução para interfaces menores permanece como evolução incremental, evitando alteração simultânea de todos os contratos.
