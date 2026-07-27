# Especificação do funil comercial

## 1. Objetivo

Este documento define o vocabulário oficial do CRM e as regras que controlam a movimentação de oportunidades. A especificação existe para impedir que frontend, persistência, relatórios e serviços de inteligência interpretem a mesma etapa de formas diferentes.

## 2. Etapas canônicas

| Ordem | Código | Significado |
|---:|---|---|
| 1 | `NOVO` | Lead encontrado, ainda sem tentativa de contato. |
| 2 | `CONTATADO` | Primeiro contato enviado ou realizado. |
| 3 | `INTERESSADO` | O lead respondeu, pediu detalhes, preço ou demonstrou abertura. |
| 4 | `REUNIAO` | Conversa, diagnóstico ou apresentação agendada. |
| 5 | `PROPOSTA` | Proposta ou orçamento formal enviado. |
| 6 | `FECHADO` | Oportunidade convertida em cliente. |
| 7 | `SEM_INTERESSE` | Oportunidade encerrada ou recusada. |

A implementação de referência está em `src/domain/leadStatus.js`.

## 3. Estados legados

Versões anteriores produziram nomes que descreviam atividades, mas não correspondiam a colunas do Kanban. Para preservar os registros existentes, a leitura aplica as seguintes conversões:

| Valor legado | Etapa canônica |
|---|---|
| `RESPONDEU` | `INTERESSADO` |
| `QUALIFICANDO` | `INTERESSADO` |
| `QUALIFICADO` | `INTERESSADO` |
| `REUNIAO_AGENDADA` | `REUNIAO` |
| `NEGOCIACAO` | `PROPOSTA` |
| `PERDIDO` | `SEM_INTERESSE` |
| `RECUSADO` | `SEM_INTERESSE` |

## 4. Processamento de resposta recebida

O fluxo obrigatório é:

1. O usuário cola a mensagem recebida na ficha do lead.
2. `POST /api/analisar-resposta` valida que a mensagem não esteja vazia.
3. `conversationEngine` classifica a intenção comercial.
4. A regra `resolveResponseStatus` calcula a etapa final sem regressão acidental.
5. `storage` persiste a etapa e a interação `RESPOSTA_RECEBIDA`.
6. A API devolve a transição `{ from, to, changed }`.
7. O frontend substitui o lead no estado local e redesenha Kanban, timeline e indicadores.

## 5. Regras de transição automática

- Toda resposta real, exceto negativa, posiciona um lead inicialmente contatado em `INTERESSADO`.
- Pedido de preço é uma intenção de qualificação, mas permanece na coluna visível `INTERESSADO`.
- Resposta negativa move a oportunidade para `SEM_INTERESSE`.
- Um lead em `REUNIAO` ou `PROPOSTA` não volta automaticamente para `INTERESSADO`.
- Um cliente `FECHADO` não é rebaixado por uma nova mensagem.
- Movimentação manual por arrastar o card continua permitida, pois representa uma decisão explícita do usuário.

## 6. Critérios de aceite

- Nenhuma etapa persistida pode ficar invisível no Kanban.
- Registrar resposta deve criar uma interação na timeline.
- A interface deve informar se a etapa mudou ou foi mantida.
- O resultado deve oferecer próximo passo e resposta sugerida.
- Status legados devem aparecer na coluna canônica correspondente.
