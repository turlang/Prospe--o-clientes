# Design System — LeadHunter Pro 26.0.0

## Objetivo

O sistema visual prioriza leitura executiva, densidade controlada e ações claras. A profundidade 3D é usada como hierarquia, não como decoração: superfícies importantes ganham camadas, luz e inclinação discreta somente em desktops com ponteiro preciso.

## Arquitetura CSS

A entrada pública é `public/assets/dashboard/styles.css`. Ela importa, nesta ordem:

1. `99-legacy.css`: compatibilidade visual dos módulos históricos;
2. `00-tokens.css`: cores, tipografia, espaçamento, raios e sombras;
3. `10-base.css`: reset, acessibilidade e escala tipográfica;
4. `20-layout.css`: shell, sidebar, sessão e superfícies;
5. `30-components.css`: botões, inputs, cards, métricas e chips;
6. `40-views.css`: visão executiva, cockpit, CRM e relatórios;
7. `50-depth.css`: profundidade 3D progressiva;
8. `90-responsive.css`: regras finais de tablet e mobile.

A compatibilidade fica isolada para permitir migração gradual sem quebrar regras de negócio ou seletores consumidos pelo JavaScript.

## Tipografia

- Família: Inter com fallbacks do sistema;
- Corpo: `0.9375rem`, altura de linha `1.55`;
- Títulos usam peso entre 720 e 840;
- Textos auxiliares ficam entre `0.75rem` e `0.875rem`;
- Valores financeiros usam números tabulares e nunca devem quebrar por caractere.

## Cores

- Azul é a ação principal;
- Ciano representa descoberta e inteligência;
- Verde representa avanço confirmado;
- Âmbar representa atenção;
- Vermelho é reservado para erro, perda ou ação destrutiva;
- Superfícies claras usam contraste mínimo AA com o texto.

## Profundidade 3D

`public/assets/shared/depth-effects.js` aplica inclinação máxima aproximada de 3 graus. O efeito:

- não modifica largura ou altura;
- é desativado em touch e abaixo de 900 px;
- respeita `prefers-reduced-motion`;
- funciona em cards renderizados dinamicamente via `MutationObserver`;
- mantém a interface totalmente funcional sem JavaScript.

## Regras de diagramação

- Máximo de quatro KPIs por linha;
- Títulos de seção não devem competir com valores;
- Cards usam espaçamento interno entre 14 e 21 px;
- O dashboard não usa scroll horizontal, exceto Kanban e tabelas densas;
- A landing continua sem scroll e troca conteúdos por navegação contextual.
