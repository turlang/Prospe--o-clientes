# Release 25.6.0 — Cache e interface corrigidos

## Problemas corrigidos

1. O dashboard apontava para `app.js` e `styles.css` com a versão antiga `25.1.0`, permitindo que o navegador reutilizasse os gráficos legados.
2. O refinamento visual do card de Fluxo sobrescrevia o fundo do botão ativo, deixando o título branco sobre fundo branco.
3. Assets CSS e JavaScript podiam permanecer em cache por uma hora após o deploy.

## Solução

- todos os documentos públicos usam query de versão `25.6.0`;
- CSS e JavaScript são revalidados em cada navegação;
- o estado ativo do fluxo tem regra específica e posterior;
- os renderizadores `renderProspectingPipeline` e `renderConversionAnalytics` continuam consumindo os dados reais da API.
