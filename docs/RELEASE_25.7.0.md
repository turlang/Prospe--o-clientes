# Release 25.7.0 — IA Comercial e Plano de Ação

## Entregas

- Card de **IA Comercial** no painel administrativo.
- Exibição segura de provedor, modelo e estado de configuração, sem exposição da chave.
- Card **Radar operacional** incorporado à seção **Plano de ação de hoje**.
- Reuso de `pipelineHealth`, `dailyPlan` e `metrics` do Cockpit Sales OS.
- Nenhum gráfico foi duplicado fora da Visão geral.
- Assets públicos versionados com `25.7.0`.

## Segurança

O navegador recebe apenas `providerLabel`, `model`, `configured`, `enabled` e `reason`. Segredos de ambiente não são serializados.
