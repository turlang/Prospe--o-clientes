# Release 26.0.0 — Higienização visual e profundidade 3D

## Entrega

- CSS do dashboard reorganizado em módulos por responsabilidade;
- tokens globais para cores, tipografia, espaçamento, raios e sombras;
- revisão de fontes, contraste, densidade e diagramação;
- profundidade 3D sutil e acessível em dashboard, Admin e landing;
- painel Admin reformatado e bloco visual redundante de IA removido;
- Timeline global realocada para Histórico;
- tela de redefinição de senha alinhada ao novo design system;
- validação automatizada da arquitetura visual;
- cache-busting atualizado para `26.0.0`.

## Compatibilidade

A camada `99-legacy.css` preserva seletores antigos. Novas regras ficam em módulos separados e prevalecem por ordem de importação. Nenhuma rota, contrato de API ou estrutura dos dados foi alterada.
