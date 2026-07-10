# Arquitetura V23 — Sales OS Core

A Sprint 23.1 introduz uma camada de núcleo sem quebrar os módulos existentes.

```text
src/core/
├── ai/              Provider Manager
├── automation/      Regras e sugestões automáticas
├── commercial/      Fachada do Sales OS
├── intelligence/    Score e próxima melhor ação
├── learning/        Aprendizado por resultados
├── memory/          Memória comercial estruturada
├── prompts/         Prompts externos e Prompt Manager
└── routes/          API do núcleo V23
```

## Compatibilidade

As rotas e serviços das versões anteriores continuam ativos. O núcleo V23 os encapsula gradualmente para evitar uma migração de alto risco.

## Endpoints

- `GET /api/v23/status`: status da arquitetura, provedores de IA e prompts disponíveis.
- `GET /api/v23/snapshot`: visão integrada do Sales OS para o usuário autenticado.

## Próximos passos

1. Migrar geração de abordagem e propostas para o Prompt Manager.
2. Persistir Sales Memory em MongoDB.
3. Alimentar o Learning Engine com vendas ganhas e perdidas.
4. Construir o Cockpit Comercial sobre `/api/v23/snapshot`.


## Sprint 23.2 — Cockpit Comercial

O módulo `src/core/commercial/cockpitService.js` agrega leads e tarefas em uma resposta única para a Home do Sales OS. A rota `GET /api/v23/cockpit` entrega métricas, prioridades, pipeline, alertas e timeline sem duplicar regras no frontend.
