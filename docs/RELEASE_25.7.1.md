# Release 25.7.1 — Correções reais de composição

## Alterações

- **IA Comercial** foi integrada à **Visão executiva** do Admin, em vez de criar uma página/seção paralela.
- **Alertas e orientação** agora fazem parte do componente **Plano de ação de hoje**.
- O card independente de alertas foi removido.
- **Saúde do pipeline** permanece somente na Visão geral.
- Assets receberam cache-busting `25.7.1`.

## Critério de aceite

- uma única ocorrência de `#v23Pipeline`;
- uma única ocorrência de `#v23Alerts`, localizada dentro do Plano de ação;
- `#adminAiStatus` localizado dentro de `#visao-executiva`;
- nenhum link administrativo para uma seção isolada `#ia-comercial`.
