# ADR-001 — Application Factory e bootstrap isolado

**Status:** aceita  
**Data:** 27 de julho de 2026

## Contexto

O ponto de entrada anterior configurava 58 rotas, conectava o banco e abria a porta HTTP no mesmo arquivo. Isso tornava testes de integração difíceis e misturava composição com infraestrutura.

## Decisão

`src/server.js` passa a cuidar somente do bootstrap. `src/app.js` exporta `createApp`, que configura e devolve uma instância Express sem iniciar rede.

## Consequências

### Positivas

- testes podem construir a aplicação sem abrir portas;
- falhas do banco ficam concentradas no bootstrap;
- composição e execução têm ciclos de vida independentes;
- responsabilidade do arquivo principal torna-se explícita.

### Negativas

- existe um arquivo adicional;
- testes antigos que inspecionavam `server.js` precisam acompanhar a nova arquitetura.
