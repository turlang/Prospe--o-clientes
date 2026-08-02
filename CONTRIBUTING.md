# Contribuindo com o LeadHunter Pro

## Fluxo

1. crie uma branch curta e orientada ao objetivo;
2. mantenha a mudança dentro de uma responsabilidade;
3. atualize testes e documentação quando houver alteração de contrato;
4. execute o pipeline local;
5. descreva risco, rollback e evidências na revisão.

## Preparação

```bash
npm ci
npm --prefix frontend/landing install --include=dev
cp .env.example .env
npm run build
npm run quality
```

## Padrões obrigatórios

- siga `docs/CODING_STANDARDS.md`;
- preserve os limites de `docs/ARQUITETURA.md`;
- adicione `@fileoverview` a módulos mantidos;
- use comentários para intenção e decisões não óbvias;
- não comente linha por linha;
- não inclua segredos, `.env`, `node_modules`, logs ou dados pessoais;
- não introduza caminhos que o `check:architecture` marca como legados.

## Pull request

A descrição deve conter:

- problema e comportamento esperado;
- solução e arquivos afetados;
- testes executados;
- impacto de segurança e acessibilidade;
- estratégia de rollback para mudanças de deploy ou dados.
