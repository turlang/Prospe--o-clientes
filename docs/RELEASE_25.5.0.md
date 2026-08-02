# Release 25.5.0 — Fluxo editorial e analytics executivo

## Objetivo

Corrigir a diagramação da tela pública **Fluxo** e substituir os gráficos improvisados do painel autenticado por visualizações executivas profissionais, responsivas e alimentadas pelos dados reais do funil.

## Landing pública

- título reduzido e diagramado em uma coluna editorial;
- quatro etapas com seletor consistente e estados acessíveis;
- painel de detalhe com radar operacional, três evidências e resultados;
- mesma estrutura no React e no fallback estático;
- manutenção do modelo sem rolagem do documento.

## Painel autenticado

### Níveis de prospecção

- eixo visual e linhas de referência;
- sete etapas canônicas do domínio;
- quantidade e percentual por etapa;
- cores específicas para fechamento e recusa;
- apresentação horizontal compacta em componentes estreitos.

### Indicadores de conversão

- taxa de contato;
- taxa de chegada à proposta;
- taxa de fechamento sobre propostas alcançadas;
- ticket médio calculado sobre negócios fechados;
- conversão entre cada etapa progressiva;
- total de oportunidades e receita potencial.

## Decisões técnicas

As visualizações usam HTML semântico, CSS e SVG inline. Essa decisão evita uma dependência de charting, reduz o bundle e permite que o mesmo painel funcione em desktop, mobile, impressão e ambientes com políticas de conteúdo restritivas.
