# Validação 25.7.0

- O Admin contém a região `#adminAiStatus` e consulta `/api/ai/status`.
- A resposta visual não contém chave ou token.
- O Cockpit contém `#v23ActionRadar` dentro do Plano de ação de hoje.
- O radar é calculado a partir de `pipelineHealth.bottleneck`, `dailyPlan` e `metrics`.
- O gráfico do funil permanece na Visão geral e não foi duplicado no Plano de ação.
- Assets usam `?v=25.7.0`.
