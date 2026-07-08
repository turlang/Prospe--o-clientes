# Release V19.2 — Correção CSP dos botões

## Correção principal

- Ajustada a configuração do Helmet/CSP para liberar `script-src-attr` durante a fase atual do frontend legado.
- Corrige bloqueio de botões que usam `onclick`, `ondrop` e `ondragstart` no CRM, Campanhas, Agenda e cards de leads.

## Observação técnica

O frontend ainda possui handlers inline em alguns componentes renderizados dinamicamente. A correção definitiva futura é migrar todos para `addEventListener`, mas esta release resolve imediatamente o erro:

```text
Executing inline event handler violates Content Security Policy directive script-src-attr 'none'
```
