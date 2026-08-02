# Release 25.9.2 — Correção da coluna executiva

## Objetivo

Corrigir a quebra do valor de previsão de receita e o recorte do card de ação recomendada na Visão executiva.

## Alterações

- Neutralização da regra legada de `#overviewRevenueChart` que forçava três colunas.
- Previsão de receita reorganizada em KPI + distribuição por estágio.
- Valor monetário protegido contra quebra de linha.
- Leitura executiva reorganizada em duas colunas, com a ação recomendada ocupando a largura completa.
- Remoção do `overflow: hidden` que recortava conteúdo na coluna lateral.
- Ajustes responsivos para tablet e celular.
- Cache-busting atualizado para `25.9.2`.

## Validação

- 165 testes automatizados aprovados.
- 131 arquivos JavaScript com sintaxe validada.
- 153 módulos documentados.
- 22 componentes JSX verificados.
