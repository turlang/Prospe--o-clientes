# Release 26.1.0 — Polimento operacional

## Objetivo

Corrigir os problemas observados na versão publicada do funil, do Cockpit e do Copiloto Comercial sem alterar regras de negócio ou dados persistidos.

## Alterações

- funil com largura proporcional ao volume real de cada etapa;
- rótulos, percentuais e contagens fora do recorte trapezoidal;
- KPIs compactos no topo e remoção da coluna vazia de leitura rápida;
- recusados preservados como saída separada do fluxo;
- Saúde do pipeline focada em volume e avanço;
- chat do Copiloto com contraste explícito e superfície responsiva;
- novo módulo `45-operational-polish.css`;
- cache-busting atualizado para `26.1.0`.

## Compatibilidade

APIs, banco de dados, login, recuperação de senha, planos e rotas permanecem compatíveis.
